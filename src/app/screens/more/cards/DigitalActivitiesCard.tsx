/**
 * DigitalActivitiesCard Component
 * Card for Digital Activities Register section in More menu
 */

import imgDigitalActivities from "figma:asset/947d85da595e4eb3e946a83cbab7bb8d8c148da1.png";

interface DigitalActivitiesCardProps {
  onClick: () => void;
  title?: string;
}

export function DigitalActivitiesCard({ onClick, title = "Digital activity record" }: DigitalActivitiesCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative h-[120px] w-full rounded-[8px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--uc-app-bg)] to-[var(--uc-neutral-400)]" />

      {/* Image - specific positioning from Figma */}
      <div className="absolute inset-[56.42%_-46.69%_-46.75%_49.96%]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            alt="" 
            className="absolute left-0 max-w-none size-full top-0" 
            src={imgDigitalActivities}
          />
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
