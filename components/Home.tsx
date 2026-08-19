"use client";

import { type RefObject } from "react";
import { ICON, LABEL, type Topic } from "@/lib/content";
import { Composer } from "./Composer";
import { Mark, Stroke } from "./Mark";

const CHIPS: { topic: Topic; icon: string }[] = [
  { topic: "projects", icon: ICON.code },
  { topic: "resume", icon: ICON.pen },
  { topic: "music", icon: ICON.note },
  { topic: "contact", icon: ICON.mail },
];

type Props = {
  greeting: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onSubmit: () => void;
  onAsk: (t: Topic) => void;
};

export function Home({ greeting, inputRef, onSubmit, onAsk }: Props) {
  return (
    <div className="home">
      <div className="home-head">
        <Mark size={38} />
        <h1>{greeting}</h1>
      </div>

      <Composer variant="home" inputRef={inputRef} onSubmit={onSubmit} onAsk={onAsk} />

      <div className="chips">
        {CHIPS.map((c) => (
          <button key={c.topic} onClick={() => onAsk(c.topic)}>
            <Stroke d={c.icon} size={14} color="#D97757" />
            {LABEL[c.topic]}
          </button>
        ))}
      </div>
    </div>
  );
}
