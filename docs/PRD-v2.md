# 對藥 (DoYeuk) — Discharge Medicine Check · PRD v2

_AIx Origin Summit 2026 · HK Vital track (Soft Healthcare)_

## One-paragraph product

A user photographs a hospital discharge medication list and the boxes in their drawer.
The app matches medicines by **active ingredient** and shows three groups — **keep taking**,
**new**, and **not on your list** — with a **loud reveal** when two boxes turn out to be the
same medicine under different names. Every screen can be **read aloud in Cantonese**. The flow
ends with a **pharmacist question card**. The app **never tells anyone to start or stop
anything**.

## Locked stack

- **Expo (React Native) + TypeScript.** No Next.js / web build.
- `expo-camera` for capture.
- Pluggable **`VisionProvider`** (`anthropic` | `minimax` | `mock`). Default `mock`.
- Hand-curated local dictionary at **`/dictionary/drugs.json`** (no network lookups).
- **MiniMax T2A** for Cantonese voice with **`expo-speech` fallback** (this PR ships expo-speech;
  MiniMax adapter wired but disabled until keys exist).
- **No backend. No accounts. No Clerk/Convex/Supabase.** No persistence beyond the session
  (except the bundled samples).

## Language & tone rules

Forbidden in product copy, comments, and pitch: **診斷 / 治療 / 處方 / 治癒 / diagnose / treat /
prescribe / cure**. Use **對照 / 資料 / 藥劑師 / 問問** instead. (The one exception is the mandated
disclaimer, which quotes 診斷/治療 to state what the tool does **not** do.)
Drug info sentences are label-style only — never **應該 / 必須 / 停 / 加 / 減** as instructions.

## Screens (one job each)

| ID | Name | Job |
| -- | ---- | --- |
| **S0** | Welcome / consent | Verbatim disclaimer; **simulated-data toggle required** before 開始; language zh-HK/en; 老友記 large type; 講俾我聽 voice toggle |
| **S1** | Scan sheet | Camera + **「用示範藥單」** fallback |
| **S2** | Scan boxes 1–8 | **「影下一盒」 / 「影完喇」** |
| **S3** | Result | Three groups + **duplicate merge reveal** + **strength-changed**; **「聽晒」**; free-text **「有嘢想問？」** for the refusal demo |
| **S4** | Pharmacist card | Templated questions; **PNG share** via `react-native-view-shot` + `expo-sharing` |
| **S5** | About & privacy | Model vs rules; providers; cross-border |
| **S6** | Refusal modal | Keyword classifier; **no generated advice** |

## Modules (unit-testable without UI)

`capture`, `extract` (VisionProvider), `dictionary`, `reconcile` (PURE deterministic rules),
`voice` (TtsProvider), `handoff`, `compliance`, `i18n`, `samples`, `ui`.

## Reconcile rules (locked, pure, deterministic)

1. Match: **exact brand/alias → normalised → Levenshtein ≤ 2 → none**.
2. Group by **activeIngredient**.
3. `sheet + box = continue`, `sheet only = new`, `boxes only = notOnList`.
4. **≥ 2 boxes** of the same ingredient = **duplicateInDrawer**.
5. Strength mismatch between sheet and box = **strengthChanged**.
6. **Unmatched** items are **never bucketed** and **always** go on the pharmacist card.
7. **No model inside `reconcile`.** Same input ⇒ identical output.

## Disclaimer (verbatim — S0, S3 footer, S4 footer, S5)

> 本工具僅供健康信息參考與支持，不構成醫療建議，不能取代專業醫護人員的診斷或治療。如有健康疑慮，請諮詢註冊醫生或相關專業人士。AI 生成內容可能不準確。

## Consent (verbatim — S0, toggle required)

> 呢個係示範版。請只用假嘅／示範嘅藥單同藥盒。唔好影真人嘅資料。

## Sample mode (ships first so the demo cannot fail)

Synthetic persona **陳伯, 72, 深水埗**. All data fabricated.

- **Sheet (4 only, no aspirin):** 必理痛 500mg, NORVASC 10mg, 阿托伐他汀 20mg, 二甲雙胍 500mg.
- **Boxes:** 必理痛 500mg, Amlodipine 5mg, ASPIRIN TAB 80MG, Metformin 500mg, unknown box (神秘補品丸),
  **plus a second 必理痛** so the duplicate reveal always fires.
- **Expected result:**
  - **duplicate** paracetamol (必理痛 + Panadol → both paracetamol) — `continue` + `duplicateInDrawer`
  - **strengthChanged** amlodipine (sheet 10mg vs box 5mg) — `continue` + `strengthChanged`
  - **notOnList** aspirin
  - **new** atorvastatin
  - **continue** metformin
  - **unmatched** 神秘補品丸

Sample mode runs the **real pipeline** with mock/fixtures first, then real vision when keys exist.
Everything is labelled **示範**.

## Dictionary

Cindy's curated **60 INN** vocab is committed **exactly** as `dictionary/drugs.json` and
`drugs.json` at repo root. Matcher uses **inn / inn_zh / also / brands[].en / brands[].zh /
brands[].hk** only — no invented dosages, indications, or start/stop language.
Required demo set is first: paracetamol 撲熱息痛 PANADOL/必理痛 HK-02280; amlodipine 氨氯地平
NORVASC HK-33731; aspirin 阿司匹林; atorvastatin 阿托伐他汀 LIPITOR/立普妥; metformin 二甲雙胍
GLUCOPHAGE/糖尿適.

## Design tokens

paper `#F7F8F6`, ink `#14213D`, continue `#2F6B4F`, new `#1F5FA8`, notOnList `#B8741A`,
reveal `#C43D2F` (duplicate only). Noto Sans HK (system fallback). Min tap **56pt**. 粵 written
Cantonese in all zh-HK strings.

## Thursday MVP (this PR)

- Expo app boots (`npx expo start`, `npx expo export` bundles clean).
- S0–S3 with the **mock** provider + sample images/fixtures (S4–S6 also included).
- `dictionary/drugs.json` + repo-root `drugs.json` — Cindy's **60 INN** vocab, matcher on inn / inn_zh / also / brands.
- `reconcile` + tests for **C1–C6** style cases (plus full 陳伯 scenario & determinism).
- Verbatim disclaimer; 老友記 font scale.
- Voice via `expo-speech` (MiniMax T2A adapter wired, enabled in a later PR).

## Later PRs

- MiniMax T2A Cantonese audio (via `expo-av`).
- Anthropic / MiniMax vision extraction from real photos.
- Bundled photographic sample images; Noto Sans HK font file.
