import { describe, test, expect } from "@jest/globals";
import { getAllDrugs, getDrugById, normaliseName, entryTerms } from "./dictionary";
import { matchName } from "./match";
import { containsForbiddenAdviceWords } from "./compliance";
import dictCopy from "../../dictionary/drugs.json";
import rootCopy from "../../drugs.json";

describe("dictionary — Cindy HK discharge vocab", () => {
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

  test("paracetamol carries PANADOL / 必理痛 / HK-02280", () => {
    const p = getDrugById("paracetamol")!;
    expect(p.inn).toBe("paracetamol");
    expect(p.inn_zh).toBe("撲熱息痛");
    expect(p.also).toContain("acetaminophen");
    expect(p.brands[0]).toEqual(
      expect.objectContaining({ en: "PANADOL", zh: "必理痛", hk: "HK-02280" }),
    );
  });

  test("amlodipine carries NORVASC / HK-33731", () => {
    const a = getDrugById("amlodipine")!;
    expect(a.inn_zh).toBe("氨氯地平");
    expect(a.brands[0]).toEqual(expect.objectContaining({ en: "NORVASC", hk: "HK-33731" }));
  });

  test("atorvastatin / metformin brands are LIPITOR/立普妥 and GLUCOPHAGE/糖尿適", () => {
    expect(getDrugById("atorvastatin")!.brands[0]).toEqual(
      expect.objectContaining({ en: "LIPITOR", zh: "立普妥" }),
    );
    expect(getDrugById("metformin")!.brands[0]).toEqual(
      expect.objectContaining({ en: "GLUCOPHAGE", zh: "糖尿適" }),
    );
  });

  test("no invented info / dosage / advice fields on entries", () => {
    for (const d of drugs) {
      expect(d).toHaveProperty("inn");
      expect(d).toHaveProperty("inn_zh");
      expect(d).toHaveProperty("also");
      expect(d).toHaveProperty("brands");
      expect(d).not.toHaveProperty("info_zh");
      expect(d).not.toHaveProperty("info_en");
      expect(d).not.toHaveProperty("plain");
      expect(d).not.toHaveProperty("strengths");
    }
  });

  test("vocab match terms have no diagnose/treat/prescribe/cure language", () => {
    for (const d of drugs) {
      const blob = entryTerms(d).join(" ");
      expect(containsForbiddenAdviceWords(blob)).toEqual([]);
    }
  });

  test("dictionary/drugs.json and repo-root drugs.json are identical", () => {
    expect(dictCopy).toEqual(rootCopy);
  });

  test("normaliseName strips strength + form words", () => {
    expect(normaliseName("Amlodipine 10mg")).toBe("amlodipine");
    expect(normaliseName("必理痛 500mg")).toBe("必理痛");
    expect(normaliseName("ASPIRIN TAB 80MG")).toBe("aspirin");
  });
});

describe("match — inn / inn_zh / also / brands", () => {
  test.each([
    ["paracetamol", "paracetamol"],
    ["撲熱息痛", "paracetamol"],
    ["必理痛", "paracetamol"],
    ["PANADOL", "paracetamol"],
    ["HK-02280", "paracetamol"],
    ["acetaminophen", "paracetamol"],
    ["NORVASC", "amlodipine"],
    ["氨氯地平", "amlodipine"],
    ["阿司匹林", "aspirin"],
    ["ASA", "aspirin"],
    ["ASPIRIN TAB 80MG", "aspirin"],
    ["立普妥", "atorvastatin"],
    ["糖尿適", "metformin"],
    ["GLUCOPHAGE", "metformin"],
  ])("matches %s → %s", (name, id) => {
    const { entry } = matchName(name);
    expect(entry?.id).toBe(id);
  });
});
