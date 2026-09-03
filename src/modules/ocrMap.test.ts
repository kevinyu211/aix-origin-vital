import { describe, test, expect } from "@jest/globals";
import { mapOcrRowsToMedItems, normalizeStrength, parseOcrModelText } from "./ocrMap";

describe("ocrMap — strength normalisation", () => {
  test("collapses spaces and case", () => {
    expect(normalizeStrength("80 mg")).toBe("80mg");
    expect(normalizeStrength("10MG")).toBe("10mg");
    expect(normalizeStrength(" 500 mg ")).toBe("500mg");
  });

  test("returns undefined for empty", () => {
    expect(normalizeStrength(undefined)).toBeUndefined();
    expect(normalizeStrength("   ")).toBeUndefined();
  });
});

describe("ocrMap — rows → MedItem[] matching mock vision", () => {
  test("maps raw / name / strength and stamps source", () => {
    const items = mapOcrRowsToMedItems(
      [{ raw: "必理痛 500mg", name: "必理痛", strength: "500 mg" }, { name: "NORVASC", strength: "10mg" }],
      "sheet",
    );
    expect(items).toEqual([
      { raw: "必理痛 500mg", name: "必理痛", strength: "500mg", source: "sheet" },
      { raw: "NORVASC", name: "NORVASC", strength: "10mg", source: "sheet" },
    ]);
  });

  test("skips empty / non-object rows and unknown wrappers", () => {
    expect(mapOcrRowsToMedItems(null, "box")).toEqual([]);
    expect(mapOcrRowsToMedItems("nope", "box")).toEqual([]);
    expect(mapOcrRowsToMedItems([null, 3, { name: "" }, { name: "Amlodipine" }], "box")).toEqual([
      { raw: "Amlodipine", name: "Amlodipine", strength: undefined, source: "box" },
    ]);
  });
});

describe("ocrMap — model text parser", () => {
  test("accepts a bare JSON array", () => {
    const items = parseOcrModelText('[{"name":"ASPIRIN TAB 80MG","strength":"80mg"}]', "box");
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe("ASPIRIN TAB 80MG");
    expect(items[0].source).toBe("box");
  });

  test("accepts fenced JSON and { items }", () => {
    const fenced = parseOcrModelText('```json\n{"items":[{"name":"Metformin","strength":"500mg"}]}\n```', "sheet");
    expect(fenced).toEqual([{ raw: "Metformin", name: "Metformin", strength: "500mg", source: "sheet" }]);
  });

  test("invalid JSON degrades to []", () => {
    expect(parseOcrModelText("not json", "sheet")).toEqual([]);
    expect(parseOcrModelText("", "sheet")).toEqual([]);
  });
});
