/**
 * PrimeIconLabelValue Component
 * Reusable dark-themed component for: Icon + Label + Value + Arrow
 * Icon and URL are configurable for future customization
 */

import { AppIcon } from "@/app/components/icons";

interface PrimeIconLabelValueProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  url?: string; // Optional URL for future navigation
  onNavigate?: () => void; // Optional navigation handler
}

export function PrimeIconLabelValue({ 
  icon, 
  label, 
  description,
  url,
  onNavigate 
}: PrimeIconLabelValueProps) {
  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    } else if (url) {
      console.log(`🔗 Navigate to: ${url}`);
      // Future: window.open(url, '_blank');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="content-stretch flex gap-[16px] h-[80px] items-center py-[24px] relative shrink-0 w-full cursor-pointer hover:opacity-80 transition-opacity"
    >
      <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-center min-h-px min-w-px relative">
        {/* Icon Container */}
        <div className="relative shrink-0 size-[32px]">
          {icon}
        </div>

        {/* Label + Description */}
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start justify-center leading-[normal] min-h-px min-w-px not-italic relative text-[16px] text-[var(--uc-static-white)] whitespace-pre-wrap">
          <p className="font-['UniCredit:Bold',sans-serif] relative shrink-0 w-full text-left">{label}</p>
          <p className="font-['UniCredit:Regular',sans-serif] relative shrink-0 w-full text-left">{description}</p>
        </div>
      </div>

      {/* Arrow Icon - Corrected SVG */}
      <div className="flex items-center justify-center relative shrink-0" style={{ width: '7px', height: '14px' }}>
        <AppIcon name="prime-chevron-right" color="var(--uc-static-white)" />
      </div>
    </button>
  );
}
