// samples module — synthetic 示範 (demo) data so the demo can never fail.
// Persona: 陳伯, 72, 深水埗. All data is fabricated. No real patient information.

import type { MedItem } from "./types";

export const SAMPLE_PATIENT = {
  name: "陳伯",
  age: 72,
  district: "深水埗",
};

// Discharge sheet: what the (fake) hospital list says.
export const SAMPLE_SHEET: MedItem[] = [
  { raw: "Paracetamol 500mg", name: "Paracetamol", strength: "500mg", source: "sheet" },
  { raw: "Amlodipine 10mg", name: "Amlodipine", strength: "10mg", source: "sheet" },
  { raw: "Atorvastatin 20mg", name: "Atorvastatin", strength: "20mg", source: "sheet" },
  { raw: "Metformin 500mg", name: "Metformin", strength: "500mg", source: "sheet" },
];

// Boxes in the drawer, in the order 陳伯 photographs them (S2 "影下一盒").
// Note two paracetamol boxes under DIFFERENT names (必理痛 + Panadol) so the
// duplicate reveal always fires.
export const SAMPLE_BOXES: MedItem[] = [
  { raw: "必理痛 500mg", name: "必理痛", strength: "500mg", source: "box" },
  { raw: "Amlodipine 5mg", name: "Amlodipine", strength: "5mg", source: "box" },
  { raw: "Aspirin 80mg", name: "Aspirin", strength: "80mg", source: "box" },
  { raw: "Metformin 500mg", name: "Metformin", strength: "500mg", source: "box" },
  { raw: "神秘補品丸", name: "神秘補品丸", source: "box" },
  { raw: "Panadol 500mg", name: "Panadol", strength: "500mg", source: "box" },
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
