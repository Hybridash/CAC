/**
 * Server-side chat message filter.
 *
 * Built on `obscenity` (maintained English word list with leet-speak, confusable-character and
 * repeated-letter handling). We add:
 *  - Unicode normalization and stripping of invisible characters
 *  - Detection of spaced/dotted-out words ("f u c k", "s.h.i.t")
 *  - Whole-word masking so partial masks like "***hole" don't leak the word
 *  - Blocking (instead of masking) when a message is mostly profanity
 */
import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";

const ALLOWLIST = ["shiitake", "shitake", "scunthorpe", "cockpit", "cocktail", "peacock", "hancock", "dickens"];

const dataset = englishDataset.build();
const matcher = new RegExpMatcher({
  ...dataset,
  whitelistedTerms: [...(dataset.whitelistedTerms ?? []), ...ALLOWLIST],
  ...englishRecommendedTransformers,
});

const INVISIBLE = /[​-‏⁠-⁤﻿­͏᠎]/g;
const CH = "[\\p{L}\\p{N}@$!|]";
const SEP = "[\\s.\\-_*,~+'\"/\\\\]+";
/** Runs of 3+ single characters separated by spaces/punctuation, e.g. "f u c k" or "s.h.i.t". */
const SPACED_RUN = new RegExp(`(?<!${CH})(?:${CH}${SEP}){2,}${CH}(?!${CH})`, "gu");

export type FilterResult =
  | { status: "ok"; text: string; masked: boolean }
  | { status: "blocked"; notice: string };

export const BLOCKED_NOTICE =
  "This message couldn't be sent. Please rephrase it and try again.";

export function normalizeMessage(input: string): string {
  return input.normalize("NFKC").replace(INVISIBLE, "").replace(/\r\n/g, "\n").trim();
}

function maskRange(chars: string[], start: number, end: number) {
  for (let i = start; i < end; i++) chars[i] = "*";
}

const WORD_CHAR = /[\p{L}\p{N}@$!|*#]/u;
/** Expand [start, end) out to the surrounding word (letters, digits and common substitution symbols). */
function expandToWord(text: string, start: number, end: number): [number, number] {
  while (start > 0 && WORD_CHAR.test(text[start - 1])) start--;
  while (end < text.length && WORD_CHAR.test(text[end])) end++;
  return [start, end];
}

export function containsProfanity(text: string): boolean {
  return findProfaneRanges(normalizeMessage(text)).length > 0;
}

function findProfaneRanges(text: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  for (const m of matcher.getAllMatches(text)) {
    ranges.push(expandToWord(text, m.startIndex, m.endIndex + 1));
  }
  for (const m of text.matchAll(SPACED_RUN)) {
    const collapsed = m[0].replace(new RegExp(SEP, "gu"), "");
    if (matcher.hasMatch(collapsed)) {
      ranges.push([m.index!, m.index! + m[0].length]);
    }
  }
  return ranges;
}

export function filterMessage(input: string): FilterResult {
  const text = normalizeMessage(input);
  const ranges = findProfaneRanges(text);
  if (ranges.length === 0) return { status: "ok", text, masked: false };

  const chars = Array.from(text);
  // Array.from splits by code point; map UTF-16 indexes to code point indexes.
  const cpIndex: number[] = [];
  let cp = 0;
  for (let i = 0; i < text.length; i++) {
    cpIndex[i] = cp;
    const code = text.charCodeAt(i);
    if (!(code >= 0xd800 && code <= 0xdbff)) cp++;
  }
  cpIndex[text.length] = cp;
  for (const [s, e] of ranges) maskRange(chars, cpIndex[s], cpIndex[e]);
  const masked = chars.join("");

  const letters = (s: string) => (s.match(/[^\s]/gu) ?? []).length;
  const maskedCount = (masked.match(/\*/g) ?? []).length - (text.match(/\*/g) ?? []).length;
  if (maskedCount / Math.max(1, letters(text)) > 0.5) {
    return { status: "blocked", notice: BLOCKED_NOTICE };
  }
  return { status: "ok", text: masked, masked: true };
}
