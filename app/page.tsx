"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Boot } from "@/components/Boot";
import { Composer } from "@/components/Composer";
import { FaviconSpinner } from "@/components/FaviconSpinner";
import { Home } from "@/components/Home";
import { Rail } from "@/components/Rail";
import { Thread } from "@/components/Thread";
import { VERBS, greetingFor, type Topic } from "@/lib/content";
import { useConversation } from "@/lib/useConversation";

const BOOT_MS = 2500;
const VERB_CYCLE_MS = 1500;
const THEME_KEY = "sm-portfolio-theme";
const RAIL_KEY = "sm-portfolio-rail-hidden";

const pickVerb = () => VERBS[Math.floor(Math.random() * VERBS.length)];

export default function Page() {
  const [booting, setBooting] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [railOpen, setRailOpen] = useState(false);
  const [railHidden, setRailHidden] = useState(false);

  // Random verb and clock-based greeting are client-only — they'd mismatch on hydrate.
  const [verb, setVerb] = useState("Thinking");
  const [greeting, setGreeting] = useState("Hey, I'm Shauraya");

  const { turns, busy, askTopic, askQuestion, clear, skip, ticket } = useConversation();

  const inputRef = useRef<HTMLInputElement>(null);
  const followRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const started = turns.length > 0;

  useEffect(() => {
    setVerb(pickVerb());
    setGreeting(greetingFor(new Date().getHours()));

    let saved: string | null = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch {}
    if (saved === "light" || saved === "dark") setTheme(saved);
    try {
      setRailHidden(localStorage.getItem(RAIL_KEY) === "1");
    } catch {}

    const t = setTimeout(() => setBooting(false), BOOT_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // colorScheme drives every light-dark() token; data-theme lets CSS branch on
    // things light-dark() can't express, like the logo inversion filter.
    document.documentElement.style.colorScheme = theme;
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle("rail-open", railOpen);
  }, [railOpen]);

  useEffect(() => {
    document.body.classList.toggle("rail-hidden", railHidden);
  }, [railHidden]);

  // One control for both behaviours: a drawer on narrow screens, a collapse on wide.
  const toggleRail = useCallback(() => {
    if (window.matchMedia("(max-width:859px)").matches) {
      setRailOpen((o) => !o);
      return;
    }
    setRailHidden((h) => {
      const next = !h;
      try {
        localStorage.setItem(RAIL_KEY, next ? "1" : "0");
      } catch {}
      return next;
    });
  }, []);

  // A new question lands at the top of the viewport, not the bottom — the
  // answer then types itself out and any cards arrive underneath, in the
  // space below, without dragging the scroll position down to chase them.
  //
  // The naive version of this scrolls-to-top once, right when the question is
  // asked — but at that instant the answer is still just a "thinking"
  // placeholder, so the browser clamps the scroll to however little content
  // exists *yet*. Nothing reruns as the real answer grows in afterward, so it
  // stays stuck wherever that early clamp left it. Same fix ChatGPT-style UIs
  // use: reserve a full screen of space below the new question immediately,
  // so scrolling it flush to the top is always achievable on the first try,
  // however long the answer turns out to be. The reserved space collapses
  // once a newer question replaces it as the last one.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !started) return;
    const exchanges = el.querySelectorAll<HTMLElement>(".exchange");

    for (let i = 0; i < exchanges.length - 1; i++) exchanges[i]!.style.minHeight = "";

    const last = exchanges[exchanges.length - 1];
    if (!last) return;
    last.style.minHeight = `${Math.max(0, el.clientHeight - 24)}px`;

    // rect-delta rather than offsetTop: offsetTop is relative to the nearest
    // positioned ancestor, which may not be this scroll container at all.
    const delta = last.getBoundingClientRect().top - el.getBoundingClientRect().top;
    el.scrollTop = Math.max(0, el.scrollTop + delta - 10);
  }, [turns.length, started]);

  const ask = useCallback(
    (t: Topic) => {
      setRailOpen(false);
      setVerb(pickVerb());
      askTopic(t);
    },
    [askTopic],
  );

  const goHome = useCallback(() => {
    clear();
    setRailOpen(false);
  }, [clear]);

  const askText = useCallback(
    (q: string) => {
      if (busy) return;
      setRailOpen(false);
      setVerb(pickVerb());
      void askQuestion(q);
    },
    [askQuestion, busy],
  );

  const submit = useCallback(
    (ref: React.RefObject<HTMLInputElement | null>) => () => {
      const q = ref.current?.value.trim() ?? "";
      if (!q) return;
      if (ref.current) ref.current.value = "";
      askText(q);
    },
    [askText],
  );

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  // Escape skips the typewriter for anyone who reads faster than it types.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip]);

  // Keep Claude's loading verbs rolling while we wait on an answer.
  const pending = turns.some((t) => t.status === "pending");
  useEffect(() => {
    if (!pending) return;
    const id = setInterval(() => setVerb(pickVerb()), VERB_CYCLE_MS);
    return () => clearInterval(id);
  }, [pending]);

  const currentTopic = turns.length ? turns[turns.length - 1]!.topic : null;

  return (
    <>
      <FaviconSpinner active={pending} />
      {booting && <Boot verb={verb} ms={BOOT_MS} />}

      <div className="shell">
        <Rail
          started={started}
          topic={currentTopic}
          theme={theme}
          onAsk={ask}
          onAskText={askText}
          onHome={goHome}
          onToggleRail={toggleRail}
          onToggleTheme={toggleTheme}
        />

        <main className={started ? "main main-chat" : "main"}>
          <button
            className="hamburger"
            onClick={toggleRail}
            aria-label="Show sidebar"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          {!started ? (
            <Home
              greeting={greeting}
              inputRef={inputRef}
              onSubmit={submit(inputRef)}
              onAsk={ask}
            />
          ) : (
            <div className="conversation">
              <div className="thread-scroll" ref={scrollRef}>
                <Thread turns={turns} verb={verb} onAsk={ask} onHome={goHome} ticket={ticket} />
              </div>
              <div className="follow-dock">
                <Composer
                  variant="thread"
                  inputRef={followRef}
                  onSubmit={submit(followRef)}
                  onAsk={ask}
                  busy={busy}
                />
              </div>
            </div>
          )}
        </main>

        <div className="scrim" onClick={() => setRailOpen(false)} />
      </div>
    </>
  );
}
