import type { ReactNode } from "react";
import { AppIcon } from "@/app/components/icons";

type HeaderActionIconName = "profile" | "messages" | "help" | "logout" | "contact-phone";

interface HeaderActionButtonProps {
  icon: HeaderActionIconName;
  label: string;
  onClick?: () => void;
  className?: string;
  badgeCount?: number;
}

export function HeaderActionIcon({ icon }: { icon: HeaderActionIconName }) {
  if (icon === "profile") return <AppIcon name="header-profile" color="var(--uc-icon)" />;
  if (icon === "messages") return <AppIcon name="header-messages" color="var(--uc-icon)" />;
  if (icon === "logout") return <AppIcon name="logout" color="var(--uc-icon)" />;
  if (icon === "contact-phone") return <AppIcon name="contact-phone" color="var(--uc-icon)" />;
  return <AppIcon name="help-circle" color="var(--uc-icon)" />;
}

export function HeaderActionRail({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex h-[32px] shrink-0 items-center gap-[8px] ${className}`}>
      {children}
    </div>
  );
}

export function HeaderActionButton({
  icon,
  label,
  onClick,
  className = "size-[32px]",
  badgeCount = 0,
}: HeaderActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center justify-center cursor-pointer hover:opacity-70 ${className}`}
      aria-label={label}
    >
      <HeaderActionIcon icon={icon} />
      {badgeCount > 0 && (
        <span className="uc-type-n5-strong absolute right-0 top-0 grid size-[20px] place-items-center rounded-full bg-[var(--uc-brand)] leading-none tracking-[0.35px] text-[var(--uc-text-inverse)]">
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      )}
    </button>
  );
}
