// i18n module — zh-HK (written Cantonese, 粵), zh-CN (Mandarin, 简体) and en strings for
// every screen. The disclaimer and consent come from the compliance module (via the
// disclaimerFor / consentFor helpers) so they stay verbatim and single-sourced.

import type { Lang } from "./types";
import { consentFor, disclaimerFor } from "./compliance";

export interface Strings {
  appName: string;
  tagline: string;
  demoBadge: string;
  common: {
    back: string;
    next: string;
    close: string;
    listen: string;
    stop: string;
    disclaimer: string;
  };
  s0: {
    title: string;
    consent: string;
    simulatedToggle: string;
    mustConsent: string;
    start: string;
    language: string;
    voiceToggle: string;
    largeType: string;
    voiceOn: string;
    voiceOff: string;
    overlayToggle: string;
    overlayOn: string;
    overlayOff: string;
    overlayHint: string;
    liveFailed: string;
  };
  s1: {
    title: string;
    hint: string;
    useSample: string;
    permissionNeeded: string;
    grant: string;
    shutter: string;
    captured: string;
    couldNotRead: string;
  };
  s2: {
    title: string;
    hint: string;
    boxesSoFar: (n: number) => string;
    addBox: string;
    done: string;
    shutter: string;
  };
  s3: {
    title: string;
    listenAll: string;
    continue: string;
    new: string;
    notOnList: string;
    unmatched: string;
    empty: string;
    revealTitle: string;
    revealBody: (name: string) => string;
    strengthChanged: (sheet: string, box: string) => string;
    onSheet: string;
    inDrawer: string;
    askLabel: string;
    askPlaceholder: string;
    askSend: string;
    pharmacistCta: string;
  };
  s4: {
    title: string;
    intro: string;
    share: string;
    shareFail: string;
    noItems: string;
  };
  s5: {
    title: string;
    modelVsRules: string;
    modelVsRulesBody: string;
    providers: string;
    providersBody: string;
    crossBorder: string;
    crossBorderBody: string;
  };
  s6: {
    title: string;
    askPharmacist: string;
  };
  buckets: {
    continue: string;
    new: string;
    notOnList: string;
    unmatched: string;
  };
  home: {
    title: string;
    subtitle: string;
    pickPrompt: string;
    sopcTitle: string;
    sopcSub: string;
    doyeukTitle: string;
    doyeukSub: string;
    demoNote: string;
  };
  sopc: {
    badge: string;
    s1Title: string;
    s1Hint: string;
    timeNote: string;
    useSample: string;
    captured: string;
    slipHint: string;
    regTimeLabel: string;
    patientLabel: string;
    caseLabel: string;
    dateLabel: string;
    specialtyLabel: string;
    venueLabel: string;
    watermark: string;
    seeSteps: string;
    s2Title: string;
    s2Intro: string;
    listenAll: string;
    stopListen: string;
    stepLabel: (n: number) => string;
    lateTitle: string;
    lateBody: string;
    toEnd: string;
    s3Title: string;
    s3Body: string;
    humanTitle: string;
    replay: string;
    backHome: string;
  };
}

