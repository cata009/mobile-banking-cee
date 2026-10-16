import { cn } from "@/app/components/ui/utils";

import { PROFILE_AVATAR_SOURCE, PROFILE_AVATAR_AI_PATHS, resolveProfileAvatar, type ProfileAvatarVariant, type ProfileAvatarPhotoStyle } from '@/app/components/contracts/profileAvatar';
export { PROFILE_AVATAR_SOURCE } from '@/app/components/contracts/profileAvatar';
export type { ProfileAvatarVariant, ProfileAvatarPhotoStyle } from '@/app/components/contracts/profileAvatar';

export interface ProfileAvatarProps {
  ariaLabel?: string;
  className?: string;
  imageAlt?: string;
  imageSrc?: string;
  initials?: string;
  photoStyle?: ProfileAvatarPhotoStyle;
  showNotification?: boolean;
  size?: number;
  variant?: ProfileAvatarVariant;
}

function AiAvatarGlyph({ size }: { size: number }) {
  const glyphSize = Math.round(size * 0.6);
  return (
    <svg
      aria-hidden="true"
      className="shrink-0"
      height={glyphSize}
      viewBox="0 0 24 24"
      width={glyphSize}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="profile-avatar-ai-gradient" x1="0" x2="24" y1="0" y2="0.65" gradientUnits="userSpaceOnUse">
          <stop stopColor="#004F95" />
          <stop offset="1" stopColor="#007A91" />
        </linearGradient>
      </defs>
      <path
        d={PROFILE_AVATAR_AI_PATHS[0]}
        fill="url(#profile-avatar-ai-gradient)"
      />
      <path
        d={PROFILE_AVATAR_AI_PATHS[1]}
        fill="url(#profile-avatar-ai-gradient)"
      />
      <path
        d={PROFILE_AVATAR_AI_PATHS[2]}
        fill="url(#profile-avatar-ai-gradient)"
      />
    </svg>
  );
}

export default function ProfileAvatar({
  ariaLabel,
  className,
  imageAlt = "",
  imageSrc,
  initials,
  photoStyle = "full",
  showNotification = false,
  size = PROFILE_AVATAR_SOURCE.baseSize,
  variant = "initials",
}: ProfileAvatarProps) {
  const { resolvedVariant, resolvedInitials, profileInset, profileImageSize, notificationSize, notificationRight, initialsFontSize, initialsLineHeight } = resolveProfileAvatar({variant,imageSrc,initials,photoStyle,showNotification,size});

  return (
    <span
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        className,
      )}
      data-component="ProfileAvatar"
      data-figma-schema={PROFILE_AVATAR_SOURCE.schema}
      style={{ width: size, height: size }}
    >
      {resolvedVariant === "ai" ? (
        <span className="inline-flex size-full items-center justify-center rounded-full bg-[var(--uc-neutral-100)]">
          <AiAvatarGlyph size={size} />
        </span>
      ) : resolvedVariant === "photo" && photoStyle === "profile" ? (
        <span
          className="inline-flex items-center justify-center overflow-hidden rounded-full"
          style={{ width: profileImageSize, height: profileImageSize, margin: profileInset }}
        >
          <img
            alt={imageAlt}
            className="size-full object-cover"
            draggable={false}
            src={imageSrc}
          />
        </span>
      ) : resolvedVariant === "photo" ? (
        <img
          alt={imageAlt}
          className="size-full object-cover"
          draggable={false}
          src={imageSrc}
        />
      ) : (
        <span className="inline-flex size-full items-center justify-center rounded-full bg-[var(--uc-primary-k1)] text-[var(--uc-static-white)]">
          <span
            className="font-['UniCredit',sans-serif] font-bold tracking-[0]"
            style={{ fontSize: initialsFontSize, lineHeight: `${initialsLineHeight}px` }}
          >
            {resolvedInitials}
          </span>
        </span>
      )}

      {showNotification ? (
        <span
          aria-hidden="true"
          className="absolute rounded-full bg-[var(--uc-red-main)]"
          style={{
            top: 0,
            right: notificationRight,
            width: notificationSize,
            height: notificationSize,
          }}
        />
      ) : null}
    </span>
  );
}
