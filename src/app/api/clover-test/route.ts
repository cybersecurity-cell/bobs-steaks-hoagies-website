import { NextResponse } from "next/server";
import { cloverFetch, getMerchantId, CLOVER_API_BASE } from "@/lib/clover/client";

export async function GET() {
  const results: Record<string, unknown> = {
    env: {
      CLOVER_SANDBOX:     process.env.CLOVER_SANDBOX,
      CLOVER_API_BASE,
      PAYMENT_PROVIDER:   process.env.PAYMENT_PROVIDER,
      POS_PROVIDER:       process.env.POS_PROVIDER,
      has_API_TOKEN:      !!process.env.CLOVER_API_TOKEN,
      has_MERCHANT_ID:    !!process.env.CLOVER_MERCHANT_ID,
      MERCHANT_ID:        process.env.CLOVER_MERCHANT_ID,
    },
  };

  // Test 1: fetch merchant info
  try {
    const mId = getMerchantId();
    const res = await cloverFetch(`/v3/merchants/${mId}`);
    const data = await res.json();
    results.merchant = res.ok ? { status: "ok", name: data.name, id: data.id } : { status: res.status, error: data };
  } catch (e: unknown) {
    results.merchant = { status: "exception", error: String(e) };
  }

  // Test 2: fetch recent orders
  try {
    const mId = getMerchantId();
    const res = await cloverFetch(`/v3/merchants/${mId}/orders?limit=5`);
    const data = await res.json();
    results.orders = res.ok
      ? { status: "ok", count: data.elements?.length ?? 0, items: data.elements?.map((o: {id: string; title?: string; note?: string}) => ({ id: o.id, title: o.title, note: o.note })) }
      : { status: res.status, error: data };
  } catch (e: unknown) {
    results.orders = { status: "exception", error: String(e) };
  }

  // Test 3: try creating a test order
  try {
    const mId = getMerchantId();
    const res = await cloverFetch(`/v3/merchants/${mId}/orders`, {
      method: "POST",
      body: JSON.stringify({ state: "open", note: "TEST ORDER — safe to delete" }),
    });
    const data = await res.json();
    results.createOrder = res.ok
      ? { status: "ok", cloverOrderId: data.id }
      : { status: res.status, error: data };

    // Clean up test order if created
    if (res.ok && data.id) {
      await cloverFetch(`/v3/merchants/${mId}/orders/${data.id}`, { method: "DELETE" });
      results.createOrder = { ...(results.createOrder as object), cleaned_up: true };
    }
  } catch (e: unknown) {
    results.createOrder = { status: "exception", error: String(e) };
  }

  return NextResponse.json(results, { status: 200 });
}
