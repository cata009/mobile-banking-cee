/**
 * TutorialCard Component
 * Card for Tutorial section in More menu
 */

import imgTutorial from "figma:asset/fabdcbcfc3ceae62811fed754b790551b42a2f6e.png";

interface TutorialCardProps {
  onClick: () => void;
}

export function TutorialCard({ onClick }: TutorialCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative h-[120px] w-full rounded-[8px] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--uc-app-bg)] to-[var(--uc-neutral-400)]" />

      {/* Image - specific positioning from Figma */}
      <div className="absolute inset-[38.33%_0_0_51.83%]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            alt="" 
            className="absolute left-0 max-w-none size-full top-0" 
            src={imgTutorial}
          />
        </div>
      </div>

      {/* Title - top left padding */}
      <div className="absolute inset-0 p-[16px] flex items-start">
        <p className="font-['UniCredit:Bold',sans-serif] text-[18px] text-[var(--uc-text)] leading-[normal] text-left whitespace-pre-wrap z-10 relative">
          Tutorial
        </p>
      </div>
    </button>
  );
}