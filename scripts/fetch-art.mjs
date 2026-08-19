/**
 * Pulls album art and a 30-second preview clip for everything in lib/music.ts
 * into public/assets/art and public/assets/preview.
 *
 * Uses the iTunes Search API, which needs no credentials and covers the same
 * catalogue as Spotify. Both art and preview are Apple's own promotional
 * assets, meant for exactly this — previewing a track before you'd buy or
 * stream it — and are saved locally so the site never hotlinks and has no
 * runtime dependency on anyone's API.
 *
 *   npm run art
 *
 * Add a track to TRACKS, run it again — existing files are skipped, and
 * whatever's already on a line (a duration you edited, art you don't want
 * touched) is preserved rather than clobbered.
 */

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const artDir = path.join(root, "public/assets/art");
const previewDir = path.join(root, "public/assets/preview");
const musicFile = path.join(root, "lib/music.ts");

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const exists = (p) =>
  access(p).then(
    () => true,
    () => false,
  );

async function search(title, artist) {
  const term = encodeURIComponent(`${artist} ${title}`);
  const url = `https://itunes.apple.com/search?term=${term}&media=music&entity=song&limit=5`;
  const res = await fetch(url, { headers: { "user-agent": "portfolio-art-fetch" } });
  if (!res.ok) throw new Error(`search ${res.status}`);

  const { results = [] } = await res.json();
  if (!results.length) return null;

  // "Drake".includes-matched against "Drake Milligan" once — a different artist
  // entirely. Split the credit on collab delimiters and require an exact match
  // against one of the named artists, not a fuzzy substring.
  const wanted = artist.toLowerCase();
  const byArtist = results.filter((r) =>
    (r.artistName ?? "")
      .toLowerCase()
      .split(/\s*(?:&|,|\bfeat\.?\b|\bwith\b|\bx\b)\s*/)
      .some((part) => part === wanted),
  );
  if (!byArtist.length) return null; // no exact artist match means this title likely isn't by them

  // Taking the first artist-matched hit once pulled a remix ahead of the
  // original because it happened to rank first. Prefer whichever result's
  // title actually matches; only fall back to "first" when none does.
  const wantedTitle = title.toLowerCase();
  const match =
    byArtist.find((r) => (r.trackName ?? "").toLowerCase() === wantedTitle) ?? byArtist[0];

  return {
    // artworkUrl100 is a thumbnail; the same path serves larger sizes.
    artUrl: (match.artworkUrl100 ?? "").replace(/\/\d+x\d+bb\./, "/600x600bb."),
    previewUrl: match.previewUrl ?? null,
    album: match.collectionName,
    seconds: match.trackTimeMillis ? Math.round(match.trackTimeMillis / 1000) : null,
  };
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

// One line per track: { title: "...", artist: "...", seconds: N[, art: "..."][, preview: "..."] },
const LINE = /^(\s*)\{\s*title:\s*"([^"]+)",\s*artist:\s*"([^"]+)",\s*seconds:\s*(\d+|undefined)(?:,\s*art:\s*"([^"]*)")?(?:,\s*preview:\s*"([^"]*)")?\s*\},?\s*$/;

const source = await readFile(musicFile, "utf8");
const lines = source.split("\n");

const tracks = [];
lines.forEach((line, i) => {
  const m = line.match(LINE);
  if (m) tracks.push({ lineIndex: i, title: m[2], artist: m[3], seconds: m[4], art: m[5], preview: m[6] });
});

if (!tracks.length) {
  console.error("No track lines matched in lib/music.ts — is the format still `{ title: ..., artist: ..., seconds: ... }`?");
  process.exit(1);
}

await mkdir(artDir, { recursive: true });
await mkdir(previewDir, { recursive: true });

let fetched = 0;
let skipped = 0;

for (const t of tracks) {
  const artName = `${slug(t.artist)}-${slug(t.title)}.jpg`;
  const previewName = `${slug(t.artist)}-${slug(t.title)}.m4a`;
  const artDest = path.join(artDir, artName);
  const previewDest = path.join(previewDir, previewName);

  const hasArt = t.art && (await exists(artDest));
  const hasPreview = t.preview && (await exists(previewDest));

  let seconds = t.seconds === "undefined" ? null : Number(t.seconds);
  let art = hasArt ? t.art : undefined;
  let preview = hasPreview ? t.preview : undefined;

  if (hasArt && hasPreview) {
    skipped += 1;
  } else {
    try {
      const found = await search(t.title, t.artist);
      if (!found) {
        console.warn(`  NOT FOUND  ${t.artist} — ${t.title}  (no matching artist on iTunes; check the title)`);
      } else {
        if (!hasArt && found.artUrl) {
          await download(found.artUrl, artDest);
          art = artName;
        }
        if (!hasPreview && found.previewUrl) {
          await download(found.previewUrl, previewDest);
          preview = previewName;
        }
        if (found.seconds) seconds = found.seconds;

        const dur = seconds ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` : "duration unknown";
        console.log(`  saved   ${artName}${preview ? " + preview" : ""}  (${found.album}, ${dur})`);
        fetched += 1;
        // Be polite to a free, unauthenticated endpoint.
        await new Promise((r) => setTimeout(r, 350));
      }
    } catch (err) {
      console.warn(`  failed  ${t.artist} — ${t.title}: ${err.message}`);
    }
  }

  // A number this can't parse back out of would break the TypeScript build,
  // so an unresolved track always gets a real placeholder, never anything else.
  if (!Number.isFinite(seconds)) seconds = 200;

  const indent = lines[t.lineIndex].match(/^(\s*)/)[1];
  const fields = [`title: "${t.title}"`, `artist: "${t.artist}"`, `seconds: ${seconds}`];
  if (art) fields.push(`art: "${art}"`);
  if (preview) fields.push(`preview: "${preview}"`);
  lines[t.lineIndex] = `${indent}{ ${fields.join(", ")} },`;
}

await writeFile(musicFile, lines.join("\n"));
console.log(`\n${fetched} fetched, ${skipped} already complete, ${tracks.length} tracks total.`);
