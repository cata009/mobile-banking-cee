import { AppIcon } from "@/app/components/icons";

interface RadioButtonProps {
  selected: boolean;
  onClick: () => void;
  label: string;
  className?: string;
}

/** Frozen local row from AccountTransactionFiltersSheet before the radio pilot. */
export function FrozenDateFilterRow({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex h-[80px] w-full items-center gap-[8px] bg-[var(--uc-surface)] px-[16px] text-left" role="radio" aria-checked={selected}>
    <span className="grid size-[32px] shrink-0 place-items-center" aria-hidden="true"><AppIcon name={selected ? 'radio-selected' : 'radio-unselected'} color="var(--uc-text)" /></span>
    <span className="text-[14px] font-bold leading-[18px] text-[var(--uc-text)]">{label}</span>
  </button>
}

export default function RadioButton({ 
  selected, 
  onClick, 
  label,
  className = '' 
}: RadioButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-[8px] px-[24px] py-[20px] text-left cursor-pointer transition-opacity hover:opacity-80 ${className}`}
      aria-label={label}
      role="radio"
      aria-checked={selected}
    >
      <div className="grid h-[32px] w-[32px] flex-shrink-0 place-items-center">
        <AppIcon name={selected ? "radio-selected" : "radio-unselected"} color="var(--uc-text)" />
      </div>
      
      <span className="uc-type-n4-strong text-[var(--uc-primary-k1)]">
        {label}
      </span>
    </button>
  );
}
