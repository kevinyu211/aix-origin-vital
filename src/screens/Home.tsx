// HOME — path picker. Two demo paths live side-by-side here:
//   • 今日去專科門診 — SOPC visit-day voice companion (new)
//   • 對藥 — discharge medicine check (existing; unchanged)
// The verbatim disclaimer is visible here (health-info support, not medical advice).

import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  Badge,
  Body,
  Card,
  DisclaimerFooter,
  Heading,
  Screen,
  Small,
  Title,
  Toggle,
  useType,
} from "../components/UIKit";
import { useApp } from "../state/AppContext";
import { L } from "../modules/i18n";
import { colors, MIN_TAP, radius, spacing } from "../modules/ui";

function PathCard({
  title,
  subtitle,
  color,
  onPress,
  emoji,
}: {
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
  emoji: string;
}) {
  const t = useType();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pathCard, { borderColor: color, opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={[styles.emojiDot, { backgroundColor: color }]}>
        <Body style={{ color: "#fff", fontSize: t.heading }}>{emoji}</Body>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Heading color={color}>{title}</Heading>
        <Small color={colors.inkSoft}>{subtitle}</Small>
      </View>
      <Body color={color} style={{ fontWeight: "900" }}>›</Body>
    </Pressable>
  );
}

export function Home() {
  const { lang, toggleLang, voiceOn, toggleVoice, fontScale, toggleFontScale, goTo } = useApp();
  const s = L(lang);

  return (
    <Screen>
      <View style={styles.topbar}>
        <View style={styles.rowGap}>
          <Title>{s.home.title}</Title>
          <Badge label={s.demoBadge} />
        </View>
        <View style={styles.rowGap}>
          <Pressable accessibilityRole="button" onPress={toggleFontScale} style={styles.pill}>
            <Small color={colors.ink}>{fontScale === "large" ? "A-" : "A+"}</Small>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={toggleLang} style={styles.pill}>
            <Small color={colors.ink}>{lang === "zh-HK" ? "EN" : "中"}</Small>
          </Pressable>
        </View>
      </View>

      <Small color={colors.inkSoft}>{s.home.subtitle}</Small>

      <Heading>{s.home.pickPrompt}</Heading>

      <PathCard
        emoji="🏥"
        title={s.home.sopcTitle}
        subtitle={s.home.sopcSub}
        color={colors.new}
        onPress={() => goTo("SOPC_S1")}
      />
      <PathCard
        emoji="💊"
        title={s.home.doyeukTitle}
        subtitle={s.home.doyeukSub}
        color={colors.continue}
        onPress={() => goTo("S0")}
      />

      <Card style={{ backgroundColor: "#EEF0EC" }}>
        <Small color={colors.inkSoft}>{s.home.demoNote}</Small>
      </Card>

      <Toggle
        value={voiceOn}
        label={`${s.s0.voiceToggle}（${voiceOn ? s.s0.voiceOn : s.s0.voiceOff}）`}
        onToggle={toggleVoice}
      />

      <DisclaimerFooter />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  rowGap: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  pill: {
    minHeight: 40,
    minWidth: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  pathCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: MIN_TAP + 24,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 2,
    padding: spacing.md,
  },
  emojiDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
