/**
 * ThirdPartyConsentCard Component
 * Card for 3rd Party Consent section in More menu
 */

import imgThirdPartyConsent from "figma:asset/e017033a83e177f2a0d9a121d8161971ab5db3b5.png";

interface ThirdPartyConsentCardProps {
  onClick: () => void;
  title?: string;
}

export function ThirdPartyConsentCard({ onClick, title = "Consent to third parties" }: ThirdPartyConsentCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative h-[120px] w-full cursor-pointer overflow-hidden rounded-[8px] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
      style={{ boxShadow: "var(--pi-menu-card-shadow, none)" }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "var(--pi-menu-card-bg, linear-gradient(90deg, var(--uc-app-bg) 0%, var(--uc-neutral-400) 100%))",
        }}
      />

      {/* Image - specific positioning from Figma with rotation */}
      <div className="absolute flex inset-[15.28%_-37.87%_-87.03%_14.48%] items-center justify-center">
        <div className="flex-none h-[158.373px] w-[151px]" style={{ transform: 'rotate(-156deg) scaleY(-1)' }}>
          <div className="relative size-full">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img 
                alt="" 
                className="absolute left-0 max-w-none size-full top-0" 
                src={imgThirdPartyConsent}
                style={{
                  filter: "var(--pi-menu-card-image-filter, none)",
                  opacity: "var(--pi-menu-card-image-opacity, 1)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Title - top left padding */}
      <div className="absolute inset-0 p-[16px] flex items-start">
        <p className="font-['UniCredit:Bold',sans-serif] text-[18px] text-[var(--uc-text)] leading-[normal] text-left whitespace-pre-wrap z-10 relative">
          {title}
        </p>
      </div>
    </button>
  );
}
