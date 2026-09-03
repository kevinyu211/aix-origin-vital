// extract module — pluggable VisionProvider (anthropic | minimax | mock).
//
// Default (overlay off): deterministic `mock` provider + bundled 示範 fixtures.
// Overlay on: Anthropic vision via the in-repo live server (no client keys).
// Fixture / simulated captures ALWAYS stay on mock so 示範 works with no keys.
// Live OCR failure → [] and the screen steers the user back to 示範.

import type { CaptureResult, MedItem } from "./types";
import { SAMPLE_FIXTURES } from "./samples";
import { isLiveApiConfigured, type VisionProviderName } from "./config";
import { postLiveOcr } from "./liveClient";

export interface VisionProvider {
  name: VisionProviderName;
  /** True when this provider can actually run (has a live URL etc.). */
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

function isDemoCapture(capture: CaptureResult): boolean {
  return Boolean(capture.simulated || capture.fixtureKey);
}

// ---- anthropic provider (Claude vision via the live server) ----------------

export function createAnthropicVisionProvider(): VisionProvider {
  return {
    name: "anthropic",
    ready: isLiveApiConfigured(),
    async extract(capture: CaptureResult): Promise<MedItem[]> {
      if (isDemoCapture(capture)) {
        return mockVisionProvider.extract(capture);
      }
      if (!isLiveApiConfigured() || !capture.imageBase64) return [];
      const items = await postLiveOcr({
        imageBase64: capture.imageBase64,
        source: capture.source,
        mediaType: "image/jpeg",
      });
      return items ?? [];
    },
  };
}

// ---- minimax provider (vision not offered on the live server) --------------

export function createMiniMaxVisionProvider(): VisionProvider {
  return {
    name: "minimax",
    ready: false,
    async extract(capture: CaptureResult): Promise<MedItem[]> {
      if (isDemoCapture(capture)) return mockVisionProvider.extract(capture);
      return [];
    },
  };
}

// ---- factory ---------------------------------------------------------------

export function getVisionProvider(overlayOn = false): VisionProvider {
  if (!overlayOn) return mockVisionProvider;
  const live = createAnthropicVisionProvider();
  return live.ready ? live : mockVisionProvider;
}

export function resetVisionProviderCache(): void {
  // Providers are created per call; kept so existing tests / callers stay valid.
}
