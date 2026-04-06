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
