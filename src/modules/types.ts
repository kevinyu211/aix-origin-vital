// Shared types for the 對藥 (DoYeuk / Discharge Medicine Check) pipeline.
// These types are intentionally UI-free so every module can be unit-tested in isolation.

export type Lang = "zh-HK" | "zh-CN" | "en";

/** One brand row from Cindy's source vocab (`drugs.json` at repo root). */
export interface DrugBrand {
  en: string;
  zh: string | null;
  hk?: string;
  product?: string;
}

/** Cindy's curated source row (repo-root drugs.json). Not what the matcher loads. */
export interface CindyDrugRow {
  id: string;
  inn: string;
  inn_zh: string;
  also: string[];
  brands: DrugBrand[];
  source: string;
}

/**
 * App dictionary row (dictionary/drugs.json). Mapped from Cindy's INN labels.
 * `plain` is label-style information only — never start/stop instructions.
 * `strengths` are match labels only, never rendered as dose advice.
 */
export interface DrugEntry {
  id: string;
  activeIngredient: string;
  ingredientZh: string;
  brandNames: string[];
  aliases: string[];
  strengths: string[];
  forms: string[];
  category: { zh: string; en: string };
  plain: { zh: string; en: string };
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
