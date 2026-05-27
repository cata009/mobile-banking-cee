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
      {/* Radio button circle - 22x22px */}
      <div className="relative w-[22px] h-[22px] flex-shrink-0">
        {/* Outer circle - white fill with black stroke */}
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle 
            cx="11" 
            cy="11" 
            r="10.5" 
            fill="white" 
            stroke="#262626" 
            strokeWidth="1"
          />
          {/* Inner filled circle (when selected) - 10x10px */}
          {selected && (
            <circle 
              cx="11" 
              cy="11" 
              r="5" 
              fill="#007A91"
            />
          )}
        </svg>
      </div>
      
      {/* Label */}
      <span className="font-['UniCredit:Bold',sans-serif] text-[18px] text-[#262626] leading-[normal] uppercase">
        {label}
      </span>
    </button>
  );
}