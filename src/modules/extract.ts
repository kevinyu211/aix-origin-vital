// extract module — pluggable VisionProvider (anthropic | minimax | mock).
//
// The VisionProvider turns a CaptureResult into structured MedItem[]. reconcile()
// never sees the model; it only sees these plain items. In this PR the default is the
// deterministic `mock` provider backed by bundled fixtures. anthropic / minimax adapters
// are wired and typed but require API keys (added in a later PR) and fall back to mock.

import type { CaptureResult, MedItem } from "./types";
import { SAMPLE_FIXTURES } from "./samples";
import {
  getVisionProviderName,
  hasVisionKeys,
  keys,
  type VisionProviderName,
} from "./config";

export interface VisionProvider {
  name: VisionProviderName;
  /** True when this provider can actually run (has keys etc.). */
  ready: boolean;
  extract(capture: CaptureResult): Promise<MedItem[]>;
}

// ---- mock provider ---------------------------------------------------------

export const mockVisionProvider: VisionProvider = {
  name: "mock",
  ready: true,
  async extract(capture: CaptureResult): Promise<MedItem[]> {
    if (capture.fixtureKey && SAMPLE_FIXTURES[capture.fixtureKey]) {
      return SAMPLE_FIXTURES[capture.fixtureKey];
    }
    // Real photo but no fixture: the mock provider cannot read pixels, so return
    // nothing. The UI guides the user to 「用示範藥單」.
    return [];
  },
};

// ---- anthropic provider (Claude vision) ------------------------------------
// Structure only; performs the request when a key is present. Left unused by default.

export function createAnthropicVisionProvider(): VisionProvider {
  return {
    name: "anthropic",
    ready: hasVisionKeys("anthropic"),
    async extract(capture: CaptureResult): Promise<MedItem[]> {
      const apiKey = keys.anthropic();
      if (!apiKey || !capture.uri) return [];
      // Wiring for a later PR: read image bytes, POST to Anthropic Messages API with
      // a strict "list medicine names + strengths only" instruction, then parse JSON
      // into MedItem[]. Kept minimal here so no un-keyed network call ever happens.
      throw new Error("anthropic vision provider not fully enabled in this build");
    },
  };
}

// ---- minimax provider ------------------------------------------------------

export function createMiniMaxVisionProvider(): VisionProvider {
  return {
    name: "minimax",
    ready: hasVisionKeys("minimax"),
    async extract(capture: CaptureResult): Promise<MedItem[]> {
      const apiKey = keys.minimax();
      if (!apiKey || !capture.uri) return [];
      throw new Error("minimax vision provider not fully enabled in this build");
    },
  };
}

// ---- factory ---------------------------------------------------------------

let cached: VisionProvider | null = null;

export function getVisionProvider(): VisionProvider {
  if (cached) return cached;
  const name = getVisionProviderName();
  let provider: VisionProvider;
  if (name === "anthropic") provider = createAnthropicVisionProvider();
  else if (name === "minimax") provider = createMiniMaxVisionProvider();
  else provider = mockVisionProvider;
  // Fall back to mock if the configured provider has no keys.
  cached = provider.ready ? provider : mockVisionProvider;
  return cached;
}

export function resetVisionProviderCache(): void {
  cached = null;
}
