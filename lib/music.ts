/**
 * The listening list. Not wired to Spotify on purpose — it's a fixed list that
 * plays on a clock, so nothing real about my account is exposed.
 *
 * The widget only ever has a 30-second Apple preview clip to actually play, so
 * `seconds` is that clip's real measured length (via `afinfo`), not the full
 * song's — the progress bar and the move-to-next-track timer both pace off
 * what's actually audible, never a number nobody hears play out.
 *
 * To change it: edit TRACKS, then `npm run art` to pull the covers into
 * public/assets/art and measure each preview's real duration.
 */

export type Track = {
  title: string;
  artist: string;
  /** The preview clip's real length in seconds — see the file comment above. */
  seconds: number;
  /** File in public/assets/art, written by scripts/fetch-art.mjs. */
  art?: string;
  /** 30-second Apple preview clip in public/assets/preview, same script. */
  preview?: string;
};

export const TRACKS: Track[] = [
  { title: "E85", artist: "Don Toliver", seconds: 30, art: "don-toliver-e85.jpg", preview: "don-toliver-e85.m4a" },
  { title: "Rendezvous", artist: "Don Toliver", seconds: 30, art: "don-toliver-rendezvous.jpg", preview: "don-toliver-rendezvous.m4a" },
  { title: "You", artist: "Don Toliver", seconds: 30, art: "don-toliver-you.jpg", preview: "don-toliver-you.m4a" },
  { title: "Secondhand", artist: "Don Toliver", seconds: 30, art: "don-toliver-secondhand.jpg", preview: "don-toliver-secondhand.m4a" },
  { title: "Test Drive", artist: "Joji", seconds: 30, art: "joji-test-drive.jpg", preview: "joji-test-drive.m4a" },
  { title: "Slow Dancing in the Dark", artist: "Joji", seconds: 30, art: "joji-slow-dancing-in-the-dark.jpg", preview: "joji-slow-dancing-in-the-dark.m4a" },
  { title: "Glimpse of Us", artist: "Joji", seconds: 30, art: "joji-glimpse-of-us.jpg", preview: "joji-glimpse-of-us.m4a" },
  { title: "9", artist: "Drake", seconds: 30, art: "drake-9.jpg", preview: "drake-9.m4a" },
  { title: "National Treasure", artist: "Drake", seconds: 30, art: "drake-national-treasure.jpg", preview: "drake-national-treasure.m4a" },
  { title: "Practice", artist: "Drake", seconds: 30, art: "drake-practice.jpg", preview: "drake-practice.m4a" },
  { title: "Marvins Room", artist: "Drake", seconds: 30, art: "drake-marvins-room.jpg", preview: "drake-marvins-room.m4a" },
  { title: "Make It to the Morning", artist: "PARTYNEXTDOOR", seconds: 30, art: "partynextdoor-make-it-to-the-morning.jpg", preview: "partynextdoor-make-it-to-the-morning.m4a" },
  { title: "Dreamin", artist: "PARTYNEXTDOOR", seconds: 30, art: "partynextdoor-dreamin.jpg", preview: "partynextdoor-dreamin.m4a" },
  { title: "Break from Toronto", artist: "PARTYNEXTDOOR", seconds: 30, art: "partynextdoor-break-from-toronto.jpg", preview: "partynextdoor-break-from-toronto.m4a" },
  { title: "Die Trying", artist: "PARTYNEXTDOOR", seconds: 30, art: "partynextdoor-die-trying.jpg", preview: "partynextdoor-die-trying.m4a" },
  { title: "Colours Violet", artist: "Tory Lanez", seconds: 30, art: "tory-lanez-colours-violet.jpg", preview: "tory-lanez-colours-violet.m4a" },
  { title: "Lady of Namek", artist: "Tory Lanez", seconds: 30, art: "tory-lanez-lady-of-namek.jpg", preview: "tory-lanez-lady-of-namek.m4a" },
];

export const TOTAL = TRACKS.reduce((n, t) => n + t.seconds, 0);

export const clock = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * Where the playlist would be if it had been looping since the epoch. Everyone
 * loading the page at the same moment sees the same song, and it keeps moving
 * between visits without any state to store.
 */
export function positionAt(ms: number): { index: number; elapsed: number } {
  let t = Math.floor(ms / 1000) % TOTAL;
  for (let i = 0; i < TRACKS.length; i++) {
    if (t < TRACKS[i]!.seconds) return { index: i, elapsed: t };
    t -= TRACKS[i]!.seconds;
  }
  return { index: 0, elapsed: 0 };
}

/** The n tracks queued after `index`, wrapping to the front of the list. */
export function upNextFrom(index: number, count: number): Track[] {
  return Array.from({ length: count }, (_, i) => TRACKS[(index + 1 + i) % TRACKS.length]!);
}
