import { useId, useMemo, useRef } from "react";
import { cn } from "@/app/components/ui/utils";

export type CodeFieldVisualState = "empty" | "filled" | "error" | "disabled";

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

const CODE_SLOT_SIZE = {
  width: 44,
  height: 64,
} as const;

function normalizeCode(value: string, length: number) {
  return value.replace(/\D/g, "").slice(0, length);
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
  const normalizedValue = normalizeCode(value, length);
  const slots = useMemo(
    () => Array.from({ length }, (_, index) => normalizedValue[index] ?? ""),
    [length, normalizedValue],
  );
  const isDisabled = disabled || visualState === "disabled";
  const isError = Boolean(errorText || errorText2) || visualState === "error";
  const helperId = isError ? `${generatedId}-message` : undefined;

  const updateSlot = (slotIndex: number, nextValue: string) => {
    if (isDisabled) return;

    const digits = normalizeCode(nextValue, length);
    const nextSlots = [...slots];

    if (digits.length > 1) {
      digits.split("").forEach((digit, offset) => {
        const index = slotIndex + offset;
        if (index < length) {
          nextSlots[index] = digit;
        }
      });
      onChange?.(nextSlots.join(""));
      inputRefs.current[Math.min(slotIndex + digits.length, length - 1)]?.focus();
      return;
    }

    nextSlots[slotIndex] = digits;
    onChange?.(nextSlots.join(""));

    if (digits && slotIndex < length - 1) {
      inputRefs.current[slotIndex + 1]?.focus();
    }
  };

  const handleBackspace = (slotIndex: number) => {
    if (isDisabled) return;

    const nextSlots = [...slots];
    if (nextSlots[slotIndex]) {
      nextSlots[slotIndex] = "";
      onChange?.(nextSlots.join(""));
      return;
    }

    if (slotIndex > 0) {
      nextSlots[slotIndex - 1] = "";
      onChange?.(nextSlots.join(""));
      inputRefs.current[slotIndex - 1]?.focus();
    }
  };

  const slotBorder = isDisabled
    ? "border-[var(--uc-neutral-650)]"
    : isError
      ? "border-[var(--uc-status-red)]"
      : "border-[var(--uc-neutral-700)]";
  const slotText = isDisabled ? "text-[var(--uc-neutral-650)]" : "text-[var(--uc-text)]";

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
              "outline-none transition-colors focus:border-[var(--uc-action)] focus:ring-2 focus:ring-[var(--uc-action)] focus:ring-offset-2 focus:ring-offset-[var(--uc-app-bg)]",
              "disabled:cursor-default disabled:bg-[var(--uc-surface-muted)] disabled:opacity-100",
              slotBorder,
              slotText,
            )}
            style={CODE_SLOT_SIZE}
            onChange={(event) => updateSlot(index, event.target.value)}
            onKeyDown={(event) => {
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
