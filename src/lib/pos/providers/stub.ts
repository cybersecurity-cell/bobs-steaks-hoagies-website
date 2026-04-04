/**
 * StubPOSProvider — Phase 1 (production default)
 *
 * Logs orders to the server console and returns success.
 * No external calls — zero configuration needed.
 *
 * Workflow with this stub:
 *   1. Customer orders + pays on the website
 *   2. Order is saved in Supabase
 *   3. Kitchen display (Phase 4) shows the order
 *   4. Staff rings the order up manually in Toast at pickup
 *
 * This matches Bob's current DoorDash workflow exactly.
 * Activate Toast integration by switching POS_PROVIDER=toast.
 */

import type { POSProvider, POSOrderPayload, POSSubmitResult } from "../types";

export class StubPOSProvider implements POSProvider {
  readonly name = "stub";

  async submitOrder(order: POSOrderPayload): Promise<POSSubmitResult> {
    console.log(
      `[POS:stub] Order received — ${order.orderId} · $${order.total.toFixed(2)}`,
      {
        type:   order.orderType,
        phone:  order.customerPhone,
        items:  order.items.map((i) => `${i.quantity}× ${i.itemName}`).join(", "),
        note:   order.specialNote ?? "(none)",
      }
    );
    return { success: true, externalId: `stub-${order.orderId}` };
  }

  async updateOrderStatus(
    externalId: string,
    status: "in_progress" | "ready" | "completed"
  ): Promise<boolean> {
    console.log(`[POS:stub] Status update — ${externalId} → ${status}`);
    return true;
  }
}