const zhHK: Strings = {
  appName: "對藥",
  tagline: "出院藥物對照",
  demoBadge: "示範",
  common: {
    back: "返去",
    next: "下一步",
    close: "閂咗佢",
    listen: "聽",
    stop: "停",
    disclaimer: disclaimerFor("zh-HK"),
  },
  s0: {
    title: "歡迎使用對藥",
    consent: consentFor("zh-HK"),
    simulatedToggle: "我明白，我只會用假嘅／示範資料",
    mustConsent: "請先剔上面嘅方格，先可以開始。",
    start: "開始",
    language: "語言",
    voiceToggle: "講俾我聽",
    largeType: "老友記大字",
    voiceOn: "已開",
    voiceOff: "未開",
    overlayToggle: "現場辨識",
    overlayOn: "已開",
    overlayOff: "未開",
    overlayHint: "開咗會用現場相機讀藥名，同用粵語朗讀。讀唔到就用示範。示範唔使密鑰。",
    liveFailed: "現場辨識而家用唔到。請按「用示範藥單」。",
  },
  s1: {
    title: "第一步：影藥單",
    hint: "將醫院嘅出院藥單放喺框入面，影一張相。淨係用示範／假嘅藥單。",
    useSample: "用示範藥單",
    permissionNeeded: "想用相機，要俾對藥用相機權限。",
    grant: "俾相機權限",
    shutter: "影相",
    captured: "影好喇！",
    couldNotRead: "而家係示範模式，讀唔到真相。請按「用示範藥單」。",
  },
  s2: {
    title: "第二步：影藥盒",
    hint: "逐一影抽屜入面嘅藥盒（最多 8 盒）。影完就撳「影完喇」。",
    boxesSoFar: (n: number) => `已經影咗 ${n} 盒`,
    addBox: "影下一盒",
    done: "影完喇",
    shutter: "影相",
  },
  s3: {
    title: "對照結果",
    listenAll: "聽晒",
    continue: "繼續食開嘅",
    new: "藥單有、抽屜未見到（新）",
    notOnList: "唔喺你張藥單",
    unmatched: "對唔到、要問藥劑師",
    empty: "呢一組冇嘢。",
    revealTitle: "留意！",
    revealBody: (name: string) =>
      `抽屜入面有兩盒或以上，可能係同一種藥（${name}），只係名唔同。`,
    strengthChanged: (sheet: string, box: string) =>
      `藥單寫 ${sheet}，藥盒寫 ${box}，份量唔同咗。`,
    onSheet: "藥單",
    inDrawer: "藥盒",
    askLabel: "有嘢想問？",
    askPlaceholder: "打你想問嘅嘢……",
    askSend: "問",
    pharmacistCta: "整張藥劑師問題卡",
  },
  s4: {
    title: "藥劑師問題卡",
    intro: "帶呢張卡去問藥劑師。全部都係問題，唔係建議。",
    share: "分享 / 存圖",
    shareFail: "而家分享唔到，可以截圖。",
    noItems: "今次示範冇需要特別留意嘅項目。",
  },
  s5: {
    title: "關於 同 私隱",
    modelVsRules: "邊部分靠 AI，邊部分靠規則？",
    modelVsRulesBody:
      "讀藥單同藥盒名嗰步係靠 AI 視覺模型（示範模式用固定假資料）。分組同對照嗰步係固定規則計出嚟，同一份輸入永遠得出同一個結果，唔靠 AI。",
    providers: "供應商",
    providersBody:
      "視覺：示範用 mock。現場辨識開啟時經本機伺服器做 Anthropic OCR。語音：MiniMax T2A 廣東話經伺服器，設備語音做後備。密鑰只放喺伺服器。",
    crossBorder: "跨境資料",
    crossBorderBody:
      "示範模式唔會傳任何資料出去。開啟現場辨識時，相會經本機伺服器傳去 Anthropic 處理，請只用假／示範資料。",
  },
  s6: {
    title: "呢個問題想問專業人士",
    askPharmacist: "帶去問藥劑師",
  },
  buckets: {
    continue: "繼續食開嘅",
    new: "新",
    notOnList: "唔喺你張藥單",
    unmatched: "對唔到",
  },
  home: {
    title: "Vital 幫手",
    subtitle: "軟性健康支援 · 示範",
    pickPrompt: "今日想做啲乜？",
    sopcTitle: "今日去專科門診",
    sopcSub: "帶你行專科門診，一步步，講俾你聽。",
    doyeukTitle: "對藥（出院藥物對照）",
    doyeukSub: "對照出院藥單同抽屜入面嘅藥盒。",
    demoNote: "全部都係示範／假資料，唔好用真人資料。",
  },
  sopc: {
    badge: "示範",
    s1Title: "第一步：影預約紙",
    s1Hint: "將專科門診預約紙放喺框入面影一張相，或者用下面嘅示範預約紙。淨係用示範／假嘅紙。",
    timeNote: "留意：張紙上面印嘅時間係「登記時間」，唔係見醫生嘅時間。",
    useSample: "用示範預約紙",
    captured: "睇到喇！",
    slipHint: "呢張係示範預約紙，睇下個「登記時間」。",
    regTimeLabel: "登記時間",
    patientLabel: "病人",
    caseLabel: "個案編號",
    dateLabel: "日期",
    specialtyLabel: "專科",
    venueLabel: "地點",
    watermark: "示範",
    seeSteps: "睇／聽三個步驟",
    s2Title: "專科門診三步",
    s2Intro: "跟住呢三步行就得。想聽就撳「聽晒」。",
    listenAll: "🔊 聽晒",
    stopListen: "停",
    stepLabel: (n: number) => `第 ${n} 步`,
    lateTitle: "遲到？唔使慌",
    lateBody: "遲 15 至 30 分鐘，去登記處重新登記就得，唔會取消你個籌。",
    toEnd: "下一步",
    s3Title: "搞掂",
    s3Body: "行完呢三步，喺專科大堂等叫名／叫號就得。",
    humanTitle: "搵唔到路？問真人",
    replay: "再聽多次",
    backHome: "返去主頁",
  },
};

