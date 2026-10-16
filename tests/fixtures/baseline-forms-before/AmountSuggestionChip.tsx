import type { ReactNode } from "react";
import { cn } from "@/app/components/ui/utils";

interface AmountSuggestionChipProps {
  children: ReactNode;
  selected: boolean;
  onSelect: () => void;
  ariaLabel?: string;
  className?: string;
}

export function AmountSuggestionChip({ children, selected, onSelect, ariaLabel, className }: AmountSuggestionChipProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "h-[34px] rounded-[4px] px-[12px] py-[8px] text-[13px] font-bold leading-[17px] transition-colors",
        selected
          ? "border border-[var(--uc-action)] bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]"
          : "bg-[var(--uc-neutral-100)] text-[var(--uc-text)]",
        className,
      )}
    >
      {children}
    </button>
  );
}
