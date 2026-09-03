// compliance module — the guardrails that make this a "soft healthcare" tool.
//
//  - DISCLAIMER: the verbatim, legally-required disclaimer text.
//  - CONSENT: the verbatim simulated-data consent text.
//  - classifyQuery(): a keyword classifier that detects advice-seeking questions so the
//    UI can refuse instead of generating advice. It NEVER produces medical advice.
//  - buildRefusal(): a fixed, non-advice refusal message that points to a pharmacist.
//  - containsForbiddenAdviceWords(): guard for our own generated / hand-off content.

import type { Lang } from "./types";

// The disclaimer is quoted verbatim by spec. It intentionally contains 診斷/治療 because
// it describes what this tool does NOT do. This is the ONLY place those words are allowed.
export const DISCLAIMER =
  "本工具僅供健康信息參考與支持，不構成醫療建議，不能取代專業醫護人員的診斷或治療。如有健康疑慮，請諮詢註冊醫生或相關專業人士。AI 生成內容可能不準確。";

export const CONSENT =
  "呢個係示範版。請只用假嘅／示範嘅藥單同藥盒。唔好影真人嘅資料。";

// Words that must never appear as instructions/advice in generated or hand-off content.
export const FORBIDDEN_ADVICE_WORDS = [
  "診斷",
  "治療",
  "處方",
  "治癒",
  "diagnose",
  "treat",
  "prescribe",
  "cure",
];

// Advice-seeking intent keywords. If a user's free text matches, we refuse.
const REFUSAL_KEYWORDS = [
  // zh-HK
  "應該",
  "應唔應該",
  "使唔使",
  "需唔需要",
  "停藥",
  "停唔停",
  "可以停",
  "加藥",
  "減藥",
  "可以加",
  "可以減",
  "食唔食",
  "食幾多",
  "幾多粒",
  "劑量",
  "好唔好食",
  "邊隻好",
  "換藥",
  "溝埋",
  "一齊食",
  "診斷",
  "治療",
  "斷症",
  // en
  "should i",
  "can i stop",
  "can i take",
  "can i start",
  "stop taking",
  "start taking",
  "how many",
  "dose",
  "dosage",
  "increase",
  "decrease",
  "is it safe",
  "replace",
  "combine",
  "diagnose",
  "treat",
  "prescribe",
  "cure",
];

export interface QueryClassification {
  refuse: boolean;
  matched: string[];
}

/** Deterministic keyword classifier. No model, no generated advice. */
export function classifyQuery(input: string): QueryClassification {
  const text = input.toLowerCase();
  const matched = REFUSAL_KEYWORDS.filter((k) => text.includes(k.toLowerCase()));
  return { refuse: matched.length > 0, matched };
}

/** Fixed refusal message. Contains no advice; steers to a pharmacist / registered doctor. */
export function buildRefusal(lang: Lang): string {
  if (lang === "en") {
    return (
      "Sorry — I can't tell you whether to take, add, reduce or stop any medicine. " +
      "I can only help you compare the names and information on your sheet and boxes. " +
      "Please ask your pharmacist or a registered doctor about this."
    );
  }
  return (
    "對唔住，我唔可以話你應唔應該食、加、減或者停邊隻藥。" +
    "我只可以幫你對照藥單同藥盒上面嘅資料。" +
    "呢啲問題，最好問下你嘅藥劑師或者註冊醫生。"
  );
}

/** Guard for our OWN generated content (not the verbatim disclaimer). */
export function containsForbiddenAdviceWords(text: string): string[] {
  const lower = text.toLowerCase();
  return FORBIDDEN_ADVICE_WORDS.filter((w) => lower.includes(w.toLowerCase()));
}
