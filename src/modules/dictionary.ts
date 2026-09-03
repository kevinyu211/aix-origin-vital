// dictionary module — loads and indexes the hand-curated local drug dictionary.
// Pure and unit-testable: no UI, no network, no model.

import type { DrugEntry } from "./types";
import raw from "../../dictionary/drugs.json";

const data = raw as { version: string; note: string; drugs: DrugEntry[] };

export const DICTIONARY_VERSION: string = data.version;

export function getAllDrugs(): DrugEntry[] {
  return data.drugs;
}

export function getDrugById(id: string): DrugEntry | undefined {
  return data.drugs.find((d) => d.id === id);
}

/**
 * Normalise a free-text medicine name for comparison:
 * lower-case, drop strength tokens, drop punctuation, collapse whitespace.
 * CJK characters are preserved so brand/alias matching still works.
 */
export function normaliseName(input: string): string {
  return input
    .toLowerCase()
    .replace(/\b\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|iu|%)\b/g, " ") // strengths
    .replace(/[^\p{L}\p{N}]+/gu, " ") // punctuation -> space (keeps letters incl. CJK)
    .replace(/\s+/g, " ")
    .trim();
}

/** All searchable terms for one entry (active ingredient + brands + aliases). */
export function entryTerms(entry: DrugEntry): string[] {
  return [entry.activeIngredient, ...entry.brands, ...entry.aliases];
}