const en: Strings = {
  appName: "DoYeuk",
  tagline: "Discharge Medicine Check",
  demoBadge: "DEMO",
  common: {
    back: "Back",
    next: "Next",
    close: "Close",
    listen: "Listen",
    stop: "Stop",
    disclaimer: disclaimerFor("en"),
  },
  s0: {
    title: "Welcome to DoYeuk",
    consent: consentFor("en"),
    simulatedToggle: "I understand — I will only use fake / demo data",
    mustConsent: "Please tick the box above before you can start.",
    start: "Start",
    language: "Language",
    voiceToggle: "Read aloud to me",
    largeType: "Large type",
    voiceOn: "On",
    voiceOff: "Off",
    overlayToggle: "Live overlay",
    overlayOn: "On",
    overlayOff: "Off",
    overlayHint:
      "When on, the camera reads names live and speech goes through the server. If that fails, use the demo path. Demo needs no keys.",
    liveFailed: "Live overlay is unavailable. Please tap “Use the demo sheet”.",
  },
  s1: {
    title: "Step 1: Photo of the sheet",
    hint: "Put the hospital discharge sheet in the frame and take a photo. Use demo / fake sheets only.",
    useSample: "Use the demo sheet",
    permissionNeeded: "Camera access is needed to take a photo.",
    grant: "Allow camera",
    shutter: "Take photo",
    captured: "Got it!",
    couldNotRead: "This is demo mode and can't read a real photo. Please tap “Use the demo sheet”.",
  },
  s2: {
    title: "Step 2: Photo of the boxes",
    hint: "Photograph each box in the drawer (up to 8). Tap “Done” when finished.",
    boxesSoFar: (n: number) => `${n} box(es) so far`,
    addBox: "Next box",
    done: "Done",
    shutter: "Take photo",
  },
  s3: {
    title: "Comparison result",
    listenAll: "Listen to all",
    continue: "Keep taking",
    new: "On sheet, not seen in drawer (new)",
    notOnList: "Not on your list",
    unmatched: "Couldn't match — ask a pharmacist",
    empty: "Nothing in this group.",
    revealTitle: "Heads up!",
    revealBody: (name: string) =>
      `Two or more boxes in the drawer may be the same medicine (${name}) under different names.`,
    strengthChanged: (sheet: string, box: string) =>
      `The sheet shows ${sheet}, the box shows ${box} — the strength is different.`,
    onSheet: "Sheet",
    inDrawer: "Box",
    askLabel: "Something you want to ask?",
    askPlaceholder: "Type your question…",
    askSend: "Ask",
    pharmacistCta: "Make a pharmacist question card",
  },
  s4: {
    title: "Pharmacist question card",
    intro: "Bring this card to your pharmacist. These are questions, not advice.",
    share: "Share / Save image",
    shareFail: "Can't share right now — you can take a screenshot.",
    noItems: "Nothing needs special attention in this demo run.",
  },
  s5: {
    title: "About & privacy",
    modelVsRules: "What uses AI vs rules?",
    modelVsRulesBody:
      "Reading names off the sheet and boxes uses an AI vision model (fixed fake data in demo mode). Grouping and comparison run on fixed rules — the same input always gives the same result and never uses AI.",
    providers: "Providers",
    providersBody:
      "Vision: mock for demo. Live overlay sends photos to the local server for Anthropic OCR. Voice: MiniMax T2A via the server, device speech as fallback. Keys stay on the server.",
    crossBorder: "Cross-border data",
    crossBorderBody:
      "Demo mode sends nothing out. With live overlay on, photos go through the local server to Anthropic — please use fake / demo data only.",
  },
  s6: {
    title: "This one is for a professional",
    askPharmacist: "Ask a pharmacist",
  },
  buckets: {
    continue: "Keep taking",
    new: "New",
    notOnList: "Not on your list",
    unmatched: "Unmatched",
  },
  home: {
    title: "Vital Helper",
    subtitle: "Soft healthcare support · Demo",
    pickPrompt: "What do you need today?",
    sopcTitle: "Going to a specialist clinic today",
    sopcSub: "Walks you through the specialist clinic (SOPC), one step at a time.",
    doyeukTitle: "DoYeuk (discharge medicine check)",
    doyeukSub: "Compare your discharge sheet with the boxes in your drawer.",
    demoNote: "Everything here is demo / fake data — never use real personal data.",
  },
  sopc: {
    badge: "DEMO",
    s1Title: "Step 1: Photo the appointment slip",
    s1Hint: "Put your specialist clinic appointment slip in the frame, or use the demo slip below. Use demo / fake slips only.",
    timeNote: "Note: the time printed on the slip is the REGISTRATION time — not the time you see a doctor.",
    useSample: "Use the demo slip",
    captured: "Got it!",
    slipHint: "This is a demo appointment slip — look at the “Registration time”.",
    regTimeLabel: "Registration time",
    patientLabel: "Patient",
    caseLabel: "Case no.",
    dateLabel: "Date",
    specialtyLabel: "Specialty",
    venueLabel: "Venue",
    watermark: "DEMO",
    seeSteps: "See / hear the 3 steps",
    s2Title: "Your 3 steps",
    s2Intro: "Follow these three steps. Tap “Listen to all” to hear them.",
    listenAll: "🔊 Listen to all",
    stopListen: "Stop",
    stepLabel: (n: number) => `Step ${n}`,
    lateTitle: "Running late? It's okay",
    lateBody: "If you're 15–30 minutes late, just re-register at the registration counter — your slot is not cancelled.",
    toEnd: "Next",
    s3Title: "You're set",
    s3Body: "After these three steps, wait in the specialty hall for your name / number to be called.",
    humanTitle: "Can't find your way? Ask a person",
    replay: "Listen again",
    backHome: "Back to home",
  },
};

