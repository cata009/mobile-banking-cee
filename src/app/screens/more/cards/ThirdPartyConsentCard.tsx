/**
 * ThirdPartyConsentCard Component
 * Card for 3rd Party Consent section in More menu
 */

import imgThirdPartyConsent from "figma:asset/e017033a83e177f2a0d9a121d8161971ab5db3b5.png";

interface ThirdPartyConsentCardProps {
  onClick: () => void;
}

export function ThirdPartyConsentCard({ onClick }: ThirdPartyConsentCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative h-[120px] w-full rounded-[8px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#f5f5f5] to-[#ccc]" />

      {/* Image - specific positioning from Figma with rotation */}
      <div className="absolute flex inset-[15.28%_-37.87%_-87.03%_14.48%] items-center justify-center">
        <div className="flex-none h-[158.373px] w-[151px]" style={{ transform: 'rotate(-156deg) scaleY(-1)' }}>
          <div className="relative size-full">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img 
                alt="" 
                className="absolute left-0 max-w-none size-full top-0" 
                src={imgThirdPartyConsent}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Title - top left padding */}
      <div className="absolute inset-0 p-[16px] flex items-start">
        <p className="font-['UniCredit:Bold',sans-serif] text-[18px] text-black leading-[normal] text-left whitespace-pre-wrap z-10 relative">
          3rd Party consent
        </p>
      </div>
    </button>
  );
}