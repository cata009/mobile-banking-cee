/**
 * MoreCardBase Component
 * Base component for More section cards
 * Provides consistent styling and badge support
 */

import { AppIcon } from "@/app/components/icons";

interface MoreCardBaseProps {
  title: string;
  image: string;
  onClick: () => void;
  badgeCount?: number;
}

export function MoreCardBase({ title, image, onClick, badgeCount }: MoreCardBaseProps) {
  return (
    <button
      onClick={onClick}
      className="relative h-[120px] w-full rounded-[8px] overflow-hidden hover:opacity-90 transition-opacity"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--uc-app-bg)] to-[var(--uc-neutral-400)]" />

      {/* Image - positioned at bottom right, scaled down */}
      <div className="absolute bottom-0 right-0 w-[50%] h-[50%] flex items-end justify-end overflow-hidden pointer-events-none">
        <img 
          src={image} 
          alt="" 
          className="object-contain object-bottom-right max-w-full max-h-full"
          style={{
            transform: 'scale(0.9)',
            transformOrigin: 'bottom right'
          }}
        />
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
          {/* Red quarter circle badge in corner */}
          <div className="absolute inset-[0_-0.37%_5.88%_6.25%]">
            <AppIcon name="badge-corner" className="block size-full" color="var(--uc-brand)" />
          </div>
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
