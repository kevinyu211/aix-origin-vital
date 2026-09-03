import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { postLiveOcr, postLiveTts } from "./liveClient";
import { getVisionProvider } from "./extract";
import { getTtsProvider } from "./voice";
import { sampleSheetCapture } from "./capture";
import { SAMPLE_SHEET } from "./samples";

const originalFetch = globalThis.fetch;
const originalLiveUrl = process.env.EXPO_PUBLIC_LIVE_API_URL;

function setLiveUrl(url: string | undefined): void {
  if (url === undefined) delete process.env.EXPO_PUBLIC_LIVE_API_URL;
  else process.env.EXPO_PUBLIC_LIVE_API_URL = url;
}

describe("live client — degrades without a URL or on 503", () => {
  beforeEach(() => {
    setLiveUrl(undefined);
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalLiveUrl === undefined) delete process.env.EXPO_PUBLIC_LIVE_API_URL;
    else process.env.EXPO_PUBLIC_LIVE_API_URL = originalLiveUrl;
  });

  test("missing LIVE API URL returns null and does not fetch", async () => {
    let called = 0;
    globalThis.fetch = (async () => {
      called += 1;
      throw new Error("should not fetch");
    }) as typeof fetch;

    expect(await postLiveOcr({ imageBase64: "abc", source: "sheet" })).toBeNull();
    expect(await postLiveTts("你好", "zh-HK")).toBeNull();
    expect(called).toBe(0);
  });

  test("HTTP 503 from /ocr degrades to null", async () => {
    setLiveUrl("http://127.0.0.1:8787");
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: "live service unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;

    expect(await postLiveOcr({ imageBase64: "abc", source: "sheet" })).toBeNull();
  });

  test("HTTP 503 from /tts degrades to null (expo-speech fallback)", async () => {
    setLiveUrl("http://127.0.0.1:8787");
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: "live service unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;

    expect(await postLiveTts("聽晒", "zh-HK")).toBeNull();
  });

  test("successful /ocr maps items through the shared mapper", async () => {
    setLiveUrl("http://127.0.0.1:8787");
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({ items: [{ raw: "必理痛 500mg", name: "必理痛", strength: "500 mg" }] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )) as typeof fetch;

    const items = await postLiveOcr({ imageBase64: "abc", source: "sheet" });
    expect(items).toEqual([{ raw: "必理痛 500mg", name: "必理痛", strength: "500mg", source: "sheet" }]);
  });
});

describe("live client — 示範 fixtures still work when overlay is on", () => {
  test("getVisionProvider(true) still returns the bundled sheet fixture", async () => {
    const items = await getVisionProvider(true).extract(sampleSheetCapture());
    expect(items).toEqual(SAMPLE_SHEET);
  });

  test("getVisionProvider() without overlay is mock", () => {
    expect(getVisionProvider().name).toBe("mock");
    expect(getVisionProvider(false).name).toBe("mock");
  });

  test("getTtsProvider() without overlay is expo-speech", () => {
    expect(getTtsProvider().name).toBe("expo-speech");
    expect(getTtsProvider(false).name).toBe("expo-speech");
  });
});
