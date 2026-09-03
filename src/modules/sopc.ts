// sopc module — data for the SOPC (專科門診 / Specialist Out-patient Clinic) visit-day
// voice companion. UI-free so the steps and the synthetic slip can be unit-tested.
//
// This is a SECOND demo path that lives alongside 對藥 (discharge medicine check).
// It only covers the "visit day" walk: read the slip → hear three steps → end on a
// human counter. It never diagnoses, never mentions A&E, indoor GPS, pharmacy or HA Go.

import type { Lang } from "./types";

/**
 * Synthetic 專科門診預約紙 (specialist out-patient appointment slip). PWH-style, fully
 * fabricated. `regTime` is the 登記時間 (registration time) — deliberately NOT the time
 * the patient sees a doctor. Everything is watermarked 示範 in the UI.
 */
export interface AppointmentSlip {
  hospitalZh: string;
  hospitalEn: string;
  clinicZh: string;
  clinicEn: string;
  specialtyZh: string;
  specialtyEn: string;
  patientZh: string;
  patientEn: string;
  caseNo: string;
  dateZh: string;
  dateEn: string;
  /** The printed time on the slip. It is the REGISTRATION time, not the doctor time. */
  regTime: string;
  venueZh: string;
  venueEn: string;
}

// Fabricated demo slip. No real patient information.
export const SAMPLE_SLIP: AppointmentSlip = {
  hospitalZh: "威爾斯親王醫院",
  hospitalEn: "Prince of Wales Hospital",
  clinicZh: "專科門診",
  clinicEn: "Specialist Out-patient Clinic",
  specialtyZh: "內科",
  specialtyEn: "Medicine",
  patientZh: "陳大文（示範）",
  patientEn: "Chan Tai Man (DEMO)",
  caseNo: "SOPC-2026-0417",
  dateZh: "2026年3月17日（星期二）",
  dateEn: "Tue, 17 Mar 2026",
  regTime: "09:15",
  venueZh: "3 樓 內科專科門診 大堂",
  venueEn: "3/F Medicine SOPC Hall",
};

/**
 * The three spoken steps, VERBATIM in written Cantonese. These are read aloud in order
 * on S2 and must not change wording:
 *   1. The printed time is registration, not doctor time — arrive 15 min early.
 *   2. Register at a self-service kiosk or the payment/registration counter — not the
 *      old ticket window.
 *   3. Go to this specialty's hall and wait.
 */
export const SOPC_STEPS_ZH: readonly string[] = [
  "呢張紙上嘅時間係登記，唔係見醫生。早15分鐘到。",
  "去自助機或繳費處登記，唔好去舊交票櫃位。",
  "去呢個專科大堂等。",
] as const;

export const SOPC_STEPS_EN: readonly string[] = [
  "The time printed on this slip is your registration time, not your doctor time. Arrive 15 minutes early.",
  "Register at a self-service kiosk or the payment / registration counter — don't go to the old ticket window.",
  "Then go to this specialty's waiting hall and wait.",
] as const;

// Simplified-character (zh-CN) steps — same meaning as SOPC_STEPS_ZH, Mandarin phrasing.
export const SOPC_STEPS_ZH_CN: readonly string[] = [
  "这张纸上的时间是登记，不是见医生。早 15 分钟到。",
  "去自助机或缴费处登记，不要去旧的交票柜位。",
  "去这个专科大堂等。",
] as const;

export function sopcSteps(lang: Lang): readonly string[] {
  if (lang === "en") return SOPC_STEPS_EN;
  if (lang === "zh-CN") return SOPC_STEPS_ZH_CN;
  return SOPC_STEPS_ZH;
}

/**
 * Reassurance about being late. Being 15–30 minutes late means you RE-REGISTER — it does
 * NOT cancel / kill your slot (籌). Kept out of the three core steps but shown as support.
 */
export const SOPC_LATE_ZH =
  "遲到都唔使慌：遲 15 至 30 分鐘，去登記處重新登記就得，唔會取消你個籌。";
export const SOPC_LATE_EN =
  "Running late is okay: if you are 15–30 minutes late, just re-register at the registration counter — your slot is not cancelled.";
// Simplified-character (zh-CN) reassurance — same meaning as SOPC_LATE_ZH.
export const SOPC_LATE_ZH_CN =
  "迟到也不用慌：迟 15 至 30 分钟，去登记处重新登记就行，不会取消你的号。";

export function sopcLate(lang: Lang): string {
  if (lang === "en") return SOPC_LATE_EN;
  if (lang === "zh-CN") return SOPC_LATE_ZH_CN;
  return SOPC_LATE_ZH;
}

/** Where the walk ends: a human counter (payment / registration), never an app or GPS. */
export const SOPC_HUMAN_ZH =
  "搞唔掂、唔清楚，就去繳費處／登記處問下職員。真人幫到你。";
export const SOPC_HUMAN_EN =
  "If anything is unclear, ask a staff member at the payment / registration counter. A real person can help you.";
// Simplified-character (zh-CN) end-on-a-human line — same meaning as SOPC_HUMAN_ZH.
export const SOPC_HUMAN_ZH_CN =
  "搞不定、不清楚，就去缴费处／登记处问一下职员。真人帮到你。";

export function sopcHuman(lang: Lang): string {
  if (lang === "en") return SOPC_HUMAN_EN;
  if (lang === "zh-CN") return SOPC_HUMAN_ZH_CN;
  return SOPC_HUMAN_ZH;
}

/** One string that reads all three steps aloud in order (for the 「聽晒」 button). */
export function sopcStepsSpokenText(lang: Lang): string {
  const steps = sopcSteps(lang);
  if (lang === "en") return steps.map((s, i) => `Step ${i + 1}. ${s}`).join(" ");
  return steps.map((s, i) => `第${i + 1}步。${s}`).join("");
}
