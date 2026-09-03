// UIKit — shared presentational components tuned for 老友記 (large type, big taps).

import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors, fontSizes, MIN_TAP, radius, spacing } from "../modules/ui";
import { useApp } from "../state/AppContext";
import { L } from "../modules/i18n";

export function useType() {
  const { fontScale } = useApp();
  return fontSizes(fontScale);
}

export function Screen({
  children,
  scroll = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  if (scroll) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }
  return <View style={[styles.screen, styles.screenContent]}>{children}</View>;
}

export function Title({ children, style }: { children: React.ReactNode; style?: TextStyle }) {
  const t = useType();
  return <Text style={[{ fontSize: t.title, fontWeight: "800", color: colors.ink }, style]}>{children}</Text>;
}

export function Heading({ children, color, style }: { children: React.ReactNode; color?: string; style?: TextStyle }) {
  const t = useType();
  return (
    <Text style={[{ fontSize: t.heading, fontWeight: "700", color: color ?? colors.ink }, style]}>{children}</Text>
  );
}

export function Body({ children, color, style }: { children: React.ReactNode; color?: string; style?: TextStyle }) {
  const t = useType();
  return <Text style={[{ fontSize: t.body, color: color ?? colors.ink, lineHeight: t.body * 1.5 }, style]}>{children}</Text>;
}

export function Small({ children, color, style }: { children: React.ReactNode; color?: string; style?: TextStyle }) {
  const t = useType();
  return <Text style={[{ fontSize: t.small, color: color ?? colors.inkSoft, lineHeight: t.small * 1.5 }, style]}>{children}</Text>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  color,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
}) {
  const t = useType();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: disabled ? colors.line : color ?? colors.ink, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={{ color: "#fff", fontSize: t.body, fontWeight: "800" }}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, color }: { label: string; onPress: () => void; color?: string }) {
  const t = useType();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.btnOutline,
        { borderColor: color ?? colors.ink, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={{ color: color ?? colors.ink, fontSize: t.body, fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}

/** 講俾我聽 button. Only speaks when voice is on; otherwise nudges the user. */
export function SpeakButton({ text, small }: { text: string; small?: boolean }) {
  const { speak, voiceOn, lang } = useApp();
  const t = useType();
  const label = `🔊 ${L(lang).common.listen}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => speak(text)}
      style={({ pressed }) => [
        styles.speak,
        { opacity: pressed ? 0.7 : voiceOn ? 1 : 0.5, paddingVertical: small ? 8 : 12 },
      ]}
    >
      <Text style={{ color: colors.ink, fontSize: small ? t.small : t.label, fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}

export function Toggle({ value, label, onToggle }: { value: boolean; label: string; onToggle: () => void }) {
  const t = useType();
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} onPress={onToggle} style={styles.toggleRow}>
      <View style={[styles.checkbox, { backgroundColor: value ? colors.continue : "#fff", borderColor: value ? colors.continue : colors.line }]}>
        {value ? <Text style={{ color: "#fff", fontSize: t.label, fontWeight: "900" }}>✓</Text> : null}
      </View>
      <Text style={{ flex: 1, fontSize: t.body, color: colors.ink, lineHeight: t.body * 1.4 }}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label }: { label: string }) {
  const t = useType();
  return (
    <View style={styles.badge}>
      <Text style={{ color: "#fff", fontSize: t.small, fontWeight: "800" }}>{label}</Text>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Compact top bar: 對藥 name + 示範 badge + quick language / large-type toggles. */
export function TopBar({ onBack }: { onBack?: () => void }) {
  const { lang, toggleLang, toggleFontScale, fontScale } = useApp();
  const s = L(lang);
  const t = useType();
  return (
    <View style={styles.topbar}>
      {onBack ? (
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.pill}>
          <Text style={{ color: colors.ink, fontSize: t.small, fontWeight: "700" }}>‹ {s.common.back}</Text>
        </Pressable>
      ) : (
        <View style={styles.rowGap}>
          <Text style={{ color: colors.ink, fontSize: t.heading, fontWeight: "900" }}>{s.appName}</Text>
          <Badge label={s.demoBadge} />
        </View>
      )}
      <View style={styles.rowGap}>
        <Pressable accessibilityRole="button" onPress={toggleFontScale} style={styles.pill}>
          <Text style={{ color: colors.ink, fontSize: t.small, fontWeight: "700" }}>
            {fontScale === "large" ? "A-" : "A+"}
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={toggleLang} style={styles.pill}>
          <Text style={{ color: colors.ink, fontSize: t.small, fontWeight: "700" }}>
            {lang === "zh-HK" ? "EN" : "中"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function DisclaimerFooter() {
  const { lang } = useApp();
  return (
    <View style={styles.disclaimer}>
      <Small color={colors.inkSoft}>{L(lang).common.disclaimer}</Small>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  screenContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl * 2 },
  btn: {
    minHeight: MIN_TAP,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  btnOutline: {
    minHeight: MIN_TAP,
    borderRadius: radius.md,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: "#fff",
  },
  speak: {
    minHeight: MIN_TAP,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: MIN_TAP,
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.notOnList,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: spacing.sm,
  },
  disclaimer: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "#EEF0EC",
  },
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
});
