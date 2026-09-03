// S5 — About & privacy. Model vs rules, providers, cross-border. Verbatim disclaimer.

import React from "react";
import { Body, Card, DisclaimerFooter, Heading, Screen, SecondaryButton, Small, Title, TopBar } from "../components/UIKit";
import { useApp } from "../state/AppContext";
import { L } from "../modules/i18n";
import { colors } from "../modules/ui";
import { DICTIONARY_COUNT, DICTIONARY_TITLE } from "../modules/dictionary";
import { effectiveTtsProvider, effectiveVisionProvider, getTtsProviderName, getVisionProviderName } from "../modules/config";

export function About() {
  const { lang, goTo, liveOverlayOn } = useApp();
  const s = L(lang);

  return (
    <Screen>
      <TopBar onBack={() => goTo("S3")} />
      <Title>{s.s5.title}</Title>

      <Card>
        <Heading>{s.s5.modelVsRules}</Heading>
        <Body color={colors.inkSoft}>{s.s5.modelVsRulesBody}</Body>
      </Card>

      <Card>
        <Heading>{s.s5.providers}</Heading>
        <Body color={colors.inkSoft}>{s.s5.providersBody}</Body>
        <Small color={colors.inkSoft}>
          vision = {effectiveVisionProvider(liveOverlayOn)} (env {getVisionProviderName()}) · tts ={" "}
          {effectiveTtsProvider(liveOverlayOn)} (env {getTtsProviderName()}) · overlay ={" "}
          {liveOverlayOn ? "on" : "off"} · {DICTIONARY_TITLE} ({DICTIONARY_COUNT})
        </Small>
      </Card>

      <Card>
        <Heading>{s.s5.crossBorder}</Heading>
        <Body color={colors.inkSoft}>{s.s5.crossBorderBody}</Body>
      </Card>

      <SecondaryButton label={s.common.back} onPress={() => goTo("S3")} />
      <DisclaimerFooter />
    </Screen>
  );
}
