/**
 * Supabase server client — uses the REST API directly via fetch.
 *
 * No npm package required. This file is the single integration point;
 * swap it for @supabase/supabase-js later without touching any callers.
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL          e.g. https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY         Secret key (sb_secret_...) — server-only, never expose to browser.
 *                                     Generate in Supabase Dashboard → Project Settings → API Keys.
 *                                     Do NOT use the legacy service_role JWT here.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function serviceHeaders(extra?: Record<string, string>) {
  return {
    "Content-Type":  "application/json",
    "apikey":        SERVICE_KEY,
    "Authorization": `Bearer ${SERVICE_KEY}`,
    ...extra,
  };
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export interface DBOrder {
  id:                   string;
  customer_phone:       string;
  items:                unknown;        // JSONB
  subtotal:             number;
  tax:                  number;
  total:                number;
  status:               "pending" | "paid" | "in_progress" | "ready" | "completed" | "failed";
  order_type:           "pickup" | "delivery";
  special_note?:        string | null;
  payment_provider?:    string | null;
  payment_external_id?: string | null;
  payment_url?:         string | null;
  pos_provider?:        string | null;
  pos_external_id?:     string | null;
  pos_error?:           string | null;
  created_at?:          string;
  paid_at?:             string | null;
}

/** Insert a new order. Returns the created row. */
export async function insertOrder(order: DBOrder): Promise<DBOrder | null> {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.warn("[supabase] env vars not set — order not persisted");
    return null;
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
    method:  "POST",
    headers: serviceHeaders({ Prefer: "return=representation" }),
    body:    JSON.stringify(order),
  });
  if (!res.ok) {
    console.error("[supabase] insertOrder failed", await res.text());
    return null;
  }
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : rows;
}

/** Update an order's status (and optionally paid_at + pos fields). */
export async function updateOrder(
  id: string,
  patch: Partial<DBOrder>
): Promise<boolean> {
  if (!SUPABASE_URL || !SERVICE_KEY) return false;
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(id)}`,
    {
      method:  "PATCH",
      headers: serviceHeaders({ Prefer: "return=minimal" }),
      body:    JSON.stringify(patch),
    }
  );
  if (!res.ok) {
    console.error("[supabase] updateOrder failed", await res.text());
    return false;
  }
  return true;
}

/** Fetch a single order by id. */
export async function getOrder(id: string): Promise<DBOrder | null> {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/orders?id=eq.${encodeURIComponent(id)}&limit=1`,
    { headers: serviceHeaders({ Accept: "application/json" }) }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

// ─── Webhook audit log ────────────────────────────────────────────────────────

export interface DBWebhookEvent {
  provider:    string;
  event_type:  string;
  external_id: string;
  order_id?:   string | null;
  payload:     unknown;
  processed:   boolean;
  error?:      string | null;
}

export async function logWebhookEvent(event: DBWebhookEvent): Promise<void> {
  if (!SUPABASE_URL || !SERVICE_KEY) return;
  await fetch(`${SUPABASE_URL}/rest/v1/webhook_events`, {
    method:  "POST",
    headers: serviceHeaders({ Prefer: "return=minimal" }),
    body:    JSON.stringify(event),
  });
}
