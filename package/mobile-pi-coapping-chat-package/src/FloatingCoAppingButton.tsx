import { PanelIcon } from "./icons";

export interface FloatingCoAppingButtonProps {
  onClick: () => void;
  showSlideIn?: boolean;
  label?: string;
}

export function FloatingCoAppingButton({
  onClick,
  showSlideIn = false,
  label = "Co-apping session active",
}: FloatingCoAppingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={showSlideIn ? "mpc-side-tab mpc-side-tab-animate" : "mpc-side-tab"}
      aria-label={label}
    >
      <span className="mpc-side-tab-shape" aria-hidden="true" />
      <span className="mpc-side-tab-icon">
        <PanelIcon name="share" />
      </span>
    </button>
  );
}

