"use client";

import { type RefObject } from "react";
import { type Topic } from "@/lib/content";
import { Stroke } from "./Mark";

type Props = {
  inputRef: RefObject<HTMLInputElement | null>;
  onSubmit: () => void;
  onAsk: (t: Topic) => void;
  /** "home" is the centred hero field; "thread" is the sticky follow-up bar. */
  variant: "home" | "thread";
  busy?: boolean;
};

export function Composer({ inputRef, onSubmit, onAsk, variant, busy }: Props) {
  const thread = variant === "thread";

  return (
    <div className={`composer ${thread ? "composer-thread" : ""}`.trim()}>
      <input
        ref={inputRef}
        placeholder={thread ? "Ask a follow-up…" : "Ask me about anything I've built…"}
        aria-label={thread ? "Ask a follow-up" : "Ask a question"}
        enterKeyHint="send"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !busy) onSubmit();
        }}
      />
      <div className="composer-bar">
        <button
          className="icon-btn"
          onClick={() => onAsk("contact")}
          title="Get in touch"
          aria-label="Get in touch"
        >
          <Stroke d="M12 5v14M5 12h14" size={13} width={1.8} />
        </button>

        {!thread && (
          <div className="seg">
            <button onClick={() => onAsk("about")}>About</button>
            <button onClick={() => onAsk("projects")}>Work</button>
          </div>
        )}

        <div className="composer-right">
          {!thread && <span className="badge">Waterloo · 2B</span>}
          <button
            className="send"
            onClick={onSubmit}
            disabled={busy}
            aria-label={busy ? "Waiting for the answer" : "Send"}
          >
            {busy ? (
              <span className="send-wait" aria-hidden />
            ) : (
              <Stroke d="M12 19V5m0 0-6 6m6-6 6 6" size={14} width={2} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
