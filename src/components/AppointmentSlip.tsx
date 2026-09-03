// AppointmentSlip — a rendered synthetic 專科門診預約紙 (PWH-style). Fully fabricated,
// watermarked 示範. The 登記時間 (registration time) is shown large and clearly labelled so
// the whole point of the walk — "this is your REGISTRATION time, not your doctor time" —
// is visible on the paper itself. No real patient data; no bundled photo needed.

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../modules/ui";
import { useApp } from "../state/AppContext";
import { L } from "../modules/i18n";
import type { AppointmentSlip as Slip } from "../modules/sopc";
import { useType } from "./UIKit";

export function AppointmentSlip({ slip }: { slip: Slip }) {
  const { lang } = useApp();
  const s = L(lang).sopc;
  const t = useType();
  const zh = lang !== "en";

  const Row = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.row}>
      <Text style={[styles.label, { fontSize: t.small }]}>{label}</Text>
      <Text style={[styles.value, { fontSize: t.label }]}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.paper} accessibilityLabel={`${s.watermark} ${zh ? slip.clinicZh : slip.clinicEn}`}>
      {/* diagonal watermark */}
      <View pointerEvents="none" style={styles.watermarkWrap}>
        <Text style={[styles.watermark, { fontSize: t.display + 18 }]}>{s.watermark}</Text>
      </View>

      <View style={styles.header}>
        <Text style={[styles.hospital, { fontSize: t.heading }]}>
          {zh ? slip.hospitalZh : slip.hospitalEn}
        </Text>
        <Text style={[styles.clinic, { fontSize: t.body }]}>
          {zh ? slip.clinicZh : slip.clinicEn}
          {"  ·  "}
          {zh ? slip.specialtyZh : slip.specialtyEn}
        </Text>
      </View>

      <View style={styles.divider} />

      <Row label={s.patientLabel} value={zh ? slip.patientZh : slip.patientEn} />
      <Row label={s.caseLabel} value={slip.caseNo} />
      <Row label={s.specialtyLabel} value={zh ? slip.specialtyZh : slip.specialtyEn} />
      <Row label={s.dateLabel} value={zh ? slip.dateZh : slip.dateEn} />
      <Row label={s.venueLabel} value={zh ? slip.venueZh : slip.venueEn} />

      {/* Registration time — the star of the slip */}
      <View style={styles.regBox}>
        <Text style={[styles.regLabel, { fontSize: t.label }]}>{s.regTimeLabel}</Text>
        <Text style={[styles.regTime, { fontSize: t.display }]}>{slip.regTime}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    backgroundColor: "#FFFDF6",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#CBB98F",
    padding: spacing.lg,
    gap: spacing.xs,
    overflow: "hidden",
  },
  watermarkWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  watermark: {
    color: "rgba(184,116,26,0.14)",
    fontWeight: "900",
    transform: [{ rotate: "-24deg" }],
    letterSpacing: 6,
  },
  header: { gap: 2, marginBottom: spacing.xs },
  hospital: { color: colors.ink, fontWeight: "900" },
  clinic: { color: colors.inkSoft, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#E4DBC2", marginVertical: spacing.sm },
  row: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm, paddingVertical: 3 },
  label: { color: colors.inkSoft, fontWeight: "700", width: 92 },
  value: { color: colors.ink, fontWeight: "700", flex: 1 },
  regBox: {
    marginTop: spacing.md,
    borderWidth: 2,
    borderColor: colors.notOnList,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    backgroundColor: "#FFF6E8",
  },
  regLabel: { color: colors.notOnList, fontWeight: "800" },
  regTime: { color: colors.ink, fontWeight: "900", letterSpacing: 2 },
});
