// voice module — pluggable TtsProvider. Default: expo-speech (device TTS).
// Overlay on: MiniMax T2A via the in-repo live server (粤 / zh-CN / en).
// MiniMax failure or missing URL → expo-speech. 示範 never needs a key.

import * as Speech from "expo-speech";
import type { Lang } from "./types";
import { isLiveApiConfigured } from "./config";
import { postLiveTts } from "./liveClient";

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

type PlayableSound = {
  stopAsync: () => Promise<unknown>;
  unloadAsync: () => Promise<unknown>;
};

let currentSound: PlayableSound | null = null;

async function stopLiveAudio(): Promise<void> {
  const sound = currentSound;
  currentSound = null;
  if (!sound) return;
  try {
    await sound.stopAsync();
  } catch {
    // already stopped
  }
  try {
    await sound.unloadAsync();
  } catch {
    // already unloaded
  }
}

async function playMpegBase64(audioBase64: string): Promise<void> {
  const { Audio } = await import("expo-av");
  const FileSystem = await import("expo-file-system/legacy");
  const dir = FileSystem.cacheDirectory;
  if (!dir) throw new Error("no audio cache");
  const path = `${dir}doyeuk-live-tts.mp3`;
  await FileSystem.writeAsStringAsync(path, audioBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
  });
  await stopLiveAudio();
  const { sound } = await Audio.Sound.createAsync({ uri: path }, { shouldPlay: true });
  currentSound = sound;
}

// MiniMax T2A adapter — POST to the live server; fall back to expo-speech.
export function createMiniMaxTtsProvider(): TtsProvider {
  return {
    name: "minimax",
    ready: isLiveApiConfigured(),
    async speak(text: string, lang: Lang): Promise<void> {
      try {
        const audio = await postLiveTts(text, lang);
        if (!audio) {
          await expoSpeechProvider.speak(text, lang);
          return;
        }
        Speech.stop();
        await playMpegBase64(audio.audioBase64);
      } catch {
        await expoSpeechProvider.speak(text, lang);
      }
    },
    stop(): void {
      void stopLiveAudio();
      expoSpeechProvider.stop();
    },
  };
}

export function getTtsProvider(overlayOn = false): TtsProvider {
  if (!overlayOn) return expoSpeechProvider;
  const live = createMiniMaxTtsProvider();
  return live.ready ? live : expoSpeechProvider;
}

export function resetTtsProviderCache(): void {
  // Providers are created per call; kept so existing tests / callers stay valid.
}
