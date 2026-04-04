/**
 * ToastPOSProvider — Phase 2 scaffold
 *
 * Pushes orders to Toast via the Toast Partner API.
 *
 * ── Prerequisites ────────────────────────────────────────────────────────────
 * 1. Enroll in the Toast Partner Program (free):
 *    https://pos.toasttab.com/partners
 * 2. In Toast Web Portal → Integrations → API Access:
 *    - Create an integration (type: "Online Ordering" or "Third-party Delivery")
 *    - Note the Restaurant GUID, Client ID, Client Secret
 * 3. Add env vars:
 *    TOAST_CLIENT_ID        from Toast portal
 *    TOAST_CLIENT_SECRET    from Toast portal
 *    TOAST_RESTAURANT_GUID  from Toast portal
 *    TOAST_API_BASE         https://ws-api.toasttab.com (production)
 *                           https://ws-sandbox-api.toasttab.com (sandbox)
 *
 * ── How it works ─────────────────────────────────────────────────────────────
 * 1. OAuth2 client-credentials token (cached in module scope, ~1hr TTL)
 * 2. POST /orders/v2/orders — creates a new order
 * 3. Toast fires webhook on status changes (kitchen accept, ready, etc.)
 *
 * ── Toast menu item mapping ───────────────────────────────────────────────────
 * Bob's menu items need to be synced with Toast menu GUIDs.
 * Two options:
 *   a. Manual: hardcode a map in src/lib/pos/toast-menu-map.ts
 *   b. Automatic: call GET /menus/v2/menus to build the map at startup
 *
 * This scaffold uses the menu map approach — populate it once Bob is enrolled.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { POSProvider, POSOrderPayload, POSSubmitResult } from "../types";

// ── Types (minimal subset of Toast API shapes) ────────────────────────────────

interface ToastToken {
  accessToken: string;
  expiresAt:   number; // epoch ms
}

interface ToastOrderItem {
  item:     { guid: string };
  quantity: number;
  modifiers?: { modifier: { guid: string } }[];
}

interface ToastOrderBody {
  restaurantGuid: string;
  source:         string;
  orderType:      { guid: string };
  checks: [{
    selections:  ToastOrderItem[];
    customer?:   { phone?: string };
  }];
  deliveryInfo?: {
    deliveryEmployee: null;
  };
}

// ── Module-level token cache ──────────────────────────────────────────────────

let _cachedToken: ToastToken | null = null;

async function getAccessToken(): Promise<string> {
  if (_cachedToken && Date.now() < _cachedToken.expiresAt - 60_000) {
    return _cachedToken.accessToken;
  }

  const base     = process.env.TOAST_API_BASE     ?? "https://ws-sandbox-api.toasttab.com";
  const clientId = process.env.TOAST_CLIENT_ID    ?? "";
  const secret   = process.env.TOAST_CLIENT_SECRET ?? "";

  const res = await fetch(`${base}/authentication/v1/authentication/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      clientId,
      clientSecret: secret,
      userAccessType: "TOAST_MACHINE_CLIENT",
    }),
  });

  if (!res.ok) {
    throw new Error(`Toast auth failed: ${res.status} ${await res.text()}`);
  }

  const body = await res.json() as { token: { accessToken: string; expiresIn: number } };
  _cachedToken = {
    accessToken: body.token.accessToken,
    expiresAt:   Date.now() + body.token.expiresIn * 1000,
  };
  return _cachedToken.accessToken;
}

// ── Menu item GUID map ────────────────────────────────────────────────────────
//
// TODO (after Toast enrollment): populate with real GUIDs from
//   GET {TOAST_API_BASE}/menus/v2/menus
//
// Key = our menu item id (from menu-data.ts), value = Toast item GUID
//
const TOAST_ITEM_GUID_MAP: Record<string, string> = {
  // "philly-cheesesteak":   "toast-guid-here",
  // "chicken-cheesesteak":  "toast-guid-here",
  // ...
};

// Default GUID — maps unrecognised items to a "Custom Item" in Toast
const TOAST_FALLBACK_GUID = process.env.TOAST_CUSTOM_ITEM_GUID ?? "";

// ── Provider ──────────────────────────────────────────────────────────────────

export class ToastPOSProvider implements POSProvider {
  readonly name = "toast";

  private readonly base:           string;
  private readonly restaurantGuid: string;

  constructor() {
    this.base           = process.env.TOAST_API_BASE          ?? "https://ws-sandbox-api.toasttab.com";
    this.restaurantGuid = process.env.TOAST_RESTAURANT_GUID   ?? "";
  }

  async submitOrder(order: POSOrderPayload): Promise<POSSubmitResult> {
    if (!this.restaurantGuid) {
      return { success: false, error: "TOAST_RESTAURANT_GUID not configured" };
    }

    try {
      const token = await getAccessToken();

      const selections: ToastOrderItem[] = order.items.map((item) => ({
        item:     { guid: TOAST_ITEM_GUID_MAP[item.itemId] ?? TOAST_FALLBACK_GUID },
        quantity: item.quantity,
      }));

      const body: ToastOrderBody = {
        restaurantGuid: this.restaurantGuid,
        source:         "ONLINE",
        orderType:      { guid: process.env.TOAST_ORDER_TYPE_GUID ?? "" },
        checks: [{
          selections,
          customer: { phone: order.customerPhone },
        }],
      };

      if (order.orderType === "delivery") {
        body.deliveryInfo = { deliveryEmployee: null };
      }

      const res = await fetch(`${this.base}/orders/v2/orders`, {
        method:  "POST",
        headers: {
          "Content-Type":    "application/json",
          "Authorization":   `Bearer ${token}`,
          "Toast-Restaurant-External-ID": this.restaurantGuid,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("[POS:toast] submitOrder failed", err);
        return { success: false, error: err };
      }

      const data = await res.json() as { guid: string };
      console.log(`[POS:toast] Order created — ${order.orderId} → Toast ${data.guid}`);
      return { success: true, externalId: data.guid };

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[POS:toast] submitOrder threw:", msg);
      return { success: false, error: msg };
    }
  }

  async updateOrderStatus(
    externalId: string,
    status: "in_progress" | "ready" | "completed"
  ): Promise<boolean> {
    // Toast manages kitchen status internally; this is a no-op unless
    // you want to push status changes back from your kitchen display.
    console.log(`[POS:toast] updateOrderStatus noop — ${externalId} → ${status}`);
    return true;
  }
}
