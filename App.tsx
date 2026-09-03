// 對藥 (DoYeuk) — Discharge Medicine Check. AIx Origin Summit 2026 HK Vital (Soft Healthcare).
// Single-file router over a small in-memory state machine (no navigation library, no backend).

import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { AppProvider, useApp } from "./src/state/AppContext";
import { Home } from "./src/screens/Home";
import { Welcome } from "./src/screens/Welcome";
import { ScanSheet } from "./src/screens/ScanSheet";
import { ScanBoxes } from "./src/screens/ScanBoxes";
import { Result } from "./src/screens/Result";
import { Pharmacist } from "./src/screens/Pharmacist";
import { About } from "./src/screens/About";
import { RefusalModal } from "./src/screens/RefusalModal";
import { SopcScanSlip } from "./src/screens/sopc/SopcScanSlip";
import { SopcSteps } from "./src/screens/sopc/SopcSteps";
import { SopcArrive } from "./src/screens/sopc/SopcArrive";
import { colors } from "./src/modules/ui";

function Router() {
  const { screen } = useApp();
  switch (screen) {
    case "HOME":
      return <Home />;
    // 對藥 (discharge medicine check) path — unchanged.
    case "S0":
      return <Welcome />;
    case "S1":
      return <ScanSheet />;
    case "S2":
      return <ScanBoxes />;
    case "S3":
      return <Result />;
    case "S4":
      return <Pharmacist />;
    case "S5":
      return <About />;
    // SOPC (專科門診) visit-day voice companion path.
    case "SOPC_S1":
      return <SopcScanSlip />;
    case "SOPC_S2":
      return <SopcSteps />;
    case "SOPC_S3":
      return <SopcArrive />;
    default:
      return <Home />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.paper} />
        <Router />
        <RefusalModal />
      </SafeAreaView>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
});
