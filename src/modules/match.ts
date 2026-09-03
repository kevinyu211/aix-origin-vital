// match module — deterministic name -> dictionary matching helpers.
// Pure: no UI, no network, no model. Same input always produces the same output.

import type { DrugEntry, MatchMethod, Strength } from "./types";
import { getAllDrugs, normaliseName } from "./dictionary";

/** Classic Levenshtein edit distance (iterative, two-row). */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let prev = new Array(b.length + 1);
  let curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

/** Only apply fuzzy (Levenshtein) matching to latin tokens of a reasonable length. */
function isFuzzyEligible(term: string): boolean {
  return /^[a-z ]+$/.test(term) && term.replace(/\s/g, "").length >= 5;
}

export interface MatchOutcome {
  entry: DrugEntry | null;
  method: MatchMethod;
}

/**
 * Match a free-text medicine name to a dictionary entry.
 * Order: exact brand/alias/ingredient -> normalised -> Levenshtein<=2 -> none.
 * Deterministic: entries are scanned in dictionary order; on a Levenshtein tie the
 * earliest entry (smallest distance first) wins.
 */
export function matchName(name: string): MatchOutcome {
  const drugs = getAllDrugs();
  const lowered = name.trim().toLowerCase();
  const norm = normaliseName(name);

  // 1. Exact (case-insensitive) against any raw term.
  for (const entry of drugs) {
    for (const term of [entry.activeIngredient, ...entry.brands, ...entry.aliases]) {
      if (term.trim().toLowerCase() === lowered && lowered.length > 0) {
        return { entry, method: "exact" };
      }
    }
  }

  // 2. Normalised equality (strengths / punctuation removed).
  if (norm.length > 0) {
    for (const entry of drugs) {
      for (const term of [entry.activeIngredient, ...entry.brands, ...entry.aliases]) {
        if (normaliseName(term) === norm) {
          return { entry, method: "normalised" };
        }
      }
    }
  }

  // 3. Levenshtein <= 2 on latin tokens.
  let best: { entry: DrugEntry; dist: number } | null = null;
  if (norm.length >= 5 && /^[a-z ]+$/.test(norm)) {
    for (const entry of drugs) {
      for (const term of [entry.activeIngredient, ...entry.brands, ...entry.aliases]) {
        const t = normaliseName(term);
        if (!isFuzzyEligible(t)) continue;
        const d = levenshtein(norm, t);
        if (d <= 2 && (best === null || d < best.dist)) {
          best = { entry, dist: d };
        }
      }
    }
  }
  if (best) return { entry: best.entry, method: "levenshtein" };

  return { entry: null, method: "none" };
}

/** Parse a strength string like "500 mg", "10mg", "0.25mg", "100mcg" into value + unit. */
export function parseStrength(input?: string): Strength | null {
  if (!input) return null;
  const m = input.toLowerCase().match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu|%)/);
  if (!m) return null;
  return { value: parseFloat(m[1]), unit: m[2] };
}

/** Two strengths differ when both parse and either value or unit differs. */
export function strengthsDiffer(a?: string, b?: string): boolean {
  const pa = parseStrength(a);
  const pb = parseStrength(b);
  if (!pa || !pb) return false;
  return pa.value !== pb.value || pa.unit !== pb.unit;
}
