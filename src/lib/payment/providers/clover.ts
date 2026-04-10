/**
 * CloverPaymentProvider
 *
 * Creates Clover Hosted Checkout sessions — the customer is sent to a
 * Clover-hosted payment page and redirected back on success or cancel.
 *
 * Clover API used:
 *   POST /invoicingcheckoutservice/v1/checkouts
 *   Base: https://scl.clover.com  (production)
 *         https://scl-sandbox.dev.clover.com  (sandbox)
 *
 * Required env vars:
 *   CLOVER_ECOMM_TOKEN      Ecommerce private key (sk_...)
 *   CLOVER_MERCHANT_ID      Your merchant MID
 *   NEXT_PUBLIC_SITE_URL    Base URL for success/cancel redirects
 *   CLOVER_SANDBOX          "true" for sandbox (optional, defaults false)
 *
 * Webhook:
 *   Register https://yoursite.com/api/webhooks/payment?provider=clover
 *   in your Clover Developer App → Notifications settings.
 *   Set CLOVER_WEBHOOK_SECRET to the signing secret Clover provides.
 *
 * Clover checkout docs:
 *   https://docs.clover.com/docs/clover-hosted-checkout
 */

import crypto from "crypto";
import { cloverFetch, getMerchantId } from "@/lib/clover/client";
import type {
  PaymentProvider,
  CreatePaymentLinkParams,
  PaymentLinkResult,
} from "../types";

// ─── Clover Hosted Checkout types ─────────────────────────────────────────────

interface CloverCheckoutLineItem {
  name: string;
  unitQty: number;  // 1 unit = 1 (integer)
  price: number;    // in cents
}

interface CloverCheckoutRequest {
  customer?: {
    phoneNumber?: string;
    email?: string;
  };
  shoppingCart: {
    lineItems: CloverCheckoutLineItem[];
    note?: string;
  };
  redirectUrls: {
    success: string;
    cancel: string;
  };
  merchant: {
    mid: string;
  };
  allowTipping: boolean;
  currency: string;
  metadata?: Record<string, string>;
}

interface CloverCheckoutResponse {
  /** Unique checkout session ID */
  id: string;
  /** URL to redirect the customer to */
  href: string;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export class CloverPaymentProvider implements PaymentProvider {
  readonly name = "clover";

  async createPaymentLink(
    params: CreatePaymentLinkParams
  ): Promise<PaymentLinkResult> {
    const mId = getMerchantId();

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const totalDollars = (params.amountCents / 100).toFixed(2);

    // ── Build line items ──
    const lineItems: CloverCheckoutLineItem[] = params.lineItems?.map((li) => ({
      name:    li.name,
      unitQty: li.quantity,
      price:   li.unitAmountCents,
    })) ?? [
      {
        name:    `Order ${params.orderId}`,
        unitQty: 1,
        price:   params.amountCents,
      },
    ];

    const payload: CloverCheckoutRequest = {
      merchant: { mid: mId },
      customer: params.customerPhone
        ? { phoneNumber: params.customerPhone.replace(/\D/g, "") }
        : undefined,
      shoppingCart: {
        lineItems,
        note: params.metadata?.specialNote,
      },
      redirectUrls: {
        success:
          `${baseUrl}/order/confirm` +
          `?orderId=${encodeURIComponent(params.orderId)}` +
          `&method=clover` +
          `&total=${totalDollars}`,
        cancel: `${baseUrl}/order`,
      },
      allowTipping: false,
      currency:     params.currency ?? "usd",
      metadata: {
        orderId: params.orderId,
        ...params.metadata,
      },
    };

    // Clover Hosted Checkout uses the same REST API base + merchant API token
    const res = await cloverFetch(
      "/invoicingcheckoutservice/v1/checkouts",
      {
        method: "POST",
        body:   JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`[Clover] Checkout creation failed: ${res.status} ${text}`);
    }

    const checkout: CloverCheckoutResponse = await res.json();

    return {
      url:        checkout.href,
      externalId: checkout.id,
      provider:   this.name,
    };
  }

  // ── Webhook signature verification ────────────────────────────────────────
  //
  // Clover signs webhook bodies with HMAC-SHA256 using your app secret.
  // The signature is sent in the `X-Clover-Auth` header.
  // Set CLOVER_WEBHOOK_SECRET to the value shown in your app's notification
  // settings in the Clover Developer Portal.

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = process.env.CLOVER_WEBHOOK_SECRET;
    if (!secret) {
      console.warn("[Clover] CLOVER_WEBHOOK_SECRET not set — skipping verification");
      return true;
    }

    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody, "utf8")
      .digest("base64");

    return crypto.timingSafeEqual(
      Buffer.from(expected, "base64"),
      Buffer.from(signature, "base64")
    );
  }
}
