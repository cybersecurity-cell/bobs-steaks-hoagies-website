/**
 * POST /api/kitchen/auth
 *
 * Server-side PIN validation for the kitchen display.
 * The PIN never leaves the server — it is read from KITCHEN_PIN (no NEXT_PUBLIC_ prefix)
 * so it is never included in the browser bundle.
 *
 * Rate limiting: max 5 attempts per IP per minute to prevent brute-force.
 *
 * Returns:
 *   200 { success: true }   — PIN correct
 *   401 { error: string }   — PIN incorrect
 *   429 { error: string }   — Too many attempts
 *   500 { error: string }   — KITCHEN_PIN env var not configured
 */

import { NextRequest, NextResponse } from "next/server";

// ─── In-process rate limiter (5 attempts / 60 s per IP) ──────────────────────

interface RateWindow {
  count:   number;
  resetAt: number;
}

const attempts = new Map<string, RateWindow>();

function checkRateLimit(ip: string): { allowed: boolean } {
  const now    = Date.now();
  const window = attempts.get(ip);

  if (!window || now > window.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 60_000 });
    return { allowed: true };
  }

  if (window.count >= 5) {
    return { allowed: false };
  }

  window.count++;
  return { allowed: true };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  // Rate limit check
  if (!checkRateLimit(ip).allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  // Verify KITCHEN_PIN is configured
  const correctPin = process.env.KITCHEN_PIN;
  if (!correctPin) {
    console.error("[kitchen/auth] KITCHEN_PIN env var is not set");
    return NextResponse.json(
      { error: "Kitchen PIN is not configured. Set KITCHEN_PIN in your environment." },
      { status: 500 }
    );
  }

  // Parse and validate input
  let pin: string;
  try {
    const body = await req.json();
    pin = String(body.pin ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!pin || !/^\d{4,8}$/.test(pin)) {
    return NextResponse.json(
      { error: "PIN must be 4–8 digits." },
      { status: 400 }
    );
  }

  // Constant-time comparison to prevent timing attacks
  const encoder    = new TextEncoder();
  const pinBytes   = encoder.encode(pin.padEnd(8, "0"));
  const correctBytes = encoder.encode(correctPin.padEnd(8, "0"));

  let match = pin.length === correctPin.length;
  for (let i = 0; i < 8; i++) {
    if (pinBytes[i] !== correctBytes[i]) match = false;
  }

  if (!match) {
    return NextResponse.json({ error: "Incorrect PIN." }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
