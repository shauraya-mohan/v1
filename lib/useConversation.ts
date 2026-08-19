"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ANSWERS, matchTopicInContext, type Topic } from "./content";

/**
 * Replicate's Gemini SSE emits the whole answer as one event and then replays it
 * as deltas, so the server waits for the complete text and we type it out here.
 * Reveal is paced to land in roughly REVEAL_MS whatever the length.
 */
const REVEAL_MS = 2600;
const MIN_CPS = 34;
const MAX_CPS = 480;

/** How many prior messages travel with the next question. */
const HISTORY_TURNS = 8;

export type Turn = {
  id: number;
  question: string;
  topic: Topic;
  /** Curated turns come from ANSWERS; asked turns come from the model. */
  kind: "curated" | "asked";
  text: string;
  status: "pending" | "done" | "error";
  error?: string;
  /** True only while the typewriter is still revealing this turn. */
  typing: boolean;
  /** Which cards/rows this exchange is actually about, per the model's own
   *  [[SHOW: ...]] tag — null means untagged (curated turns, or a rare parse
   *  miss), which falls back to text-matching. See stripShowTag for why this
   *  exists instead of inferring it from the prose after the fact. */
  entities: string[] | null;
};

function useTypewriter() {
  const [shown, setShown] = useState("");
  const target = useRef("");
  const frame = useRef<number | null>(null);
  const last = useRef(0);
  const exact = useRef(0);

  const stop = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  };

  const tick = useCallback((now: number) => {
    const dt = Math.min(now - (last.current || now), 100); // ignore tab-away jumps
    last.current = now;

    const total = target.current.length;
    const cps = Math.min(MAX_CPS, Math.max(MIN_CPS, (total / REVEAL_MS) * 1000));
    exact.current = Math.min(total, exact.current + (cps * dt) / 1000);

    const n = Math.floor(exact.current);
    setShown(target.current.slice(0, n));

    if (n < total) frame.current = requestAnimationFrame(tick);
    else frame.current = null;
  }, []);

  const start = useCallback(
    (full: string) => {
      stop();
      target.current = full;
      exact.current = 0;
      last.current = 0;
      setShown("");
      frame.current = requestAnimationFrame(tick);
    },
    [tick],
  );

  const reset = useCallback(() => {
    stop();
    target.current = "";
    exact.current = 0;
    setShown("");
  }, []);

  const finish = useCallback(() => {
    stop();
    exact.current = target.current.length;
    setShown(target.current);
  }, []);

  const typing = shown.length < target.current.length;

  return { shown, typing, start, reset, finish };
}

export function useConversation() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const { shown, typing, start, reset, finish } = useTypewriter();

  const ticket = useRef<string | null>(null);
  const inflight = useRef<AbortController | null>(null);
  const nextId = useRef(1);
  const curatedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getTicket = useCallback(async (force = false): Promise<string | null> => {
    if (ticket.current && !force) return ticket.current;
    try {
      const res = await fetch("/api/session", { cache: "no-store" });
      if (!res.ok) return null;
      const { token } = await res.json();
      ticket.current = typeof token === "string" ? token : null;
      return ticket.current;
    } catch {
      return null;
    }
  }, []);

  // Warm the ticket during the boot screen so the first ask has no extra hop.
  useEffect(() => {
    void getTicket();
  }, [getTicket]);

  useEffect(
    () => () => {
      if (curatedTimer.current) clearTimeout(curatedTimer.current);
      inflight.current?.abort();
    },
    [],
  );

  const clear = useCallback(() => {
    inflight.current?.abort();
    inflight.current = null;
    if (curatedTimer.current) clearTimeout(curatedTimer.current);
    reset();
    setTurns([]);
    setActiveId(null);
  }, [reset]);

  /** Nav items and chips: instant, from curated content, still a real turn. */
  const askTopic = useCallback(
    (topic: Topic) => {
      if (curatedTimer.current) clearTimeout(curatedTimer.current);
      inflight.current?.abort();
      reset();

      const id = nextId.current++;
      setTurns((prev) => [
        ...prev,
        { id, question: ANSWERS[topic].q, topic, kind: "curated", text: "", status: "pending", typing: false, entities: null },
      ]);
      setActiveId(id);

      curatedTimer.current = setTimeout(() => {
        setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, status: "done" } : t)));
        setActiveId(null);
      }, 1100);
    },
    [reset],
  );

  /** Typed questions: sent to the model with the conversation so far. */
  const askQuestion = useCallback(
    async (question: string) => {
      if (curatedTimer.current) clearTimeout(curatedTimer.current);
      inflight.current?.abort();
      const ac = new AbortController();
      inflight.current = ac;
      reset();

      const id = nextId.current++;

      // Snapshot history before appending, so the new question isn't in its own context.
      let history: { role: "user" | "assistant"; content: string }[] = [];
      let previousTopic: Topic | null = null;

      setTurns((prev) => {
        const done = prev.filter((t) => t.status === "done");
        previousTopic = done.length ? done[done.length - 1]!.topic : null;
        history = done
          .flatMap((t) => [
            { role: "user" as const, content: t.question },
            {
              role: "assistant" as const,
              content: t.kind === "curated" ? ANSWERS[t.topic].lines.join(" ") : t.text,
            },
          ])
          .slice(-HISTORY_TURNS);

        return [
          ...prev,
          {
            id,
            question,
            topic: matchTopicInContext(question, previousTopic),
            kind: "asked",
            text: "",
            status: "pending",
            typing: false,
            entities: null,
          },
        ];
      });
      setActiveId(id);

      const fail = (message: string) => {
        setTurns((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: "error", error: message } : t)),
        );
        setActiveId(null);
      };

      const run = async (tok: string, allowRetry: boolean): Promise<void> => {
        const res = await fetch("/api/ask", {
          method: "POST",
          signal: ac.signal,
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ question, token: tok, history, topic: previousTopic }),
        });

        if (res.status === 401 && allowRetry) {
          const fresh = await getTicket(true);
          if (fresh) return run(fresh, false);
        }

        const body = await res.text();
        if (!res.ok) return fail(body || "Something went wrong. Try again.");

        const topic = (res.headers.get("x-topic") as Topic | null) ?? matchTopicInContext(question, previousTopic);
        const entitiesHeader = res.headers.get("x-entities");
        const entities = entitiesHeader === null ? null : entitiesHeader.split("|").filter(Boolean);
        setTurns((prev) =>
          prev.map((t) => (t.id === id ? { ...t, topic, text: body, status: "done", entities } : t)),
        );
        start(body);
      };

      try {
        const tok = await getTicket();
        if (!tok) return fail("Couldn't start a session. Reload the page.");
        await run(tok, true);
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        fail("Something went wrong. Try again.");
      } finally {
        if (inflight.current === ac) inflight.current = null;
      }
    },
    [getTicket, reset, start],
  );

  // The turn being typed shows the partial text; everything else is final.
  const rendered = turns.map((t) => {
    if (t.id !== activeId || t.status !== "done" || t.kind !== "asked") return t;
    return { ...t, text: shown, typing: shown.length < t.text.length };
  });

  const last = turns[turns.length - 1];
  const busy =
    (!!last && last.status === "pending") || (activeId !== null && typing);

  // Release the active turn once it has finished typing.
  useEffect(() => {
    if (activeId !== null && !typing) {
      const t = turns.find((x) => x.id === activeId);
      if (t?.status === "done" && t.kind === "asked") setActiveId(null);
    }
  }, [activeId, typing, turns]);

  return { turns: rendered, busy, askTopic, askQuestion, clear, skip: finish, ticket: getTicket };
}
