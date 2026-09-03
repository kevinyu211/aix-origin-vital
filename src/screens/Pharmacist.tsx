// S4 — Pharmacist question card. Templated QUESTIONS only (never advice). Shareable as a
// PNG via react-native-view-shot + expo-sharing. Disclaimer is captured inside the image.

import React, { useRef, useState } from "react";
import { View } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import {
  Body,
  Card,
  Heading,
  PrimaryButton,
  Screen,
  SecondaryButton,
  Small,
  SpeakButton,
  Title,
  TopBar,
} from "../components/UIKit";
import { useApp } from "../state/AppContext";
import { L } from "../modules/i18n";
import { colors, radius, spacing } from "../modules/ui";
import { buildPharmacistItems, buildShareText } from "../modules/handoff";
import { DISCLAIMER } from "../modules/compliance";
import { SAMPLE_PATIENT } from "../modules/samples";

export function Pharmacist() {
  const { lang, goTo, result, speak } = useApp();
  const s = L(lang);
  const cardRef = useRef<View | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const items = buildPharmacistItems(result, lang);
  const patientLabel = lang === "en" ? `${SAMPLE_PATIENT.name} (demo)` : `${SAMPLE_PATIENT.name}（示範）`;

  const onShare = async () => {
    try {
      const uri = await captureRef(cardRef, { format: "png", quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: s.s4.title });
      } else {
        setNote(s.s4.shareFail);
      }
    } catch {
      setNote(s.s4.shareFail);
    }
  };

  return (
    <Screen>
      <TopBar onBack={() => goTo("S3")} />
      <Title>{s.s4.title}</Title>
      <Body>{s.s4.intro}</Body>
      <SpeakButton text={buildShareText(result, patientLabel, lang)} />

      {/* The captured region: */}
      <View ref={cardRef} collapsable={false} style={{ backgroundColor: colors.paper, padding: spacing.md, borderRadius: radius.md, gap: spacing.md }}>
        <Card style={{ borderColor: colors.ink, borderWidth: 2 }}>
          <Heading>
            {s.demoBadge} · {s.s4.title}
          </Heading>
          <Small color={colors.inkSoft}>{patientLabel}</Small>
          {items.length === 0 ? (
            <Body>{s.s4.noItems}</Body>
          ) : (
            items.map((it, i) => (
              <Body key={it.key}>
                {i + 1}. {it.question}
              </Body>
            ))
          )}
          <View style={{ marginTop: spacing.sm, padding: spacing.sm, backgroundColor: "#EEF0EC", borderRadius: radius.sm }}>
            <Small color={colors.inkSoft}>{DISCLAIMER}</Small>
          </View>
        </Card>
      </View>

      <PrimaryButton label={s.s4.share} color={colors.continue} onPress={onShare} />
      {note ? <Small color={colors.notOnList}>{note}</Small> : null}
      <SecondaryButton label={s.common.back} onPress={() => goTo("S3")} />
    </Screen>
  );
}
