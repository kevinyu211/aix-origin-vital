// Shared types for the 對藥 (DoYeuk / Discharge Medicine Check) pipeline.
// These types are intentionally UI-free so every module can be unit-tested in isolation.

export type Lang = "zh-HK" | "en";

/** A dictionary entry describing one active ingredient. */
export interface DrugEntry {
  id: string;
  activeIngredient: string;
  brands: string[];
  aliases: string[];
  classHint?: string;
  commonStrengths?: string[];
  info_zh: string;
  info_en: string;
}

/** Where a detected medicine name came from. */
export type MedSource = "sheet" | "box";

/**
 * A single medicine detected either on the discharge sheet or on a box.
 * `raw` is exactly what the vision layer read; other fields are normalised by capture/extract.
 */
export interface MedItem {
  raw: string;
  name: string;
  strength?: string; // normalised, e.g. "500mg"
  source: MedSource;
}

/** A parsed strength, e.g. { value: 500, unit: "mg" }. */
export interface Strength {
  value: number;
  unit: string;
}

export type Bucket = "continue" | "new" | "notOnList" | "unmatched";

export type ReconcileFlag = "duplicateInDrawer" | "strengthChanged";

/** How a name was matched to the dictionary (for transparency / About screen). */
export type MatchMethod = "exact" | "normalised" | "levenshtein" | "none";

/** One reconciled group. Groups matched by active ingredient; unmatched items are their own group. */
export interface ReconcileGroup {
  key: string; // activeIngredient for matched, or `unmatched:<raw>` for unmatched
  activeIngredient: string | null;
  displayName: string;
  entry: DrugEntry | null;
  matchMethod: MatchMethod;
  bucket: Bucket;
  flags: ReconcileFlag[];
  sheetItems: MedItem[];
  boxItems: MedItem[];
  strengthDetail?: { sheet?: string; box?: string };
}

/** Something the pharmacist should look at. reconcile only records the fact + reason (no wording). */
export type AttentionReason = "unmatched" | "duplicateInDrawer" | "strengthChanged";

export interface AttentionItem {
  key: string;
  displayName: string;
  reason: AttentionReason;
  detail?: { sheet?: string; box?: string };
}

export interface ReconcileResult {
  groups: ReconcileGroup[];
  attention: AttentionItem[];
}

/** A single templated question for the pharmacist hand-off card. Always a question, never advice. */
export interface PharmacistItem {
  key: string;
  displayName: string;
  reason: AttentionReason;
  question: string;
}

/** Result of a capture step (real camera photo or a bundled sample). */
export interface CaptureResult {
  uri: string | null; // null when using pure fixtures (sample mode without an image)
  source: MedSource;
  /** When set, the mock VisionProvider returns the matching bundled fixture. */
  fixtureKey?: string;
  simulated: boolean;
}
