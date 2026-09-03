// capture module — shapes raw camera output / sample selections into CaptureResult.
// Pure data-shaping (no camera hardware here); screens own the expo-camera ref and
// call these helpers with the resulting photo URI.

import type { CaptureResult, MedSource } from "./types";
import { SAMPLE_SHEET_FIXTURE_KEY, boxFixtureKey } from "./samples";

export function sampleSheetCapture(): CaptureResult {
  return { uri: null, source: "sheet", fixtureKey: SAMPLE_SHEET_FIXTURE_KEY, simulated: true };
}

export function sampleBoxCapture(index: number): CaptureResult {
  return { uri: null, source: "box", fixtureKey: boxFixtureKey(index), simulated: true };
}

export function photoCapture(uri: string, source: MedSource, simulated: boolean): CaptureResult {
  return { uri, source, simulated };
}
