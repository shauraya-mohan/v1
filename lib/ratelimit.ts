/**
 * In-process rate limiting. Deliberately loose — a curious human should never
 * hit it; a script should hit it immediately.
 *
 * Caveat worth knowing: this is per server instance. On a single container or
 * a low-traffic Vercel deployment that is effectively global. If you ever scale
 * to many concurrent instances, swap the three maps for Upstash Redis — the
 * function signatures below are what you'd reimplement.
 */

type Bucket = { tokens: number; last: number };

const LIMITS = {
  burst: { cap: 8, refillMs: 60_000 }, // 8 questions a minute
  hourly: { cap: 40, refillMs: 3_600_000 }, // 40 an hour
  minGapMs: 700, // no double-fires
  globalPerDay: 800, // bill guard
};

const CONTACT = { cap: 4, refillMs: 3_600_000, perDay: 60 };

const burst = new Map<string, Bucket>();
const contact = new Map<string, Bucket>();

let contactCount = 0;
let contactResetAt = 0;
const hourly = new Map<string, Bucket>();
const lastSeen = new Map<string, number>();

let globalCount = 0;
let globalResetAt = 0;

/** Drop cold entries so the maps can't grow without bound. */
function sweep(map: Map<string, Bucket>, maxAgeMs: number, now: number) {
  if (map.size < 5000) return;
  for (const [k, v] of map) if (now - v.last > maxAgeMs) map.delete(k);
}

function take(map: Map<string, Bucket>, key: string, cap: number, refillMs: number, now: number) {
  const b = map.get(key) ?? { tokens: cap, last: now };
  // Continuous refill: cap tokens spread evenly over the window.
  b.tokens = Math.min(cap, b.tokens + ((now - b.last) / refillMs) * cap);
  b.last = now;
  if (b.tokens < 1) {
    map.set(key, b);
    return { ok: false, retryAfter: Math.ceil(((1 - b.tokens) * refillMs) / cap / 1000) };
  }
  b.tokens -= 1;
  map.set(key, b);
  return { ok: true, retryAfter: 0 };
}

export type RateResult = { ok: true } | { ok: false; reason: string; retryAfter: number };

/** Sending mail is costlier to abuse than asking a question, so it gets its own. */
export function checkContactRate(key: string): RateResult {
  const now = Date.now();

  if (now > contactResetAt) {
    contactCount = 0;
    contactResetAt = now + 86_400_000;
  }
  if (contactCount >= CONTACT.perDay) {
    return { ok: false, reason: "The form is closed for today. Email still works.", retryAfter: 3600 };
  }

  sweep(contact, CONTACT.refillMs * 2, now);
  const c = take(contact, key, CONTACT.cap, CONTACT.refillMs, now);
  if (!c.ok) {
    return { ok: false, reason: "That's a few messages already. Email me directly instead.", retryAfter: c.retryAfter };
  }

  contactCount += 1;
  return { ok: true };
}

export function checkRate(key: string): RateResult {
  const now = Date.now();

  if (now > globalResetAt) {
    globalCount = 0;
    globalResetAt = now + 86_400_000;
  }
  if (globalCount >= LIMITS.globalPerDay) {
    return { ok: false, reason: "The ask box is taking a breather. Try again tomorrow.", retryAfter: 3600 };
  }

  const prev = lastSeen.get(key);
  if (prev && now - prev < LIMITS.minGapMs) {
    return { ok: false, reason: "One at a time.", retryAfter: 1 };
  }

  sweep(burst, LIMITS.burst.refillMs * 2, now);
  sweep(hourly, LIMITS.hourly.refillMs * 2, now);

  const b = take(burst, key, LIMITS.burst.cap, LIMITS.burst.refillMs, now);
  if (!b.ok) {
    return { ok: false, reason: "Slow down a moment — too many questions at once.", retryAfter: b.retryAfter };
  }

  const h = take(hourly, key, LIMITS.hourly.cap, LIMITS.hourly.refillMs, now);
  if (!h.ok) {
    return { ok: false, reason: "You've hit the hourly limit. The résumé has the rest.", retryAfter: h.retryAfter };
  }

  lastSeen.set(key, now);
  globalCount += 1;
  return { ok: true };
}
