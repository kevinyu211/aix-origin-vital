import { describe, test, expect } from "@jest/globals";
import { createAnthropicVisionProvider, getVisionProvider, mockVisionProvider } from "./extract";
import { photoCapture, sampleBoxCapture, sampleSheetCapture } from "./capture";
import { SAMPLE_BOXES, SAMPLE_SHEET } from "./samples";

describe("extract — mock remains the default path", () => {
  test("factory without overlay is the mock provider", () => {
    expect(getVisionProvider().name).toBe("mock");
    expect(getVisionProvider().ready).toBe(true);
  });

  test("mock extract returns bundled 示範 fixtures", async () => {
    expect(await mockVisionProvider.extract(sampleSheetCapture())).toEqual(SAMPLE_SHEET);
    expect(await mockVisionProvider.extract(sampleBoxCapture(0))).toEqual([SAMPLE_BOXES[0]]);
  });

  test("mock extract of a real photo (no fixture) is empty — UI steers to 示範", async () => {
    expect(await mockVisionProvider.extract(photoCapture("file://x.jpg", "sheet", false))).toEqual([]);
  });
});

describe("extract — live anthropic provider degrades and keeps 示範", () => {
  test("fixture captures stay on mock data even through the anthropic adapter", async () => {
    const live = createAnthropicVisionProvider();
    expect(await live.extract(sampleSheetCapture())).toEqual(SAMPLE_SHEET);
    expect(await live.extract(sampleBoxCapture(2))).toEqual([SAMPLE_BOXES[2]]);
  });

  test("photo without a live URL / base64 returns []", async () => {
    const live = createAnthropicVisionProvider();
    expect(live.ready).toBe(false);
    expect(await live.extract(photoCapture("file://x.jpg", "box", false))).toEqual([]);
    expect(await live.extract(photoCapture("file://x.jpg", "box", false, "abc"))).toEqual([]);
  });
});
