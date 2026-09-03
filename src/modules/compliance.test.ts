import { describe, test, expect } from "@jest/globals";
import {
  DISCLAIMER,
  DISCLAIMER_ZH_CN,
  CONSENT,
  CONSENT_ZH_CN,
  classifyQuery,
  buildRefusal,
  consentFor,
  disclaimerFor,
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

  test("zh-CN disclaimer is exactly the mandated simplified string", () => {
    expect(DISCLAIMER_ZH_CN).toBe(
      "本工具仅供健康信息参考与支持，不构成医疗建议，不能取代专业医护人员的诊断或治疗。如有健康疑虑，请咨询注册医生或相关专业人士。AI 生成内容可能不准确。",
    );
  });

  test("zh-CN consent is exactly the mandated simplified string", () => {
    expect(CONSENT_ZH_CN).toBe("这是示范版。请只用假的／示范的药单和药盒。不要拍真人资料。");
  });

  test("disclaimerFor / consentFor single-source each language", () => {
    expect(disclaimerFor("zh-HK")).toBe(DISCLAIMER);
    expect(disclaimerFor("en")).toBe(DISCLAIMER);
    expect(disclaimerFor("zh-CN")).toBe(DISCLAIMER_ZH_CN);
    expect(consentFor("zh-HK")).toBe(CONSENT);
    expect(consentFor("en")).toBe(CONSENT);
    expect(consentFor("zh-CN")).toBe(CONSENT_ZH_CN);
  });
});

describe("compliance — refusal classifier", () => {
  test.each([
    "我應唔應該停藥？",
    "可唔可以加藥？",
    "Should I stop taking this?",
    "how many pills do I take?",
    "can I combine these two?",
    // zh-CN (simplified, Mandarin)
    "我应不应该停药？",
    "要不要加药？",
    "这个能停吗？",
    "可以减药吗？",
    "一起吃可以吗？",
    "换药好不好？",
  ])("refuses advice-seeking question: %s", (q) => {
    expect(classifyQuery(q).refuse).toBe(true);
  });

  test.each([
    "呢盒係咩藥？",
    "what is this box?",
    "邊個係新藥？",
    // zh-CN neutral
    "这盒是什么药？",
    "哪个是新药？",
  ])("does not refuse a neutral question: %s", (q) => {
    expect(classifyQuery(q).refuse).toBe(false);
  });

  test("refusal message contains no advice and points to a professional", () => {
    const zh = buildRefusal("zh-HK");
    const zhCn = buildRefusal("zh-CN");
    const en = buildRefusal("en");
    expect(zh).toContain("藥劑師");
    expect(zhCn).toContain("药剂师");
    expect(en.toLowerCase()).toContain("pharmacist");
    // The refusal must not itself carry forbidden advice words.
    expect(containsForbiddenAdviceWords(zhCn)).toEqual([]);
  });
});

describe("compliance — generated content never carries advice words", () => {
  const r = reconcile(SAMPLE_SHEET, SAMPLE_BOXES);

  test("pharmacist questions are clean", () => {
    for (const lang of ["zh-HK", "zh-CN", "en"] as const) {
      for (const item of buildPharmacistItems(r, lang)) {
        expect(containsForbiddenAdviceWords(item.question)).toEqual([]);
      }
    }
  });

  test("share text advice words come ONLY from the appended disclaimer", () => {
    const zh = buildShareText(r, "陳伯（示範）", "zh-HK");
    expect(containsForbiddenAdviceWords(zh.replace(DISCLAIMER, ""))).toEqual([]);

    const zhCn = buildShareText(r, "陈伯（示范）", "zh-CN");
    expect(containsForbiddenAdviceWords(zhCn.replace(DISCLAIMER_ZH_CN, ""))).toEqual([]);
    // The zh-CN card uses the simplified disclaimer, not the traditional one.
    expect(zhCn).toContain(DISCLAIMER_ZH_CN);
  });
});
