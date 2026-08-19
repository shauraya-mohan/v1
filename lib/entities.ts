/**
 * Decides which cards/rows a free-text AI answer should attach, by checking
 * whether the item is actually *named* in it — not by scoring word overlap.
 *
 * An earlier version scored each item by how many "distinctive" body words
 * (words no sibling item's text also used) appeared in the answer, falling
 * back to showing everything when nothing scored. Both halves of that were
 * wrong: uniqueness-among-five-siblings is not the same as relevance — it let
 * filler words like "text" and "through" identify a job that was never
 * mentioned — and "show everything" is the opposite of what a specific
 * question deserves. An item now attaches only if its title, or one of a
 * short hand-picked alias, appears as a whole phrase. Nothing named means
 * nothing shown — never a guess.
 */

import type { Card, Row } from "./content";

/** Lowercase, collapse to single spaces, pad with a leading/trailing space so
 *  a plain string.includes() only ever matches whole words — "itc" can't
 *  match inside a longer word, and "kitchen" alone can't match "Kitchen
 *  Copilot" since the full two-word phrase is what gets searched for. */
const normalize = (s: string): string => ` ${s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;

function isNamed(haystack: string, title: string, aliases: string[] = []): boolean {
  const needleTitle = normalize(title);
  if (haystack.includes(needleTitle)) return true;
  return aliases.some((a) => haystack.includes(normalize(a)));
}

function narrow<T>(text: string, items: T[], read: (i: T) => { title: string; aliases?: string[] }): T[] {
  const haystack = normalize(text);
  return items.filter((item) => {
    const { title, aliases } = read(item);
    return isNamed(haystack, title, aliases);
  });
}

export const selectCards = (text: string, cards: Card[]): Card[] =>
  narrow(text, cards, (c) => ({ title: c.title, aliases: c.aliases }));

export const selectRows = (text: string, rows: Row[]): Row[] =>
  narrow(text, rows, (r) => ({ title: r.name, aliases: r.aliases }));
