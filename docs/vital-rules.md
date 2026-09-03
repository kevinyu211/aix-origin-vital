# HK Vital track rules — Soft Healthcare

_AIx Origin Summit 2026 · Hong Kong · Vital (Soft Healthcare) category._

This document restates the track constraints 對藥 (DoYeuk) is built to satisfy.

## What "Soft Healthcare" means here

Tools that **support** a person's understanding of health information **without** acting as a
medical professional. A Soft Healthcare entry provides **information, comparison and hand-off**;
it must **not** diagnose, treat, prescribe or cure, and must never instruct anyone to start,
stop, add or reduce any medicine.

## Judging requirements 對藥 targets

1. **Runnable path.** There is an end-to-end path a judge can run live:
   `npx expo start` → S0 consent → S1 「用示範藥單」 → S2 「影下一盒」×N → S3 result with the five
   expected buckets/flags → S4 pharmacist card. The demo uses bundled 示範 data so it cannot fail.
2. **AI is load-bearing.** The AI vision model is what reads medicine names/strengths off the
   sheet and boxes (the `VisionProvider`). In demo mode this is the deterministic `mock` provider
   backed by fixtures; with keys it becomes `anthropic` / `minimax`. The **reconciliation** step
   is intentionally **pure rules** (no model) so results are explainable and repeatable — this
   separation is a feature, documented on the About screen (S5).
3. **Synthetic data only.** No real patient data. The consent toggle on S0 is **required** before
   starting, and every screen is labelled **示範**. Persona: 陳伯, 72, 深水埗 (fabricated).
4. **Safety / compliance.** Verbatim disclaimer on S0, S3, S4 and S5. A keyword classifier detects
   advice-seeking questions and returns a **fixed refusal** (S6) that points to a pharmacist — it
   never generates advice. Forbidden words (診斷/治療/處方/治癒/diagnose/treat/prescribe/cure) are
   kept out of all product copy except the mandated disclaimer.

## Submission

- **Deadline:** Sunday 6 September, **12:00 HKT**.
- **Repo:** `kevinyu211/aix-origin-vital` (this repo only).
- **Deliverable:** Expo (React Native) + TypeScript app, runnable via `npx expo start`, with the
  sample-mode demo path and passing `reconcile` tests (`npm test`).

## Non-goals (explicitly out of scope)

- No web / Next.js build.
- No backend, accounts, or third-party auth/data platforms (Clerk / Convex / Supabase).
- No persistence beyond the session, other than the bundled sample fixtures.
- No secrets committed to the repository.
