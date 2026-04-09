// ─── Payment Provider Interface ───────────────────────────────────────────────
//
// All payment vendors (Square, Stripe, PayPal, Clover, etc.) must implement
// this interface. The rest of the application never imports a vendor directly —
// it always goes through getPaymentProvider() in index.ts.
//
// To add a new vendor:
//   1. Create src/lib/payment/providers/<vendor>.ts implementing PaymentProvider
//   2. Add a case in src/lib/payment/index.ts
//   3. Set PAYMENT_PROVIDER=<vendor> in your .env

export interface PaymentLineItem {
  name: string;
  quantity: number;
  /** Unit price in cents */
  unitAmountCents: number;
}

export interface CreatePaymentLinkParams {
  /** Internal order ID */
  orderId: string;
  /** Total charge amount in cents */
  amountCents: number;
  /** ISO 4217 currency code (default "usd") */
  currency?: string;
  /** Optional itemised breakdown for receipt display */
  lineItems?: PaymentLineItem[];
  /** Vendor-agnostic metadata (strings only) */
  metadata?: Record<string, string>;
  /** Customer phone for SMS receipt if supported */
  customerPhone?: string;
}

export interface PaymentLinkResult {
  /** URL to send the customer to for payment */
  url: string;
  /** Vendor-assigned ID for this payment link / intent */
  externalId: string;
  /** Name of the provider that created this link */
  provider: string;
}

/**
 * PaymentProvider — the single interface every vendor must satisfy.
 *
 * Optional verifyWebhookSignature is called by the webhook handler to
 * authenticate inbound events before processing them.
 */
export interface PaymentProvider {
  readonly name: string;

  createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLinkResult>;

  /**
   * Verify an inbound webhook from this provider.
   * @param rawBody  Raw request body string (before JSON.parse)
   * @param signature  Value of the vendor's signature header
   * @returns true if the signature is valid
   */
  verifyWebhookSignature?(rawBody: string, signature: string): boolean;
}

// ─── Normalised webhook event ─────────────────────────────────────────────────
//
// Each vendor's webhook handler translates its raw event into this shape before
// passing it to business logic (kitchen queue insert, SMS, etc.).
// This keeps the webhook consumers vendor-agnostic.

export interface PaymentConfirmedEvent {
  orderId: string;
  externalId: string;
  provider: string;
  amountCents: number;
  currency: string;
  paidAt: Date;
  metadata?: Record<string, string>;
}
