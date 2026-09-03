// S2 — Scan the boxes (1–8). 「影下一盒」 adds a box, 「影完喇」 moves to the result.
// 「影下一盒」 pulls the next bundled 示範 box so the demo cannot fail.
// Overlay on: the live camera goes through server OCR; fixtures stay mock.

import React, { useState } from "react";
import { View } from "react-native";
import { Body, Card, DisclaimerFooter, Heading, PrimaryButton, Screen, SecondaryButton, Small, SpeakButton, Title, TopBar } from "../components/UIKit";
import { CameraCapture } from "../components/CameraCapture";
import { useApp } from "../state/AppContext";
import { L } from "../modules/i18n";
import { colors, spacing } from "../modules/ui";
import { photoCapture, sampleBoxCapture } from "../modules/capture";
import { getVisionProvider } from "../modules/extract";
import { SAMPLE_BOXES } from "../modules/samples";

const MAX_BOXES = 8;

export function ScanBoxes() {
  const { lang, goTo, boxItems, addBoxItems, speak, liveOverlayOn } = useApp();
  const s = L(lang);
  const [note, setNote] = useState<string | null>(null);
  const failNote = liveOverlayOn ? s.s0.liveFailed : s.s1.couldNotRead;

  const addNextSample = async () => {
    const idx = boxItems.length;
    if (idx >= Math.min(MAX_BOXES, SAMPLE_BOXES.length)) return;
    // 「影下一盒」 stays on the bundled 示範 fixtures so the demo cannot fail.
    const items = await getVisionProvider(liveOverlayOn).extract(sampleBoxCapture(idx));
    addBoxItems(items);
    if (items[0]) speak(items[0].name);
  };

  const onPhoto = async (photo: { uri: string | null; base64?: string }) => {
    if (!photo.uri && !photo.base64) {
      setNote(failNote);
      return;
    }
    const items = await getVisionProvider(liveOverlayOn).extract(
      photoCapture(photo.uri, "box", false, photo.base64),
    );
    if (items.length === 0) {
      setNote(failNote);
      return;
    }
    addBoxItems(items);
  };

  const sampleExhausted = boxItems.length >= Math.min(MAX_BOXES, SAMPLE_BOXES.length);

  return (
    <Screen>
      <TopBar onBack={() => goTo("S1")} />
      <Title>{s.s2.title}</Title>
      <Body>{s.s2.hint}</Body>
      <SpeakButton text={`${s.s2.title}。${s.s2.hint}`} small />

      <CameraCapture
        shutterLabel={s.s2.shutter}
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

      <Card>
        <Heading>{s.s2.boxesSoFar(boxItems.length)}</Heading>
        {boxItems.map((b, i) => (
          <Body key={`${b.raw}-${i}`}>
            {i + 1}. {b.name}
            {b.strength ? `（${b.strength}）` : ""}
          </Body>
        ))}
      </Card>

      <View style={{ gap: spacing.md }}>
        <PrimaryButton
          label={s.s2.addBox}
          color={colors.new}
          disabled={sampleExhausted}
          onPress={addNextSample}
        />
        <PrimaryButton
          label={s.s2.done}
          color={colors.continue}
          disabled={boxItems.length === 0}
          onPress={() => goTo("S3")}
        />
        <SecondaryButton label={s.common.back} onPress={() => goTo("S1")} />
      </View>

      <DisclaimerFooter />
    </Screen>
  );
}
