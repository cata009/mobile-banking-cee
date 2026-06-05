import { AppIcon, type IconName } from "@/app/components/icons";

interface InvestmentAction {
  id: string;
  iconName: IconName;
  label: string;
  badgeCount?: number;
  onClick?: () => void;
}

interface InvestmentActionBarProps {
  actions: readonly InvestmentAction[];
  investLabel: string;
  onInvestClick?: () => void;
}

function InvestmentActionButton({ action }: { action: InvestmentAction }) {
  return (
    <button
      type="button"
      onClick={action.onClick}
      className="flex min-w-0 flex-col items-center gap-[4px] px-[2px]"
      aria-label={action.label.replace(/\s+/g, " ")}
      data-ds-label="Investments action button"
    >
      <span className="relative grid size-[32px] place-items-center">
        <AppIcon name={action.iconName} color="var(--uc-icon)" />
        {action.badgeCount ? (
          <span className="uc-type-n5-strong absolute right-[-6px] top-[-5px] grid size-[20px] place-items-center rounded-full bg-[var(--uc-brand)] leading-none text-[var(--uc-text-inverse)]">
            {action.badgeCount > 99 ? "99+" : action.badgeCount}
          </span>
        ) : null}
      </span>
      <span className="uc-type-p2 whitespace-pre-line text-center leading-[15px] text-[var(--uc-text)]">
        {action.label}
      </span>
    </button>
  );
}

export default function InvestmentActionBar({
  actions,
  investLabel,
  onInvestClick,
}: InvestmentActionBarProps) {
  return (
    <div
      className="grid grid-cols-[1fr_1fr_1fr_56px] items-start gap-[6px] px-[16px] pb-[16px] pt-[24px]"
      data-ds-label="Investments action bar"
    >
      {actions.slice(0, 3).map((action) => (
        <InvestmentActionButton key={action.id} action={action} />
      ))}
      <button
        type="button"
        onClick={onInvestClick}
        className="flex h-[56px] w-[56px] flex-col items-center justify-center gap-0 rounded-full bg-[var(--uc-action)] px-[12px] py-[4px] text-[var(--uc-static-white)]"
        aria-label={investLabel}
        data-ds-label="Investments invest action"
      >
        <span className="grid size-[32px] place-items-center">
          <AppIcon name="invest-action" color="var(--uc-static-white)" size={32} />
        </span>
        <span className="text-[11px] font-bold leading-[12px] text-[var(--uc-static-white)]">
          {investLabel.toLowerCase()}
        </span>
      </button>
    </div>
  );
}
