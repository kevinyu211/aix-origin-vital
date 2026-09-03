# 對藥 (DoYeuk) — Discharge Medicine Check

AIx Origin Summit 2026 · HK Vital (Soft Healthcare) demo.

Photograph a hospital discharge medication list and the boxes in your drawer. 對藥 matches
medicines by **active ingredient** and shows three groups — **keep taking / new / not on your
list** — with a loud reveal when two boxes are the same medicine under different names. Every
screen reads aloud in Cantonese and the flow ends with a pharmacist question card.

> **對藥 never tells anyone to start or stop anything.** It compares information and helps you
> ask a pharmacist.

## Run it

```bash
npm install
npx expo start        # open in Expo Go (iOS/Android)
```

The app now opens on a **home path picker** with two demo paths:

1. **今日去專科門診 — SOPC visit-day voice companion** (new). A HK HA 專科門診 walk for the
   visit day only: read a synthetic 預約紙 → hear exactly three Cantonese steps → end on a
   human 繳費處／登記處 counter. It teaches that the printed time is the **登記時間, not 見醫生**,
   and that being 15–30 min late means you **re-register** (your 籌 is not cancelled). No HA Go,
   no indoor GPS, no A&E, no pharmacy, no diagnosis.
2. **對藥 — discharge medicine check** (unchanged). Sheet-vs-drawer reconciliation below.

Demo path (cannot fail): **S0** tick consent → **S1** 「用示範藥單」 → **S2** 「影下一盒」 a few
times → **S3** see the five expected buckets/flags → **S4** pharmacist card.

SOPC demo path: **home** 「今日去專科門診」 → **SOPC S1** 「用示範預約紙」 (PWH-style 內科 slip,
watermark 示範, 登記時間 printed clearly) → **SOPC S2** hear the three steps (「聽晒」) → **SOPC S3**
end on a human counter.

## Test it

```bash
npm test        # jest — reconcile C1–C6, full 陳伯 scenario, compliance, dictionary, SOPC steps
npm run typecheck
```

## Stack

- Expo (React Native) + TypeScript — no web/Next.js, no backend, no accounts.
- `expo-camera`, `expo-speech`, `expo-sharing`, `react-native-view-shot`.
- Pluggable `VisionProvider` (`anthropic` | `minimax` | `mock`, default `mock`).
- `drugs.json` at repo root = Cindy's 60 INN source. `dictionary/drugs.json` = mapped DrugEntry[] (aliases include HA labels like PARACETAMOL TAB 500MG). Matcher: inn / inn_zh / also / brands.
- Pure, deterministic `reconcile` module (same input ⇒ identical output).

## Providers / keys

Demo mode needs no keys. To enable real providers later, set `EXPO_PUBLIC_*` env vars (see
[`.env.example`](.env.example)). **Never commit secrets.**

## Docs

- [`docs/PRD-v2.md`](docs/PRD-v2.md) — full product spec.
- [`docs/vital-rules.md`](docs/vital-rules.md) — HK Vital / Soft Healthcare track rules.
