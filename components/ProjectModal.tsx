"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Card } from "@/lib/content";
import { LinkIcon } from "./LinkIcon";
import { Stroke } from "./Mark";

const PLAY = "M8 5.5v13l11-6.5-11-6.5Z";
const PAUSE = "M7.5 5.5h3.5v13H7.5zm5.5 0h3.5v13H13z";
const MUTE = "M11 5 6 9H3v6h3l5 4V5Z";
const UNMUTE = "M11 5 6 9H3v6h3l5 4V5Zm4.5 2a5 5 0 0 1 0 10m2-13a8 8 0 0 1 0 16";

const clock = (s: number) =>
  Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00";

/**
 * The expanded view of a project: the demo at full width, the longer telling,
 * the stack, and every link. Closes on Escape, on backdrop, or on the X.
 *
 * Portalled to <body> on purpose. `.thread` carries a filling opacity animation,
 * which makes it a stacking context — nested here, no z-index could lift this
 * above the sidebar or the composer.
 */
export function ProjectModal({ card, onClose }: { card: Card; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const opener = useRef<Element | null>(null);

  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    opener.current = document.activeElement;
    panel.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);

    // Hold the page still behind the overlay.
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [onClose]);

  const togglePlay = useCallback(() => {
    const el = video.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => {});
    else el.pause();
  }, []);

  const toggleSound = useCallback(() => {
    const el = video.current;
    if (!el) return;
    el.muted = !el.muted;
    setMuted(el.muted);
    if (!el.muted) void el.play().catch(() => {});
  }, []);

  const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const el = video.current;
    if (!el) return;
    el.currentTime = Number(e.target.value);
    setTime(el.currentTime);
  }, []);

  const pct = duration ? (time / duration) * 100 : 0;

  return createPortal(
    <div className="sheet-backdrop" onClick={onClose} role="presentation">
      <div
        className="sheet"
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={card.title}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="sheet-close" onClick={onClose} aria-label="Close">
          <Stroke d="M6 6l12 12M18 6L6 18" size={15} width={1.7} />
        </button>

        {card.demo ? (
          <div className="sheet-stage">
            <video
              ref={video}
              src={card.demo}
              poster={card.img || undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              onClick={togglePlay}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
            />

            <div className="vplayer">
              <button className="vplayer-btn" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
                <Stroke d={playing ? PAUSE : PLAY} size={13} width={1.6} />
              </button>

              <span className="vplayer-time">
                {clock(time)} / {clock(duration)}
              </span>

              <input
                className="vplayer-seek"
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={time}
                onChange={seek}
                style={{ backgroundSize: `${pct}% 100%` }}
                aria-label="Seek"
              />

              {card.sound && (
                <button
                  className="vplayer-btn"
                  onClick={toggleSound}
                  aria-label={muted ? "Unmute" : "Mute"}
                  aria-pressed={!muted}
                >
                  <Stroke d={muted ? MUTE : UNMUTE} size={13} width={1.6} />
                </button>
              )}
            </div>
          </div>
        ) : (
          card.img && (
            <div className="sheet-stage">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.img} alt="" />
            </div>
          )
        )}

        <div className="sheet-body">
          <h2>{card.title}</h2>
          <p className="sheet-lede">{card.blurb}</p>
          {card.detail && <p className="sheet-detail">{card.detail}</p>}

          {card.stack && (
            <ul className="stack">
              {card.stack.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          )}

          {card.links.length > 0 && (
            <div className="sheet-links">
              {card.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer noopener">
                  <LinkIcon kind={l.kind} size={14} />
                  {l.label}
                  <Stroke d="M7 17 17 7M9 7h8v8" size={11} width={1.6} className="kick" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
