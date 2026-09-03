import { describe, test, expect } from "@jest/globals";
import {
  SAMPLE_SLIP,
  SOPC_STEPS_ZH,
  SOPC_STEPS_EN,
  SOPC_STEPS_ZH_CN,
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
    expect(SOPC_STEPS_ZH_CN).toHaveLength(3);
    expect(sopcSteps("zh-HK")).toHaveLength(3);
    expect(sopcSteps("zh-CN")).toHaveLength(3);
    expect(sopcSteps("en")).toHaveLength(3);
  });

  test("the three Cantonese steps are the mandated strings (verbatim, unchanged)", () => {
    expect(SOPC_STEPS_ZH[0]).toBe("呢張紙上嘅時間係登記，唔係見醫生。早15分鐘到。");
    expect(SOPC_STEPS_ZH[1]).toBe("去自助機或繳費處登記，唔好去舊交票櫃位。");
    expect(SOPC_STEPS_ZH[2]).toBe("去呢個專科大堂等。");
  });

  test("zh-CN steps carry the same locked meaning in simplified characters", () => {
    // 1) printed time is registration, not seeing the doctor; arrive 15 min early
    expect(SOPC_STEPS_ZH_CN[0]).toContain("登记");
    expect(SOPC_STEPS_ZH_CN[0]).toContain("不是见医生");
    expect(SOPC_STEPS_ZH_CN[0]).toContain("15");
    // 2) self-service kiosk / registration counter, NOT the old ticket window
    expect(SOPC_STEPS_ZH_CN[1]).toContain("自助机");
    expect(SOPC_STEPS_ZH_CN[1]).toContain("不要去旧");
    // 3) go to this specialty hall and wait
    expect(SOPC_STEPS_ZH_CN[2]).toContain("专科大堂");
    expect(SOPC_STEPS_ZH_CN[2]).toContain("等");
  });

  test("step 1 makes clear the printed time is 登記/登记, not 見醫生/见医生", () => {
    expect(SOPC_STEPS_ZH[0]).toContain("登記");
    expect(SOPC_STEPS_ZH[0]).toContain("唔係見醫生");
    expect(SOPC_STEPS_ZH_CN[0]).toContain("登记");
    expect(SOPC_STEPS_ZH_CN[0]).toContain("不是见医生");
  });
});

describe("sopc — safety guardrails", () => {
  const allZh = [...SOPC_STEPS_ZH, sopcLate("zh-HK"), sopcHuman("zh-HK")].join(" ");
  const allZhCn = [...SOPC_STEPS_ZH_CN, sopcLate("zh-CN"), sopcHuman("zh-CN")].join(" ");
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
    // zh-CN reassurance: slot (号) is NOT cancelled, re-register instead.
    expect(sopcLate("zh-CN")).toContain("不会取消你的号");
    expect(sopcLate("zh-CN")).toContain("重新登记");
    expect(allZhCn).not.toContain("取消你的号，");
  });

  test("no forbidden advice words (診斷/治療/處方/治癒/diagnose/treat/…)", () => {
    expect(containsForbiddenAdviceWords(allZh)).toEqual([]);
    expect(containsForbiddenAdviceWords(allZhCn)).toEqual([]);
    expect(containsForbiddenAdviceWords(allEn)).toEqual([]);
  });

  test("this path never mentions A&E, indoor GPS, pharmacy or HA Go", () => {
    const haystackZh = `${allZh} ${SAMPLE_SLIP.venueZh} ${SAMPLE_SLIP.clinicZh}`;
    const haystackZhCn = `${allZhCn} ${SAMPLE_SLIP.venueZh} ${SAMPLE_SLIP.clinicZh}`;
    const haystackEn = `${allEn} ${SAMPLE_SLIP.venueEn} ${SAMPLE_SLIP.clinicEn}`.toLowerCase();
    for (const banned of ["急症", "藥房", "GPS", "HA Go", "HA GO"]) {
      expect(haystackZh).not.toContain(banned);
    }
    // zh-CN must also avoid 急症, simplified pharmacy (药房), GPS, HA Go.
    for (const banned of ["急症", "药房", "藥房", "GPS", "HA Go", "HA GO"]) {
      expect(haystackZhCn).not.toContain(banned);
    }
    for (const banned of ["a&e", "accident", "emergency", "gps", "pharmacy", "ha go"]) {
      expect(haystackEn).not.toContain(banned);
    }
  });

  test("the walk ends on a human counter (繳費處／登記處 · 缴费处／登记处)", () => {
    expect(sopcHuman("zh-HK")).toMatch(/繳費處|登記處/);
    expect(sopcHuman("zh-CN")).toMatch(/缴费处|登记处/);
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

    const zhCn = sopcStepsSpokenText("zh-CN");
    expect(zhCn).toContain(SOPC_STEPS_ZH_CN[0]);
    expect(zhCn).toContain(SOPC_STEPS_ZH_CN[2]);
    expect(zhCn.indexOf(SOPC_STEPS_ZH_CN[0])).toBeLessThan(zhCn.indexOf(SOPC_STEPS_ZH_CN[2]));
  });
});
