"use client";

import { Fragment, useCallback, useRef, useState, type ReactNode } from "react";
import {
  ALL_ROWS,
  ANSWERS,
  CARDS,
  LABEL,
  LINKS,
  stagger,
  type Card,
  type CardLink,
  type Row,
  type Topic,
} from "@/lib/content";
import { selectCards, selectRows } from "@/lib/entities";
import type { Turn } from "@/lib/useConversation";
import { LinkIcon } from "./LinkIcon";
import { Mark, Stroke } from "./Mark";
import { ContactForm } from "./ContactForm";
import { MusicPanel } from "./Music";
import { ProjectModal } from "./ProjectModal";

const ARROW = "M7 17 17 7M9 7h8v8";

/** Turn bare emails and urls in model output into real links. */
const LINKABLE =
  /(https?:\/\/[^\s<>()]+|(?:www\.|github\.com\/|linkedin\.com\/)[^\s<>()]+|[\w.+-]+@[\w-]+\.[\w.]+)/g;

function linkify(text: string): ReactNode[] {
  return text.split(LINKABLE).map((part, i) => {
    if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
    const trimmed = part.replace(/[.,;:]$/, "");
    const tail = part.slice(trimmed.length);
    const href = trimmed.includes("@")
      ? `mailto:${trimmed}`
      : trimmed.startsWith("http")
        ? trimmed
        : `https://${trimmed}`;
    return (
      <Fragment key={i}>
        <a className="inline-link" href={href} target="_blank" rel="noreferrer noopener">
          {trimmed}
        </a>
        {tail}
      </Fragment>
    );
  });
}

function LinkRow({ links, className = "" }: { links: CardLink[]; className?: string }) {
  if (!links.length) return null;
  return (
    <div className={`linkrow ${className}`.trim()}>
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target={l.href.startsWith("mailto:") ? undefined : "_blank"}
          rel="noreferrer noopener"
        >
          <LinkIcon kind={l.kind} size={12} />
          {l.label}
          <Stroke d={ARROW} size={11} width={1.6} className="kick" />
        </a>
      ))}
    </div>
  );
}

function ProjectCard({
  card,
  delay,
  onOpen,
}: {
  card: Card;
  delay: string;
  onOpen: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);

  // Hover previews the demo. Nothing is fetched until the pointer lands, and
  // it rewinds on the way out so the next hover starts from the top.
  const enter = useCallback(() => {
    const el = video.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    void el.play().catch(() => {});
  }, []);

  const leave = useCallback(() => {
    const el = video.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
  }, []);

  return (
    <div
      className="card"
      style={{ animationDelay: delay }}
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      <button className="card-open" onClick={onOpen} aria-label={`Open ${card.title}`}>
        {card.img && (
          <span className="shot" style={{ backgroundImage: `url("${card.img}")` }}>
            {card.demo && (
              <video
                ref={video}
                src={card.demo}
                muted
                loop
                playsInline
                preload="none"
                tabIndex={-1}
                aria-hidden
              />
            )}
            <span className="shot-cue">
              <Stroke d="M9 7.5 17 12l-8 4.5V7.5Z" size={13} width={1.5} />
              Play
            </span>
          </span>
        )}
        <span className="card-body">
          <span className="card-title">{card.title}</span>
          <span className="card-blurb">{card.blurb}</span>
        </span>
      </button>
      <div className="card-foot">
        <LinkRow links={card.links} className="tight" />
      </div>
    </div>
  );
}

