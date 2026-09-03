// MiniMax T2A HTTP — current documented shape (POST /v1/t2a_v2).
// Docs: https://platform.minimax.io/docs/api-reference/speech-t2a-http
// Never logs the API key, group id, or audio bytes.

import type { Lang } from "../../src/modules/types";

const T2A_URL = "https://api.minimax.io/v1/t2a_v2";
const T2A_MODEL = "speech-2.8-hd";

export function hasMiniMaxKey(): boolean {
  return Boolean(process.env.MINIMAX_API_KEY);
}

function languageBoost(lang: Lang): "Chinese,Yue" | "Chinese" | "English" {
  if (lang === "zh-HK") return "Chinese,Yue";
  if (lang === "zh-CN") return "Chinese";
  return "English";
}

function voiceId(lang: Lang): string {
  if (lang === "zh-HK") return "Chinese (Mandarin)_HK_Flight_Attendant";
  if (lang === "zh-CN") return "Chinese (Mandarin)_Lyrical_Voice";
  return "English_expressive_narrator";
}

function hexToBase64(hex: string): string {
  return Buffer.from(hex, "hex").toString("base64");
}

function parseLang(locale: string): Lang {
  if (locale === "zh-CN" || locale === "zh-HK" || locale === "en") return locale;
  if (locale.toLowerCase().startsWith("zh")) return locale.toLowerCase().includes("cn") ? "zh-CN" : "zh-HK";
  return "zh-HK";
}

export async function runMiniMaxTts(args: {
  text: string;
  locale: string;
}): Promise<{ audioBase64: string; mime: string }> {
  const key = process.env.MINIMAX_API_KEY;
  if (!key) {
    const err = new Error("unavailable");
    (err as Error & { code?: string }).code = "NO_KEY";
    throw err;
  }
  const lang = parseLang(args.locale);
  const groupId = process.env.MINIMAX_GROUP_ID;
  const url = groupId ? `${T2A_URL}?GroupId=${encodeURIComponent(groupId)}` : T2A_URL;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: T2A_MODEL,
      text: args.text,
      stream: false,
      language_boost: languageBoost(lang),
      output_format: "hex",
      voice_setting: {
        voice_id: voiceId(lang),
        speed: 1,
        vol: 1,
        pitch: 0,
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: "mp3",
        channel: 1,
      },
    }),
  });

  if (!res.ok) {
    const err = new Error("unavailable");
    (err as Error & { code?: string }).code = "UPSTREAM";
    throw err;
  }

  const payload = (await res.json()) as {
    data?: { audio?: string };
    base_resp?: { status_code?: number };
  };
  if (payload.base_resp && payload.base_resp.status_code !== 0) {
    const err = new Error("unavailable");
    (err as Error & { code?: string }).code = "UPSTREAM";
    throw err;
  }
  const hex = payload.data?.audio;
  if (!hex) {
    const err = new Error("unavailable");
    (err as Error & { code?: string }).code = "UPSTREAM";
    throw err;
  }
  return { audioBase64: hexToBase64(hex), mime: "audio/mpeg" };
}
