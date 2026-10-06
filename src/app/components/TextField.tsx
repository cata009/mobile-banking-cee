import { useId, useMemo, useRef, useState, type HTMLAttributes } from "react";
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
  trailingIconAction?: {
    ariaLabel: string;
    onClick: () => void;
  };
  trailingIconPlacement?: "inline" | "floating";
  multipleValues?: string[];
  multipleCount?: number;
  ariaLabel?: string;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  forceFloatLabel?: boolean;
  readOnly?: boolean;
  suffix?: string;
  suffixOutsideDivider?: boolean;
  suffixClassName?: string;
  onActivate?: () => void;
  onFocus?: () => void;
  /** Called when the input loses focus, e.g. to commit a clamped numeric draft. */
  onBlur?: () => void;
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
  trailingIconAction,
  trailingIconPlacement = "inline",
  multipleValues,
  multipleCount,
  ariaLabel,
  ariaInvalid = false,
  ariaDescribedBy,
  inputMode,
  maxLength,
  forceFloatLabel = false,
  readOnly = false,
  suffix,
  suffixOutsideDivider = false,
  suffixClassName = "",
  onActivate,
  onFocus,
  onBlur,
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

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
  const shouldFloatLabel = forceFloatLabel || isActive || hasValue;

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
  const hasFloatingTrailingIcon = trailingIconPlacement === "floating" && Boolean(trailingIconName);
  const helperTextWidth = trailingIconName && trailingIconPlacement === "inline"
    ? "calc(100% - 44px)"
    : "100%";
  const displayedMultipleValues = multipleValues?.join("; ") ?? value;
  const effectiveMultipleCount = multipleCount ?? multipleValues?.length ?? 0;
  const inputPlaceholder = shouldFloatLabel ? placeholder : label;
  const placeholderColorClass = shouldFloatLabel
    ? "placeholder:text-[var(--uc-text-subtle)]"
    : isDisabled
      ? "placeholder:text-[var(--uc-neutral-650)]"
      : "placeholder:text-[var(--uc-text)]";

  return (
    <div
      className="w-full"
      data-component="TextField"
      onClick={onActivate}
    >
      <div className="relative">
        {shouldFloatLabel ? (
          <label
            htmlFor={inputId}
            className="uc-type-n5 line-clamp-2 block"
            style={{ color: labelColor }}
          >
            {label}
          </label>
        ) : null}

        <div className={`${shouldFloatLabel ? "mt-[4px]" : ""} flex items-end ${hasFloatingTrailingIcon ? "pr-[44px]" : ""}`}>
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
                id={inputId}
                type="text"
                aria-label={ariaLabel ?? label}
                aria-invalid={ariaInvalid || undefined}
                aria-describedby={ariaDescribedBy}
                inputMode={inputMode}
                maxLength={maxLength}
                readOnly={readOnly}
                value={hasValue ? value : ""}
                onChange={(event) => onChange(event.target.value)}
                onFocus={() => {
                  setIsFocused(true);
                  onFocus?.();
                }}
                onBlur={() => {
                  setIsFocused(false);
                  onBlur?.();
                }}
                onKeyDown={(event) => {
                  if (onActivate && (event.key === "Enter" || event.key === " ")) {
                    event.preventDefault();
                    onActivate();
                  }
                }}
                placeholder={inputPlaceholder}
                disabled={isDisabled}
                className={`uc-type-p1 min-w-0 flex-1 bg-transparent outline-none disabled:cursor-default ${placeholderColorClass}`}
                style={{ color: valueColor }}
              />
            )}
            {suffix && !suffixOutsideDivider ? (
              <span className={`uc-type-p1 ml-[8px] shrink-0 ${suffixClassName}`} style={{ color: valueColor }}>
                {suffix}
              </span>
            ) : null}
          </div>

          {suffix && suffixOutsideDivider ? (
            <span className={`uc-type-p1 ml-[12px] shrink-0 ${suffixClassName}`} style={{ color: valueColor }}>
              {suffix}
            </span>
          ) : null}

          {!hasFloatingTrailingIcon && (trailingIconName || !suffixOutsideDivider) ? (
            trailingIconAction && trailingIconName ? (
              <button
                type="button"
                aria-label={trailingIconAction.ariaLabel}
                onClick={(event) => {
                  event.stopPropagation();
                  trailingIconAction.onClick();
                }}
                className="ml-[12px] grid h-[32px] w-[32px] shrink-0 place-items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
              >
                <AppIcon
                  name={trailingIconName}
                  color={trailingIconColor ?? (isDisabled ? DISABLED_COLOR : "var(--uc-text)")}
                />
              </button>
            ) : (
              <span className="ml-[12px] grid h-[32px] w-[32px] shrink-0 place-items-center" aria-hidden={!trailingIconName}>
                {trailingIconName ? (
                  <AppIcon
                    name={trailingIconName}
                    color={trailingIconColor ?? (isDisabled ? DISABLED_COLOR : "var(--uc-text)")}
                  />
                ) : null}
              </span>
            )
          ) : null}
        </div>

        {hasFloatingTrailingIcon && trailingIconName ? (
          trailingIconAction ? (
            <button
              type="button"
              aria-label={trailingIconAction.ariaLabel}
              onClick={(event) => {
                event.stopPropagation();
                trailingIconAction.onClick();
              }}
              className={`absolute right-0 grid h-[32px] w-[32px] place-items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${shouldFloatLabel ? "top-[12px]" : "top-0"}`}
            >
              <AppIcon
                name={trailingIconName}
                color={trailingIconColor ?? (isDisabled ? DISABLED_COLOR : "var(--uc-text)")}
              />
            </button>
          ) : (
            <span
              className={`absolute right-0 grid h-[32px] w-[32px] place-items-center ${shouldFloatLabel ? "top-[12px]" : "top-0"}`}
              aria-hidden="true"
            >
              <AppIcon
                name={trailingIconName}
                color={trailingIconColor ?? (isDisabled ? DISABLED_COLOR : "var(--uc-text)")}
              />
            </span>
          )
        ) : null}

        {descriptionText1 || descriptionText2 ? (
          <div className="mt-[6px] flex flex-col" style={{ width: helperTextWidth }}>
            {descriptionText1 ? (
              <p
                className="uc-type-n5 max-w-full break-words"
                style={{ color: helperColor }}
              >
                {descriptionText1}
              </p>
            ) : null}
            {descriptionText2 ? (
              <p
                className="uc-type-n5 max-w-full break-words"
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
