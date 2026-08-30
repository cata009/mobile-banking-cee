import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/app/components/ui/utils";

export const DATE_FILTER_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  sourceNodeId: "290:14520",
  width: 286,
  height: 24,
  chipWidth: 42,
  chipHeight: 24,
} as const;

export type DateFilterType = "five" | "four";

type DateFilterProps = {
  type?: DateFilterType;
  selectedValue?: string;
  selectedIndex?: number;
  onChange?: (value: string) => void;
  className?: string;
};

function DateFilterChip({
  value,
  selected,
  onClick,
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
  selected: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-[24px] min-w-[42px] shrink-0 items-center justify-center rounded-[4px] px-[8px] text-center text-[14px] font-bold leading-[16px] whitespace-nowrap",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]",
        selected ? "border border-[var(--uc-action)] bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]" : "border border-[var(--uc-text)] bg-transparent text-[var(--uc-text)]",
      )}
      aria-pressed={selected}
      onClick={onClick}
      data-date-filter-chip={value}
    >
      {value}
    </button>
  );
}

export default function DateFilter({ type = "five", selectedValue = "3 Y", selectedIndex = 3, onChange, className }: DateFilterProps) {
  const values = type === "five" ? ["1 M", "3 M", "1 Y", "3 Y", "MAX"] : ["0 Y", "1 Y", "3 Y", "3 Y"];

  return (
    <div
      className={cn(
        "flex min-h-[24px] w-full max-w-[286px] items-center justify-center gap-[8px]",
        className,
      )}
      data-date-filter-type={type}
    >
      {values.map((value, index) => (
        <DateFilterChip
          key={`${value}-${index}`}
          value={value}
          selected={index === selectedIndex || (selectedIndex < 0 && value === selectedValue)}
          onClick={() => onChange?.(value)}
        />
      ))}
    </div>
  );
}
