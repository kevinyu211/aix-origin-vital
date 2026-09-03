// S1 — Scan the discharge sheet. Camera + 「用示範藥單」 fallback (sample mode).

import React, { useState } from "react";
import { Body, Card, DisclaimerFooter, PrimaryButton, Screen, SecondaryButton, Small, SpeakButton, Title, TopBar } from "../components/UIKit";
import { CameraCapture } from "../components/CameraCapture";
import { useApp } from "../state/AppContext";
import { L } from "../modules/i18n";
import { colors } from "../modules/ui";
import { photoCapture, sampleSheetCapture } from "../modules/capture";
import { getVisionProvider } from "../modules/extract";
import { SAMPLE_SHEET } from "../modules/samples";

export function ScanSheet() {
  const { lang, goTo, setSheetItems, speak, liveOverlayOn } = useApp();
  const s = L(lang);
  const [note, setNote] = useState<string | null>(null);
  const failNote = liveOverlayOn ? s.s0.liveFailed : s.s1.couldNotRead;

  const useSample = async () => {
    // 示範 always goes through the mock fixture path, even when overlay is on.
    const items = await getVisionProvider(liveOverlayOn).extract(sampleSheetCapture());
    setSheetItems(items.length ? items : SAMPLE_SHEET);
    speak(s.s1.captured);
    goTo("S2");
  };

  const onPhoto = async (photo: { uri: string | null; base64?: string }) => {
    if (!photo.uri && !photo.base64) {
      setNote(failNote);
      return;
    }
    const items = await getVisionProvider(liveOverlayOn).extract(
      photoCapture(photo.uri, "sheet", false, photo.base64),
    );
    if (items.length === 0) {
      setNote(failNote);
      return;
    }
    setSheetItems(items);
    goTo("S2");
  };

  return (
    <Screen>
      <TopBar onBack={() => goTo("S0")} />
      <Title>{s.s1.title}</Title>
      <Body>{s.s1.hint}</Body>
      <SpeakButton text={`${s.s1.title}。${s.s1.hint}`} small />

      <CameraCapture
        shutterLabel={s.s1.shutter}
        permissionText={s.s1.permissionNeeded}
        grantLabel={s.s1.grant}
        requestBase64={liveOverlayOn}
        onCapture={onPhoto}
      />

      {note ? (
        <Card style={{ borderColor: colors.notOnList }}>
          <Small color={colors.notOnList}>{note}</Small>
        </Card>
      ) : null}

      <PrimaryButton label={s.s1.useSample} color={colors.new} onPress={useSample} />
      <SecondaryButton label={s.common.back} onPress={() => goTo("S0")} />

      <DisclaimerFooter />
    </Screen>
  );
}
