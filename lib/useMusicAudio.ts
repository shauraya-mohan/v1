"use client";

import { useCallback, useEffect, useState } from "react";
import { TRACKS } from "./music";

/**
 * One real (muted-by-default) audio element shared by every mounted widget —
 * the rail strip and the chat panel can both be on screen at once, and there
 * must be exactly one thing making sound. Module scope, not a ref, because
 * a hook can't own state that needs to survive and stay singular across
 * however many components call it.
 */
let audio: HTMLAudioElement | null = null;
let trackIndex: number | null = null;
let muted = true;
const listeners = new Set<(m: boolean) => void>();

function ensure(): HTMLAudioElement | null {
  if (audio || typeof window === "undefined") return audio;
  audio = new Audio();
  audio.loop = true;
  audio.volume = 0.5;
  audio.muted = true;
  audio.preload = "none";
  return audio;
}

/** Point the shared element at whichever track is current. A no-op if it already is. */
function sync(index: number) {
  if (index === trackIndex) return;
  trackIndex = index;
  const el = ensure();
  if (!el) return;

  const preview = TRACKS[index]?.preview;
  if (!preview) {
    el.pause();
    el.removeAttribute("src");
    return;
  }
  el.src = `/assets/preview/${preview}`;
  if (!el.muted) void el.play().catch(() => {});
}

export function useMusicAudio(currentIndex: number | null) {
  const [isMuted, setIsMuted] = useState(muted);

  useEffect(() => {
    listeners.add(setIsMuted);
    return () => {
      listeners.delete(setIsMuted);
    };
  }, []);

  useEffect(() => {
    if (currentIndex !== null) sync(currentIndex);
  }, [currentIndex]);

  // Unmuting is the user gesture browsers require before sound can play —
  // it must happen inside this click handler, not in an effect.
  const toggle = useCallback(() => {
    const el = ensure();
    if (!el) return;
    const next = !el.muted;
    el.muted = next;
    muted = next;
    if (!next) void el.play().catch(() => {});
    listeners.forEach((fn) => fn(next));
  }, []);

  const hasAudio = currentIndex !== null && !!TRACKS[currentIndex]?.preview;

  return { muted: isMuted, toggle, hasAudio };
}
