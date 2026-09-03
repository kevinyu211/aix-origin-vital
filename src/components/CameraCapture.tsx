// CameraCapture — thin wrapper around expo-camera. Emits a photo URI on shutter.
// Falls back gracefully when permission is not granted or the platform has no camera.

import React, { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors, MIN_TAP, radius, spacing } from "../modules/ui";
import { Body, PrimaryButton, useType } from "./UIKit";

export function CameraCapture({
  shutterLabel,
  permissionText,
  grantLabel,
  onCapture,
}: {
  shutterLabel: string;
  permissionText: string;
  grantLabel: string;
  onCapture: (uri: string | null) => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView | null>(null);
  const t = useType();

  if (!permission) {
    return <View style={styles.frame} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.placeholder}>
        <Body>{permissionText}</Body>
        <PrimaryButton label={grantLabel} onPress={() => void requestPermission()} />
      </View>
    );
  }

  const take = async () => {
    try {
      const photo = await ref.current?.takePictureAsync?.({ quality: 0.5, skipProcessing: true });
      onCapture(photo?.uri ?? null);
    } catch {
      onCapture(null);
    }
  };

  return (
    <View style={styles.frame}>
      <CameraView ref={ref} style={StyleSheet.absoluteFill} facing="back" />
      <View style={styles.shutterBar}>
        <Pressable accessibilityRole="button" onPress={take} style={styles.shutter}>
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: t.body }}>{shutterLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: 320,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: colors.line,
  },
  placeholder: {
    height: 220,
    borderRadius: radius.md,
    backgroundColor: "#EEF0EC",
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  shutterBar: {
    position: "absolute",
    bottom: spacing.md,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  shutter: {
    minHeight: MIN_TAP,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
});
