import { useId, useRef } from "react";
import { cn } from "@/app/components/ui/utils";

import type { CodeFieldVisualState } from './contracts/codeField';
export type { CodeFieldVisualState } from './contracts/codeField';
import { updateCodeSlot, backspaceCodeSlot } from './contracts/codeField';
import { codeFieldWeb } from './contracts/codeFieldWeb';

interface CodeFieldProps {
  value: string;
  onChange?: (value: string) => void;
  length?: number;
  errorText?: string;
  errorText2?: string;
  disabled?: boolean;
  visualState?: CodeFieldVisualState;
  ariaLabel?: string;
  className?: string;
}

export default function CodeField({
  value,
  onChange,
  length = 4,
  errorText,
  errorText2,
  disabled = false,
  visualState,
  ariaLabel = "Verification code",
  className,
}: CodeFieldProps) {
  const generatedId = useId();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const web = codeFieldWeb({ value, length, disabled, visualState, errorText, errorText2 });
  const { slots, isDisabled, isError, slotBorder, slotText } = web;
  const helperId = isError ? `${generatedId}-message` : undefined;

  const updateSlot = (slotIndex: number, nextValue: string) => {
    const update = updateCodeSlot(slots, slotIndex, nextValue, length, isDisabled);
    if (update.value !== undefined) onChange?.(update.value);
    if (update.focusIndex !== undefined) inputRefs.current[update.focusIndex]?.focus();
  };
  const handleBackspace = (slotIndex: number) => {
    const update = backspaceCodeSlot(slots, slotIndex, isDisabled);
    if (update.value !== undefined) onChange?.(update.value);
    if (update.focusIndex !== undefined) inputRefs.current[update.focusIndex]?.focus();
  };

  return (
    <div
      className={cn("flex w-full max-w-[327px] flex-col items-center", className)}
      role="group"
      aria-label={ariaLabel}
      aria-describedby={helperId}
    >
      <div className="flex w-fit items-center justify-center gap-[16px]">
        {slots.map((slot, index) => (
          <input
            key={index}
            ref={(node) => {
              inputRefs.current[index] = node;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            value={slot}
            disabled={isDisabled}
            aria-label={`${ariaLabel} digit ${index + 1} of ${length}`}
            aria-invalid={isError}
            aria-describedby={helperId}
            className={cn(
              "uc-type-n1 rounded-[8px] border bg-[var(--uc-surface)] p-0 text-center tabular-nums",
              "outline-none transition-colors focus:border-[var(--uc-action)]",
              "disabled:cursor-default disabled:opacity-100",
              slotBorder,
              slotText,
            )}
            style={web.slotSize}
            onChange={(event) => updateSlot(index, event.target.value)}
            onKeyDown={(event) => {
              if (isDisabled) return;
              if (event.key === "Backspace") {
                event.preventDefault();
                handleBackspace(index);
              }
              if (event.key === "ArrowLeft" && index > 0) {
                event.preventDefault();
                inputRefs.current[index - 1]?.focus();
              }
              if (event.key === "ArrowRight" && index < length - 1) {
                event.preventDefault();
                inputRefs.current[index + 1]?.focus();
              }
            }}
            onPaste={(event) => {
              event.preventDefault();
              updateSlot(index, event.clipboardData.getData("text"));
            }}
          />
        ))}
      </div>

      {isError && (errorText || errorText2) ? (
        <div id={helperId} className="mt-[8px] flex w-[224px] flex-col gap-[3px] text-left">
          {errorText ? (
            <p className="uc-type-n5 text-[var(--uc-status-red)] [line-height:normal]">
              {errorText}
            </p>
          ) : null}
          {errorText2 ? (
            <p className="uc-type-n5 text-[var(--uc-status-red)] [line-height:normal]">
              {errorText2}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
