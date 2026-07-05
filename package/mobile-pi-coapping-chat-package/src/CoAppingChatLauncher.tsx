import { useState } from "react";
import { CoAppingChatAssistant, type CoAppingChatAssistantProps } from "./CoAppingChatAssistant";
import { ChatBubbleIcon } from "./icons";

export interface CoAppingChatLauncherProps
  extends Omit<CoAppingChatAssistantProps, "onClose"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  buttonLabel?: string;
}

export function CoAppingChatLauncher({
  open,
  defaultOpen = false,
  onOpenChange,
  buttonLabel = "Open Smart Assistant chat",
  ...assistantProps
}: CoAppingChatLauncherProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open ?? internalOpen;

  const setOpen = (nextOpen: boolean) => {
    if (open === undefined) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="mpc-chat-launcher" aria-label={buttonLabel}>
        <ChatBubbleIcon />
        <span className="mpc-chat-launcher-status" />
      </button>

      {isOpen && <CoAppingChatAssistant {...assistantProps} onClose={() => setOpen(false)} />}
    </>
  );
}