// zh-CN — natural mainland Simplified Chinese (Mandarin phrasing), NOT a character-by-
// character conversion of the Cantonese table. The disclaimer and consent are sourced from
// the compliance helpers so they stay single-sourced and verbatim.
const zhCN: Strings = {
  appName: "对药",
  tagline: "出院药物对照",
  demoBadge: "示范",
  common: {
    back: "返回",
    next: "下一步",
    close: "关闭",
    listen: "听",
    stop: "停",
    disclaimer: disclaimerFor("zh-CN"),
  },
  s0: {
    title: "欢迎使用对药",
    consent: consentFor("zh-CN"),
    simulatedToggle: "我明白，我只会用假的／示范资料",
    mustConsent: "请先勾选上面的方框，才可以开始。",
    start: "开始",
    language: "语言",
    voiceToggle: "讲给我听",
    largeType: "老友记大字",
    voiceOn: "已开",
    voiceOff: "未开",
    overlayToggle: "现场识别",
    overlayOn: "已开",
    overlayOff: "未开",
    overlayHint: "打开后会用现场相机读药名，并用语音朗读。读不到就用示范。示范不需要密钥。",
    liveFailed: "现场识别现在用不了。请按「用示范药单」。",
  },
  s1: {
    title: "第一步：拍药单",
    hint: "把医院的出院药单放在框里，拍一张照。只用示范／假的药单。",
    useSample: "用示范药单",
    permissionNeeded: "想用相机，要给对药相机权限。",
    grant: "给相机权限",
    shutter: "拍照",
    captured: "拍好了！",
    couldNotRead: "现在是示范模式，读不到真的照片。请按「用示范药单」。",
  },
  s2: {
    title: "第二步：拍药盒",
    hint: "逐一拍抽屉里的药盒（最多 8 盒）。拍完就按「拍完了」。",
    boxesSoFar: (n: number) => `已经拍了 ${n} 盒`,
    addBox: "拍下一盒",
    done: "拍完了",
    shutter: "拍照",
  },
  s3: {
    title: "对照结果",
    listenAll: "全部听",
    continue: "继续在吃的",
    new: "药单有、抽屉没见到（新）",
    notOnList: "不在你的药单上",
    unmatched: "对不上、要问药剂师",
    empty: "这一组没有东西。",
    revealTitle: "留意！",
    revealBody: (name: string) =>
      `抽屉里有两盒或以上，可能是同一种药（${name}），只是名字不同。`,
    strengthChanged: (sheet: string, box: string) =>
      `药单写 ${sheet}，药盒写 ${box}，份量不一样了。`,
    onSheet: "药单",
    inDrawer: "药盒",
    askLabel: "有什么想问？",
    askPlaceholder: "打你想问的东西……",
    askSend: "问",
    pharmacistCta: "做一张药剂师问题卡",
  },
  s4: {
    title: "药剂师问题卡",
    intro: "带这张卡去问药剂师。全部都是问题，不是建议。",
    share: "分享 / 存图",
    shareFail: "现在分享不了，可以截图。",
    noItems: "这次示范没有需要特别留意的项目。",
  },
  s5: {
    title: "关于 与 私隐",
    modelVsRules: "哪部分靠 AI，哪部分靠规则？",
    modelVsRulesBody:
      "读药单和药盒名那一步靠 AI 视觉模型（示范模式用固定假资料）。分组和对照那一步是固定规则算出来的，同一份输入永远得出同一个结果，不靠 AI。",
    providers: "供应商",
    providersBody:
      "视觉：示范用 mock。现场识别开启时经本机服务器做 Anthropic OCR。语音：MiniMax T2A 普通话经服务器，设备语音做后备。密钥只放在服务器。",
    crossBorder: "跨境资料",
    crossBorderBody:
      "示范模式不会传任何资料出去。开启现场识别时，照片会经本机服务器传去 Anthropic 处理，请只用假／示范资料。",
  },
  s6: {
    title: "这个问题想问专业人士",
    askPharmacist: "带去问药剂师",
  },
  buckets: {
    continue: "继续在吃的",
    new: "新",
    notOnList: "不在你的药单上",
    unmatched: "对不上",
  },
  home: {
    title: "Vital 帮手",
    subtitle: "软性健康支援 · 示范",
    pickPrompt: "今天想做什么？",
    sopcTitle: "今天去专科门诊",
    sopcSub: "带你走专科门诊，一步一步，讲给你听。",
    doyeukTitle: "对药（出院药物对照）",
    doyeukSub: "对照出院药单和抽屉里的药盒。",
    demoNote: "全部都是示范／假资料，不要用真人资料。",
  },
  sopc: {
    badge: "示范",
    s1Title: "第一步：拍预约纸",
    s1Hint: "把专科门诊预约纸放在框里拍一张照，或者用下面的示范预约纸。只用示范／假的纸。",
    timeNote: "留意：纸上印的时间是「登记时间」，不是见医生的时间。",
    useSample: "用示范预约纸",
    captured: "看到了！",
    slipHint: "这是示范预约纸，看一下「登记时间」。",
    regTimeLabel: "登记时间",
    patientLabel: "病人",
    caseLabel: "个案编号",
    dateLabel: "日期",
    specialtyLabel: "专科",
    venueLabel: "地点",
    watermark: "示范",
    seeSteps: "看／听三个步骤",
    s2Title: "专科门诊三步",
    s2Intro: "跟着这三步走就行。想听就按「全部听」。",
    listenAll: "🔊 全部听",
    stopListen: "停",
    stepLabel: (n: number) => `第 ${n} 步`,
    lateTitle: "迟到？不用慌",
    lateBody: "迟 15 至 30 分钟，去登记处重新登记就行，不会取消你的号。",
    toEnd: "下一步",
    s3Title: "搞定",
    s3Body: "走完这三步，在专科大堂等叫名／叫号就行。",
    humanTitle: "找不到路？问真人",
    replay: "再听一次",
    backHome: "返回主页",
  },
};

const TABLE: Record<Lang, Strings> = { "zh-HK": zhHK, "zh-CN": zhCN, en };

export function L(lang: Lang): Strings {
  return TABLE[lang];
}

/**
 * Short script label for the language cycle control (粵 / 简 / EN). Shows the CURRENT
 * language so the pill doubles as a clear "which script am I in" indicator; tapping it
 * advances through zh-HK → zh-CN → en, so 简体 is reachable in one or two taps.
 */
export function langPillLabel(lang: Lang): string {
  return lang === "zh-HK" ? "粵" : lang === "zh-CN" ? "简" : "EN";
}
