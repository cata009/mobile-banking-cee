import type { CSSProperties } from "react";
import { AppIcon, type IconName } from "@/app/components/icons";

interface AccountActionBarProps {
  items?: readonly AccountActionBarItem[];
  align?: AccountActionBarAlignment;
  className?: string;
  style?: CSSProperties;
  onDetailsClick?: () => void;
  onOptionsClick?: () => void;
}

export type AccountActionBarAlignment = "start" | "center" | "end" | "between";

export interface AccountActionBarItem {
  id: string;
  iconName: IconName;
  label: string;
  onClick?: () => void;
  ariaLabel?: string;
  iconColor?: string;
}

function AccountActionItem({
  iconName,
  label,
  onClick,
  ariaLabel,
  iconColor = "var(--uc-text)",
  stretch,
}: {
  iconName: IconName;
  label: string;
  onClick?: () => void;
  ariaLabel?: string;
  iconColor?: string;
  stretch: boolean;
}) {
  const normalizedLabel = label.replace(/\s+/g, " ").trim();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-[4px] ${stretch ? "min-w-0 flex-1" : "w-[82px] shrink-0"}`}
      aria-label={ariaLabel ?? normalizedLabel}
      data-ds-label={`Account action ${normalizedLabel}`}
    >
      <span className="flex h-[32px] w-[32px] items-center justify-center" data-ds-label="Account action icon 32x32">
        <AppIcon name={iconName} color={iconColor} />
      </span>
      <span className="whitespace-pre-line font-['UniCredit',sans-serif] text-center text-[14px] font-normal leading-[15px] text-[var(--uc-text)]">
        {label}
      </span>
    </button>
  );
}

function getDefaultActions(onDetailsClick?: () => void, onOptionsClick?: () => void): AccountActionBarItem[] {
  return [
    { id: "details", iconName: "account-details", label: "Details", onClick: onDetailsClick },
    { id: "options", iconName: "account-options", label: "Options", onClick: onOptionsClick },
    { id: "add-money", iconName: "add-money", label: "Add money" },
    { id: "mcash", iconName: "mcash", label: "mCash" },
  ];
}

const ALIGNMENT_CLASS: Record<AccountActionBarAlignment, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

export default function AccountActionBar({
  items,
  align = "between",
  className = "",
  style,
  onDetailsClick,
  onOptionsClick,
}: AccountActionBarProps) {
  const actionItems = (items ?? getDefaultActions(onDetailsClick, onOptionsClick)).slice(0, 4);
  const stretchItems = align === "between";

  return (
    <div
      className={`flex items-start px-[16px] py-[8px] ${ALIGNMENT_CLASS[align]} ${stretchItems ? "" : "gap-[8px]"} ${className}`}
      data-ds-label="AccountActionBar"
      data-action-count={actionItems.length}
      style={style}
    >
      {actionItems.map((item) => (
        <AccountActionItem
          key={item.id}
          iconName={item.iconName}
          label={item.label}
          onClick={item.onClick}
          ariaLabel={item.ariaLabel}
          iconColor={item.iconColor}
          stretch={stretchItems}
        />
      ))}
    </div>
  );
}
