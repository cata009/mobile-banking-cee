import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/app/components/ui/utils";

export const DATE_FILTER_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  sourceNodeId: "290:14520",
  width: 238,
  height: 24,
  chipWidth: 35,
  chipHeight: 22,
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
        "flex h-[22px] w-[35px] shrink-0 items-center justify-center rounded-[3.5px] px-[6px] py-[3px] text-center text-[14px] font-bold leading-[14px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]",
        selected ? "border border-[var(--uc-action)] bg-[var(--uc-action)] text-[var(--uc-static-white)]" : "border border-[var(--uc-text)] bg-transparent text-[var(--uc-text)]",
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
        "flex h-[24px] w-[238px] items-center gap-[15px]",
        type === "four" ? "justify-center px-[26px] py-px" : "p-px",
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
