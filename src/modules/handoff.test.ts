import { describe, test, expect } from "@jest/globals";
import { buildPharmacistItems, buildShareText } from "./handoff";
import { reconcile } from "./reconcile";
import { SAMPLE_SHEET, SAMPLE_BOXES } from "./samples";
import {
  DISCLAIMER,
  DISCLAIMER_ZH_CN,
  containsForbiddenAdviceWords,
} from "./compliance";
import type { Lang } from "./types";

const r = reconcile(SAMPLE_SHEET, SAMPLE_BOXES);
const LANGS: Lang[] = ["zh-HK", "zh-CN", "en"];

describe("handoff — pharmacist card in all three languages", () => {
  test("the demo run surfaces at least one attention item", () => {
    // (unmatched 神秘補品丸, duplicate 必理痛, strength-changed amlodipine)
    expect(r.attention.length).toBeGreaterThan(0);
  });

  test("item count is identical across languages (only wording differs)", () => {
    const counts = LANGS.map((l) => buildPharmacistItems(r, l).length);
    expect(new Set(counts).size).toBe(1);
  });

  test("zh-CN questions are questions, never advice", () => {
    const items = buildPharmacistItems(r, "zh-CN");
    expect(items.length).toBeGreaterThan(0);
    for (const it of items) {
      expect(it.question).toContain("？");
      expect(containsForbiddenAdviceWords(it.question)).toEqual([]);
    }
  });

  test("zh-CN unmatched question stays a check, not an instruction", () => {
    const items = buildPharmacistItems(r, "zh-CN");
    const unmatched = items.find((i) => i.reason === "unmatched");
    expect(unmatched).toBeDefined();
    expect(unmatched!.question).toContain("是什么");
    // no 应该/必须/停/加/减 as instructions
    for (const forbidden of ["应该", "必须"]) {
      expect(unmatched!.question).not.toContain(forbidden);
    }
  });
});

describe("handoff — share text disclaimer follows the language", () => {
  test("zh-HK card ends with the traditional disclaimer", () => {
    const text = buildShareText(r, "陳伯（示範）", "zh-HK");
    expect(text).toContain(DISCLAIMER);
  });

  test("zh-CN card ends with the simplified disclaimer", () => {
    const text = buildShareText(r, "陈伯（示范）", "zh-CN");
    expect(text).toContain(DISCLAIMER_ZH_CN);
    expect(text).not.toContain(DISCLAIMER);
  });
});
