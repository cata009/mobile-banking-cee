import { useState } from "react";
import { AppIcon } from "@/app/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  createPhoneFigmaJson,
  downloadPhoneScreenshot,
  type PhoneScreenshotMode,
} from "@/app/utils/phoneScreenshot";

interface PhoneScreenshotControlProps {
  disabled?: boolean;
  getScreenElement?: () => HTMLElement | null;
}

const SCREENSHOT_OPTIONS: Array<{ mode: PhoneScreenshotMode; label: string }> = [
  { mode: "full", label: "Capture entire screen" },
  { mode: "visible", label: "Capture visible screen" },
];

const FIGMA_JSON_OPTIONS: Array<{ mode: PhoneScreenshotMode; label: string }> = [
  { mode: "visible", label: "Generate visible JSON" },
  { mode: "full", label: "Generate entire screen JSON" },
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

  const handleGenerateFigmaJson = async (mode: PhoneScreenshotMode) => {
    if (isDisabled) return;

    const screenElement = getScreenElement();
    if (!screenElement) return;

    setIsCapturing(true);
    try {
      const delivery = await deliverGeneratedJson(
        () => createPhoneFigmaJson({ screenElement, mode }),
        `unicredit-${mode}-screen.json`,
      );
      console.log(`Figma screen JSON ${delivery === "clipboard" ? "copied to clipboard" : "downloaded"} (${mode}).`);
    } catch (error) {
      console.error("Phone Figma JSON export failed", error);
      window.alert("Figma JSON could not be generated. Please try again.");
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
          {FIGMA_JSON_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={`json-${option.mode}`}
              className="cursor-pointer rounded-[4px] px-3 py-2 font-['UniCredit',sans-serif] text-[14px] font-bold text-[var(--uc-text)] focus:bg-[var(--uc-surface-muted)] focus:text-[var(--uc-text)]"
              disabled={isDisabled}
              onSelect={() => void handleGenerateFigmaJson(option.mode)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

async function deliverGeneratedJson(createJson: () => Promise<string>, fileName: string) {
  const jsonPromise = createJson();

  if (navigator.clipboard?.write && typeof ClipboardItem !== "undefined") {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": jsonPromise.then((json) => new Blob([json], { type: "text/plain" })),
        }),
      ]);
      await jsonPromise;
      return "clipboard" as const;
    } catch {
      // Fall through to direct text copy or file download when browser permissions block async clipboard writes.
    }
  }

  const json = await jsonPromise;
  try {
    await copyTextToClipboard(json);
    return "clipboard" as const;
  } catch {
    downloadTextFile(json, fileName);
    return "download" as const;
  }
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the legacy copy path when browser permissions block Clipboard API.
    }
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "readonly");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();

  try {
    const copied = document.execCommand("copy");
    if (!copied) {
      throw new Error("Clipboard fallback copy command failed.");
    }
  } finally {
    textArea.remove();
  }
}

function downloadTextFile(text: string, fileName: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
