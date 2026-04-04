import { NextRequest, NextResponse } from "next/server";
import { MENU_ITEMS } from "@/lib/menu-data";
import { getPaymentProvider } from "@/lib/payment";

// ─── Constants ────────────────────────────────────────────────────────────────

const TAX_RATE = 0.08; // 8% PA prepared-food sales tax — keep in sync with cart-context.tsx

// ─── Request schema ───────────────────────────────────────────────────────────

interface OrderItemInput {
  id: string;
  quantity: number;
  size?: string;
  customizations?: Record<string, string>;
  specialInstructions?: string;
}

interface OrderRequest {
  items: OrderItemInput[];
  orderType: "pickup" | "delivery";
  customerPhone: string;
  specialNote?: string;
}

// ─── POST /api/orders ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: OrderRequest = await req.json();
    const { items, orderType, customerPhone, specialNote } = body;

    // ── Validate inputs ──

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item." },
        { status: 400 }
      );
    }

    if (!customerPhone || customerPhone.replace(/\D/g, "").length < 7) {
      return NextResponse.json(
        { error: "A valid phone number is required." },
        { status: 400 }
      );
    }

    if (!["pickup", "delivery"].includes(orderType)) {
      return NextResponse.json(
        { error: "orderType must be 'pickup' or 'delivery'." },
        { status: 400 }
      );
    }

    // ── Validate items against our menu and calculate server-side total ──
    // Never trust the client-submitted total.

    const resolvedItems = [];

    for (const input of items) {
      if (!input.id || typeof input.id !== "string") {
        return NextResponse.json(
          { error: "Each item must have a valid id." },
          { status: 400 }
        );
      }

      const menuItem = MENU_ITEMS.find((m) => m.id === input.id);
      if (!menuItem) {
        return NextResponse.json(
          { error: `Menu item not found: ${input.id}` },
          { status: 400 }
        );
      }

      const qty = Number(input.quantity);
      if (!Number.isInteger(qty) || qty < 1 || qty > 20) {
        return NextResponse.json(
          { error: `Invalid quantity for "${menuItem.name}". Must be 1–20.` },
          { status: 400 }
        );
      }

      resolvedItems.push({
        itemId: menuItem.id,
        name: menuItem.name,
        category: menuItem.category,
        unitPrice: menuItem.price,
        quantity: qty,
        size: input.size ?? null,
        customizations: input.customizations ?? null,
        specialInstructions: input.specialInstructions ?? null,
        lineTotal: menuItem.price * qty,
      });
    }

    // ── Server-side totals ──

    const subtotal = resolvedItems.reduce((s, i) => s + i.lineTotal, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    // ── Generate order ID ──
    // TODO: replace with Supabase-generated ID when DB is wired up (Phase 2)

    const orderId =
      "ORD-" +
      Date.now().toString(36).toUpperCase() +
      "-" +
      Math.random().toString(36).slice(2, 6).toUpperCase();

    // ── Create payment link via active provider ──
    // Swapping payment vendors = change PAYMENT_PROVIDER env var only.

    const paymentProvider = getPaymentProvider();

    const paymentResult = await paymentProvider.createPaymentLink({
      orderId,
      amountCents: Math.round(total * 100),
      currency: "usd",
      lineItems: resolvedItems.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unitAmountCents: Math.round(i.unitPrice * 100),
      })),
      metadata: {
        orderType,
        customerPhone: customerPhone.replace(/\D/g, ""),
        itemCount: String(resolvedItems.length),
        ...(specialNote ? { specialNote: specialNote.slice(0, 200) } : {}),
      },
      customerPhone,
    });

    // ── TODO: Persist to Supabase (Phase 2 / Task 3a) ──
    //
    // await supabaseAdmin.from("orders").insert({
    //   id: orderId,
    //   customer_phone: customerPhone,
    //   items: resolvedItems,
    //   subtotal,
    //   tax,
    //   total,
    //   status: "pending",
    //   order_type: orderType,
    //   special_note: specialNote,
    //   payment_provider: paymentResult.provider,
    //   payment_external_id: paymentResult.externalId,
    //   stripe_payment_url: paymentResult.url,  // column name kept for compat
    //   created_at: new Date().toISOString(),
    // });

    // ── Return response ──

    return NextResponse.json({
      success: true,
      orderId,
      paymentUrl: paymentResult.url,
      paymentProvider: paymentResult.provider,
      subtotal: +subtotal.toFixed(2),
      tax: +tax.toFixed(2),
      total: +total.toFixed(2),
      items: resolvedItems,
      orderType,
      customerPhone,
    });
  } catch (err) {
    console.error("[POST /api/orders] error:", err);
    return NextResponse.json(
      { error: "Failed to create order. Please try again or call us." },
      { status: 500 }
    );
  }
}
