/**
 * GET /api/menu
 *
 * Server-side proxy that fetches the live menu from Clover inventory.
 * The menu page calls this endpoint so Clover credentials never touch
 * the browser.
 *
 * Falls back to the static menu-data.ts if Clover is not configured
 * (i.e. CLOVER_MERCHANT_ID / CLOVER_API_TOKEN are not set) — useful
 * during local development before credentials are added.
 *
 * Cache: revalidates every 60 seconds so prices stay fresh without
 * hammering the Clover API on every page view.
 */

import { NextResponse } from "next/server";
import { getCloverMenuItems } from "@/lib/clover/menu";
import { MENU_ITEMS } from "@/lib/menu-data";

export const revalidate = 60; // ISR — revalidate every 60 s

export async function GET() {
  const hasClover =
    process.env.CLOVER_MERCHANT_ID && process.env.CLOVER_API_TOKEN;

  if (!hasClover) {
    // No Clover config — return static data so dev/staging still works
    console.log("[/api/menu] Clover not configured — returning static menu");
    return NextResponse.json({ items: MENU_ITEMS, source: "static" });
  }

  try {
    const items = await getCloverMenuItems();

    return NextResponse.json(
      { items, source: "clover", fetchedAt: new Date().toISOString() },
      {
        headers: {
          // Allow the edge/CDN to cache for 60 s, serve stale while revalidating
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err) {
    console.error("[/api/menu] Clover fetch failed — falling back to static menu:", err);

    // Graceful degradation: never show a broken menu page
    return NextResponse.json(
      { items: MENU_ITEMS, source: "static-fallback", error: String(err) },
      { status: 200 }
    );
  }
}
