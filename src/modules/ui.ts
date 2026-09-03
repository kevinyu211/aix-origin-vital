// ui module — design tokens. Kept as data so it is unit-testable and reused everywhere.
// Palette (locked): paper, ink, continue, new, notOnList, reveal(duplicate only).

import type { Bucket } from "./types";

export const colors = {
  paper: "#F7F8F6",
  ink: "#14213D",
  inkSoft: "#4A5578",
  line: "#D9DDE3",
  card: "#FFFFFF",
  continue: "#2F6B4F",
  new: "#1F5FA8",
  notOnList: "#B8741A",
  reveal: "#C43D2F", // ONLY for the duplicate-in-drawer reveal
  unmatched: "#6B7280",
};

export function bucketColor(bucket: Bucket): string {
  switch (bucket) {
    case "continue":
      return colors.continue;
    case "new":
      return colors.new;
    case "notOnList":
      return colors.notOnList;
    case "unmatched":
      return colors.unmatched;
  }
}

export const MIN_TAP = 56; // minimum tap target, pt
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 14, lg: 22 };

// 老友記 large-type support: a single scale multiplier applied to every font size.
export type FontScale = "normal" | "large";
export const SCALE: Record<FontScale, number> = { normal: 1, large: 1.35 };

const BASE = {
  display: 34,
  title: 26,
  heading: 22,
  body: 18,
  label: 16,
  small: 14,
};

export function fontSizes(scale: FontScale) {
  const k = SCALE[scale];
  return Object.fromEntries(
    Object.entries(BASE).map(([key, v]) => [key, Math.round(v * k)]),
  ) as Record<keyof typeof BASE, number>;
}

// Preferred font family (bundled system font hint). Falls back to system if absent.
export const FONT_FAMILY = undefined; // Noto Sans HK if/when bundled; system default otherwise
