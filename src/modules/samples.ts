// samples module — synthetic 示範 (demo) data so the demo can never fail.
// Persona: 陳伯, 72, 深水埗. All data is fabricated. No real patient information.
// SAMPLE PATH LOCK: aspirin is NEVER on the sheet (that would fake the notOnList reveal).

import type { MedItem } from "./types";

export const SAMPLE_PATIENT = {
  name: "陳伯",
  age: 72,
  district: "深水埗",
};

// Sheet: four INNs only. Names are curated vocab terms (inn / inn_zh / brands).
export const SAMPLE_SHEET: MedItem[] = [
  { raw: "必理痛 500mg", name: "必理痛", strength: "500mg", source: "sheet" },
  { raw: "NORVASC 10mg", name: "NORVASC", strength: "10mg", source: "sheet" },
  { raw: "阿托伐他汀 20mg", name: "阿托伐他汀", strength: "20mg", source: "sheet" },
  { raw: "二甲雙胍 500mg", name: "二甲雙胍", strength: "500mg", source: "sheet" },
];

// Drawer. Two 必理痛 boxes so duplicateInDrawer always fires.
// Aspirin is drawer-only (notOnList). Amlodipine box is 5mg vs sheet 10mg.
export const SAMPLE_BOXES: MedItem[] = [
  { raw: "必理痛 500mg", name: "必理痛", strength: "500mg", source: "box" },
  { raw: "Amlodipine 5mg", name: "Amlodipine", strength: "5mg", source: "box" },
  { raw: "ASPIRIN TAB 80MG / 阿士匹靈", name: "ASPIRIN TAB 80MG", strength: "80mg", source: "box" },
  { raw: "Metformin 500mg", name: "Metformin", strength: "500mg", source: "box" },
  { raw: "神秘補品丸", name: "神秘補品丸", source: "box" },
  { raw: "必理痛 500mg", name: "必理痛", strength: "500mg", source: "box" },
];

export const SAMPLE_SHEET_FIXTURE_KEY = "chan-sheet";
export const boxFixtureKey = (index: number) => `chan-box-${index}`;

/** Fixture lookup used by the mock VisionProvider. */
export const SAMPLE_FIXTURES: Record<string, MedItem[]> = {
  [SAMPLE_SHEET_FIXTURE_KEY]: SAMPLE_SHEET,
  ...Object.fromEntries(SAMPLE_BOXES.map((b, i) => [boxFixtureKey(i), [b]])),
};

/** Human-readable description of what the demo should show (used in About + docs). */
export const SAMPLE_EXPECTED = [
  { drug: "paracetamol", bucket: "continue", flag: "duplicateInDrawer" },
  { drug: "amlodipine", bucket: "continue", flag: "strengthChanged (10mg → 5mg)" },
  { drug: "atorvastatin", bucket: "new", flag: null },
  { drug: "metformin", bucket: "continue", flag: null },
  { drug: "aspirin", bucket: "notOnList", flag: null },
  { drug: "神秘補品丸", bucket: "unmatched", flag: null },
];
