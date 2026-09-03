// voice module — pluggable TtsProvider. Default: expo-speech (device TTS).
// MiniMax T2A (Cantonese) adapter is wired but disabled unless a key is present
// (added in a later PR); it falls back to expo-speech.

import * as Speech from "expo-speech";
import type { Lang } from "./types";
import { getTtsProviderName, keys } from "./config";

export interface TtsProvider {
  name: string;
  ready: boolean;
  speak(text: string, lang: Lang): Promise<void>;
  stop(): void;
}

function ttsLangCode(lang: Lang): string {
  if (lang === "en") return "en-US";
  // zh-CN reads in Mandarin; zh-HK stays Cantonese.
  if (lang === "zh-CN") return "zh-CN";
  return "zh-HK";
}

export const expoSpeechProvider: TtsProvider = {
  name: "expo-speech",
  ready: true,
  async speak(text: string, lang: Lang): Promise<void> {
    Speech.stop();
    Speech.speak(text, { language: ttsLangCode(lang), rate: 0.92, pitch: 1.0 });
  },
  stop(): void {
    Speech.stop();
  },
};

// MiniMax T2A adapter — structure only for this PR; falls back to expo-speech.
export function createMiniMaxTtsProvider(): TtsProvider {
  const ready = !!keys.minimax();
  return {
    name: "minimax",
    ready,
    async speak(text: string, lang: Lang): Promise<void> {
      // Later PR: POST to MiniMax T2A, receive audio, play via expo-av.
      // Until then, degrade gracefully to device speech.
      await expoSpeechProvider.speak(text, lang);
    },
    stop(): void {
      expoSpeechProvider.stop();
    },
  };
}

let cached: TtsProvider | null = null;

export function getTtsProvider(): TtsProvider {
  if (cached) return cached;
  const name = getTtsProviderName();
  const provider = name === "minimax" ? createMiniMaxTtsProvider() : expoSpeechProvider;
  cached = provider.ready ? provider : expoSpeechProvider;
  return cached;
}

export function resetTtsProviderCache(): void {
  cached = null;
}
