/**
 * Simple in-process sliding-window rate limiter.
 *
 * Works per-serverless-instance (no shared state across Vercel instances).
 * Good enough to stop simple bots and accidental hammering.
 *
 * To scale to multi-instance production traffic, replace the Map with
 * an Upstash Redis call — the interface is identical so callers don't change:
 *
 *   import { Ratelimit } from "@upstash/ratelimit";
 *   import { Redis }     from "@upstash/redis";
 *
 * Usage:
 *   const { allowed, remaining } = checkRateLimit(`chat:${ip}`, { limit: 20, windowMs: 60_000 });
 *   if (!allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */

interface Window {
  count:   number;
  resetAt: number;
}

const store = new Map<string, Window>();

export interface RateLimitResult {
  allowed:   boolean;
  remaining: number;
  resetAt:   number; // Unix ms — useful for Retry-After header
}

export function checkRateLimit(
  key: string,
  opts: { limit: number; windowMs: number }
): RateLimitResult {
  const now   = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + opts.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: opts.limit - 1, resetAt };
  }

  if (entry.count >= opts.limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: opts.limit - entry.count, resetAt: entry.resetAt };
}
