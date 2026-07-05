import { defaultTerminateLabels } from "./defaults";
import type { CoAppingTerminateLabels } from "./types";

export interface TerminateSessionPopupProps {
  onCancel: () => void;
  onTerminate: () => void;
  labels?: Partial<CoAppingTerminateLabels>;
}

export function TerminateSessionPopup({
  onCancel,
  onTerminate,
  labels,
}: TerminateSessionPopupProps) {
  const mergedLabels = { ...defaultTerminateLabels, ...labels };

  return (
    <div className="mpc-dialog">
      <button type="button" className="mpc-dialog-backdrop" onClick={onCancel} aria-label={mergedLabels.cancel} />
      <section className="mpc-dialog-card" role="dialog" aria-modal="true" aria-labelledby="mpc-terminate-title">
        <div className="mpc-dialog-body">
          <h2 id="mpc-terminate-title">{mergedLabels.title}</h2>
          <p>{mergedLabels.body}</p>
        </div>
        <div className="mpc-dialog-actions">
          <button type="button" onClick={onCancel}>{mergedLabels.cancel}</button>
          <button type="button" onClick={onTerminate}>{mergedLabels.confirm}</button>
        </div>
      </section>
    </div>
  );
}

