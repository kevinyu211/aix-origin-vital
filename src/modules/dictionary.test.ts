import { describe, test, expect } from "@jest/globals";
import { getAllDrugs, getDrugById, normaliseName, entryTerms } from "./dictionary";
import { matchName } from "./match";
import { containsForbiddenAdviceWords } from "./compliance";

const INSTRUCTION = ["應該", "必須"];

describe("dictionary — DrugEntry[] mapped from Cindy INNs", () => {
  const drugs = getAllDrugs();

  test("has exactly 60 INNs", () => {
    expect(drugs.length).toBe(60);
  });

  test("required demo set is first five", () => {
    expect(drugs.slice(0, 5).map((d) => d.id)).toEqual([
      "paracetamol",
      "amlodipine",
      "aspirin",
      "atorvastatin",
      "metformin",
    ]);
  });

  test("paracetamol demo row", () => {
    const p = getDrugById("paracetamol")!;
    expect(p.activeIngredient).toBe("paracetamol");
    expect(p.ingredientZh).toBe("撲熱息痛");
    expect(p.brandNames).toEqual(expect.arrayContaining(["PANADOL", "必理痛"]));
    expect(p.aliases).toEqual(expect.arrayContaining(["PARACETAMOL TAB 500MG", "Panadol"]));
    expect(p.strengths).toEqual(expect.arrayContaining(["500mg"]));
  });

  test("amlodipine demo row (5mg + 10mg, 氨氮地平 alias)", () => {
    const a = getDrugById("amlodipine")!;
    expect(a.ingredientZh).toBe("氨氯地平");
    expect(a.brandNames).toContain("NORVASC");
    expect(a.aliases).toEqual(
      expect.arrayContaining(["AMLODIPINE TAB 5MG", "AMLODIPINE TAB 10MG", "氨氮地平"]),
    );
    expect(a.strengths).toEqual(expect.arrayContaining(["5mg", "10mg"]));
  });

  test("aspirin demo row (阿士匹靈 + ASPIRIN TAB 80MG)", () => {
    const a = getDrugById("aspirin")!;
    expect(a.ingredientZh).toBe("阿士匹靈");
    expect(a.aliases).toContain("ASPIRIN TAB 80MG");
    expect(a.strengths).toContain("80mg");
  });

  test("atorvastatin / metformin demo rows", () => {
    const t = getDrugById("atorvastatin")!;
    expect(t.brandNames).toEqual(expect.arrayContaining(["LIPITOR", "立普妥"]));
    expect(t.aliases).toContain("ATORVASTATIN TAB 20MG");
    expect(t.strengths).toContain("20mg");
    const m = getDrugById("metformin")!;
    expect(m.brandNames).toEqual(expect.arrayContaining(["GLUCOPHAGE", "糖尿適"]));
    expect(m.aliases).toEqual(expect.arrayContaining(["METFORMIN TAB 500MG", "二甲雙胞"]));
    expect(m.strengths).toContain("500mg");
  });

  test("every row has the DrugEntry shape", () => {
    for (const d of drugs) {
      expect(d).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          activeIngredient: expect.any(String),
          ingredientZh: expect.any(String),
          brandNames: expect.any(Array),
          aliases: expect.any(Array),
          strengths: expect.any(Array),
          forms: expect.any(Array),
          category: expect.objectContaining({ zh: expect.any(String), en: expect.any(String) }),
          plain: expect.objectContaining({ zh: expect.any(String), en: expect.any(String) }),
        }),
      );
    }
  });

  test("plain is label-style: no advice words, no instruction verbs", () => {
    for (const d of drugs) {
      const blob = `${d.plain.zh} ${d.plain.en}`;
      expect(containsForbiddenAdviceWords(blob)).toEqual([]);
      for (const w of INSTRUCTION) {
        expect(blob.includes(w)).toBe(false);
      }
      expect(d.plain.zh.startsWith("呢隻藥嘅成分係")).toBe(true);
      expect(d.plain.en.startsWith("This pack is labelled as")).toBe(true);
    }
  });

  test("normaliseName strips strength + form words", () => {
    expect(normaliseName("Amlodipine 10mg")).toBe("amlodipine");
    expect(normaliseName("必理痛 500mg")).toBe("必理痛");
    expect(normaliseName("ASPIRIN TAB 80MG")).toBe("aspirin");
    expect(normaliseName("PARACETAMOL TAB 500MG")).toBe("paracetamol");
  });
});

describe("match — inn / inn_zh / also / brands + HA labels", () => {
  test.each([
    ["paracetamol", "paracetamol"],
    ["撲熱息痛", "paracetamol"],
    ["必理痛", "paracetamol"],
    ["PANADOL", "paracetamol"],
    ["Panadol", "paracetamol"],
    ["PARACETAMOL TAB 500MG", "paracetamol"],
    ["acetaminophen", "paracetamol"],
    ["NORVASC", "amlodipine"],
    ["氨氯地平", "amlodipine"],
    ["氨氮地平", "amlodipine"],
    ["AMLODIPINE TAB 5MG", "amlodipine"],
    ["阿士匹靈", "aspirin"],
    ["阿司匹林", "aspirin"],
    ["ASA", "aspirin"],
    ["ASPIRIN TAB 80MG", "aspirin"],
    ["立普妥", "atorvastatin"],
    ["ATORVASTATIN TAB 20MG", "atorvastatin"],
    ["糖尿適", "metformin"],
    ["GLUCOPHAGE", "metformin"],
    ["二甲雙胞", "metformin"],
    ["METFORMIN TAB 500MG", "metformin"],
  ])("matches %s → %s", (name, id) => {
    const { entry } = matchName(name);
    expect(entry?.id).toBe(id);
  });

  test("entryTerms include inn / zh / brands / aliases", () => {
    const terms = entryTerms(getDrugById("paracetamol")!);
    expect(terms).toEqual(expect.arrayContaining(["paracetamol", "撲熱息痛", "必理痛", "PARACETAMOL TAB 500MG"]));
  });
});
