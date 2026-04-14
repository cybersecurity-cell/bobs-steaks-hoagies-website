/**
 * CloverPOSProvider
 *
 * Pushes website orders directly into Clover as open orders with line items.
 * Kitchen staff see them on Clover Kitchen Display or Order Management.
 *
 * Clover APIs used:
 *   POST /v3/merchants/{mId}/orders              — create the order
 *   POST /v3/merchants/{mId}/orders/{id}/line_items — add each item
 *   POST /v3/merchants/{mId}/orders/{id}/notes   — add customer phone/note
 *
 * Required env vars:
 *   CLOVER_API_TOKEN       REST API token (from Merchant Dashboard → API Tokens)
 *   CLOVER_MERCHANT_ID     Your merchant MID
 *   CLOVER_ORDER_TYPE_ID   (optional) Clover order type ID for online orders
 *                          If omitted, Clover uses the merchant's default type.
 *
 * Non-fatal: if Clover is down or returns an error, the website order still
 * succeeds and is visible in Supabase / the kitchen display.
 */

import { cloverFetch, getMerchantId } from "@/lib/clover/client";
import type {
  POSProvider,
  POSOrderPayload,
  POSSubmitResult,
} from "../types";

// ─── Clover API types ─────────────────────────────────────────────────────────

interface CloverOrder {
  id: string;
  state?: string;
}

interface CloverLineItem {
  id: string;
  name: string;
  price: number;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export class CloverPOSProvider implements POSProvider {
  readonly name = "clover";

  async submitOrder(order: POSOrderPayload): Promise<POSSubmitResult> {
    const mId = getMerchantId();

    // ── 1. Create an open order in Clover ──────────────────────────────────

    const orderBody: Record<string, unknown> = {
      state: "open",
      orderType: process.env.CLOVER_ORDER_TYPE_ID
        ? { id: process.env.CLOVER_ORDER_TYPE_ID }
        : undefined,
      note: [
        `WEB ORDER ${order.orderId}`,
        `Type: ${order.orderType.toUpperCase()}`,
        `Phone: ${order.customerPhone}`,
        order.specialNote ? `Note: ${order.specialNote}` : null,
        order.paidAt ? `Paid: ${order.paidAt}` : null,
      ]
        .filter(Boolean)
        .join(" | "),
      title: `Web Order ${order.orderId}`,
    };

    const createRes = await cloverFetch(`/v3/merchants/${mId}/orders`, {
      method: "POST",
      body:   JSON.stringify(orderBody),
    });

    if (!createRes.ok) {
      const text = await createRes.text();
      console.error(`[Clover POS] Failed to create order: ${createRes.status} ${text}`);
      return { success: false, error: `Clover order creation failed: ${createRes.status}` };
    }

    const cloverOrder: CloverOrder = await createRes.json();
    const cloverOrderId = cloverOrder.id;

    // ── 2. Add line items ─────────────────────────────────────────────────
    //
    // Clover accepts bulk line item creation via a single POST.
    // Each line item either references an existing inventory item by ID
    // or uses a custom item name + price.

    // Post each line item individually (Clover does not support bulk POST on this endpoint)
    for (const item of order.items) {
      const lineItemBody: Record<string, unknown> = {
        name:    item.itemName,
        price:   Math.round(item.unitPrice * 100), // dollars → cents
        unitQty: item.quantity * 1000,             // Clover milli-units: 1 unit = 1000
      };

      // Reference inventory item if ID looks like a Clover ID (13-char alphanumeric)
      if (/^[A-Z0-9]{13}$/.test(item.itemId)) {
        lineItemBody.item = { id: item.itemId };
      }

      let note = "";
      if (item.size) note = `Size: ${item.size}`;
      if (item.customizations) {
        const extras = Object.entries(item.customizations)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        note = note ? `${note} | ${extras}` : extras;
      }
      if (note) lineItemBody.note = note;

      const lineItemRes = await cloverFetch(
        `/v3/merchants/${mId}/orders/${cloverOrderId}/line_items`,
        {
          method: "POST",
          body:   JSON.stringify(lineItemBody),
        }
      );

      if (!lineItemRes.ok) {
        const text = await lineItemRes.text();
        // Non-fatal — order header was already created
        console.error(`[Clover POS] Failed to add line item "${item.itemName}": ${lineItemRes.status} ${text}`);
      }
    }

    // ── 3. Print / fire to kitchen (optional) ─────────────────────────────
    //
    // If your Clover station is configured for auto-print, it fires automatically.
    // Uncomment the block below to explicitly fire the order to the printer:
    //
    // await cloverFetch(`/v3/merchants/${mId}/orders/${cloverOrderId}/fire`, {
    //   method: "POST",
    // });

    console.log(
      `[Clover POS] ✓ Order ${order.orderId} → Clover ${cloverOrderId} · $${order.total.toFixed(2)}`
    );

    return { success: true, externalId: cloverOrderId };
  }

  // ── Update order status ────────────────────────────────────────────────────

  async updateOrderStatus(
    externalId: string,
    status: "in_progress" | "ready" | "completed"
  ): Promise<boolean> {
    const mId = getMerchantId();

    // Map our status to Clover order states
    const stateMap: Record<string, string> = {
      in_progress: "open",
      ready:       "locked",    // "locked" in Clover ≈ order complete / being paid
      completed:   "paid",
    };

    const cloverState = stateMap[status] ?? "open";

    const res = await cloverFetch(`/v3/merchants/${mId}/orders/${externalId}`, {
      method: "POST",
      body:   JSON.stringify({ state: cloverState }),
    });

    if (!res.ok) {
      console.error(`[Clover POS] Failed to update order ${externalId}: ${res.status}`);
      return false;
    }

    console.log(`[Clover POS] ✓ Order ${externalId} → ${cloverState}`);
    return true;
  }
}
