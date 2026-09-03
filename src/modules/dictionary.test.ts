import { describe, test, expect } from "@jest/globals";
import { getAllDrugs, getDrugById, normaliseName } from "./dictionary";
import { containsForbiddenAdviceWords } from "./compliance";

// Instruction words that must never appear in label-style info sentences.
const INSTRUCTION_WORDS = ["應該", "必須", "停", "加", "減"];

describe("dictionary", () => {
  const drugs = getAllDrugs();

  test("has at least 25 entries", () => {
    expect(drugs.length).toBeGreaterThanOrEqual(25);
  });

  test.each(["paracetamol", "amlodipine", "aspirin", "atorvastatin", "metformin"])(
    "includes required demo drug: %s",
    (id) => {
      expect(getDrugById(id)).toBeDefined();
    },
  );

  test("paracetamol carries Panadol + 必理痛 as brands", () => {
    const p = getDrugById("paracetamol")!;
    expect(p.brands).toEqual(expect.arrayContaining(["Panadol", "必理痛"]));
  });

  test("info sentences are label-style: no advice words, no instruction words", () => {
    for (const d of drugs) {
      expect(containsForbiddenAdviceWords(d.info_zh)).toEqual([]);
      expect(containsForbiddenAdviceWords(d.info_en)).toEqual([]);
      for (const w of INSTRUCTION_WORDS) {
        expect(d.info_zh.includes(w)).toBe(false);
        expect(d.info_en.includes(w)).toBe(false);
      }
    }
  });

  test("normaliseName strips strength + punctuation", () => {
    expect(normaliseName("Amlodipine 10mg")).toBe("amlodipine");
    expect(normaliseName("必理痛 500mg")).toBe("必理痛");
  });
});
