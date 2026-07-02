import { useState } from "react";
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
                : "text-[var(--uc-text)] hover:text-[var(--uc-action)]"
            }`}
            disabled={isDisabled}
            aria-label={disabled ? "Screenshot disabled in Design System" : "Screenshot options"}
            title={disabled ? "Screenshot disabled in Design System" : "Screenshot"}
          >
            <ScreenshotOptionsIcon />
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

function ScreenshotOptionsIcon() {
  return (
    <svg
      aria-hidden="true"
      className="block size-6"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 11.3126C10.8612 11.3126 9.93819 12.2356 9.93819 13.3745C9.93819 14.5133 10.8612 15.4363 12 15.4363C13.1389 15.4363 14.0619 14.5133 14.0619 13.3745C14.0619 12.2356 13.1389 11.3126 12 11.3126Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.9039 9.93801C19.3348 9.93801 18.873 9.47685 18.873 8.90708C18.873 8.33732 19.3348 7.87616 19.9039 7.87616C20.473 7.87616 20.9348 8.33732 20.9348 8.90708C20.9348 9.47685 20.473 9.93801 19.9039 9.93801ZM14.9155 16.2899C14.1423 17.0638 13.0942 17.4982 12.0001 17.4982C9.72307 17.4982 7.87634 15.6515 7.87634 13.3745C7.87634 11.0975 9.72307 9.25076 12.0001 9.25076C14.277 9.25076 16.1238 11.0975 16.1238 13.3745C16.1238 14.4686 15.6894 15.5168 14.9155 16.2899ZM20.2474 5.8143H8.56357L7.189 3.75244H3.75256L2.37799 5.8143H1.00342V17.4982C1.10307 18.9731 2.27765 20.147 3.75256 20.2473H22.9966V8.56345C22.8962 7.08853 21.7224 5.91396 20.2474 5.8143Z"
        fill="currentColor"
      />
    </svg>
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
