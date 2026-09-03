import { describe, test, expect } from "@jest/globals";
import {
  DISCLAIMER,
  CONSENT,
  classifyQuery,
  buildRefusal,
  containsForbiddenAdviceWords,
} from "./compliance";
import { reconcile } from "./reconcile";
import { buildPharmacistItems, buildShareText } from "./handoff";
import { SAMPLE_SHEET, SAMPLE_BOXES } from "./samples";

describe("compliance — verbatim texts", () => {
  test("disclaimer is exactly the mandated string", () => {
    expect(DISCLAIMER).toBe(
      "本工具僅供健康信息參考與支持，不構成醫療建議，不能取代專業醫護人員的診斷或治療。如有健康疑慮，請諮詢註冊醫生或相關專業人士。AI 生成內容可能不準確。",
    );
  });

  test("consent is exactly the mandated string", () => {
    expect(CONSENT).toBe("呢個係示範版。請只用假嘅／示範嘅藥單同藥盒。唔好影真人嘅資料。");
  });
});

describe("compliance — refusal classifier", () => {
  test.each([
    "我應唔應該停藥？",
    "可唔可以加藥？",
    "Should I stop taking this?",
    "how many pills do I take?",
    "can I combine these two?",
  ])("refuses advice-seeking question: %s", (q) => {
    expect(classifyQuery(q).refuse).toBe(true);
  });

  test.each(["呢盒係咩藥？", "what is this box?", "邊個係新藥？"])(
    "does not refuse a neutral question: %s",
    (q) => {
      expect(classifyQuery(q).refuse).toBe(false);
    },
  );

  test("refusal message contains no advice and points to a professional", () => {
    const zh = buildRefusal("zh-HK");
    const en = buildRefusal("en");
    expect(zh).toContain("藥劑師");
    expect(en.toLowerCase()).toContain("pharmacist");
  });
});

describe("compliance — generated content never carries advice words", () => {
  const r = reconcile(SAMPLE_SHEET, SAMPLE_BOXES);

  test("pharmacist questions are clean", () => {
    for (const item of buildPharmacistItems(r, "zh-HK")) {
      expect(containsForbiddenAdviceWords(item.question)).toEqual([]);
    }
    for (const item of buildPharmacistItems(r, "en")) {
      expect(containsForbiddenAdviceWords(item.question)).toEqual([]);
    }
  });

  test("share text advice words come ONLY from the appended disclaimer", () => {
    const text = buildShareText(r, "陳伯（示範）", "zh-HK");
    const withoutDisclaimer = text.replace(DISCLAIMER, "");
    expect(containsForbiddenAdviceWords(withoutDisclaimer)).toEqual([]);
  });
});
