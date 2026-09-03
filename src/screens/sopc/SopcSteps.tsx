// SOPC S2 — the three spoken steps. 粵 voice reads exactly three steps (expo-speech now,
// MiniMax later). It never says a 15–30 min late arrival kills the slot — late is
// re-register, shown as a reassurance card, not one of the three core steps.

import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Body,
  Card,
  DisclaimerFooter,
  Heading,
  PrimaryButton,
  Screen,
  SecondaryButton,
  Small,
  SpeakButton,
  Title,
  TopBar,
  useType,
} from "../../components/UIKit";
import { useApp } from "../../state/AppContext";
import { L } from "../../modules/i18n";
import { colors, radius, spacing } from "../../modules/ui";
import { sopcSteps, sopcStepsSpokenText } from "../../modules/sopc";

function StepCard({ n, text }: { n: number; text: string }) {
  const { lang } = useApp();
  const s = L(lang).sopc;
  const t = useType();
  return (
    <Card style={{ gap: spacing.sm }}>
      <View style={styles.stepHead}>
        <View style={styles.numDot}>
          <Text style={[styles.num, { fontSize: t.heading }]}>{n}</Text>
        </View>
        <Small color={colors.inkSoft}>{s.stepLabel(n)}</Small>
      </View>
      <Body>{text}</Body>
      <SpeakButton text={text} small />
    </Card>
  );
}

export function SopcSteps() {
  const { lang, goTo, speak, stopSpeak, voiceOn } = useApp();
  const s = L(lang);
  const steps = sopcSteps(lang);

  // Read all three steps aloud on entry when voice is on; stop on leave.
  useEffect(() => {
    if (voiceOn) speak(sopcStepsSpokenText(lang));
    return () => stopSpeak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, voiceOn]);

  return (
    <Screen>
      <TopBar onBack={() => goTo("SOPC_S1")} />
      <Title>{s.sopc.s2Title}</Title>
      <Body>{s.sopc.s2Intro}</Body>

      <View style={styles.listenRow}>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            label={s.sopc.listenAll}
            color={colors.new}
            onPress={() => speak(sopcStepsSpokenText(lang))}
          />
        </View>
        <SecondaryButton label={s.sopc.stopListen} onPress={stopSpeak} />
      </View>

      {steps.map((text, i) => (
        <StepCard key={i} n={i + 1} text={text} />
      ))}

      <Card style={{ borderColor: colors.continue, borderWidth: 2 }}>
        <Heading color={colors.continue}>{s.sopc.lateTitle}</Heading>
        <Body>{s.sopc.lateBody}</Body>
        <SpeakButton text={s.sopc.lateBody} small />
      </Card>

      <PrimaryButton label={s.sopc.toEnd} color={colors.continue} onPress={() => goTo("SOPC_S3")} />
      <SecondaryButton label={s.common.back} onPress={() => goTo("SOPC_S1")} />

      <DisclaimerFooter />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listenRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  stepHead: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  numDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.new,
    alignItems: "center",
    justifyContent: "center",
  },
  num: { color: "#fff", fontWeight: "900" },
});