function Attachments({
  cards,
  rows,
  socials,
  note,
  form,
  music,
  delayFrom,
  onOpen,
  onWrite,
}: {
  cards?: Card[];
  rows?: Row[];
  socials?: CardLink[];
  note?: string;
  form?: boolean;
  music?: boolean;
  delayFrom: number;
  onOpen: (c: Card) => void;
  onWrite: () => void;
}) {
  const answer = { cards, rows, socials, note };
  return (
    <div className="attachments">
      {answer.cards && answer.cards.length > 0 && (
        <div className="cards" data-count={answer.cards.length}>
          {answer.cards.map((c, i) => (
            <ProjectCard
              key={c.title}
              card={c}
              delay={stagger(i + delayFrom)}
              onOpen={() => onOpen(c)}
            />
          ))}
        </div>
      )}

      {answer.rows && answer.rows.length > 0 && (
        <div className="rows">
          {answer.rows.map((r, i) => (
            <div className="row" key={r.name} style={{ animationDelay: stagger(i + delayFrom) }}>
              <div
                className={r.mono ? "logo logo-mono" : "logo"}
                style={{ backgroundImage: `url("${r.logo}")` }}
              />
              <div className="rbody">
                <div className="rhead">
                  <span className="rname">
                    {r.href ? (
                      <a href={r.href} target="_blank" rel="noreferrer noopener">
                        {r.name}
                        <Stroke d={ARROW} size={11} width={1.6} />
                      </a>
                    ) : (
                      r.name
                    )}
                  </span>
                  <span className="rrole">{r.role}</span>
                  <span className="rmeta">{r.meta}</span>
                </div>
                <div className="rline">{r.line}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {music && <MusicPanel />}
      {answer.socials && <LinkRow links={answer.socials} />}
      {answer.note && <div className="note">{answer.note}</div>}

      {form && (
        <div className="write-cta">
          <p>Rather just write something? I read everything that comes through.</p>
          <button className="btn-primary" onClick={onWrite}>
            Send a message
            <Stroke d="M7 17 17 7M9 7h8v8" size={12} width={1.7} />
          </button>
        </div>
      )}
    </div>
  );
}

function Exchange({
  turn,
  cards,
  rows,
  showAttachments,
  isLast,
  verb,
  onAsk,
  onOpen,
  onWrite,
}: {
  turn: Turn;
  cards?: Card[];
  rows?: Row[];
  showAttachments: boolean;
  isLast: boolean;
  verb: string;
  onAsk: (t: Topic) => void;
  onOpen: (c: Card) => void;
  onWrite: () => void;
}) {
  const answer = ANSWERS[turn.topic];
  const curated = turn.kind === "curated";
  const paragraphs = curated ? answer.lines : turn.text.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="exchange">
      <div className="bubble">{turn.question}</div>

      {turn.status === "pending" ? (
        <div className="thinking">
          <Mark size={21} className="mark-think" />
          <span className="sweep-sm">{verb}…</span>
        </div>
      ) : (
        <div className="answer">
          <div className="answer-body">
            {turn.status === "error" ? (
              <div className="oops">
                <p>{turn.error}</p>
                <LinkRow
                  links={[
                    { label: "Résumé", href: LINKS.resume, kind: "doc" },
                    { label: LINKS.emailText, href: LINKS.email, kind: "mail" },
                  ]}
                />
              </div>
            ) : (
              <>
                <div className="prose">
                  {paragraphs.map((text, i) => (
                    <p key={i} style={curated ? { animationDelay: stagger(i) } : undefined}>
                      {curated ? text : linkify(text)}
                      {turn.typing && i === paragraphs.length - 1 && (
                        <span className="caret" aria-hidden />
                      )}
                    </p>
                  ))}
                </div>

                {showAttachments && (
                  <Attachments
                    cards={cards}
                    rows={rows}
                    socials={curated || turn.topic === "contact" ? answer.socials : undefined}
                    note={curated ? answer.note : undefined}
                    form={answer.form}
                    music={answer.music}
                    delayFrom={curated ? 1 : 0}
                    onOpen={onOpen}
                    onWrite={onWrite}
                  />
                )}
              </>
            )}

            {/* Only the newest answer offers next steps, so old ones don't compete. */}
            {isLast && (
              <div className="follow">
                {answer.follow.map((f) => (
                  <button key={f} onClick={() => onAsk(f)}>
                    {LABEL[f]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function Thread({
  turns,
  verb,
  onAsk,
  onHome,
  ticket,
}: {
  turns: Turn[];
  verb: string;
  onAsk: (t: Topic) => void;
  onHome: () => void;
  ticket: () => Promise<string | null>;
}) {
  const [open, setOpen] = useState<Card | null>(null);
  const [writing, setWriting] = useState(false);

  // Curated turns (nav clicks) show their own fixed set exactly as authored —
  // that pairing IS the deliberate answer, so it needs no searching. A typed
  // question isn't confined to one topic: the router's topic guess only steers
  // the prompt, so an AI answer searches every card and every row by name,
  // and attaches only the ones actually named — never a guess, never "show
  // everything" when nothing was.
  const attachmentsFor = (turn: Turn) => {
    const answer = ANSWERS[turn.topic];
    if (turn.kind === "curated") return { cards: answer.cards, rows: answer.rows };

    // The model's own [[SHOW: ...]] tag says exactly what it gave real detail
    // about — trust that over guessing from the prose. Text-matching is only
    // a fallback for the rare case the tag didn't parse.
    if (turn.entities !== null) {
      const named = new Set(turn.entities);
      return {
        cards: CARDS.filter((c) => named.has(c.title)),
        rows: ALL_ROWS.filter((r) => named.has(r.name)),
      };
    }
    const context = `${turn.question} ${turn.text}`;
    return { cards: selectCards(context, CARDS), rows: selectRows(context, ALL_ROWS) };
  };

  // What each turn would attach, as a comparable string.
  const signatures = turns.map((turn) => {
    const answer = ANSWERS[turn.topic];
    const { cards, rows } = attachmentsFor(turn);
    const parts = [
      ...(cards ? cards.map((c) => c.title) : []),
      ...(rows ? rows.map((r) => r.name) : []),
      ...(answer.socials && turn.kind === "curated" ? ["socials"] : []),
      ...(answer.note && turn.kind === "curated" ? ["note"] : []),
      ...(answer.form ? ["form"] : []),
      ...(answer.music ? ["music"] : []),
    ];
    return parts.join("|");
  });

  return (
    <div className="thread">
      <button className="back" onClick={onHome}>
        <Stroke d="M15 18l-6-6 6-6" size={13} width={1.7} />
        new conversation
      </button>

      {turns.map((turn, i) => {
        const answer = ANSWERS[turn.topic];

        // Curated turns show their fixed set; asked turns show only what got
        // named in this exchange, question and answer both.
        const { cards, rows } = attachmentsFor(turn);

        // Don't repeat the identical set directly above.
        const shownAbove = signatures[i - 1];
        const signature = signatures[i];
        const repeat = !!signature && signature === shownAbove;

        const showAttachments =
          turn.status === "done" && !turn.typing && !repeat && !!signature;

        return (
          <Exchange
            key={turn.id}
            turn={turn}
            cards={cards}
            rows={rows}
            showAttachments={showAttachments}
            isLast={i === turns.length - 1}
            verb={verb}
            onAsk={onAsk}
            onOpen={setOpen}
            onWrite={() => setWriting(true)}
          />
        );
      })}

      {open && <ProjectModal card={open} onClose={() => setOpen(null)} />}
      {writing && <ContactForm ticket={ticket} onClose={() => setWriting(false)} />}
    </div>
  );
}
