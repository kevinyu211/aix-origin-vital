// dictionary module — loads Cindy's hand-curated HK discharge INN vocab.
// Pure and unit-testable: no UI, no network, no model.
// Matcher terms are ONLY: inn / inn_zh / also / brands[].en / brands[].zh / brands[].hk.

import type { DrugDictionaryFile, DrugEntry } from "./types";
import raw from "../../dictionary/drugs.json";

const data = raw as DrugDictionaryFile;

export const DICTIONARY_TITLE: string = data.title;
export const DICTIONARY_COUNT: number = data.count;

export function getAllDrugs(): DrugEntry[] {
  return data.drugs;
}

export function getDrugById(id: string): DrugEntry | undefined {
  return data.drugs.find((d) => d.id === id);
}

/**
 * Normalise a free-text medicine name for comparison:
 * lower-case, drop strength tokens, drop common form words (tab/tablet/…),
 * drop punctuation, collapse whitespace. CJK is preserved.
 */
export function normaliseName(input: string): string {
  return input
    .toLowerCase()
    .replace(/\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu|%)\b/g, " ")
    .replace(/\b(?:tabs?|tablets?|caps?|capsules?|caplets?|syrup|oral|soln|solution|inj|injection)\b/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Searchable terms for one entry — inn / inn_zh / also / brand en+zh+hk only. */
export function entryTerms(entry: DrugEntry): string[] {
  const terms: string[] = [entry.inn, entry.inn_zh, ...entry.also];
  for (const b of entry.brands) {
    if (b.en) terms.push(b.en);
    if (b.zh) terms.push(b.zh);
    if (b.hk) terms.push(b.hk);
  }
  return terms.filter((t) => t.trim().length > 0);
}
