import { cn } from "@/app/components/ui/utils";

export const PROFILE_AVATAR_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  sourceNodeIds: {
    photoFull: "9106:16257",
    photoWithNotification: "9106:16242",
    initials: "9106:16259",
    ai: "9106:16303",
  },
  baseSize: 40,
  profileInsetRatio: 0.1,
  profileImageRatio: 0.8,
  notificationRatio: 0.2,
} as const;

export type ProfileAvatarVariant = "photo" | "initials" | "ai";
export type ProfileAvatarPhotoStyle = "full" | "profile";

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

function normalizeInitials(initials?: string) {
  const trimmed = initials?.trim();
  if (!trimmed) {
    return "MR";
  }

  const compact = trimmed.replace(/\s+/g, "");
  return compact.slice(0, 2).toUpperCase();
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
        d="M8.88304 9.35536C9.17135 8.7607 10.0035 8.7607 10.2918 9.35536L10.6818 10.1596C11.3435 11.5245 12.3021 12.7175 13.4844 13.648L14.2819 14.2756C14.6893 14.5961 14.6893 15.2227 14.2819 15.5432L13.4844 16.1708C12.3021 17.1012 11.3435 18.2943 10.6818 19.6592L10.2918 20.4634C10.0035 21.0581 9.17135 21.0581 8.88304 20.4634L8.49309 19.6592C7.83133 18.2943 6.87277 17.1012 5.69044 16.1708L4.89291 15.5432C4.48557 15.2227 4.48557 14.5961 4.89291 14.2756L5.69044 13.648C6.87277 12.7175 7.83133 11.5245 8.49309 10.1596L8.88304 9.35536Z"
        fill="url(#profile-avatar-ai-gradient)"
      />
      <path
        d="M7.30565 3.09501C7.42098 2.84724 7.75383 2.84724 7.86915 3.09501L8.02513 3.43012C8.28984 3.99882 8.67326 4.49591 9.14619 4.88359L9.4652 5.14509C9.62814 5.27865 9.62814 5.53971 9.4652 5.67327L9.14619 5.93477C8.67326 6.32245 8.28984 6.81954 8.02513 7.38824L7.86915 7.72335C7.75383 7.97112 7.42098 7.97112 7.30565 7.72335L7.14967 7.38824C6.88497 6.81954 6.50155 6.32245 6.02862 5.93477L5.70961 5.67327C5.54667 5.53971 5.54667 5.27865 5.70961 5.14509L6.02862 4.88359C6.50155 4.49591 6.88497 3.99882 7.14967 3.43012L7.30565 3.09501Z"
        fill="url(#profile-avatar-ai-gradient)"
      />
      <path
        d="M16.1199 6.20654C16.2898 5.81006 16.7804 5.81006 16.9504 6.20654L17.1803 6.74278C17.5704 7.65281 18.1355 8.44826 18.8326 9.06862L19.3027 9.48708C19.5429 9.7008 19.5429 10.1185 19.3027 10.3323L18.8326 10.7507C18.1355 11.3711 17.5704 12.1665 17.1803 13.0766L16.9504 13.6128C16.7804 14.0093 16.2898 14.0093 16.1199 13.6128L15.89 13.0766C15.4998 12.1665 14.9347 11.3711 14.2377 10.7507L13.7675 10.3323C13.5274 10.1185 13.5274 9.7008 13.7675 9.48708L14.2377 9.06862C14.9347 8.44826 15.4998 7.65281 15.89 6.74278L16.1199 6.20654Z"
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
  const hasPhoto = Boolean(imageSrc);
  const resolvedVariant = variant === "photo" && !hasPhoto ? "initials" : variant;
  const resolvedInitials = normalizeInitials(initials);
  const profileInset = Math.round(size * PROFILE_AVATAR_SOURCE.profileInsetRatio);
  const profileImageSize = Math.round(size * PROFILE_AVATAR_SOURCE.profileImageRatio);
  const notificationSize = Math.round(size * PROFILE_AVATAR_SOURCE.notificationRatio);
  const notificationRight = Math.max(0, Math.round(size * 0.05));
  const initialsFontSize = Math.max(14, Math.round(size * 0.4));
  const initialsLineHeight = Math.max(16, Math.round(size * 0.45));

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
