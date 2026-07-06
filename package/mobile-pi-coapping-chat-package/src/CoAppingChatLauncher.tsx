import { useState } from "react";
import { CoAppingChatAssistant, type CoAppingChatAssistantProps } from "./CoAppingChatAssistant";
import { ExportIcon } from "./icons";

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
        <span className="mpc-chat-launcher-edge-shape" aria-hidden="true" />
        <span className="mpc-chat-launcher-icon">
          <ExportIcon />
        </span>
      </button>

      {isOpen && <CoAppingChatAssistant {...assistantProps} onClose={() => setOpen(false)} />}
    </>
  );
}
