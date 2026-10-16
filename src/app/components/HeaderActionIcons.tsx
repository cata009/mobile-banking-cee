import type { ReactNode } from "react";
import { AppIcon } from "@/app/components/icons";
import { resolveHeaderAction, type HeaderActionIconName } from "./contracts/headerActions";

interface HeaderActionButtonProps {
  icon: HeaderActionIconName;
  label: string;
  onClick?: () => void;
  className?: string;
  badgeCount?: number;
}

export function HeaderActionIcon({ icon }: { icon: HeaderActionIconName }) {
  return <AppIcon name={resolveHeaderAction(icon).icon} color="var(--uc-icon)" />;
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
  const contract = resolveHeaderAction(icon, badgeCount);
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center justify-center cursor-pointer hover:opacity-70 ${className}`}
      aria-label={label}
    >
      <HeaderActionIcon icon={icon} />
      {contract.badgeText !== null && (
        <span className="uc-type-n5-strong absolute right-0 top-0 grid size-[20px] place-items-center rounded-full bg-[var(--uc-brand)] leading-none tracking-[0.35px] text-[var(--uc-static-white)]">
          {contract.badgeText}
        </span>
      )}
    </button>
  );
}
