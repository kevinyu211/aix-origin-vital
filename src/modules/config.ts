// config module — resolves which providers to use and reads (never logs) API keys.
// Keys come from EXPO_PUBLIC_* env vars or app.json `extra`. No secrets are committed.

import Constants from "expo-constants";

export type VisionProviderName = "anthropic" | "minimax" | "mock";
export type TtsProviderName = "minimax" | "expo-speech";

const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

function env(name: string): string | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = (process.env as any)?.[name];
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

export const keys = {
  anthropic: () => env("EXPO_PUBLIC_ANTHROPIC_API_KEY"),
  minimax: () => env("EXPO_PUBLIC_MINIMAX_API_KEY"),
  minimaxGroup: () => env("EXPO_PUBLIC_MINIMAX_GROUP_ID"),
};

export function hasVisionKeys(name: VisionProviderName): boolean {
  if (name === "anthropic") return !!keys.anthropic();
  if (name === "minimax") return !!keys.minimax();
  return true; // mock always available
}
