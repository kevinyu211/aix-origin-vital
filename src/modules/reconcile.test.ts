import { describe, test, expect } from "@jest/globals";
import { reconcile, groupsByBucket } from "./reconcile";
import type { MedItem } from "./types";
import { SAMPLE_SHEET, SAMPLE_BOXES } from "./samples";
import { sampleSheetCapture, sampleBoxCapture } from "./capture";
import { mockVisionProvider } from "./extract";

const sheet = (name: string, strength?: string): MedItem => ({ raw: name, name, strength, source: "sheet" });
const box = (name: string, strength?: string): MedItem => ({ raw: name, name, strength, source: "box" });

describe("reconcile — locked deterministic rules", () => {
  // C1: same drug on sheet AND in a box -> continue
  test("C1 continue: sheet + box", () => {
    const r = reconcile([sheet("Metformin", "500mg")], [box("Metformin", "500mg")]);
    const cont = groupsByBucket(r, "continue");
    expect(cont).toHaveLength(1);
    expect(cont[0].activeIngredient).toBe("metformin");
    expect(cont[0].flags).toEqual([]);
  });

  // C2: drug only on the sheet -> new
  test("C2 new: sheet only", () => {
    const r = reconcile([sheet("Atorvastatin", "20mg")], []);
    const nw = groupsByBucket(r, "new");
    expect(nw).toHaveLength(1);
    expect(nw[0].activeIngredient).toBe("atorvastatin");
  });

  // C3: drug only in a box -> notOnList
  test("C3 notOnList: box only", () => {
    const r = reconcile([], [box("Aspirin", "80mg")]);
    const nol = groupsByBucket(r, "notOnList");
    expect(nol).toHaveLength(1);
    expect(nol[0].activeIngredient).toBe("aspirin");
  });

  // C4: two boxes, same ingredient under different names -> duplicateInDrawer
  test("C4 duplicateInDrawer: 必理痛 + Panadol both = paracetamol", () => {
    const r = reconcile([sheet("Paracetamol", "500mg")], [box("必理痛", "500mg"), box("Panadol", "500mg")]);
    const g = r.groups.find((x) => x.activeIngredient === "paracetamol")!;
    expect(g.bucket).toBe("continue");
    expect(g.flags).toContain("duplicateInDrawer");
    expect(g.boxItems).toHaveLength(2);
    expect(r.attention.some((a) => a.reason === "duplicateInDrawer")).toBe(true);
  });

  // C5: strength differs between sheet and box -> strengthChanged
  test("C5 strengthChanged: amlodipine 10mg (sheet) vs 5mg (box)", () => {
    const r = reconcile([sheet("Amlodipine", "10mg")], [box("Amlodipine", "5mg")]);
    const g = r.groups.find((x) => x.activeIngredient === "amlodipine")!;
    expect(g.flags).toContain("strengthChanged");
    expect(g.strengthDetail).toEqual({ sheet: "10mg", box: "5mg" });
  });

  // C6: unknown name is never bucketed into the three groups; always on pharmacist card
  test("C6 unmatched: unknown box is not in continue/new/notOnList and is flagged for pharmacist", () => {
    const r = reconcile([], [box("神秘補品丸")]);
    expect(groupsByBucket(r, "continue")).toHaveLength(0);
    expect(groupsByBucket(r, "new")).toHaveLength(0);
    expect(groupsByBucket(r, "notOnList")).toHaveLength(0);
    const un = groupsByBucket(r, "unmatched");
    expect(un).toHaveLength(1);
    expect(un[0].activeIngredient).toBeNull();
    expect(r.attention.some((a) => a.reason === "unmatched")).toBe(true);
  });

  test("Levenshtein <= 2 fuzzy match (typo) still resolves", () => {
    const r = reconcile([sheet("Atorvastatn", "20mg")], []); // missing 'i'
    expect(r.groups[0].activeIngredient).toBe("atorvastatin");
    expect(r.groups[0].matchMethod).toBe("levenshtein");
  });

  test("determinism: identical input -> identical output", () => {
    const a = reconcile(SAMPLE_SHEET, SAMPLE_BOXES);
    const b = reconcile(SAMPLE_SHEET, SAMPLE_BOXES);
    expect(JSON.stringify(a)).toEqual(JSON.stringify(b));
  });
});

