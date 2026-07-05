import { defaultPanelLabels } from "./defaults";
import { PanelIcon } from "./icons";
import type { CoAppingPanelLabels } from "./types";

export interface CoAppingPanelProps {
  labels?: Partial<CoAppingPanelLabels>;
  coAppingAvailable?: boolean;
  onClose?: () => void;
  onStartCoApping?: () => void;
}

function DragHandle({ onClose }: { onClose?: () => void }) {
  return (
    <button type="button" className="mpc-panel-handle" onClick={onClose} aria-label="Close panel">
      <span />
      <span />
    </button>
  );
}

function PanelRow({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: "smart" | "rates" | "location" | "share";
  onClick?: () => void;
}) {
  return (
    <button type="button" className="mpc-panel-row" onClick={onClick}>
      <span className="mpc-panel-row-icon">
        <PanelIcon name={icon} />
      </span>
      <span className="mpc-panel-row-label">{label}</span>
    </button>
  );
}

export function CoAppingPanel({
  labels,
  coAppingAvailable = true,
  onClose,
  onStartCoApping,
}: CoAppingPanelProps) {
  const mergedLabels = { ...defaultPanelLabels, ...labels };

  return (
    <div className="mpc-panel-overlay" onClick={(event) => event.target === event.currentTarget && onClose?.()}>
      <div className="mpc-panel-sheet">
        <DragHandle onClose={onClose} />
        <div className="mpc-panel-rows">
          <PanelRow label={mergedLabels.aboutSmartBanking} icon="smart" />
          <PanelRow label={mergedLabels.exchangeRates} icon="rates" />
          <PanelRow label={mergedLabels.findAtmBranches} icon="location" />
          {coAppingAvailable && (
            <PanelRow
              label={mergedLabels.startCoAppingSession}
              icon="share"
              onClick={onStartCoApping}
            />
          )}
        </div>
      </div>
    </div>
  );
}

