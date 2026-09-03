// S6 — Refusal modal. Shown when the keyword classifier detects an advice-seeking
// question. Displays a FIXED refusal message (no generated advice) + a nudge to a
// pharmacist. Nothing here is model-generated.

import React from "react";
import { Modal, View, StyleSheet } from "react-native";
import { Body, Card, Heading, PrimaryButton, SecondaryButton, SpeakButton } from "../components/UIKit";
import { useApp } from "../state/AppContext";
import { L } from "../modules/i18n";
import { colors, spacing } from "../modules/ui";

export function RefusalModal() {
  const { lang, refusal, closeRefusal, goTo } = useApp();
  const s = L(lang);
  const visible = refusal !== null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={closeRefusal}>
      <View style={styles.backdrop}>
        <Card style={{ borderColor: colors.reveal, borderWidth: 2, gap: spacing.md }}>
          <Heading color={colors.reveal}>{s.s6.title}</Heading>
          <Body>{refusal}</Body>
          <SpeakButton text={refusal ?? ""} small />
          <PrimaryButton
            label={s.s6.askPharmacist}
            color={colors.continue}
            onPress={() => {
              closeRefusal();
              goTo("S4");
            }}
          />
          <SecondaryButton label={s.common.close} onPress={closeRefusal} />
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(20,33,61,0.45)",
    justifyContent: "center",
    padding: spacing.lg,
  },
});
