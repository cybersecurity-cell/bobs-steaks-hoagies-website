/**
 * POST /api/webhooks/payment
 *
 * Vendor-agnostic payment webhook handler.
 *
 * The URL you register with Square / Stripe / PayPal is always this single
 * endpoint. The `provider` query param (or a header) tells us who sent it.
 *
 * Usage:
 *   Square:  https://yourdomain.com/api/webhooks/payment?provider=square
 *   Stripe:  https://yourdomain.com/api/webhooks/payment?provider=stripe
 *   PayPal:  https://yourdomain.com/api/webhooks/payment?provider=paypal
 *   Stub:    https://yourdomain.com/api/webhooks/payment?provider=stub
 *
 * On payment confirmation the handler:
 *   1. Verifies webhook signature (if the provider implements it)
 *   2. Logs the raw event to Supabase webhook_events for audit
 *   3. Updates order status → "paid" in Supabase
 *   4. Notifies the POS (pushes a paid timestamp so kitchen can start)
 *   5. TODO: Send SMS confirmation via Twilio (add TWILIO_* env vars)
 *
 * Any error inside returns 200 to prevent the payment provider retrying —
 * the audit log has the raw payload for manual replay if needed.
 */

import { NextRequest, NextResponse } from "next/server";
import { updateOrder, getOrder, logWebhookEvent } from "@/lib/supabase/server";
import { getPOSProvider }                         from "@/lib/pos";

// ─── Stub webhook shape ───────────────────────────────────────────────────────
// Used when PAYMENT_PROVIDER=stub (test / Pay-at-Pickup flow)

interface StubWebhookBody {
  event:    "payment.confirmed";
  orderId:  string;
  total?:   number;
}

// ─── Square webhook shape (minimal) ──────────────────────────────────────────

interface SquareWebhookBody {
  type:       string;                   // "payment.completed"
  merchant_id?: string;
  data?: {
    object?: {
      payment?: {
        order_id?:    string;           // our orderId is stored in reference_id
        reference_id?: string;
        amount_money?: { amount: number; currency: string };
        id?:          string;           // Square's payment ID
        status?:      string;
      };
    };
  };
}

// ─── Stripe webhook shape (minimal) ──────────────────────────────────────────

interface StripeWebhookBody {
  type:       string;                   // "payment_intent.succeeded"
  id:         string;
  data?: {
    object?: {
      id?:       string;
      metadata?: Record<string, string>;
      amount?:   number;
      currency?: string;
    };
  };
}

// ─── Clover webhook shape ────────────────────────────────────────────────────
//
// Clover sends a lightweight notification. We fetch full payment details
// via the REST API using the payment ID in the payload.
//
// Docs: https://docs.clover.com/docs/webhook-notifications

interface CloverWebhookBody {
  merchantId: string;
  appId?:     string;
  /** Event type — e.g. "PAYMENT", "CREATE_PAYMENT" */
  type:       string;
  /** Unix timestamp (ms) */
  time:       number;
  /** Payment ID for PAYMENT events */
  data?:      string;
}

