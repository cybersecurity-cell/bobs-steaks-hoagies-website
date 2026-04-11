/**
 * POST /api/reviews
 *
 * Accepts a multipart/form-data submission with:
 *   name     string  required
 *   email    string  optional
 *   rating   "1"–"5" required
 *   body     string  required (min 10 chars)
 *   photo    File    optional (max 5 MB, image/*)
 *
 * Inserts a pending review into Supabase.
 * Photo is stored in the "review-photos" Supabase Storage bucket (if configured).
 * Returns { success: true } or { error: string }.
 *
 * Moderation: reviews land with status = 'pending'.
 * Admin approves via approve_review(id) or a future admin dashboard.
 */

import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL    = process.env.NEXT_PUBLIC_SUPABASE_URL     ?? "";
const SERVICE_KEY     = process.env.SUPABASE_SERVICE_ROLE_KEY    ?? "";
const STORAGE_BUCKET  = "review-photos";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

function serviceHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    "Content-Type":  "application/json",
    apikey:          SERVICE_KEY,
    Authorization:   `Bearer ${SERVICE_KEY}`,
    ...extra,
  };
}

/* ── Simple profanity filter (extend as needed) ────────────── */
const BLOCKLIST = ["spam", "scam", "fake"]; // placeholder — swap for a real library
function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKLIST.some((word) => lower.includes(word));
}

// ─── GET /api/reviews ────────────────────────────────────────────────────────
//
// Returns approved reviews ordered by most recent first.
// Cache: revalidates every 60 seconds so new approvals appear quickly.
//
// Query params:
//   limit   number   max reviews to return (default 20, max 50)

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const url    = new URL(req.url);
  const limit  = Math.min(Number(url.searchParams.get("limit") ?? 20), 50);

  // Fallback sample reviews for when Supabase isn't configured (dev / preview)
  const FALLBACK_REVIEWS = [
    { id: "1", name: "Marcus T.",  rating: 5, body: "Best cheesesteak in Philly. Period. The rib-eye is fire and the whiz is perfect.", is_verified: true,  photo_url: null },
    { id: "2", name: "Destiny W.", rating: 5, body: "The AI ordering is actually wild — called at midnight and had my order in by the time I pulled up!", is_verified: true,  photo_url: null },
    { id: "3", name: "James K.",   rating: 5, body: "Bob's Big Beautiful Bacon Burger is no joke. Come hungry.", is_verified: true,  photo_url: null },
    { id: "4", name: "Keisha P.",  rating: 5, body: "Came in for lunch and stayed for dessert. The banana pudding got me.", is_verified: false, photo_url: null },
    { id: "5", name: "Tony R.",    rating: 4, body: "Solid spot. Long line on a Friday but worth every minute. The chicken cutlet hoagie slaps.", is_verified: false, photo_url: null },
  ];

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return NextResponse.json({ reviews: FALLBACK_REVIEWS, source: "static" });
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/reviews` +
      `?status=eq.approved` +
      `&order=created_at.desc` +
      `&limit=${limit}` +
      `&select=id,name,rating,body,photo_url,is_verified,created_at`,
      {
        headers: {
          apikey:        SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          Accept:        "application/json",
        },
        // Next.js ISR — revalidate every 60 s
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      console.error("[reviews GET] Supabase fetch failed", await res.text());
      return NextResponse.json({ reviews: FALLBACK_REVIEWS, source: "static-fallback" });
    }

    const reviews = await res.json();
    return NextResponse.json(
      { reviews, source: "supabase" },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } }
    );
  } catch (err) {
    console.error("[reviews GET] Unexpected error", err);
    return NextResponse.json({ reviews: FALLBACK_REVIEWS, source: "static-fallback" });
  }
}

// ─── POST /api/reviews ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name   = String(formData.get("name")   ?? "").trim();
    const email  = String(formData.get("email")  ?? "").trim();
    const rating = Number(formData.get("rating") ?? 0);
    const body   = String(formData.get("body")   ?? "").trim();
    const photo  = formData.get("photo") as File | null;

    // ── Validation ──────────────────────────────────────────
    if (!name)                     return json({ error: "Name is required" }, 400);
    if (rating < 1 || rating > 5)  return json({ error: "Rating must be 1–5" }, 400);
    if (body.length < 10)          return json({ error: "Review must be at least 10 characters" }, 400);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Invalid email address" }, 400);
    }
    if (containsProfanity(name) || containsProfanity(body)) {
      return json({ error: "Review contains disallowed content" }, 400);
    }

    // ── Photo upload (optional) ──────────────────────────────
    let photo_url: string | null = null;
    if (photo && photo.size > 0) {
      if (photo.size > MAX_PHOTO_BYTES) {
        return json({ error: "Photo must be under 5 MB" }, 400);
      }
      if (!photo.type.startsWith("image/")) {
        return json({ error: "Only image files are accepted" }, 400);
      }

      if (SUPABASE_URL && SERVICE_KEY) {
        const ext      = photo.name.split(".").pop() ?? "jpg";
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const uploadRes = await fetch(
          `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${filename}`,
          {
            method:  "POST",
            headers: {
              apikey:          SERVICE_KEY,
              Authorization:   `Bearer ${SERVICE_KEY}`,
              "Content-Type":  photo.type,
            },
            body: await photo.arrayBuffer(),
          }
        );
        if (uploadRes.ok) {
          photo_url = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${filename}`;
        }
        // Non-fatal: we continue without photo if upload fails
      }
    }

    // ── Supabase insert ──────────────────────────────────────
    if (!SUPABASE_URL || !SERVICE_KEY) {
      // Dev fallback: log and return success without persisting
      console.warn("[reviews] Supabase not configured — review not persisted", { name, rating, body });
      return json({ success: true });
    }

    const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null;

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
      method:  "POST",
      headers: serviceHeaders({ Prefer: "return=minimal" }),
      body: JSON.stringify({
        name,
        email:      email || null,
        rating,
        body,
        photo_url,
        status:     "pending",
        ip_address: ip,
      }),
    });

    if (!insertRes.ok) {
      const detail = await insertRes.text();
      console.error("[reviews] Supabase insert failed", detail);
      return json({ error: "Failed to save review. Please try again." }, 500);
    }

    return json({ success: true });
  } catch (err) {
    console.error("[reviews] Unexpected error", err);
    return json({ error: "Server error. Please try again." }, 500);
  }
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
