/**
 * SettingsCard Component
 * Card for Settings section in More menu
 */

import { MORE_CARD_IMAGE_BY_TYPE } from "@/app/config/moreCardAssets";

interface SettingsCardProps {
  onClick: () => void;
  title?: string;
}

export function SettingsCard({ onClick, title = "Settings" }: SettingsCardProps) {
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
      <div className="absolute inset-[47.86%_-30.03%_-29.17%_42.2%]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img 
            alt="" 
            className="absolute left-0 max-w-none size-full top-0" 
            decoding="async"
            loading="eager"
            src={MORE_CARD_IMAGE_BY_TYPE.settings}
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
