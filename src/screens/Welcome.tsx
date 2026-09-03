// S0 — Welcome / consent. Verbatim disclaimer + verbatim consent. Simulated-data toggle
// is REQUIRED before 開始. Language, 老友記 large type and 講俾我聽 voice toggles live here.

import React from "react";
import { View } from "react-native";
import {
  Body,
  Card,
  DisclaimerFooter,
  Heading,
  PrimaryButton,
  Screen,
  Small,
  SpeakButton,
  Title,
  Toggle,
  TopBar,
} from "../components/UIKit";
import { useApp } from "../state/AppContext";
import { L } from "../modules/i18n";
import { colors, spacing } from "../modules/ui";

export function Welcome() {
  const {
    lang,
    setLang,
    consented,
    setConsented,
    voiceOn,
    toggleVoice,
    fontScale,
    toggleFontScale,
    goTo,
  } = useApp();
  const s = L(lang);

  return (
    <Screen>
      <TopBar onBack={() => goTo("HOME")} />
      <Title>{s.s0.title}</Title>
      <Small color={colors.inkSoft}>{s.tagline}</Small>

      <Card style={{ borderColor: colors.notOnList, borderWidth: 2 }}>
        <Heading color={colors.notOnList}>{s.demoBadge}</Heading>
        <Body>{s.s0.consent}</Body>
        <SpeakButton text={s.s0.consent} small />
      </Card>

      <Toggle
        value={consented}
        label={s.s0.simulatedToggle}
        onToggle={() => setConsented(!consented)}
      />

      <Card>
        <Heading>{s.s0.language}</Heading>
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="粵"
              color={lang === "zh-HK" ? colors.ink : colors.line}
              onPress={() => setLang("zh-HK")}
            />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="简"
              color={lang === "zh-CN" ? colors.ink : colors.line}
              onPress={() => setLang("zh-CN")}
            />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="EN"
              color={lang === "en" ? colors.ink : colors.line}
              onPress={() => setLang("en")}
            />
          </View>
        </View>
        <Toggle
          value={voiceOn}
          label={`${s.s0.voiceToggle}（${voiceOn ? s.s0.voiceOn : s.s0.voiceOff}）`}
          onToggle={toggleVoice}
        />
        <Toggle value={fontScale === "large"} label={s.s0.largeType} onToggle={toggleFontScale} />
      </Card>

      {!consented ? <Small color={colors.notOnList}>{s.s0.mustConsent}</Small> : null}
      <PrimaryButton
        label={s.s0.start}
        disabled={!consented}
        color={colors.continue}
        onPress={() => goTo("S1")}
      />

      <DisclaimerFooter />
    </Screen>
  );
}
