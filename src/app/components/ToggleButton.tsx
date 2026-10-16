import type { ReactNode } from "react";
import { TOGGLE_ARTWORK } from "./contracts/toggleArtwork";
import { TOGGLE_BUTTON_SOURCE, type ToggleButtonVariant } from './contracts/toggleButton';
import { toggleButtonWeb } from './contracts/toggleButtonWeb';
export { TOGGLE_BUTTON_SOURCE } from './contracts/toggleButton';

import { cn } from "@/app/components/ui/utils";

export interface ToggleButtonProps {
  ariaLabel?: string;
  checked: boolean;
  className?: string;
  disabled?: boolean;
  onToggle?: (checked: boolean) => void;
  variant?: ToggleButtonVariant;
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
        d={TOGGLE_ARTWORK.checkedTrackPath}
        fill={toggleButtonWeb({ checked: true }).trackColor}
        stroke={toggleButtonWeb({ checked: true }).borderColor}
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
        fill={toggleButtonWeb({ checked: false }).trackColor}
        stroke={toggleButtonWeb({ checked: false }).borderColor}
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
        d={TOGGLE_ARTWORK.checkedKnobPath}
        fill={toggleButtonWeb({ checked: true }).knobColor}
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
        fill={toggleButtonWeb({ checked: false }).knobColor}
      />
    </svg>
  );
}

function ToggleTrack({ checked }: { checked: boolean }) {
  return checked ? <CheckedTrackSvg /> : <UncheckedTrackSvg />;
}

function ToggleKnob({ checked }: { checked: boolean }) {
  const web = toggleButtonWeb({ checked });
  return (
    <span
      className={cn(
        web.knobClass,
        web.knobPositionClass,
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
        toggleButtonWeb({ checked }).frameClass,
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
  variant = 'baseline',
}: ToggleButtonProps) {
  const web = toggleButtonWeb({ checked, disabled, interactive: Boolean(onToggle), variant });
  if (!onToggle) {
    return <ToggleFrame checked={checked} className={className} />;
  }

  return (
    <button
      aria-checked={checked}
      aria-label={ariaLabel}
      className={cn(
        web.buttonClass,
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
