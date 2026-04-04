import type {
  PaymentProvider,
  CreatePaymentLinkParams,
  PaymentLinkResult,
} from "../types";

/**
 * StubPaymentProvider — "Pay at Pickup" placeholder.
 *
 * Used when PAYMENT_PROVIDER is not set or is "stub".
 * Returns a /order/confirm URL so the order flow completes without a real
 * payment gateway. No money is collected.
 *
 * Replace this with a real provider when you're ready:
 *   - Square:  src/lib/payment/providers/square.ts
 *   - Stripe:  src/lib/payment/providers/stripe.ts
 *   - PayPal:  src/lib/payment/providers/paypal.ts
 *   - Clover:  src/lib/payment/providers/clover.ts
 */
export class StubPaymentProvider implements PaymentProvider {
  readonly name = "stub";

  async createPaymentLink(
    params: CreatePaymentLinkParams
  ): Promise<PaymentLinkResult> {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const totalDollars = (params.amountCents / 100).toFixed(2);
    const url =
      `${baseUrl}/order/confirm` +
      `?orderId=${encodeURIComponent(params.orderId)}` +
      `&method=cash` +
      `&total=${totalDollars}`;

    return {
      url,
      externalId: `stub_${params.orderId}`,
      provider: this.name,
    };
  }

  // Stub does not handle webhooks
}
