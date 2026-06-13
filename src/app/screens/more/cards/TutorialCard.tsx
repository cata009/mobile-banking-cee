/**
 * TutorialCard Component
 * Card for Tutorial section in More menu
 */

import imgTutorial from "figma:asset/fabdcbcfc3ceae62811fed754b790551b42a2f6e.png";

interface TutorialCardProps {
  onClick: () => void;
  title?: string;
}

export function TutorialCard({ onClick, title = "Tutorials" }: TutorialCardProps) {
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

      {/* Image - specific positioning from Figma */}
      <div className="absolute inset-[38.33%_0_0_51.83%]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            alt="" 
            className="absolute left-0 max-w-none size-full top-0" 
            src={imgTutorial}
            style={{
              filter: "var(--pi-menu-card-image-filter, none)",
              opacity: "var(--pi-menu-card-image-opacity, 1)",
            }}
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
