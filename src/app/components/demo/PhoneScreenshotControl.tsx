import { useState } from "react";
import { AppIcon } from "@/app/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { downloadPhoneScreenshot, type PhoneScreenshotMode } from "@/app/utils/phoneScreenshot";

interface PhoneScreenshotControlProps {
  disabled?: boolean;
  getScreenElement?: () => HTMLElement | null;
}

const SCREENSHOT_OPTIONS: Array<{ mode: PhoneScreenshotMode; label: string }> = [
  { mode: "full", label: "Capture entire screen" },
  { mode: "visible", label: "Capture visible screen" },
];

function getDefaultPhoneScreenElement() {
  const screenElement = document.querySelector("[data-phone-screen='true']");
  return screenElement instanceof HTMLElement ? screenElement : null;
}

export function PhoneScreenshotControl({
  disabled = false,
  getScreenElement = getDefaultPhoneScreenElement,
}: PhoneScreenshotControlProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const isDisabled = disabled || isCapturing;

  const handleCapture = async (mode: PhoneScreenshotMode) => {
    if (isDisabled) return;

    const screenElement = getScreenElement();
    if (!screenElement) return;

    setIsCapturing(true);
    try {
      await downloadPhoneScreenshot({ screenElement, mode });
    } catch (error) {
      console.error("Phone screenshot failed", error);
      window.alert("Screenshot could not be generated. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="relative" data-phone-screenshot-control="true">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={`grid h-[32px] w-[32px] place-items-center transition-colors ${
              isDisabled
                ? "cursor-not-allowed text-[var(--uc-text-subtle)] opacity-50"
                : "text-[var(--uc-text)] hover:text-[var(--uc-brand)]"
            }`}
            disabled={isDisabled}
            aria-label={disabled ? "Screenshot disabled in Design System" : "Screenshot options"}
            title={disabled ? "Screenshot disabled in Design System" : "Screenshot"}
          >
            <AppIcon name="camera" size={18} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="z-[10000] min-w-[188px] rounded-[6px] border-[var(--uc-border)] bg-[var(--uc-surface)] p-1 text-[var(--uc-text)] shadow-xl"
          side="bottom"
          sideOffset={8}
        >
          {SCREENSHOT_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.mode}
              className="cursor-pointer rounded-[4px] px-3 py-2 font-['UniCredit',sans-serif] text-[14px] font-bold text-[var(--uc-text)] focus:bg-[var(--uc-surface-muted)] focus:text-[var(--uc-text)]"
              disabled={isDisabled}
              onSelect={() => void handleCapture(option.mode)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
