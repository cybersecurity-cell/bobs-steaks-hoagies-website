/**
 * POS Provider abstraction layer
 *
 * Plug in any POS system by implementing this interface.
 * Active provider is selected via POS_PROVIDER env var.
 *
 * Supported values (POS_PROVIDER):
 *   stub  — console-log only, no external calls (default / Phase 1)
 *   toast — Toast POS Partner API (Phase 2, requires enrollment)
 */

export interface POSOrderItem {
  itemId:     string;
  itemName:   string;
  quantity:   number;
  unitPrice:  number;   // in dollars
  size?:      string;
  customizations?: Record<string, string>;
}

export interface POSOrderPayload {
  /** Our internal order ID (e.g. ORD-abc123) */
  orderId:        string;
  orderType:      "pickup" | "delivery";
  customerPhone:  string;
  items:          POSOrderItem[];
  subtotal:       number;  // dollars
  tax:            number;  // dollars
  total:          number;  // dollars
  specialNote?:   string;
  paidAt?:        string;  // ISO timestamp — present once payment confirmed
}

export interface POSSubmitResult {
  /** True if the POS accepted the order */
  success:      boolean;
  /** POS-assigned order/ticket ID */
  externalId?:  string;
  /** Human-readable error (logged, never shown to customer) */
  error?:       string;
}

export interface POSProvider {
  readonly name: string;

  /**
   * Push a new order into the POS system.
   * Called from the orders API route once the order is validated.
   * On failure, the website order still succeeds — POS errors are non-fatal.
   */
  submitOrder(order: POSOrderPayload): Promise<POSSubmitResult>;

  /**
   * Update the status of an existing POS ticket.
   * Optional — not all POS providers support this direction.
   */
  updateOrderStatus?(
    externalId: string,
    status: "in_progress" | "ready" | "completed"
  ): Promise<boolean>;
}
