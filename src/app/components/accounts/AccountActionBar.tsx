import type { CSSProperties } from "react";
import { AppIcon, type IconName } from "@/app/components/icons";
import { useLanguage } from "@/app/contexts/LanguageContext";

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
  hidden?: boolean;
}

function AccountActionItem({
  iconName,
  label,
  onClick,
  ariaLabel,
  iconColor = "var(--uc-text)",
  stretch,
  hidden = false,
}: {
  iconName: IconName;
  label: string;
  onClick?: () => void;
  ariaLabel?: string;
  iconColor?: string;
  stretch: boolean;
  hidden?: boolean;
}) {
  const normalizedLabel = label.replace(/\s+/g, " ").trim();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={hidden}
      tabIndex={hidden ? -1 : undefined}
      aria-hidden={hidden ? "true" : undefined}
      className={`flex flex-col items-center gap-[4px] ${stretch ? "min-w-0 flex-1" : "w-[82px] shrink-0"} ${hidden ? "pointer-events-none invisible" : ""}`}
      aria-label={ariaLabel ?? normalizedLabel}
      data-ds-label={`Account action ${normalizedLabel}`}
    >
      <span className="flex h-[32px] w-[32px] items-center justify-center" data-ds-label="Account action icon 32x32">
        <AppIcon name={iconName} color={iconColor} />
      </span>
      <span className="uc-type-p2 whitespace-pre-line text-center leading-[15px] text-[var(--uc-text)]">
        {label}
      </span>
    </button>
  );
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
  const { t } = useLanguage();
  const defaultActions = [
    { id: "details", iconName: "account-details" as const, label: t("runtime.accounts.actions.details", "Details"), onClick: onDetailsClick },
    { id: "options", iconName: "account-options" as const, label: t("runtime.accounts.actions.options", "Options"), onClick: onOptionsClick },
    { id: "add-money", iconName: "add-money" as const, label: t("runtime.accounts.actions.addMoney", "Add money") },
    { id: "mcash", iconName: "mcash" as const, label: t("runtime.accounts.actions.mCash", "mCash") },
  ];
  const actionItems = (items ?? defaultActions).slice(0, 4);
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
          hidden={item.hidden}
          stretch={stretchItems}
        />
      ))}
    </div>
  );
}
