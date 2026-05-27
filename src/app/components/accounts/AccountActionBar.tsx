import type { ReactNode } from "react";
import { AppIcon } from "@/app/components/icons";

interface AccountActionBarProps {
  onDetailsClick?: () => void;
  onOptionsClick?: () => void;
}

function AccountActionItem({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-[4px]"
      data-ds-label={`Account action ${label}`}
    >
      <span className="flex h-[32px] w-[32px] items-center justify-center" data-ds-label="Account action icon 32x32">
        {icon}
      </span>
      <span className="font-['UniCredit',sans-serif] text-center text-[14px] font-normal leading-normal text-[var(--uc-text)]">
        {label}
      </span>
    </button>
  );
}

export default function AccountActionBar({ onDetailsClick, onOptionsClick }: AccountActionBarProps) {
  return (
    <div className="flex items-start justify-between px-[16px] py-[8px]" data-ds-label="AccountActionBar">
      <AccountActionItem icon={<AppIcon name="account-details" color="var(--uc-text)" />} label="Details" onClick={onDetailsClick} />
      <AccountActionItem icon={<AppIcon name="account-options" color="var(--uc-text)" />} label="Options" onClick={onOptionsClick} />
      <AccountActionItem icon={<AppIcon name="add-money" color="var(--uc-text)" />} label="Add money" />
      <AccountActionItem icon={<AppIcon name="mcash" color="var(--uc-text)" />} label="mCash" />
    </div>
  );
}
