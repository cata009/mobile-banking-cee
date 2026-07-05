import { useState } from "react";
import {
  CoAppingChatLauncher,
  CoAppingPanel,
  CoAppingSessionScreen,
  FloatingCoAppingButton,
  TerminateSessionPopup,
} from "../index";
import "../coapping.css";

type DemoScreen = "home" | "panel" | "session";

export function AppExample() {
  const [screen, setScreen] = useState<DemoScreen>("home");
  const [coAppingActive, setCoAppingActive] = useState(false);
  const [showTerminate, setShowTerminate] = useState(false);

  return (
    <div className="demo-phone-shell">
      <main className="demo-phone-content">
        <h1>Host app screen</h1>
        <p>This area represents your existing app. The chat package floats above it.</p>
        <button type="button" onClick={() => setScreen("panel")}>Open Other panel</button>
      </main>

      <CoAppingChatLauncher />

      {coAppingActive && (
        <FloatingCoAppingButton onClick={() => setShowTerminate(true)} showSlideIn />
      )}

      {screen === "panel" && (
        <CoAppingPanel
          coAppingAvailable
          onClose={() => setScreen("home")}
          onStartCoApping={() => setScreen("session")}
        />
      )}

      {screen === "session" && (
        <CoAppingSessionScreen
          onBack={() => setScreen("panel")}
          onContinue={() => {
            setCoAppingActive(true);
            setScreen("home");
          }}
        />
      )}

      {showTerminate && (
        <TerminateSessionPopup
          onCancel={() => setShowTerminate(false)}
          onTerminate={() => {
            setCoAppingActive(false);
            setShowTerminate(false);
          }}
        />
      )}
    </div>
  );
}

