import type { ReactNode } from "react";

import { cn } from "@/app/components/ui/utils";

export const TOGGLE_BUTTON_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  figmaComponentName: "Toggle",
  sourceNodeIds: {
    checked: "9105:1688",
    unchecked: "9105:1689",
  },
  width: 60,
  height: 30,
  knobSize: 22,
  knobInset: 4,
  borderWidth: 2,
} as const;

export interface ToggleButtonProps {
  ariaLabel?: string;
  checked: boolean;
  className?: string;
  disabled?: boolean;
  onToggle?: (checked: boolean) => void;
}

function CheckedTrackSvg() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      fill="none"
      viewBox="0 0 60 30"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M40.6465 1C41.9299 1.00237 43.1808 1.0168 44.4307 1.08789H44.4316C45.9361 1.17262 47.366 1.35161 48.7734 1.74121H48.7744C51.728 2.558 54.2985 4.26043 56.1553 6.66895C58.0016 9.0628 59 11.9924 59 14.999C59 18.0095 58.0016 20.9372 56.1553 23.3311C54.2984 25.7388 51.7279 27.442 48.7744 28.2588H48.7734C47.3662 28.6483 45.9361 28.8264 44.4307 28.9121C42.7642 29.0069 41.0959 28.999 39.3838 28.999C39.3364 28.999 34.6733 28.9998 30.0117 29H20.6484L18.0801 28.9912C17.2368 28.9813 16.403 28.9595 15.5693 28.9121C14.0649 28.8264 12.6348 28.6483 11.2275 28.2588H11.2266C8.27312 27.442 5.70262 25.7388 3.8457 23.3311C1.99927 20.937 1 18.0093 1 15C1.00002 11.9925 1.99928 9.06293 3.8457 6.66895C5.7025 4.26043 8.27296 2.558 11.2266 1.74121H11.2275C12.635 1.35161 14.0649 1.17262 15.5684 1.08789H15.5693C16.8201 1.01679 18.0713 1.00236 19.3408 1H40.6465Z"
        fill="var(--uc-static-white)"
        stroke="var(--uc-action)"
        strokeWidth="2"
      />
    </svg>
  );
}

function UncheckedTrackSvg() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      fill="none"
      viewBox="0 0 60 30"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="1"
        y="1"
        width="58"
        height="28"
        rx="14"
        fill="var(--uc-static-white)"
        stroke="var(--uc-text-muted)"
        strokeWidth="2"
      />
    </svg>
  );
}

function CheckedKnobSvg() {
  return (
    <svg
      aria-hidden="true"
      className="h-[22px] w-[22px]"
      fill="none"
      viewBox="0 0 22 22"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M14.8727 8.16475C15.6764 7.36175 16.9785 7.36175 17.7808 8.16475L10.1448 15.8125L4.8125 10.4809C5.6155 9.67794 6.91763 9.67794 7.72063 10.4809L10.1448 12.9044L14.8727 8.16475ZM11 0C4.92456 0 0 4.92456 0 11C0 17.0748 4.92456 22 11 22C17.0754 22 22 17.0748 22 11C22 4.92456 17.0754 0 11 0V0Z"
        fill="var(--uc-action)"
        fillRule="evenodd"
      />
    </svg>
  );
}

function UncheckedKnobSvg() {
  return (
    <svg
      aria-hidden="true"
      className="h-[22px] w-[22px]"
      fill="none"
      viewBox="0 0 22 22"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="11"
        cy="11"
        r="11"
        fill="var(--uc-text-muted)"
      />
    </svg>
  );
}

function ToggleTrack({ checked }: { checked: boolean }) {
  return checked ? <CheckedTrackSvg /> : <UncheckedTrackSvg />;
}

function ToggleKnob({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "absolute top-[4px] h-[22px] w-[22px] transition-[left] duration-200 ease-out",
        checked ? "left-[34px]" : "left-[4px]",
      )}
    >
      {checked ? <CheckedKnobSvg /> : <UncheckedKnobSvg />}
    </span>
  );
}

function ToggleVisual({ checked }: { checked: boolean }) {
  return (
    <>
      <ToggleTrack checked={checked} />
      <ToggleKnob checked={checked} />
    </>
  );
}

function ToggleFrame({
  checked,
  className,
  children,
}: {
  checked: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex h-[30px] w-[60px] shrink-0 overflow-hidden",
        className,
      )}
      data-component="ToggleButton"
      data-figma-schema={TOGGLE_BUTTON_SOURCE.schema}
    >
      <ToggleVisual checked={checked} />
      {children}
    </span>
  );
}

export default function ToggleButton({
  ariaLabel,
  checked,
  className,
  disabled = false,
  onToggle,
}: ToggleButtonProps) {
  if (!onToggle) {
    return <ToggleFrame checked={checked} className={className} />;
  }

  return (
    <button
      aria-checked={checked}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--uc-action)_30%,transparent)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      disabled={disabled}
      onClick={() => onToggle(!checked)}
      role="switch"
      type="button"
    >
      <ToggleFrame checked={checked} />
    </button>
  );
}
