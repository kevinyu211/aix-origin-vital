// SOPC S3 — the walk ends on a HUMAN counter (繳費處／登記處). No HA Go, no indoor GPS,
// no A&E, no pharmacy, no diagnosis — just "wait for your number, and ask a person if lost".

import React from "react";
import {
  Body,
  Card,
  DisclaimerFooter,
  Heading,
  PrimaryButton,
  Screen,
  SecondaryButton,
  SpeakButton,
  Title,
  TopBar,
} from "../../components/UIKit";
import { useApp } from "../../state/AppContext";
import { L } from "../../modules/i18n";
import { colors } from "../../modules/ui";
import { sopcHuman } from "../../modules/sopc";

export function SopcArrive() {
  const { lang, goTo } = useApp();
  const s = L(lang);
  const human = sopcHuman(lang);

  return (
    <Screen>
      <TopBar onBack={() => goTo("SOPC_S2")} />
      <Title>{s.sopc.s3Title}</Title>
      <Body>{s.sopc.s3Body}</Body>
      <SpeakButton text={`${s.sopc.s3Title}。${s.sopc.s3Body}`} small />

      <Card style={{ borderColor: colors.new, borderWidth: 2 }}>
        <Heading color={colors.new}>{s.sopc.humanTitle}</Heading>
        <Body>{human}</Body>
        <SpeakButton text={human} small />
      </Card>

      <PrimaryButton label={s.sopc.replay} color={colors.new} onPress={() => goTo("SOPC_S2")} />
      <SecondaryButton label={s.sopc.backHome} onPress={() => goTo("HOME")} />

      <DisclaimerFooter />
    </Screen>
  );
}
