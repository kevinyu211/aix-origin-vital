// config module — provider names + the non-secret live-server base URL.
// API keys NEVER live in the Expo app (no EXPO_PUBLIC_* secrets, no extra keys).

import Constants from "expo-constants";

export type VisionProviderName = "anthropic" | "minimax" | "mock";
export type TtsProviderName = "minimax" | "expo-speech";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

function env(name: string): string | undefined {
  const v = process.env[name];
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

export function getVisionProviderName(): VisionProviderName {
  const fromEnv = env("EXPO_PUBLIC_VISION_PROVIDER");
  const fromExtra = typeof extra.visionProvider === "string" ? extra.visionProvider : undefined;
  const name = (fromEnv ?? fromExtra ?? "mock").toLowerCase();
  if (name === "anthropic" || name === "minimax") return name;
  return "mock";
}

export function getTtsProviderName(): TtsProviderName {
  const fromEnv = env("EXPO_PUBLIC_TTS_PROVIDER");
  const fromExtra = typeof extra.ttsProvider === "string" ? extra.ttsProvider : undefined;
  const name = (fromEnv ?? fromExtra ?? "expo-speech").toLowerCase();
  if (name === "minimax") return "minimax";
  return "expo-speech";
}

/** Non-secret base URL of the in-repo live server. Empty = overlay cannot call out. */
export function getLiveApiUrl(): string {
  const fromEnv = env("EXPO_PUBLIC_LIVE_API_URL");
  const fromExtra = typeof extra.liveApiUrl === "string" ? extra.liveApiUrl : undefined;
  return (fromEnv ?? fromExtra ?? "").trim().replace(/\/$/, "");
}

export function isLiveApiConfigured(): boolean {
  return getLiveApiUrl().length > 0;
}

/** Effective vision while the in-app overlay toggle is off (default) or on. */
export function effectiveVisionProvider(overlayOn: boolean): VisionProviderName {
  return overlayOn && isLiveApiConfigured() ? "anthropic" : "mock";
}

/** Effective TTS while the in-app overlay toggle is off (default) or on. */
export function effectiveTtsProvider(overlayOn: boolean): TtsProviderName {
  return overlayOn && isLiveApiConfigured() ? "minimax" : "expo-speech";
}
