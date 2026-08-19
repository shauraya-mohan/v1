export function Mark({ size, className }: { size: number; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden>
      <path d="M24 3c10 8 10 13 0 21-10-8-10-13 0-21Z" fill="#D97757" />
      <path d="M45 24c-8 10-13 10-21 0 8-10 13-10 21 0Z" fill="#D97757" opacity=".78" />
      <path d="M24 45c-10-8-10-13 0-21 10 8 10 13 0 21Z" fill="#D97757" opacity=".9" />
      <path d="M3 24c8-10 13-10 21 0-8 10-13 10-21 0Z" fill="#D97757" opacity=".66" />
    </svg>
  );
}

const GLYPHS = ["·", "·", "✻", "✽", "✶", "✳", "✢", "✢", "✳", "✶", "✽", "✻"];

/** The rolling ✻ that Claude spins while it thinks. */
export function Glyphs({ size }: { size: "sm" | "lg" }) {
  return (
    <span className={`gs gs-${size}`} aria-hidden>
      <span>
        {GLYPHS.map((g, i) => (
          <i key={i}>{g}</i>
        ))}
      </span>
    </span>
  );
}

export function Stroke({
  d,
  size = 15,
  color = "currentColor",
  width = 1.5,
  className,
}: {
  d: string;
  size?: number;
  color?: string;
  width?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
