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
      onClick={onClick}
      className={`w-full flex items-center gap-[16px] py-[20px] px-[24px] cursor-pointer transition-opacity hover:opacity-80 ${className}`}
      aria-label={label}
      role="radio"
      aria-checked={selected}
    >
      <div className="relative w-[22px] h-[22px] flex-shrink-0">
        <AppIcon name={selected ? "radio-selected" : "radio-unselected"} color="var(--uc-text)" />
      </div>
      
      <span className="font-['UniCredit:Bold',sans-serif] text-[18px] text-[var(--uc-text)] leading-[normal] uppercase">
        {label}
      </span>
    </button>
  );
}
