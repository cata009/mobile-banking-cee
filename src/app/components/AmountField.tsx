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
  disabled?: boolean;
  visualState?: TextFieldVisualState;
  multipleValues?: string[];
  multipleCount?: number;
  currencyIconName?: IconName;
}

const DISABLED_COLOR = "var(--uc-neutral-650)";

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
  disabled = false,
  visualState,
  multipleValues,
  multipleCount,
  currencyIconName = "chevron-down-wide",
}: AmountFieldProps) {
  const isDisabled = disabled || visualState === "disabled-empty" || visualState === "disabled-filled";
  const currencyColor = isDisabled ? DISABLED_COLOR : "var(--uc-text)";
  const currencyTitleColor = isDisabled ? DISABLED_COLOR : "var(--uc-text-muted)";

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
          disabled={disabled}
          visualState={visualState}
          multipleValues={multipleValues}
          multipleCount={multipleCount}
        />
      </div>

      <button
        type="button"
        disabled={isDisabled}
        className="flex shrink-0 items-start gap-0 text-left disabled:cursor-default"
      >
        <span className="flex min-w-[64px] flex-col">
          <span
            className="font-['UniCredit',sans-serif] text-[14px] font-normal leading-normal"
            style={{ color: currencyTitleColor }}
          >
            {currencyLabel}
          </span>
          <span
            className="mt-[4px] font-['UniCredit',sans-serif] text-[18px] font-normal leading-normal"
            style={{ color: currencyColor }}
          >
            {currency}
          </span>
        </span>
        <span className="mt-[21px] grid h-[32px] w-[32px] shrink-0 place-items-center">
          <AppIcon name={currencyIconName} color={currencyColor} />
        </span>
      </button>
    </div>
  );
}
