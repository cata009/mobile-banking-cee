/**
 * DocumentsCard Component
 * Card for Documents section in More menu
 * Supports badge count for new documents
 */

import imgDocuments from "figma:asset/befcf83245a907a033553e7ac7902995e124d730.png";

interface DocumentsCardProps {
  onClick: () => void;
  badgeCount?: number;
  title?: string;
}

export function DocumentsCard({ onClick, badgeCount, title = "Documents" }: DocumentsCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative h-[120px] w-full rounded-[8px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--uc-app-bg)] to-[var(--uc-neutral-400)]" />

      {/* Image - specific positioning from Figma */}
      <div className="absolute inset-[46.67%_-9.15%_-13.33%_35.98%]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            alt="" 
            className="absolute left-0 max-w-none size-full top-0" 
            src={imgDocuments}
          />
        </div>
      </div>

      {/* Title - top left padding */}
      <div className="absolute inset-0 p-[16px] flex items-start">
        <p className="font-['UniCredit:Bold',sans-serif] text-[18px] text-[var(--uc-text)] leading-[normal] text-left whitespace-pre-wrap z-10 relative">
          {title}
        </p>
      </div>

      {/* Badge (if provided) - top right */}
      {badgeCount !== undefined && badgeCount > 0 && (
        <div className="absolute right-0 top-0 size-[32px] z-20">
          <div className="absolute right-0 top-0 h-[30px] w-[30px] rounded-bl-[30px] bg-[var(--uc-brand)]" />
          {/* Badge number - centered in top-right quarter */}
          <div className="absolute right-[7px] top-[4px]">
            <span 
              className="font-['UniCredit:Bold',sans-serif] text-[var(--uc-static-white)] text-[14px] leading-none block"
              style={{ fontWeight: 700 }}
            >
              {badgeCount > 99 ? '99' : badgeCount}
            </span>
          </div>
        </div>
      )}
    </button>
  );
}
