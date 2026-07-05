import { useState } from "react";
import { defaultSessionLabels } from "./defaults";
import { BackIcon } from "./icons";
import type { CoAppingSessionLabels } from "./types";

export interface CoAppingSessionScreenProps {
  onContinue: (code: string) => void;
  onBack: () => void;
  labels?: Partial<CoAppingSessionLabels>;
  imageSrc?: string;
}

export function CoAppingSessionScreen({
  onContinue,
  onBack,
  labels,
  imageSrc,
}: CoAppingSessionScreenProps) {
  const mergedLabels = { ...defaultSessionLabels, ...labels };
  const [code, setCode] = useState("");
  const canContinue = code.trim().length > 0;

  return (
    <div className="mpc-session-screen">
      <header className="mpc-session-header">
        <button type="button" className="mpc-icon-button" onClick={onBack} aria-label={mergedLabels.backLabel}>
          <BackIcon />
        </button>
        <h1>{mergedLabels.title}</h1>
      </header>

      <main className="mpc-session-content">
        <div className="mpc-session-image">
          {imageSrc ? <img src={imageSrc} alt="" /> : <div className="mpc-session-image-placeholder">Co-apping</div>}
        </div>

        <div className="mpc-session-copy">
          <p>{mergedLabels.description}</p>
          <p>{mergedLabels.instruction}</p>
        </div>

        <label className="mpc-text-field">
          <span>{mergedLabels.codeLabel}</span>
          <input value={code} onChange={(event) => setCode(event.target.value)} />
          <small>{mergedLabels.privacyText}</small>
        </label>

        <button
          type="button"
          className="mpc-primary-button"
          disabled={!canContinue}
          onClick={() => canContinue && onContinue(code.trim())}
        >
          {mergedLabels.continueLabel}
        </button>
      </main>
    </div>
  );
}

