import { checkContactRate } from "@/lib/ratelimit";
import { clientIp, ipHash, originOk, verifyToken } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAILJS = "https://api.emailjs.com/api/v1.0/email/send";

const CAPS = { name: 120, email: 160, org: 160, message: 4000, who: 40 };

const deny = (status: number, message: string, extra?: Record<string, string>) =>
  new Response(message, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", ...extra },
  });

const clean = (v: unknown, cap: number) =>
  typeof v === "string"
    ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]+/g, " ").trim().slice(0, cap)
    : "";

export async function POST(req: Request) {
  if (!originOk(req)) return deny(403, "Forbidden.");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return deny(400, "Bad request.");
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const ip = clientIp(req);
  if (!verifyToken(b.token, ip)) return deny(401, "Session expired. Reload the page.");

  // The honeypot is invisible to people, so anything in it is a bot. Accept and
  // drop rather than erroring, which tells the bot nothing.
  if (clean(b.decoy, 200)) return new Response("ok", { status: 200 });

  const name = clean(b.name, CAPS.name);
  const email = clean(b.email, CAPS.email);
  const org = clean(b.org, CAPS.org);
  const message = clean(b.message, CAPS.message);
  const who = clean(b.who, CAPS.who) || "Someone";

  if (!name || !email || !message) return deny(400, "Name, email and a message, please.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return deny(400, "That email doesn't look right.");
  if (message.length < 10) return deny(400, "A little more to go on, please.");

  const rate = checkContactRate(ipHash(ip));
  if (!rate.ok) return deny(429, rate.reason, { "retry-after": String(rate.retryAfter) });

  const service = process.env.EMAILJS_SERVICE_ID;
  const template = process.env.EMAILJS_TEMPLATE_ID;
  const key = process.env.EMAILJS_PUBLIC_KEY;
  if (!service || !template || !key) {
    return deny(503, "The form isn't wired up yet. Email works.", { "x-contact": "unconfigured" });
  }

  // Fold the extras into the body so nothing is lost if the EmailJS template
  // only references from_name / from_email / message.
  const composed = [
    message,
    "",
    `— ${who}${org ? ` at ${org}` : ""}`,
    `Reply to: ${email}`,
  ].join("\n");

  const params: Record<string, string> = {
    from_name: name,
    from_email: email,
    reply_to: email,
    message: composed,
    who,
    company: org,
    subject: `${who} via shauraya.ca — ${name}`,
  };

  try {
    const res = await fetch(EMAILJS, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        service_id: service,
        template_id: template,
        user_id: key,
        ...(process.env.EMAILJS_PRIVATE_KEY ? { accessToken: process.env.EMAILJS_PRIVATE_KEY } : {}),
        template_params: params,
      }),
    });

    if (res.ok) return new Response("ok", { status: 200 });

    const detail = await res.text().catch(() => "");

    // EmailJS refuses server-side calls until that account setting is enabled.
    // Tell the client to send it from the browser instead of failing outright.
    if (res.status === 403 && /non-browser/i.test(detail)) {
      return new Response("browser", { status: 409, headers: { "x-contact": "needs-browser" } });
    }

    console.error("emailjs send failed", res.status, detail);
    return deny(502, "That didn't send. Email works.");
  } catch (err) {
    console.error("contact failed", err);
    return deny(502, "That didn't send. Email works.");
  }
}
