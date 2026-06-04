import { AppIcon } from "@/app/components/icons";

interface RadioButtonProps {
  selected: boolean;
  onClick: () => void;
  label: string;
  className?: string;
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
