/**
 * GdprConsentCard Component
 * Card for GDPR Consent section in More menu
 */

import imgGdprConsent from "figma:asset/4d7abd397db5234d24f236a294f434a9b45b7d2b.png";

interface GdprConsentCardProps {
  onClick: () => void;
}

export function GdprConsentCard({ onClick }: GdprConsentCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative h-[120px] w-full rounded-[8px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--uc-app-bg)] to-[var(--uc-neutral-400)]" />

      {/* Image - specific positioning from Figma - two overlapping user icons */}
      <div 
        className="absolute bottom-[-35.83%] left-[38.66%] right-[-0.24%] top-1/2"
        style={{ 
          backgroundImage: `url('${imgGdprConsent}')`,
          backgroundSize: '61.60000091791153px 62.90000093728304px',
          backgroundPosition: 'top left'
        }}
      />

      {/* Title - top left padding */}
      <div className="absolute inset-0 p-[16px] flex items-start">
        <p className="font-['UniCredit:Bold',sans-serif] text-[18px] text-[var(--uc-text)] leading-[normal] text-left whitespace-pre-wrap z-10 relative">
          GDPR Consent
        </p>
      </div>
    </button>
  );
}