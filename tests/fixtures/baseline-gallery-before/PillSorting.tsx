import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/app/components/ui/utils";

export const PILL_SORTING_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  sourceNodeId: "290:14610",
  width: 375,
  height: 40,
  chipHeight: 24,
} as const;

export type PillSortingValue = "max-value" | "min-value" | "max-percent" | "min-percent";

type PillSortingProps = {
  selectedValue?: PillSortingValue | null;
  onChange?: (value: PillSortingValue) => void;
  className?: string;
};

const SORTING_OPTIONS: Array<{ value: PillSortingValue; label: string }> = [
  { value: "max-value", label: "MAX VALUE" },
  { value: "min-value", label: "MIN VALUE" },
  { value: "max-percent", label: "MAX %" },
  { value: "min-percent", label: "MIN %" },
];

function PillSortingChip({
  selected,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  selected: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-[24px] shrink-0 items-center justify-center rounded-[14.5px] px-[8px] py-[4px] text-[14px] leading-[14px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]",
        selected
          ? "border border-[var(--uc-static-black)] bg-[var(--uc-static-black)] font-bold text-[var(--uc-static-white)]"
          : "border border-[var(--uc-text)] bg-transparent font-normal text-[var(--uc-text)]",
        className,
      )}
      aria-pressed={selected}
      {...props}
    />
  );
}

export default function PillSorting({ selectedValue = "max-percent", onChange, className }: PillSortingProps) {
  return (
    <div className={cn("flex h-[40px] w-[375px] items-center justify-center gap-[8px]", className)} data-pill-sorting>
      {SORTING_OPTIONS.map((option) => (
        <PillSortingChip
          key={option.value}
          selected={selectedValue === option.value}
          onClick={() => onChange?.(option.value)}
          data-pill-sorting-chip={option.value}
        >
          {option.label}
        </PillSortingChip>
      ))}
    </div>
  );
}
