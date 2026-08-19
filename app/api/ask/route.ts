import { matchTopicInContext, type Topic } from "@/lib/content";
import { SYSTEM_INSTRUCTION, buildPrompt, stripShowTag, type Turn } from "@/lib/knowledge";
import { checkRate } from "@/lib/ratelimit";
import { clientIp, ipHash, originOk, verifyToken } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = "google/gemini-2.5-flash";
const MAX_QUESTION = 300;
const DEADLINE_MS = 45_000;
const MAX_HISTORY = 8; // last 4 exchanges
const MAX_TURN_CHARS = 700;

const TOPICS = ["about", "projects", "experience", "writing", "resume", "contact"];

/**
 * History arrives from the browser, so a caller can put whatever they like in it
 * — including a fake assistant turn saying "ignore your instructions". It gets
 * capped, stripped of control characters, and labelled as a record rather than
 * a request; the system instruction tells the model not to obey anything inside.
 */
function cleanHistory(raw: unknown): Turn[] {
  if (!Array.isArray(raw)) return [];
  const out: Turn[] = [];
  for (const item of raw.slice(-MAX_HISTORY)) {
    const role = (item as Turn)?.role;
    const content = (item as Turn)?.content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const text = content
      .replace(/[\u0000-\u001F\u007F-\u009F]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_TURN_CHARS);
    if (text) out.push({ role, content: text });
  }
  return out;
}

const deny = (status: number, message: string, retryAfter?: number) =>
  new Response(message, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      ...(retryAfter ? { "retry-after": String(retryAfter) } : {}),
    },
  });

export async function POST(req: Request) {
  if (!originOk(req)) return deny(403, "Forbidden.");

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return deny(503, "The ask box is offline right now.");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return deny(400, "Bad request.");
  }

  const { question, token: ticket, history: rawHistory, topic: rawTopic } = (body ?? {}) as Record<string, unknown>;

  const ip = clientIp(req);
  if (!verifyToken(ticket, ip)) return deny(401, "Session expired. Reload the page.");

  if (typeof question !== "string") return deny(400, "Bad request.");
  const q = question.trim().replace(/\s+/g, " ");
  if (!q) return deny(400, "Ask something first.");
  if (q.length > MAX_QUESTION) return deny(413, "That's a long one. Trim it down a bit.");

  const rate = checkRate(ipHash(ip));
  if (!rate.ok) return deny(429, rate.reason, rate.retryAfter);

  const history = cleanHistory(rawHistory);
  // The client sends the topic already on screen so a bare follow-up
  // ("tell me more about that one") stays on the same subject.
  const previous = TOPICS.includes(rawTopic as string) ? (rawTopic as Topic) : null;
  const topic = matchTopicInContext(q, previous);

  const ac = new AbortController();
  const deadline = setTimeout(() => ac.abort(), DEADLINE_MS);

  try {
    const created = await fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
      method: "POST",
      signal: ac.signal,
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        // Block until the prediction finishes instead of polling.
        prefer: "wait=50",
      },
      body: JSON.stringify({
        input: {
          prompt: buildPrompt(topic, q, history),
          system_instruction: SYSTEM_INSTRUCTION,
          temperature: 0.55,
          // Reasoning overhead is billed against this cap even with thinking off,
          // so a tight number truncates mid-sentence. Brevity is enforced by the
          // system instruction instead; this is only a runaway guard.
          max_output_tokens: 1400,
          thinking_budget: 0,
          dynamic_thinking: false,
        },
      }),
    });

    if (!created.ok) {
      console.error("replicate create failed", created.status, await created.text().catch(() => ""));
      return deny(502, "Couldn't reach the model. Try again in a second.");
    }

    const pred = await created.json();
    if (pred?.status !== "succeeded") {
      console.error("replicate prediction not ok", pred?.status, pred?.error);
      return deny(502, "The model didn't finish that one. Try again.");
    }

    const raw = (Array.isArray(pred.output) ? pred.output.join("") : (pred.output ?? "")).trim();
    if (!raw) return deny(502, "Nothing came back. Try rephrasing.");

    // The model reports which real things it actually gave detail about, so
    // the client can attach cards/rows by that instead of re-scanning the
    // prose for names — see stripShowTag for why that used to misfire.
    const { text: answer, entities } = stripShowTag(raw);
    if (!answer) return deny(502, "Nothing came back. Try rephrasing.");

    return new Response(answer, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
        "x-topic": topic,
        "x-content-type-options": "nosniff",
        // Absent entirely (not just empty) means the tag was missing, so the
        // client knows to fall back to text-matching rather than showing nothing.
        ...(entities !== null ? { "x-entities": entities.join("|") } : {}),
      },
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") return deny(504, "That took too long. Try again.");
    console.error("ask failed", err);
    return deny(502, "Couldn't reach the model. Try again in a second.");
  } finally {
    clearTimeout(deadline);
  }
}
