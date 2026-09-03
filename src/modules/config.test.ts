import { describe, test, expect } from "@jest/globals";
import { readFileSync } from "fs";
import { join } from "path";
import {
  effectiveTtsProvider,
  effectiveVisionProvider,
  getLiveApiUrl,
  getTtsProviderName,
  getVisionProviderName,
  isLiveApiConfigured,
} from "./config";

describe("config — mock stays the default", () => {
  test("vision provider env/extra default is mock", () => {
    expect(getVisionProviderName()).toBe("mock");
  });

  test("tts provider env/extra default is expo-speech", () => {
    expect(getTtsProviderName()).toBe("expo-speech");
  });

  test("live API URL is empty unless explicitly set", () => {
    expect(getLiveApiUrl()).toBe("");
    expect(isLiveApiConfigured()).toBe(false);
  });

  test("overlay off always resolves to mock / expo-speech", () => {
    expect(effectiveVisionProvider(false)).toBe("mock");
    expect(effectiveTtsProvider(false)).toBe("expo-speech");
  });

  test("overlay on without a live URL still degrades to mock / expo-speech", () => {
    expect(effectiveVisionProvider(true)).toBe("mock");
    expect(effectiveTtsProvider(true)).toBe("expo-speech");
  });
});

describe("config — no API keys in the Expo app", () => {
  const root = process.cwd();

  test("config.ts does not read Anthropic or MiniMax keys", () => {
    const src = readFileSync(join(root, "src/modules/config.ts"), "utf8");
    expect(src).not.toMatch(/ANTHROPIC_API_KEY/);
    expect(src).not.toMatch(/MINIMAX_API_KEY/);
    expect(src).not.toMatch(/MINIMAX_GROUP_ID/);
    expect(src).not.toMatch(/EXPO_PUBLIC_ANTHROPIC/);
    expect(src).not.toMatch(/EXPO_PUBLIC_MINIMAX/);
  });

  test("app.json extra has no secret fields", () => {
    const extra = JSON.parse(readFileSync(join(root, "app.json"), "utf8")).expo.extra as Record<
      string,
      unknown
    >;
    expect(extra.visionProvider).toBe("mock");
    expect(extra.ttsProvider).toBe("expo-speech");
    expect(extra.liveApiUrl).toBe("");
    const blob = JSON.stringify(extra);
    expect(blob).not.toMatch(/API_KEY|SECRET|TOKEN|sk-|mm_/i);
  });

  test(".env.example has empty placeholders only and no EXPO_PUBLIC secrets", () => {
    const example = readFileSync(join(root, ".env.example"), "utf8");
    expect(example).toMatch(/EXPO_PUBLIC_VISION_PROVIDER=mock/);
    expect(example).toMatch(/EXPO_PUBLIC_TTS_PROVIDER=expo-speech/);
    expect(example).toMatch(/EXPO_PUBLIC_LIVE_API_URL=\s*$/m);
    expect(example).not.toMatch(/EXPO_PUBLIC_ANTHROPIC/);
    expect(example).not.toMatch(/EXPO_PUBLIC_MINIMAX/);
    expect(example).not.toMatch(/=sk-/);
    expect(example).not.toMatch(/sk-ant-/);
  });
});
