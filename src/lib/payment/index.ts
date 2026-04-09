/**
 * Payment provider factory.
 *
 * Add a new vendor by:
 *   1. Implementing PaymentProvider in providers/<vendor>.ts
 *   2. Importing it below and adding a case
 *   3. Setting PAYMENT_PROVIDER=<vendor> in .env.local / Vercel env vars
 *
 * The Orders API and webhook handlers only ever call getPaymentProvider()
 * — they are completely decoupled from any specific vendor.
 */

import type { PaymentProvider } from "./types";
import { StubPaymentProvider } from "./providers/stub";

// ── Uncomment the provider you want to activate ──────────────────────────────
// import { SquarePaymentProvider }  from "./providers/square";
// import { StripePaymentProvider }  from "./providers/stripe";
// import { PayPalPaymentProvider }  from "./providers/paypal";
// import { CloverPaymentProvider }  from "./providers/clover";

export function getPaymentProvider(): PaymentProvider {
  const provider = (process.env.PAYMENT_PROVIDER ?? "stub").toLowerCase();

  switch (provider) {
    // case "square":
    //   return new SquarePaymentProvider({
    //     accessToken: process.env.SQUARE_ACCESS_TOKEN!,
    //     locationId:  process.env.SQUARE_LOCATION_ID!,
    //     sandbox:     process.env.NODE_ENV !== "production",
    //   });

    // case "stripe":
    //   return new StripePaymentProvider({
    //     secretKey:     process.env.STRIPE_SECRET_KEY!,
    //     webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
    //   });

    case "stub":
    default:
      return new StubPaymentProvider();
  }
}

// Re-export types so callers don't need to import from "./types" directly
export type { PaymentProvider } from "./types";
export type {
  CreatePaymentLinkParams,
  PaymentLinkResult,
  PaymentConfirmedEvent,
} from "./types";
