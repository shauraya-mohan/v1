import type { LinkKind } from "@/lib/content";

const GITHUB =
  "M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z";

const LINKEDIN =
  "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.07 1.4-2.07 2.85V21h-4V9Z";

const STROKES: Record<Exclude<LinkKind, "code" | "linkedin">, string> = {
  // globe
  live: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c-3 3-3 15 0 18m0-18c3 3 3 15 0 18M3.5 9h17m-17 6h17",
  // play in a rounded square
  demo: "M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Zm6 2.2 5 3.3-5 3.3V8.7Z",
  // trophy
  devpost: "M8 4h8v5a4 4 0 1 1-8 0V4Zm0 1.5H5.5V8A2.5 2.5 0 0 0 8 10.5M16 5.5h2.5V8a2.5 2.5 0 0 1-2.5 2.5M12 13v4m-3 3h6",
  doc: "M7 3h7l4 4v14H7V3Zm7 0v4h4M9.5 12h6m-6 3.5h6",
  mail: "M3.5 6.5h17v11h-17v-11Zm0 .5 8.5 6 8.5-6",
};

export function LinkIcon({ kind, size = 13 }: { kind?: LinkKind; size?: number }) {
  // Untyped links get no leading glyph — the trailing arrow already says
  // "outbound", and doubling it up reads as a mistake.
  if (!kind) return null;

  if (kind === "code" || kind === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden>
        <path d={kind === "code" ? GITHUB : LINKEDIN} />
      </svg>
    );
  }

  const d = STROKES[kind];
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
