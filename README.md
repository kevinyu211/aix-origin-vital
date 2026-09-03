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

Pinned to **Expo SDK 54** so the public App Store Expo Go client (currently SDK 54 / Expo Go 2.25.x) can open the project. SDK 57 is too new for that store client.

Expo Go QR (tunnel) remains **`exp://ahqji2e-anonymous-8081.exp.direct`**. Open it in the App Store Expo Go client. **Never sideload** a custom build.

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

- Expo (React Native) + TypeScript — no Clerk / Convex / Supabase. Product paths stay on-device.
- `expo-camera`, `expo-speech`, `expo-sharing`, `react-native-view-shot`, `expo-av` (overlay TTS playback).
- Pluggable `VisionProvider` (`anthropic` | `minimax` | `mock`, default `mock`). 示範 always uses mock.
- Optional in-repo live server (`/server`) for overlay OCR + MiniMax T2A. Keys stay on the server.
- `drugs.json` at repo root = Cindy's 60 INN source. `dictionary/drugs.json` = mapped DrugEntry[] (aliases include HA labels like PARACETAMOL TAB 500MG). Matcher: inn / inn_zh / also / brands.
- Pure, deterministic `reconcile` module (same input ⇒ identical output).

## Providers / keys

**示範 / sample / demo needs no keys.** Default stays `EXPO_PUBLIC_VISION_PROVIDER=mock` and
device `expo-speech`. The in-app **現場辨識 / Live overlay** toggle is opt-in: same screens, but
camera photos go to the local server (Anthropic vision) and speech goes to MiniMax T2A via that
server, with expo-speech fallback. If live OCR/TTS dies, the app degrades and tells you to use 示範.

API keys are **server-only**. Never `EXPO_PUBLIC_*` secrets, never commit `.env`, never paste keys
into the app, PRs, or logs. See [`.env.example`](.env.example) (empty placeholders only).

## Live overlay server (local)

Tiny Node/TypeScript HTTP server. The Expo app never sees `ANTHROPIC_API_KEY` / `MINIMAX_API_KEY`.

```bash
# Terminal 1 — keys stay here (copy placeholders, fill locally, never commit)
#   ANTHROPIC_API_KEY=
#   MINIMAX_API_KEY=
#   MINIMAX_GROUP_ID=          # optional
npm run server                # default http://0.0.0.0:8787

# Terminal 2 — Expo Go (SDK 54). Leave vision=mock. Overlay toggle is in the app.
# For a physical phone, point this at a URL the phone can reach (LAN or tunnel):
#   EXPO_PUBLIC_LIVE_API_URL=http://192.168.x.x:8787
npx expo start --tunnel
```

- `GET /health` → `{ ok: true }`
- `POST /ocr` `{ imageBase64, source }` → `{ items: MedItem[] }` (or HTTP 503 if the key is missing)
- `POST /tts` `{ text, locale }` → `{ audioBase64, mime }` (or HTTP 503; app then uses expo-speech)

Missing keys return a generic `live service unavailable` so 示範 still works.

## Docs

- [`docs/PRD-v2.md`](docs/PRD-v2.md) — full product spec.
- [`docs/vital-rules.md`](docs/vital-rules.md) — HK Vital / Soft Healthcare track rules.
