import { useMemo, useRef, useState } from "react";
import { AppIcon, type IconName } from "@/app/components/icons";

export type TextFieldVisualState =
  | "empty"
  | "on-focus"
  | "filled"
  | "error-filled"
  | "error-empty"
  | "disabled-empty"
  | "disabled-filled"
  | "multiple-filled";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  helperText2?: string;
  errorText?: string;
  errorText2?: string;
  placeholder?: string;
  disabled?: boolean;
  visualState?: TextFieldVisualState;
  trailingIconName?: IconName;
  trailingIconColor?: string;
  multipleValues?: string[];
  multipleCount?: number;
}

const DISABLED_COLOR = "var(--uc-neutral-650)";

export default function TextField({
  label,
  value,
  onChange,
  helperText,
  helperText2,
  errorText,
  errorText2,
  placeholder = "",
  disabled = false,
  visualState,
  trailingIconName,
  trailingIconColor,
  multipleValues,
  multipleCount,
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const derivedState: TextFieldVisualState = useMemo(() => {
    if (visualState) return visualState;
    if (disabled) return value.trim().length > 0 ? "disabled-filled" : "disabled-empty";
    if (errorText || errorText2) return value.trim().length > 0 ? "error-filled" : "error-empty";
    if (isFocused) return "on-focus";
    return value.trim().length > 0 ? "filled" : "empty";
  }, [disabled, errorText, errorText2, isFocused, value, visualState]);

  const isDisabled = derivedState === "disabled-empty" || derivedState === "disabled-filled";
  const isError = derivedState === "error-filled" || derivedState === "error-empty";
  const isActive = derivedState === "on-focus";
  const isMultiple = derivedState === "multiple-filled";
  const hasValue = derivedState === "filled" || derivedState === "error-filled" || derivedState === "disabled-filled" || isMultiple || value.trim().length > 0;
  const shouldFloatLabel = isActive || hasValue;

  const labelColor = isDisabled
    ? DISABLED_COLOR
    : isActive
      ? "var(--uc-action)"
      : "var(--uc-text-muted)";

  const valueColor = isDisabled ? DISABLED_COLOR : "var(--uc-text)";
  const dividerColor = isDisabled
    ? DISABLED_COLOR
    : isError
      ? "var(--uc-status-red)"
      : isActive
        ? "var(--uc-action)"
        : "var(--uc-text-subtle)";
  const helperColor = isDisabled
    ? DISABLED_COLOR
    : isError
      ? "var(--uc-status-red)"
      : "var(--uc-text-muted)";

  const descriptionText1 = isError ? errorText : helperText;
  const descriptionText2 = isError ? errorText2 : helperText2;
  const displayedMultipleValues = multipleValues?.join("; ") ?? value;
  const effectiveMultipleCount = multipleCount ?? multipleValues?.length ?? 0;
  const inputPlaceholder = shouldFloatLabel ? placeholder : label;
  const placeholderColorClass = shouldFloatLabel
    ? "placeholder:text-[var(--uc-text-subtle)]"
    : isDisabled
      ? "placeholder:text-[var(--uc-neutral-650)]"
      : "placeholder:text-[var(--uc-text)]";

  return (
    <div className="w-full">
      <div className="relative">
        {shouldFloatLabel ? (
          <label
            className="uc-type-n5 block"
            style={{ color: labelColor }}
          >
            {label}
          </label>
        ) : null}

        <div className={`${shouldFloatLabel ? "mt-[4px]" : ""} flex items-end`}>
          <div
            className={`flex min-w-0 flex-1 items-end border-b pb-[3px] ${isDisabled ? "cursor-default" : "cursor-text"}`}
            style={{
              borderBottomColor: dividerColor,
              borderBottomWidth: "0.5px",
            }}
            onClick={() => {
              if (!isDisabled && !isMultiple) {
                inputRef.current?.focus();
              }
            }}
          >
            {isMultiple ? (
              <div className="min-w-0 flex flex-1 items-baseline gap-[8px]">
                <span
                  className="uc-type-p1 min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ color: valueColor }}
                  title={displayedMultipleValues}
                >
                  {displayedMultipleValues}
                </span>
                {effectiveMultipleCount > 0 ? (
                  <span
                    className="uc-type-h2 shrink-0"
                    style={{ color: valueColor }}
                  >
                    ({effectiveMultipleCount})
                  </span>
                ) : null}
              </div>
            ) : (
              <input
                ref={inputRef}
                type="text"
                value={hasValue ? value : ""}
                onChange={(event) => onChange(event.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={inputPlaceholder}
                disabled={isDisabled}
                className={`uc-type-p1 min-w-0 flex-1 bg-transparent outline-none disabled:cursor-default ${placeholderColorClass}`}
                style={{ color: valueColor }}
              />
            )}
          </div>

          <span className="ml-[12px] grid h-[32px] w-[32px] shrink-0 place-items-center" aria-hidden={!trailingIconName}>
            {trailingIconName ? (
              <AppIcon
                name={trailingIconName}
                color={trailingIconColor ?? (isDisabled ? DISABLED_COLOR : "var(--uc-text)")}
              />
            ) : null}
          </span>
        </div>

        {descriptionText1 || descriptionText2 ? (
          <div className="mt-[6px] flex flex-col">
            {descriptionText1 ? (
              <p
                className="uc-type-n5"
                style={{ color: helperColor }}
              >
                {descriptionText1}
              </p>
            ) : null}
            {descriptionText2 ? (
              <p
                className="uc-type-n5"
                style={{ color: helperColor }}
              >
                {descriptionText2}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
