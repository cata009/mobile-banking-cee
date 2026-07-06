import { useState } from "react";
import { CoAppingChatAssistant, type CoAppingChatAssistantProps } from "./CoAppingChatAssistant";
import { ExportIcon } from "./icons";

const EDGE_TAB_PATH =
  "M44 113.013C43.1647 111.301 42.2428 109.538 41.2227 107.716C31.1116 89.658 0.00122113 81.8065 6.06534e-08 57.4678C-0.00103405 33.1289 26.4446 26.8479 38.1113 9.5752C40.4191 6.15845 42.3666 3.01221 44 0V113.013Z";

export interface CoAppingChatLauncherProps
  extends Omit<CoAppingChatAssistantProps, "onClose"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onLauncherOpen?: () => void;
  buttonLabel?: string;
  variant?: "bubble" | "edge-tab";
}

export function CoAppingChatLauncher({
  open,
  defaultOpen = false,
  onOpenChange,
  onLauncherOpen,
  buttonLabel = "Open Smart Assistant chat",
  variant = "bubble",
  ...assistantProps
}: CoAppingChatLauncherProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open ?? internalOpen;
  const launcherClassName = [
    "mpc-chat-launcher",
    variant === "edge-tab" ? "mpc-chat-launcher-edge-tab" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const setOpen = (nextOpen: boolean) => {
    if (open === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          onLauncherOpen?.();
          setOpen(true);
        }}
        className={launcherClassName}
        aria-label={buttonLabel}
      >
        {variant === "edge-tab" ? (
          <svg
            className="mpc-chat-launcher-edge-shape"
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 44 113.013"
            preserveAspectRatio="none"
          >
            <path d={EDGE_TAB_PATH} />
          </svg>
        ) : (
          <span className="mpc-chat-launcher-edge-shape" aria-hidden="true" />
        )}
        <span className="mpc-chat-launcher-icon">
          <ExportIcon />
        </span>
      </button>

      {isOpen && <CoAppingChatAssistant {...assistantProps} onClose={() => setOpen(false)} />}
    </>
  );
}
