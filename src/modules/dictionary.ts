// dictionary module — loads the mapped DrugEntry[] (from Cindy's 60 HK discharge INNs).
// Matcher terms: activeIngredient (inn) / ingredientZh (inn_zh) / aliases (also + HA labels) / brandNames.

import type { DrugEntry } from "./types";
import raw from "../../dictionary/drugs.json";

const drugs = raw as DrugEntry[];

export const DICTIONARY_TITLE = "對藥 label vocab — HK discharge INNs";
export const DICTIONARY_COUNT: number = drugs.length;

export function getAllDrugs(): DrugEntry[] {
  return drugs;
}

export function getDrugById(id: string): DrugEntry | undefined {
  return drugs.find((d) => d.id === id);
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

/** Searchable terms: inn / inn_zh / also / brands (via activeIngredient, ingredientZh, aliases, brandNames). */
export function entryTerms(entry: DrugEntry): string[] {
  return [entry.activeIngredient, entry.ingredientZh, ...entry.brandNames, ...entry.aliases].filter(
    (t) => t.trim().length > 0,
  );
}