interface CloverPaymentDetail {
  id:         string;
  amount:     number;    // cents
  currency?:  string;
  order?:     { id: string };
  note?:      string;
  externalReferenceId?: string;
  metadata?:  Record<string, string>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function handlePaymentConfirmed(
  orderId:     string,
  externalId:  string,
  provider:    string,
  amountCents: number,
  paidAt:      Date
) {
  const paidAtISO = paidAt.toISOString();

  // 1. Update Supabase order status
  const updated = await updateOrder(orderId, {
    status:  "paid",
    paid_at: paidAtISO,
  });
  if (!updated) {
    console.error("[webhook] Supabase updateOrder failed for", orderId);
  }

  // 2. Push paid status to POS so kitchen display lights up
  const order = await getOrder(orderId);
  if (order) {
    const pos = getPOSProvider();
    if (order.pos_external_id) {
      pos.updateOrderStatus?.(order.pos_external_id, "in_progress").catch(
        (err: unknown) => console.error("[webhook] POS updateOrderStatus threw:", err)
      );
    } else {
      // POS not yet notified — submit now with paid timestamp
      pos.submitOrder({
        orderId,
        orderType:     order.order_type,
        customerPhone: order.customer_phone,
        items:         (order.items as Array<{
          itemId: string; name: string; quantity: number;
          unitPrice: number; size?: string;
        }>).map((i) => ({
          itemId:    i.itemId,
          itemName:  i.name,
          quantity:  i.quantity,
          unitPrice: i.unitPrice,
          size:      i.size,
        })),
        subtotal:   order.subtotal,
        tax:        order.tax,
        total:      order.total,
        specialNote: order.special_note ?? undefined,
        paidAt:     paidAtISO,
      }).catch((err: unknown) => console.error("[webhook] POS submitOrder threw:", err));
    }
  }

  // 3. TODO: Twilio SMS confirmation
  //    import twilio from "twilio";
  //    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  //    await client.messages.create({
  //      body: `Your Bob's order ${orderId} is confirmed! $${(amountCents/100).toFixed(2)}`,
  //      from: process.env.TWILIO_FROM_NUMBER,
  //      to:   order?.customer_phone ?? "",
  //    });

  console.log(`[webhook] ✓ Order ${orderId} marked paid via ${provider} · $${(amountCents / 100).toFixed(2)}`);
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const provider = (req.nextUrl.searchParams.get("provider") ?? "stub").toLowerCase();
  const rawBody  = await req.text();

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    console.error("[webhook] Failed to parse body");
    return NextResponse.json({ received: true });
  }

  // Always log the raw event first — even if processing fails below
  await logWebhookEvent({
    provider,
    event_type:  (body as Record<string, string>)?.type ?? provider,
    external_id: (body as Record<string, string>)?.id   ?? "unknown",
    payload:     body,
    processed:   false,
  });

