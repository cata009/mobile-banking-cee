/**
 * GdprConsentCard Component
 * Card for GDPR Consent section in More menu
 */

import { MORE_CARD_IMAGE_BY_TYPE } from "@/app/config/moreCardAssets";

interface GdprConsentCardProps {
  onClick: () => void;
  title?: string;
}

export function GdprConsentCard({ onClick, title = "GDPR Consent" }: GdprConsentCardProps) {
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

      {/* Image - specific positioning from Figma - two overlapping user icons */}
      <div 
        className="absolute bottom-[-35.83%] left-[38.66%] right-[-0.24%] top-1/2"
        style={{ 
          backgroundImage: `url('${MORE_CARD_IMAGE_BY_TYPE["gdpr-consent"]}')`,
          backgroundSize: '61.60000091791153px 62.90000093728304px',
          backgroundPosition: 'top left',
          filter: "var(--pi-menu-card-image-filter, none)",
          opacity: "var(--pi-menu-card-image-opacity, 1)",
        }}
      />

      {/* Title - top left padding */}
      <div className="absolute inset-0 p-[16px] flex items-start">
        <p className="font-['UniCredit:Bold',sans-serif] text-[18px] text-[var(--uc-text)] leading-[normal] text-left whitespace-pre-wrap z-10 relative">
          {title}
        </p>
      </div>
    </button>
  );
}
