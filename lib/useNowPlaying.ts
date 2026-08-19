"use client";

import { useEffect, useState } from "react";
import { positionAt, TRACKS, type Track } from "./music";

export type Playing = { track: Track; index: number; elapsed: number };

/**
 * Drives both the rail widget and the in-chat panel off one clock.
 *
 * Returns null on the first render: the position depends on Date.now(), which
 * would differ between server and client and break hydration. Callers show a
 * quiet placeholder until it arrives, one frame later.
 */
export function useNowPlaying(): Playing | null {
  const [pos, setPos] = useState<Playing | null>(null);

  useEffect(() => {
    const tick = () => {
      const { index, elapsed } = positionAt(Date.now());
      setPos({ track: TRACKS[index]!, index, elapsed });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return pos;
}