  try {
    switch (provider) {

      // ── Stub (Pay-at-Pickup / testing) ──────────────────────────────────────
      case "stub": {
        const ev = body as StubWebhookBody;
        if (ev.event === "payment.confirmed" && ev.orderId) {
          await handlePaymentConfirmed(
            ev.orderId,
            `stub-${ev.orderId}`,
            "stub",
            Math.round((ev.total ?? 0) * 100),
            new Date()
          );
        }
        break;
      }

      // ── Square ───────────────────────────────────────────────────────────────
      case "square": {
        const ev = body as SquareWebhookBody;

        // Verify signature if Square webhook signature key is configured
        const sigKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
        if (sigKey) {
          const sig = req.headers.get("x-square-hmacsha256-signature") ?? "";
          // Square HMAC-SHA256: HMAC(notification_url + rawBody, sigKey)
          // For now: log a warning if key is set but verification not yet wired
          // TODO: implement square-webhook-signature verification
          console.warn("[webhook/square] Signature key set but verification not implemented yet");
          void sig;
        }

        if (ev.type === "payment.completed") {
          const payment = ev.data?.object?.payment;
          const orderId = payment?.reference_id;
          if (orderId && payment?.id) {
            const amount = payment.amount_money?.amount ?? 0;
            await handlePaymentConfirmed(
              orderId,
              payment.id,
              "square",
              amount,
              new Date()
            );
            await logWebhookEvent({
              provider:    "square",
              event_type:  ev.type,
              external_id: payment.id,
              order_id:    orderId,
              payload:     body,
              processed:   true,
            });
          }
        }
        break;
      }

      // ── Stripe ───────────────────────────────────────────────────────────────
      case "stripe": {
        const ev = body as StripeWebhookBody;

        // Verify Stripe webhook signature
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (webhookSecret) {
          const sig = req.headers.get("stripe-signature") ?? "";
          // TODO: implement Stripe signature verification using HMAC-SHA256
          // Reference: https://stripe.com/docs/webhooks/signatures
          console.warn("[webhook/stripe] Webhook secret set but verification not implemented yet");
          void sig;
        }

        if (ev.type === "payment_intent.succeeded") {
          const pi      = ev.data?.object;
          const orderId = pi?.metadata?.orderId;
          if (orderId && pi?.id) {
            await handlePaymentConfirmed(
              orderId,
              pi.id,
              "stripe",
              pi.amount ?? 0,
              new Date()
            );
            await logWebhookEvent({
              provider:    "stripe",
              event_type:  ev.type,
              external_id: pi.id,
              order_id:    orderId,
              payload:     body,
              processed:   true,
            });
          }
        }
        break;
      }

      // ── Clover ───────────────────────────────────────────────────────────────
      //
      // Register webhook URL in Clover Developer Portal → App → Notifications:
      //   https://yoursite.com/api/webhooks/payment?provider=clover
      //
      // Clover sends a lightweight ping; we fetch full payment details by ID.
      case "clover": {
        const ev = body as CloverWebhookBody;

        // Verify webhook signature (HMAC-SHA256 in X-Clover-Auth header)
        const cloverSig    = req.headers.get("x-clover-auth") ?? "";
        const webhookSecret = process.env.CLOVER_WEBHOOK_SECRET;
        if (webhookSecret && cloverSig) {
          const crypto = await import("crypto");
          const expected = crypto
            .createHmac("sha256", webhookSecret)
            .update(rawBody, "utf8")
            .digest("base64");
          const sigValid = crypto.timingSafeEqual(
            Buffer.from(expected, "base64"),
            Buffer.from(cloverSig, "base64")
          );
          if (!sigValid) {
            console.warn("[webhook/clover] Invalid signature — ignoring");
            break;
          }
        }

        // Only process payment events
        if (
          (ev.type === "PAYMENT" || ev.type === "CREATE_PAYMENT") &&
          ev.data
        ) {
          const paymentId  = ev.data;
          const merchantId = ev.merchantId ?? process.env.CLOVER_MERCHANT_ID;

          // Fetch full payment details from Clover
          const { cloverFetch } = await import("@/lib/clover/client");
          const payRes = await cloverFetch(
            `/v3/merchants/${merchantId}/payments/${paymentId}`
          );

          if (payRes.ok) {
            const payment: CloverPaymentDetail = await payRes.json();

            // Our orderId is stored in the Clover order note or externalReferenceId
            // The CloverPOSProvider sets the order note to "WEB ORDER ORD-xxx | ..."
            let orderId: string | null = null;

            if (payment.externalReferenceId) {
              orderId = payment.externalReferenceId;
            } else if (payment.note) {
              const match = payment.note.match(/WEB ORDER\s+(ORD-[A-Z0-9-]+)/i);
              if (match) orderId = match[1];
            }

            if (orderId) {
              await handlePaymentConfirmed(
                orderId,
                paymentId,
                "clover",
                payment.amount,
                new Date(ev.time)
              );
              await logWebhookEvent({
                provider:    "clover",
                event_type:  ev.type,
                external_id: paymentId,
                order_id:    orderId,
                payload:     body,
                processed:   true,
              });
            } else {
              console.warn("[webhook/clover] Could not resolve orderId from payment", paymentId);
            }
          } else {
            console.error("[webhook/clover] Failed to fetch payment", paymentId, payRes.status);
          }
        }
        break;
      }

      default:
        console.warn(`[webhook] Unknown provider: ${provider}`);
    }
  } catch (err) {
    // Log but always return 200 — prevents provider retrying indefinitely
    console.error("[webhook] Processing error:", err);
    await logWebhookEvent({
      provider,
      event_type:  "processing_error",
      external_id: "error",
      payload:     { error: String(err), originalBody: body },
      processed:   false,
      error:       String(err),
    });
  }

  // Payment providers expect 200 regardless
  return NextResponse.json({ received: true });
}
