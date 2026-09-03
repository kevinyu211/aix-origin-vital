// handoff module — turns reconcile attention items into a pharmacist question card.
// Every line is a QUESTION for the pharmacist. Nothing here tells anyone what to do.

import type { AttentionItem, Lang, PharmacistItem, ReconcileResult } from "./types";
import { disclaimerFor } from "./compliance";

function questionFor(item: AttentionItem, lang: Lang): string {
  const name = item.displayName;
  const sheet = item.detail?.sheet ?? "";
  const box = item.detail?.box ?? "";
  if (lang === "en") {
    switch (item.reason) {
      case "unmatched":
        return `This box "${name}" didn't match anything on the sheet — can you help me check what it is?`;
      case "duplicateInDrawer":
        return `There seem to be two or more boxes that may be the same ingredient (${name}) — are they the same medicine?`;
      case "strengthChanged":
        return `The sheet shows ${sheet} but the box shows ${box} (${name}) — which one should I be looking at?`;
    }
  }
  if (lang === "zh-CN") {
    switch (item.reason) {
      case "unmatched":
        return `这盒「${name}」对不上药单上面的资料，可不可以帮我看一下是什么？`;
      case "duplicateInDrawer":
        return `药箱里好像有两盒或以上可能是同一种成分（${name}），是不是同一种药？`;
      case "strengthChanged":
        return `药单写${sheet}，但药盒写${box}（${name}）——想问一下应该看哪一个？`;
    }
  }
  switch (item.reason) {
    case "unmatched":
      return `呢盒「${name}」對唔到藥單上面嘅資料，可唔可以幫我睇下係咩嚟？`;
    case "duplicateInDrawer":
      return `藥箱入面好似有兩盒或以上可能係同一種成分（${name}），係咪同一隻嚟？`;
    case "strengthChanged":
      return `藥單寫${sheet}，但藥盒寫${box}（${name}）——想問下應該睇邊一個？`;
  }
}

export function buildPharmacistItems(result: ReconcileResult, lang: Lang): PharmacistItem[] {
  return result.attention.map((a) => ({
    key: `${a.key}:${a.reason}`,
    displayName: a.displayName,
    reason: a.reason,
    question: questionFor(a, lang),
  }));
}

/** Plain-text version of the card (used for the shareable PNG caption / fallback). */
export function buildShareText(
  result: ReconcileResult,
  patientLabel: string,
  lang: Lang,
): string {
  const items = buildPharmacistItems(result, lang);
  const title =
    lang === "en"
      ? "Questions for my pharmacist"
      : lang === "zh-CN"
        ? "想问药剂师的问题"
        : "想問藥劑師嘅問題";
  const intro =
    lang === "en"
      ? `${patientLabel} would like to ask:`
      : lang === "zh-CN"
        ? `${patientLabel}想问一问：`
        : `${patientLabel}想問問：`;
  const emptyLine =
    lang === "en"
      ? "(No flagged items in this demo run.)"
      : lang === "zh-CN"
        ? "（这次示范没有需要特别留意的项目。）"
        : "（今次示範冇需要特別留意嘅項目。）";
  const lines = items.length
    ? items.map((it, i) => `${i + 1}. ${it.question}`)
    : [emptyLine];
  return [`【示範 DEMO】${title}`, intro, ...lines, "", disclaimerFor(lang)].join("\n");
}
