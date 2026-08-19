"use client";

import { CARDS, ICON, LABEL, LINKS, ROWS, type Topic } from "@/lib/content";
import { Mark, Stroke } from "./Mark";
import { NowPlaying } from "./Music";

const BRAND = {
  github:
    "M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z",
  linkedin:
    "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.85V21h-4V9Z",
};

const NAV: { topic: Topic; icon: string }[] = [
  { topic: "about", icon: ICON.user },
  { topic: "projects", icon: ICON.folder },
  { topic: "music", icon: ICON.note },
  { topic: "experience", icon: ICON.brief },
];

// Derived from the roles themselves so the two can't drift apart.
const PINNED = ROWS.slice(0, 3).map((r, i) => ({
  name: r.name,
  label: `${r.name}, ${r.role.replace(/ (Engineer|Intern)$/, "")}`,
  year: (r.meta.match(/\b(20\d{2})\b(?!.*\b20\d{2}\b)/) ?? [])[1] ?? "",
  dim: i < 2 ? 1 : 0.55,
}));

type Props = {
  started: boolean;
  topic: Topic | null;
  theme: "light" | "dark";
  onAsk: (t: Topic) => void;
  /** Sends a written question, so a sidebar item reads like something a person asked. */
  onAskText: (q: string) => void;
  onHome: () => void;
  onToggleRail: () => void;
  onToggleTheme: () => void;
};

export function Rail({
  started,
  topic,
  theme,
  onAsk,
  onAskText,
  onHome,
  onToggleRail,
  onToggleTheme,
}: Props) {
  return (
    <aside className="rail">
      <div className="rail-head">
        <Mark size={17} />
        <span className="rail-wordmark">Shauraya</span>
        <span className="rail-head-actions">
          <button onClick={onToggleRail} title="Hide sidebar" aria-label="Hide sidebar">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
              <path d="M9.5 4.5v15" />
            </svg>
          </button>
        </span>
      </div>

      <div className="tabs">
        <button className={started ? "" : "on"} onClick={onHome}>
          Home
        </button>
        <button className={started ? "on" : ""} onClick={() => onAsk("projects")}>
          Work
        </button>
      </div>

      <button className="touch" onClick={() => onAsk("contact")}>
        <Stroke d="M12 5v14M5 12h14" color="#D97757" width={1.7} />
        Get in touch
      </button>

      <nav className="nav">
        {NAV.map((n) => (
          <button
            key={n.topic}
            className={topic === n.topic ? "on" : ""}
            onClick={() => onAsk(n.topic)}
          >
            <Stroke d={n.icon} />
            {LABEL[n.topic]}
          </button>
        ))}
      </nav>

      <div className="group">
        <div className="group-label">Pinned</div>
        {PINNED.map((p) => (
          <button
            key={p.label}
            className="pin"
            onClick={() => onAskText(`What did you do at ${p.name}?`)}
          >
            <span className="dot" style={{ opacity: p.dim }} />
            <span className="name">{p.label}</span>
            <span className="year">{p.year}</span>
          </button>
        ))}
      </div>

      <div className="group recent">
        <div className="group-label">Recent</div>
        {CARDS.map((c) => (
          <button key={c.title} onClick={() => onAskText(`Tell me about ${c.title}`)}>
            {c.title}
          </button>
        ))}
      </div>

      <NowPlaying />

      <a className="rail-resume" href={LINKS.resume} target="_blank" rel="noreferrer noopener">
        <Stroke d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" />
        Résumé
        <span className="ext">PDF</span>
      </a>

      <div className="rail-foot">
        <a href={LINKS.github} target="_blank" rel="noreferrer noopener" title="GitHub" aria-label="GitHub">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
            <path d={BRAND.github} />
          </svg>
        </a>
        <a href={LINKS.linkedin} target="_blank" rel="noreferrer noopener" title="LinkedIn" aria-label="LinkedIn">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden>
            <path d={BRAND.linkedin} />
          </svg>
        </a>
        <a href={LINKS.email} title={LINKS.emailText} aria-label="Email">
          <Stroke d={ICON.mail} />
        </a>
        <button
          className="theme-btn"
          onClick={onToggleTheme}
          title="Theme"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          <Stroke d={theme === "dark" ? ICON.sun : ICON.moon} />
        </button>
      </div>

      <div className="who">
        <div className="avatar">SM</div>
        <div className="meta">
          <div className="n">Shauraya Mohan</div>
          <div className="s">Waterloo · 2B</div>
        </div>
      </div>
    </aside>
  );
}
