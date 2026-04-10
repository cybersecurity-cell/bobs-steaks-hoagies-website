/**
 * Clover API client helpers
 *
 * Two API surfaces:
 *
 *  1. REST API  (cloverFetch)       — merchant management, inventory, orders
 *     Base:  https://api.clover.com
 *     Auth:  CLOVER_API_TOKEN  (from Merchant Dashboard → Account & Setup → API Tokens)
 *
 *  2. Ecommerce API (cloverEcommFetch) — online payments / hosted checkout
 *     Base:  https://scl.clover.com
 *     Auth:  CLOVER_ECOMM_TOKEN  (from App Market → Ecommerce → Private Key)
 *
 * Required env vars:
 *   CLOVER_MERCHANT_ID     Your merchant MID (visible in Clover dashboard URL)
 *   CLOVER_API_TOKEN       REST API token
 *   CLOVER_ECOMM_TOKEN     Ecommerce private key (sk_...)
 *   CLOVER_SANDBOX         "true" to hit sandbox, omit/false for production
 */

// ─── Base URLs ────────────────────────────────────────────────────────────────

const isSandbox = process.env.CLOVER_SANDBOX === "true";

export const CLOVER_API_BASE = isSandbox
  ? "https://apisandbox.dev.clover.com"
  : "https://api.clover.com";

export const CLOVER_ECOMM_BASE = isSandbox
  ? "https://scl-sandbox.dev.clover.com"
  : "https://scl.clover.com";

export const CLOVER_CHECKOUT_BASE = isSandbox
  ? "https://checkout.sandbox.dev.clover.com"
  : "https://checkout.clover.com";

// ─── REST API fetch ───────────────────────────────────────────────────────────

/**
 * Authenticated fetch against the Clover REST API.
 * Uses CLOVER_API_TOKEN (Bearer token from Merchant Dashboard).
 */
export async function cloverFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = process.env.CLOVER_API_TOKEN;
  if (!token) throw new Error("[Clover] CLOVER_API_TOKEN is not set");

  return fetch(`${CLOVER_API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });
}

// ─── Ecommerce API fetch ──────────────────────────────────────────────────────

/**
 * Authenticated fetch against the Clover Ecommerce / Hosted Checkout API.
 * Uses CLOVER_ECOMM_TOKEN (private key, starts with sk_...).
 */
export async function cloverEcommFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = process.env.CLOVER_ECOMM_TOKEN;
  if (!token) throw new Error("[Clover] CLOVER_ECOMM_TOKEN is not set");

  return fetch(`${CLOVER_ECOMM_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });
}

// ─── Merchant ID helper ───────────────────────────────────────────────────────

export function getMerchantId(): string {
  const mId = process.env.CLOVER_MERCHANT_ID;
  if (!mId) throw new Error("[Clover] CLOVER_MERCHANT_ID is not set");
  return mId;
}
