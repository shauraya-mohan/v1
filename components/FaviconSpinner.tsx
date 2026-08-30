"use client";

import { useEffect, useRef } from "react";

// Same four petals as Mark.tsx, rendered to rotated PNG frames so the browser
// tab can flip through them like <link rel="icon"> was made to spin.
const MARK_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">' +
  '<path d="M24 3c10 8 10 13 0 21-10-8-10-13 0-21Z" fill="#D97757"/>' +
  '<path d="M45 24c-8 10-13 10-21 0 8-10 13-10 21 0Z" fill="#D97757" opacity=".78"/>' +
  '<path d="M24 45c-10-8-10-13 0-21 10 8 10 13 0 21Z" fill="#D97757" opacity=".9"/>' +
  '<path d="M3 24c8-10 13-10 21 0-8 10-13 10-21 0Z" fill="#D97757" opacity=".66"/>' +
  "</svg>";

const FRAME_COUNT = 12;
const FRAME_MS = 90;
const SIZE = 32;

let framesPromise: Promise<string[]> | null = null;

function loadFrames(): Promise<string[]> {
  if (framesPromise) return framesPromise;
  framesPromise = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const frames: string[] = [];
      for (let i = 0; i < FRAME_COUNT; i++) {
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.translate(SIZE / 2, SIZE / 2);
        ctx.rotate((i / FRAME_COUNT) * Math.PI * 2);
        ctx.translate(-SIZE / 2, -SIZE / 2);
        ctx.drawImage(img, 0, 0, SIZE, SIZE);
        frames.push(canvas.toDataURL("image/png"));
      }
      resolve(frames);
    };
    img.src = `data:image/svg+xml;base64,${btoa(MARK_SVG)}`;
  });
  return framesPromise;
}

/** Spins the tab favicon through the mark's rotations while `active`, the way Claude's tab icon spins while it's generating. */
export function FaviconSpinner({ active }: { active: boolean }) {
  const originalHref = useRef<string | null>(null);

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!link) return;
    if (originalHref.current === null) originalHref.current = link.href;

    if (!active) {
      link.href = originalHref.current;
      return;
    }

    let cancelled = false;
    let id: ReturnType<typeof setInterval> | undefined;
    let frame = 0;

    loadFrames().then((frames) => {
      if (cancelled || frames.length === 0) return;
      id = setInterval(() => {
        frame = (frame + 1) % frames.length;
        link.href = frames[frame]!;
      }, FRAME_MS);
    });

    return () => {
      cancelled = true;
      clearInterval(id);
      link.href = originalHref.current!;
    };
  }, [active]);

  return null;
}
