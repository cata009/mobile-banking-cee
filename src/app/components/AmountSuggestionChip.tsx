import type { ReactNode } from "react";
import { cn } from "@/app/components/ui/utils";

import { resolveAmountSuggestionChip } from './contracts/amountSuggestionChip';

interface AmountSuggestionChipProps {
  children: ReactNode;
  selected: boolean;
  onSelect: () => void;
  ariaLabel?: string;
  className?: string;
}

const backgrounds = {
  '--uc-action-strong': 'bg-[var(--uc-action-strong)]',
  '--uc-neutral-100': 'bg-[var(--uc-neutral-100)]',
} as const;
const foregrounds = {
  '--uc-static-white': 'text-[var(--uc-static-white)]',
  '--uc-text': 'text-[var(--uc-text)]',
} as const;

export function AmountSuggestionChip({ children, selected, onSelect, ariaLabel, className }: AmountSuggestionChipProps) {
  const state = resolveAmountSuggestionChip({ selected });
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "h-[34px] rounded-[4px] px-[12px] py-[8px] text-[13px] font-bold leading-[17px] transition-colors",
        `${state.borderWidth ? 'border border-[var(--uc-action)] ' : ''}${backgrounds[state.backgroundToken]} ${foregrounds[state.textToken]}`,
        className,
      )}
    >
      {children}
    </button>
  );
}
