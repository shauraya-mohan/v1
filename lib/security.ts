import { createHmac, randomBytes, timingSafeEqual, createHash } from "node:crypto";

const SECRET = process.env.ASK_SIGNING_SECRET ?? "";
const TTL_MS = 30 * 60 * 1000; // 30 minutes

if (!SECRET && process.env.NODE_ENV === "production") {
  throw new Error("ASK_SIGNING_SECRET is not set");
}

const b64url = (b: Buffer) => b.toString("base64url");

/** Best-effort client IP. Vercel/most proxies set x-forwarded-for. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export function ipHash(ip: string): string {
  return createHash("sha256").update(ip + SECRET).digest("base64url").slice(0, 16);
}

/**
 * Only accept requests the browser itself sent from this site. A cross-origin
 * fetch cannot forge Origin, so this blocks other sites proxying the endpoint.
 */
export function originOk(req: Request): boolean {
  const origin = req.headers.get("origin");
  // Same-origin navigations/fetches from some browsers omit Origin entirely.
  if (!origin) return req.headers.get("sec-fetch-site") !== "cross-site";

  const extra = (process.env.ASK_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (extra.includes(origin)) return true;

  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

/**
 * Stateless signed ticket: `exp.iphash.nonce.sig`. Bound to the caller's IP and
 * short-lived, so a token scraped from devtools is useless elsewhere and dies
 * on its own. No storage, so it survives serverless cold starts.
 */
export function mintToken(ip: string): string {
  const payload = `${Date.now() + TTL_MS}.${ipHash(ip)}.${b64url(randomBytes(9))}`;
  const sig = b64url(createHmac("sha256", SECRET).update(payload).digest());
  return `${payload}.${sig}`;
}

export function verifyToken(token: unknown, ip: string): boolean {
  if (typeof token !== "string" || token.length > 256) return false;

  const cut = token.lastIndexOf(".");
  if (cut < 1) return false;

  const payload = token.slice(0, cut);
  const given = Buffer.from(token.slice(cut + 1));
  const want = createHmac("sha256", SECRET).update(payload).digest();
  const wantB64 = Buffer.from(b64url(want));

  if (given.length !== wantB64.length || !timingSafeEqual(given, wantB64)) return false;

  const [exp, boundIp] = payload.split(".");
  if (!exp || !boundIp) return false;
  if (Number(exp) < Date.now()) return false;
  return boundIp === ipHash(ip);
}