describe("reconcile — full 陳伯 sample scenario", () => {
  const r = reconcile(SAMPLE_SHEET, SAMPLE_BOXES);
  const byIngredient = (ai: string) => r.groups.find((g) => g.activeIngredient === ai)!;

  test("SAMPLE PATH LOCK: sheet has exactly 4 rows and never includes aspirin", () => {
    expect(SAMPLE_SHEET).toHaveLength(4);
    const blob = SAMPLE_SHEET.map((i) => `${i.name} ${i.raw}`).join(" ").toLowerCase();
    expect(blob.includes("aspirin")).toBe(false);
    expect(blob.includes("阿司匹林")).toBe(false);
    expect(blob.includes("阿士匹靈")).toBe(false);
  });

  test("SAMPLE PATH LOCK: drawer has two 必理痛 + ASPIRIN TAB 80MG + unknown", () => {
    const names = SAMPLE_BOXES.map((b) => b.name);
    expect(names.filter((n) => n === "必理痛")).toHaveLength(2);
    expect(names).toContain("ASPIRIN TAB 80MG");
    expect(names).toContain("神秘補品丸");
  });

  test("paracetamol: continue + duplicateInDrawer", () => {
    const g = byIngredient("paracetamol");
    expect(g.bucket).toBe("continue");
    expect(g.flags).toContain("duplicateInDrawer");
  });

  test("amlodipine: continue + strengthChanged (10 vs 5)", () => {
    const g = byIngredient("amlodipine");
    expect(g.bucket).toBe("continue");
    expect(g.flags).toContain("strengthChanged");
    expect(g.strengthDetail).toEqual({ sheet: "10mg", box: "5mg" });
  });

  test("atorvastatin: new", () => {
    expect(byIngredient("atorvastatin").bucket).toBe("new");
  });

  test("metformin: continue (no flags)", () => {
    const g = byIngredient("metformin");
    expect(g.bucket).toBe("continue");
    expect(g.flags).toEqual([]);
  });

  test("aspirin: notOnList", () => {
    expect(byIngredient("aspirin").bucket).toBe("notOnList");
  });

  test("神秘補品丸: unmatched (never bucketed)", () => {
    const un = groupsByBucket(r, "unmatched");
    expect(un).toHaveLength(1);
    expect(un[0].displayName).toBe("神秘補品丸");
  });

  test("sample-mode pipeline (mock extract S1→S2) yields the same buckets", async () => {
    const sheet = await mockVisionProvider.extract(sampleSheetCapture());
    const boxes: MedItem[] = [];
    for (let i = 0; i < SAMPLE_BOXES.length; i++) {
      boxes.push(...(await mockVisionProvider.extract(sampleBoxCapture(i))));
    }
    const piped = reconcile(sheet, boxes);
    expect(groupsByBucket(piped, "new").map((g) => g.activeIngredient)).toEqual(["atorvastatin"]);
    expect(groupsByBucket(piped, "notOnList").map((g) => g.activeIngredient)).toEqual(["aspirin"]);
    expect(groupsByBucket(piped, "unmatched")).toHaveLength(1);
    expect(piped.groups.find((g) => g.activeIngredient === "paracetamol")?.flags).toContain(
      "duplicateInDrawer",
    );
    expect(piped.groups.find((g) => g.activeIngredient === "amlodipine")?.flags).toContain(
      "strengthChanged",
    );
  });

  test("five expected buckets/flags all present", () => {
    expect(groupsByBucket(r, "continue").map((g) => g.activeIngredient).sort()).toEqual(
      ["amlodipine", "metformin", "paracetamol"],
    );
    expect(groupsByBucket(r, "new").map((g) => g.activeIngredient)).toEqual(["atorvastatin"]);
    expect(groupsByBucket(r, "notOnList").map((g) => g.activeIngredient)).toEqual(["aspirin"]);
    expect(groupsByBucket(r, "unmatched")).toHaveLength(1);
  });
});
