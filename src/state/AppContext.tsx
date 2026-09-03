// AppContext — lightweight in-memory session store + screen navigation.
// No persistence beyond the session (spec): everything lives in React state only.

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { FontScale } from "../modules/ui";
import type { Lang, MedItem, ReconcileResult } from "../modules/types";
import { reconcile } from "../modules/reconcile";
import { getTtsProvider } from "../modules/voice";

export type ScreenId =
  | "HOME"
  | "S0"
  | "S1"
  | "S2"
  | "S3"
  | "S4"
  | "S5"
  | "SOPC_S1"
  | "SOPC_S2"
  | "SOPC_S3";

interface AppState {
  lang: Lang;
  fontScale: FontScale;
  voiceOn: boolean;
  consented: boolean;
  screen: ScreenId;
  sheetItems: MedItem[];
  boxItems: MedItem[];
  refusal: string | null;
}

interface AppContextValue extends AppState {
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  setFontScale: (s: FontScale) => void;
  toggleFontScale: () => void;
  toggleVoice: () => void;
  setConsented: (v: boolean) => void;
  goTo: (s: ScreenId) => void;
  setSheetItems: (items: MedItem[]) => void;
  addBoxItems: (items: MedItem[]) => void;
  resetScan: () => void;
  result: ReconcileResult;
  openRefusal: (text: string) => void;
  closeRefusal: () => void;
  speak: (text: string) => void;
  stopSpeak: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("zh-HK");
  const [fontScale, setFontScale] = useState<FontScale>("large");
  const [voiceOn, setVoiceOn] = useState<boolean>(false);
  const [consented, setConsented] = useState<boolean>(false);
  const [screen, setScreen] = useState<ScreenId>("HOME");
  const [sheetItems, setSheetItemsState] = useState<MedItem[]>([]);
  const [boxItems, setBoxItems] = useState<MedItem[]>([]);
  const [refusal, setRefusal] = useState<string | null>(null);

  const result = useMemo(() => reconcile(sheetItems, boxItems), [sheetItems, boxItems]);

  const speak = useCallback(
    (text: string) => {
      if (!voiceOn) return;
      void getTtsProvider().speak(text, lang);
    },
    [voiceOn, lang],
  );

  const stopSpeak = useCallback(() => getTtsProvider().stop(), []);

  const value = useMemo<AppContextValue>(
    () => ({
      lang,
      fontScale,
      voiceOn,
      consented,
      screen,
      sheetItems,
      boxItems,
      refusal,
      result,
      setLang,
      toggleLang: () => setLang((p) => (p === "zh-HK" ? "en" : "zh-HK")),
      setFontScale,
      toggleFontScale: () => setFontScale((p) => (p === "large" ? "normal" : "large")),
      toggleVoice: () => setVoiceOn((p) => !p),
      setConsented,
      goTo: setScreen,
      setSheetItems: setSheetItemsState,
      addBoxItems: (items: MedItem[]) => setBoxItems((prev) => [...prev, ...items]),
      resetScan: () => {
        setSheetItemsState([]);
        setBoxItems([]);
      },
      openRefusal: (text: string) => setRefusal(text),
      closeRefusal: () => setRefusal(null),
      speak,
      stopSpeak,
    }),
    [lang, fontScale, voiceOn, consented, screen, sheetItems, boxItems, refusal, result, speak, stopSpeak],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
