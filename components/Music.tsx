"use client";

import { clock, upNextFrom } from "@/lib/music";
import { useMusicAudio } from "@/lib/useMusicAudio";
import { useNowPlaying } from "@/lib/useNowPlaying";
import { Stroke } from "./Mark";

const artUrl = (art?: string) => (art ? `/assets/art/${art}` : undefined);

const MUTE_ICON = "M11 5 6 9H3v6h3l5 4V5Z";
const UNMUTE_ICON = "M11 5 6 9H3v6h3l5 4V5Zm4.5 2a5 5 0 0 1 0 10m2-13a8 8 0 0 1 0 16";

/** Five bars on staggered loops. Purely decorative, so it's hidden from AT. */
function Bars({ paused = false }: { paused?: boolean }) {
  return (
    <span className={paused ? "bars paused" : "bars"} aria-hidden>
      <i />
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

function SoundToggle({
  muted,
  hasAudio,
  onToggle,
  small,
}: {
  muted: boolean;
  hasAudio: boolean;
  onToggle: () => void;
  small?: boolean;
}) {
  return (
    <button
      className={small ? "sound-toggle sound-toggle-sm" : "sound-toggle"}
      onClick={onToggle}
      disabled={!hasAudio}
      title={!hasAudio ? "No preview for this one" : muted ? "Unmute" : "Mute"}
      aria-label={muted ? "Unmute preview" : "Mute preview"}
      aria-pressed={!muted}
    >
      <Stroke d={muted ? MUTE_ICON : UNMUTE_ICON} size={small ? 12 : 13} width={1.7} />
    </button>
  );
}

/** Compact widget for the sidebar. */
export function NowPlaying() {
  const now = useNowPlaying();
  const { muted, toggle, hasAudio } = useMusicAudio(now?.index ?? null, now?.elapsed ?? 0);

  return (
    <div className="np" aria-live="off">
      <div className="np-label">
        <Bars paused={!now} />
        Now playing
        <SoundToggle muted={muted} hasAudio={hasAudio} onToggle={toggle} small />
      </div>

      <div className="np-row">
        <span
          className="np-art"
          style={{ backgroundImage: now?.track.art ? `url("${artUrl(now.track.art)}")` : undefined }}
        />
        <span className="np-meta">
          <span className="np-title">{now ? now.track.title : "—"}</span>
          <span className="np-artist">{now ? now.track.artist : "Loading"}</span>
        </span>
      </div>

      <div className="np-foot">
        <span className="np-bar">
          <span style={{ width: now ? `${(now.elapsed / now.track.seconds) * 100}%` : "0%" }} />
        </span>
        <span className="np-time">{now ? clock(now.elapsed) : "0:00"}</span>
      </div>
    </div>
  );
}

/**
 * The fuller version in the conversation: one now-playing card plus a short,
 * photo-free queue. Showing all seventeen tracks at once read like a media
 * library, not an answer to "what are you listening to" — this reads like one.
 */
export function MusicPanel() {
  const now = useNowPlaying();
  const { muted, toggle, hasAudio } = useMusicAudio(now?.index ?? null, now?.elapsed ?? 0);
  const pct = now ? (now.elapsed / now.track.seconds) * 100 : 0;
  const queue = now ? upNextFrom(now.index, 4) : [];

  return (
    <div className="music">
      <div className="music-now">
        <span
          className="music-now-art"
          style={{ backgroundImage: now?.track.art ? `url("${artUrl(now.track.art)}")` : undefined }}
        />
        <div className="music-now-meta">
          <span className="music-eyebrow">
            <Bars paused={!now} />
            Now playing
            <SoundToggle muted={muted} hasAudio={hasAudio} onToggle={toggle} />
          </span>
          <h3>{now ? now.track.title : "—"}</h3>
          <p>{now ? now.track.artist : ""}</p>
          <div className="music-progress">
            <span className="np-bar">
              <span style={{ width: `${pct}%` }} />
            </span>
            <span className="np-time">
              {now ? `${clock(now.elapsed)} / ${clock(now.track.seconds)}` : "0:00"}
            </span>
          </div>
        </div>
      </div>

      {queue.length > 0 && (
        <div className="queue">
          <div className="queue-label">Up next</div>
          {queue.map((t, i) => (
            <div className="queue-row" key={`${t.artist}-${t.title}`}>
              <span className="queue-index">{i + 1}</span>
              <span className="queue-meta">
                <span className="queue-title">{t.title}</span>
                <span className="queue-artist">{t.artist}</span>
              </span>
              <span className="queue-time">{clock(t.seconds)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
