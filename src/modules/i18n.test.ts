import { describe, test, expect } from "@jest/globals";
import { L, langPillLabel } from "./i18n";
import {
  CONSENT,
  CONSENT_ZH_CN,
  DISCLAIMER,
  DISCLAIMER_ZH_CN,
  containsForbiddenAdviceWords,
} from "./compliance";
import type { Lang } from "./types";

const LANGS: Lang[] = ["zh-HK", "zh-CN", "en"];

describe("i18n — three languages are wired up", () => {
  test("every language resolves to a Strings table with core keys", () => {
    for (const lang of LANGS) {
      const s = L(lang);
      expect(typeof s.appName).toBe("string");
      expect(s.appName.length).toBeGreaterThan(0);
      expect(typeof s.common.disclaimer).toBe("string");
      expect(typeof s.s0.consent).toBe("string");
      expect(typeof s.home.sopcTitle).toBe("string");
      expect(typeof s.sopc.timeNote).toBe("string");
      expect(typeof s.s0.overlayToggle).toBe("string");
      expect(s.s0.overlayToggle.length).toBeGreaterThan(0);
    }
  });

  test("disclaimer / consent are single-sourced from compliance per language", () => {
    expect(L("zh-HK").common.disclaimer).toBe(DISCLAIMER);
    expect(L("en").common.disclaimer).toBe(DISCLAIMER);
    expect(L("zh-CN").common.disclaimer).toBe(DISCLAIMER_ZH_CN);

    expect(L("zh-HK").s0.consent).toBe(CONSENT);
    expect(L("en").s0.consent).toBe(CONSENT);
    expect(L("zh-CN").s0.consent).toBe(CONSENT_ZH_CN);
  });
});

describe("i18n — zh-CN is natural simplified, not a Cantonese char-copy", () => {
  const zhCN = L("zh-CN");

  test("uses mainland simplified phrasing, not Cantonese-only tokens", () => {
    const blob = JSON.stringify(zhCN);
    // Cantonese-only tokens that must NOT leak into the Mandarin table.
    for (const canto of ["返去", "影相", "閂咗佢", "唔好", "嘅", "冇", "睇下"]) {
      expect(blob).not.toContain(canto);
    }
    // A few expected simplified terms are present.
    expect(zhCN.common.back).toBe("返回");
    expect(zhCN.common.next).toBe("下一步");
    expect(zhCN.common.close).toBe("关闭");
    expect(zhCN.s0.language).toBe("语言");
    expect(zhCN.s0.voiceToggle).toBe("讲给我听");
    expect(zhCN.s0.overlayToggle).toBe("现场识别");
    expect(zhCN.s3.new).toBe("药单有、抽屉没见到（新）");
    expect(zhCN.s3.notOnList).toBe("不在你的药单上");
    expect(zhCN.s3.unmatched).toBe("对不上、要问药剂师");
  });

  test("zh-CN copy carries no forbidden advice words (outside the quoted disclaimer)", () => {
    const withoutDisclaimer = JSON.stringify(zhCN).split(DISCLAIMER_ZH_CN).join("");
    expect(containsForbiddenAdviceWords(withoutDisclaimer)).toEqual([]);
  });
});

describe("i18n — language pill cycles 粵 / 简 / EN", () => {
  test("pill label shows the current script clearly", () => {
    expect(langPillLabel("zh-HK")).toBe("粵");
    expect(langPillLabel("zh-CN")).toBe("简");
    expect(langPillLabel("en")).toBe("EN");
  });
});
