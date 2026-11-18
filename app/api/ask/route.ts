import OpenAI from "openai";
import { matchTopicInContext, type Topic } from "@/lib/content";
import { SYSTEM_INSTRUCTION, buildPrompt, stripShowTag, type Turn } from "@/lib/knowledge";
import { checkRate } from "@/lib/ratelimit";
import { clientIp, ipHash, originOk, verifyToken } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Cheapest current general chat model, and the recommended successor to
// gpt-4o-mini. reasoning_effort "none" matches the old Gemini call, which ran
// with thinking disabled: temperature stays valid, and the token cap below
// applies to the visible answer instead of hidden reasoning.
const MODEL = "gpt-6-luna";
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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return deny(503, "The ask box is offline right now.");

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

  const client = new OpenAI({ apiKey, timeout: DEADLINE_MS });

  try {
    const completion = await client.chat.completions.create(
      {
        model: MODEL,
        temperature: 0.55,
        // Runaway guard only. A tight cap truncates mid-sentence; the system
        // instruction is what keeps answers short.
        max_completion_tokens: 1400,
        reasoning_effort: "none",
        messages: [
          { role: "developer", content: SYSTEM_INSTRUCTION },
          { role: "user", content: buildPrompt(topic, q, history) },
        ],
      },
      { signal: ac.signal },
    );

    const raw = (completion.choices[0]?.message?.content ?? "").trim();
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
    if (
      err instanceof OpenAI.APIUserAbortError ||
      err instanceof OpenAI.APIConnectionTimeoutError ||
      (err instanceof Error && err.name === "AbortError")
    ) {
      return deny(504, "That took too long. Try again.");
    }
    const status = err instanceof OpenAI.APIError ? err.status : "";
    console.error("openai request failed", status, err instanceof Error ? err.message : err);
    return deny(502, "Couldn't reach the model. Try again in a second.");
  } finally {
    clearTimeout(deadline);
  }
}
