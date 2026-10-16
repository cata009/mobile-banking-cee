import type { InputHTMLAttributes } from "react";
import TextField, { type TextFieldVisualState } from "@/app/components/TextField";
import { AppIcon, type IconName } from "@/app/components/icons";

interface AmountFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  currencyLabel?: string;
  helperText?: string;
  helperText2?: string;
  errorText?: string;
  errorText2?: string;
  placeholder?: string;
  ariaLabel?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  ariaInvalid?: boolean;
  onBlur?: () => void;
  disabled?: boolean;
  visualState?: TextFieldVisualState;
  multipleValues?: string[];
  multipleCount?: number;
  currencyIconName?: IconName;
  currencyAriaLabel?: string;
  onCurrencyClick?: () => void;
  /** Hide the currency selector chevron (for domestic payments where currency is fixed). */
  hideCurrencySelector?: boolean;
}

import { resolveAmountField } from './contracts/amountField';

export default function AmountField({
  label,
  value,
  onChange,
  currency = "RSD",
  currencyLabel = "Currency",
  helperText,
  helperText2,
  errorText,
  errorText2,
  placeholder,
  ariaLabel,
  inputMode,
  ariaInvalid,
  onBlur,
  disabled = false,
  visualState,
  multipleValues,
  multipleCount,
  currencyIconName = "chevron-down-wide",
  currencyAriaLabel,
  onCurrencyClick,
  hideCurrencySelector = false,
}: AmountFieldProps) {
  const { isDisabled, currencyColor, currencyTitleColor } = resolveAmountField({ disabled, visualState, currency, currencyLabel, hideCurrencySelector });

  return (
    <div className="flex w-full items-start gap-[24px]">
      <div className="min-w-0 flex-1">
        <TextField
          label={label}
          value={value}
          onChange={onChange}
          helperText={helperText}
          helperText2={helperText2}
          errorText={errorText}
          errorText2={errorText2}
          placeholder={placeholder}
          ariaLabel={ariaLabel}
          inputMode={inputMode}
          ariaInvalid={ariaInvalid}
          onBlur={onBlur}
          disabled={disabled}
          visualState={visualState}
          multipleValues={multipleValues}
          multipleCount={multipleCount}
        />
      </div>

      <button
        type="button"
        disabled={isDisabled}
        aria-label={currencyAriaLabel ?? `${currencyLabel}: ${currency}`}
        aria-haspopup={onCurrencyClick ? "dialog" : undefined}
        onClick={onCurrencyClick}
        className="flex shrink-0 items-center gap-0 text-left disabled:cursor-default"
      >
        <span className="flex min-w-[64px] flex-col">
          <span
            className="uc-type-n5"
            style={{ color: currencyTitleColor }}
          >
            {currencyLabel}
          </span>
          <span
            className="uc-type-p1 mt-[4px]"
            style={{ color: currencyColor }}
          >
            {currency}
          </span>
        </span>
        {!hideCurrencySelector && (
          <span className="grid h-[32px] w-[32px] shrink-0 place-items-center">
            <AppIcon name={currencyIconName} color={currencyColor} />
          </span>
        )}
      </button>
    </div>
  );
}
