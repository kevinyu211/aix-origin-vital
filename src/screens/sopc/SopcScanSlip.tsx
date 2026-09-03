// SOPC S1 — Scan the appointment slip. Camera + 「用示範預約紙」 fallback (demo mode).
// The key teaching point lives here: the printed time is the 登記時間, not 見醫生.

import React, { useState } from "react";
import {
  Body,
  Card,
  DisclaimerFooter,
  PrimaryButton,
  Screen,
  SecondaryButton,
  Small,
  SpeakButton,
  Title,
  TopBar,
} from "../../components/UIKit";
import { CameraCapture } from "../../components/CameraCapture";
import { AppointmentSlip } from "../../components/AppointmentSlip";
import { useApp } from "../../state/AppContext";
import { L } from "../../modules/i18n";
import { colors } from "../../modules/ui";
import { SAMPLE_SLIP } from "../../modules/sopc";

export function SopcScanSlip() {
  const { lang, goTo, speak } = useApp();
  const s = L(lang);
  const [note, setNote] = useState<string | null>(null);

  const useSample = () => {
    speak(s.sopc.captured);
    goTo("SOPC_S2");
  };

  const onPhoto = (photo: { uri: string | null; base64?: string }) => {
    // SOPC slip OCR is not a medicine extract — steer to the bundled 示範 slip.
    setNote(
      lang === "en"
        ? "This is demo mode and can't read a real slip. Please tap “Use the demo slip”."
        : lang === "zh-CN"
          ? "现在是示范模式，读不到真的预约纸。请按「用示范预约纸」。"
          : "而家係示範模式，讀唔到真嘅預約紙。請按「用示範預約紙」。",
    );
    void photo;
  };

  return (
    <Screen>
      <TopBar onBack={() => goTo("HOME")} />
      <Title>{s.sopc.s1Title}</Title>
      <Body>{s.sopc.s1Hint}</Body>
      <SpeakButton text={`${s.sopc.s1Title}。${s.sopc.s1Hint}`} small />

      <Card style={{ borderColor: colors.notOnList, borderWidth: 2 }}>
        <Body color={colors.notOnList}>{s.sopc.timeNote}</Body>
        <SpeakButton text={s.sopc.timeNote} small />
      </Card>

      <CameraCapture
        shutterLabel={s.s1.shutter}
        permissionText={s.s1.permissionNeeded}
        grantLabel={s.s1.grant}
        onCapture={onPhoto}
      />

      {note ? (
        <Card style={{ borderColor: colors.notOnList }}>
          <Small color={colors.notOnList}>{note}</Small>
        </Card>
      ) : null}

      <Small color={colors.inkSoft}>{s.sopc.slipHint}</Small>
      <AppointmentSlip slip={SAMPLE_SLIP} />

      <PrimaryButton label={s.sopc.useSample} color={colors.new} onPress={useSample} />
      <SecondaryButton label={s.common.back} onPress={() => goTo("HOME")} />

      <DisclaimerFooter />
    </Screen>
  );
}
