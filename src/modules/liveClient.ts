// liveClient — Expo-side HTTP calls to the in-repo live server.
// No API keys. Missing URL or HTTP 503 → null so callers degrade to mock / expo-speech.

import type { Lang, MedItem, MedSource } from "./types";
import { getLiveApiUrl, isLiveApiConfigured } from "./config";
import { mapOcrRowsToMedItems } from "./ocrMap";

export const LIVE_UNAVAILABLE = "live service unavailable";

export interface LiveTtsAudio {
  audioBase64: string;
  mime: string;
}

function joinLiveUrl(path: string): string | null {
  const base = getLiveApiUrl();
  if (!base) return null;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * POST /ocr. Returns mapped MedItem[] on success, or null when the live path
 * cannot run (no URL, 503, network, bad payload) so the UI can offer 示範.
 */
export async function postLiveOcr(args: {
  imageBase64: string;
  source: MedSource;
  mediaType?: string;
}): Promise<MedItem[] | null> {
  if (!isLiveApiConfigured() || !args.imageBase64) return null;
  const url = joinLiveUrl("/ocr");
  if (!url) return null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        imageBase64: args.imageBase64,
        mediaType: args.mediaType ?? "image/jpeg",
        source: args.source,
      }),
    });
    if (res.status === 503 || !res.ok) return null;
    const data = await readJson(res);
    if (!data || typeof data !== "object") return null;
    const items = (data as { items?: unknown }).items;
    return mapOcrRowsToMedItems(items, args.source);
  } catch {
    return null;
  }
}

/**
 * POST /tts. Returns audio payload on success, or null so voice falls back to expo-speech.
 */
export async function postLiveTts(text: string, lang: Lang): Promise<LiveTtsAudio | null> {
  if (!isLiveApiConfigured() || !text.trim()) return null;
  const url = joinLiveUrl("/tts");
  if (!url) return null;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ text, locale: lang }),
    });
    if (res.status === 503 || !res.ok) return null;
    const data = await readJson(res);
    if (!data || typeof data !== "object") return null;
    const audioBase64 = (data as { audioBase64?: unknown }).audioBase64;
    const mime = (data as { mime?: unknown }).mime;
    if (typeof audioBase64 !== "string" || audioBase64.length === 0) return null;
    return { audioBase64, mime: typeof mime === "string" && mime ? mime : "audio/mpeg" };
  } catch {
    return null;
  }
}
