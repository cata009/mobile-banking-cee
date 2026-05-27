/**
 * PrimeIconLabelValue Component
 * Reusable dark-themed component for: Icon + Label + Value + Arrow
 * Icon and URL are configurable for future customization
 */

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
        <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start justify-center leading-[normal] min-h-px min-w-px not-italic relative text-[16px] text-white whitespace-pre-wrap">
          <p className="font-['UniCredit:Bold',sans-serif] relative shrink-0 w-full text-left">{label}</p>
          <p className="font-['UniCredit:Regular',sans-serif] relative shrink-0 w-full text-left">{description}</p>
        </div>
      </div>

      {/* Arrow Icon - Corrected SVG */}
      <div className="flex items-center justify-center relative shrink-0" style={{ width: '7px', height: '14px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="7" height="14" viewBox="0 0 7 14" fill="none">
          <path fillRule="evenodd" clipRule="evenodd" d="M0.675889 0C-0.225296 0.934937 -0.225296 2.45219 0.675889 3.388L3.93913 7L0.675889 10.612C-0.225296 11.5478 -0.225296 13.0642 0.675889 14L7 7L0.675889 0Z" fill="white"/>
        </svg>
      </div>
    </button>
  );
}