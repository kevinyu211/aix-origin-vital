import { describe, test, expect } from "@jest/globals";
import {
  SAMPLE_SLIP,
  SOPC_STEPS_ZH,
  SOPC_STEPS_EN,
  sopcSteps,
  sopcLate,
  sopcHuman,
  sopcStepsSpokenText,
} from "./sopc";
import { containsForbiddenAdviceWords } from "./compliance";

describe("sopc — exactly three spoken steps, verbatim", () => {
  test("there are exactly three steps in each language", () => {
    expect(SOPC_STEPS_ZH).toHaveLength(3);
    expect(SOPC_STEPS_EN).toHaveLength(3);
    expect(sopcSteps("zh-HK")).toHaveLength(3);
    expect(sopcSteps("en")).toHaveLength(3);
  });

  test("the three Cantonese steps are the mandated strings", () => {
    expect(SOPC_STEPS_ZH[0]).toBe("呢張紙上嘅時間係登記，唔係見醫生。早15分鐘到。");
    expect(SOPC_STEPS_ZH[1]).toBe("去自助機或繳費處登記，唔好去舊交票櫃位。");
    expect(SOPC_STEPS_ZH[2]).toBe("去呢個專科大堂等。");
  });

  test("step 1 makes clear the printed time is 登記, not 見醫生", () => {
    expect(SOPC_STEPS_ZH[0]).toContain("登記");
    expect(SOPC_STEPS_ZH[0]).toContain("唔係見醫生");
  });
});

describe("sopc — safety guardrails", () => {
  const allZh = [...SOPC_STEPS_ZH, sopcLate("zh-HK"), sopcHuman("zh-HK")].join(" ");
  const allEn = [...SOPC_STEPS_EN, sopcLate("en"), sopcHuman("en")].join(" ");

  test("never says a late arrival cancels / kills the slot", () => {
    // Late = re-register, NOT kill. Guard against any 'cancel the 籌' wording appearing
    // as a statement rather than the reassurance that it is NOT cancelled.
    expect(allZh).not.toContain("取消個籌");
    expect(allZh).not.toContain("取消你個籌，");
    expect(allZh).not.toMatch(/過咗時間.*冇咗/);
    // The reassurance explicitly says the slot is NOT cancelled.
    expect(sopcLate("zh-HK")).toContain("唔會取消你個籌");
    expect(sopcLate("zh-HK")).toContain("重新登記");
    expect(sopcLate("en").toLowerCase()).toContain("not cancelled");
    expect(sopcLate("en").toLowerCase()).toContain("re-register");
  });

  test("no forbidden advice words (診斷/治療/處方/治癒/diagnose/treat/…)", () => {
    expect(containsForbiddenAdviceWords(allZh)).toEqual([]);
    expect(containsForbiddenAdviceWords(allEn)).toEqual([]);
  });

  test("this path never mentions A&E, indoor GPS, pharmacy or HA Go", () => {
    const haystackZh = `${allZh} ${SAMPLE_SLIP.venueZh} ${SAMPLE_SLIP.clinicZh}`;
    const haystackEn = `${allEn} ${SAMPLE_SLIP.venueEn} ${SAMPLE_SLIP.clinicEn}`.toLowerCase();
    for (const banned of ["急症", "藥房", "GPS", "HA Go", "HA GO"]) {
      expect(haystackZh).not.toContain(banned);
    }
    for (const banned of ["a&e", "accident", "emergency", "gps", "pharmacy", "ha go"]) {
      expect(haystackEn).not.toContain(banned);
    }
  });

  test("the walk ends on a human counter (繳費處／登記處)", () => {
    expect(sopcHuman("zh-HK")).toMatch(/繳費處|登記處/);
    expect(sopcHuman("en").toLowerCase()).toMatch(/payment|registration/);
  });
});

describe("sopc — synthetic slip", () => {
  test("is a PWH-style 內科 SOPC slip, watermark-labelled demo, with a printed 登記時間", () => {
    expect(SAMPLE_SLIP.specialtyZh).toBe("內科");
    expect(SAMPLE_SLIP.clinicZh).toBe("專科門診");
    expect(SAMPLE_SLIP.hospitalEn).toContain("Prince of Wales");
    expect(SAMPLE_SLIP.regTime).toMatch(/^\d{2}:\d{2}$/);
    // fabricated patient is clearly marked as a demo
    expect(SAMPLE_SLIP.patientZh).toContain("示範");
  });
});

describe("sopc — 聽晒 (listen-to-all) text", () => {
  test("reads all three steps in order", () => {
    const zh = sopcStepsSpokenText("zh-HK");
    expect(zh).toContain(SOPC_STEPS_ZH[0]);
    expect(zh).toContain(SOPC_STEPS_ZH[1]);
    expect(zh).toContain(SOPC_STEPS_ZH[2]);
    expect(zh.indexOf(SOPC_STEPS_ZH[0])).toBeLessThan(zh.indexOf(SOPC_STEPS_ZH[2]));

    const en = sopcStepsSpokenText("en");
    expect(en).toContain("Step 1.");
    expect(en).toContain("Step 3.");
  });
});
