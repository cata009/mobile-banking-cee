/**
 * MyRequestsCard Component
 * Card for My Requests section in More menu
 */

import imgMyRequests from "figma:asset/612ac7960c2d43bfdada538aae6f3cf27be44d99.png";

interface MyRequestsCardProps {
  onClick: () => void;
}

export function MyRequestsCard({ onClick }: MyRequestsCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative h-[120px] w-full rounded-[8px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--uc-app-bg)] to-[var(--uc-neutral-400)]" />

      {/* Image - specific positioning from Figma */}
      <div className="absolute inset-[37.22%_0_-6.36%_29.88%]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            alt="" 
            className="absolute left-0 max-w-none size-full top-0" 
            src={imgMyRequests}
          />
        </div>
      </div>

      {/* Title - top left padding */}
      <div className="absolute inset-0 p-[16px] flex items-start">
        <p className="font-['UniCredit:Bold',sans-serif] text-[18px] text-[var(--uc-text)] leading-[normal] text-left whitespace-pre-wrap z-10 relative">
          My requests
        </p>
      </div>
    </button>
  );
}