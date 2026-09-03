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

Demo path (cannot fail): **S0** tick consent → **S1** 「用示範藥單」 → **S2** 「影下一盒」 a few
times → **S3** see the five expected buckets/flags → **S4** pharmacist card.

## Test it

```bash
npm test        # jest — reconcile C1–C6, full 陳伯 scenario, compliance, dictionary
npm run typecheck
```

## Stack

- Expo (React Native) + TypeScript — no web/Next.js, no backend, no accounts.
- `expo-camera`, `expo-speech`, `expo-sharing`, `react-native-view-shot`.
- Pluggable `VisionProvider` (`anthropic` | `minimax` | `mock`, default `mock`).
- Hand-curated local `dictionary/drugs.json` (35 common HK discharge drugs).
- Pure, deterministic `reconcile` module (same input ⇒ identical output).

## Providers / keys

Demo mode needs no keys. To enable real providers later, set `EXPO_PUBLIC_*` env vars (see
[`.env.example`](.env.example)). **Never commit secrets.**

## Docs

- [`docs/PRD-v2.md`](docs/PRD-v2.md) — full product spec.
- [`docs/vital-rules.md`](docs/vital-rules.md) — HK Vital / Soft Healthcare track rules.
