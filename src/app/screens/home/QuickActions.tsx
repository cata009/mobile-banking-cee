/**
 * QuickActions - Quick action buttons section
 */

import { useLanguage } from "@/app/contexts/LanguageContext";
import { AppIcon, type IconName } from "@/app/components/icons";

interface QuickActionsProps {
  showPaymentsHub?: boolean;
  showRedesign?: boolean;
}

export default function QuickActions({ showPaymentsHub = false, showRedesign = false }: QuickActionsProps) {
  const { t } = useLanguage();
  
  const transferAction = { id: "transfer", label: t('home.quickActions.transfer'), icon: "send" as IconName };
  const cardsAction = { id: "cards", label: t('home.quickActions.cards'), icon: "credit-card" as IconName };
  const moreAction = { id: "more", label: t('home.quickActions.more'), icon: "add-money" as IconName };
  const baseActions = [transferAction, cardsAction, moreAction];

  // Add Payments Hub action if feature is enabled
  const actions = showPaymentsHub
    ? [
        ...baseActions.slice(0, 2),
        { id: "payments-hub", label: t('home.quickActions.paymentsHub'), icon: "arrow-right" as const },
        moreAction,
      ]
    : baseActions;

  return (
    <div className="px-[24px] pt-[24px]">
      <div className={`rounded-[8px] p-[16px] shadow-sm ${
        showRedesign
          ? 'bg-gradient-to-br from-[var(--uc-surface-muted)] to-[var(--uc-surface)] border-2 border-[var(--uc-border-muted)]'
          : 'bg-[var(--uc-surface)]'
      }`}>
        <h3 className="uc-type-n4-strong mb-[12px] text-[var(--uc-text)]">
          {t('home.quickActions.title')} {showRedesign && "✨"}
        </h3>
        <div className={`grid gap-[12px] ${
          showRedesign ? 'grid-cols-3' : 'grid-cols-2'
        }`}>
          {actions.map((action) => {
            return (
              <button
                key={action.id}
                className={`
                  flex items-center justify-center gap-[8px] p-[12px] rounded-[6px]
                  border transition-all
                  ${
                    action.id === "payments-hub"
                      ? "border-[var(--uc-brand)] bg-[color-mix(in_srgb,var(--uc-brand)_10%,var(--uc-surface))] hover:bg-[color-mix(in_srgb,var(--uc-brand)_14%,var(--uc-surface))]"
                      : "border-[var(--uc-border-muted)] bg-[var(--uc-surface-muted)] hover:bg-[var(--uc-app-bg)]"
                  }
                  ${showRedesign ? 'hover:scale-105 shadow-sm flex-col' : ''}
                `}
              >
                <span className="grid h-[32px] w-[32px] place-items-center">
                  <AppIcon
                    name={action.icon}
                    className={action.id === "payments-hub" ? "text-[var(--uc-brand)]" : "text-[var(--uc-text)]"}
                  />
                </span>
                <span
                  className={`${
                    showRedesign ? 'text-[12px] font-semibold' : 'uc-type-n5-strong'
                  } ${
                    action.id === "payments-hub" ? "text-[var(--uc-brand)]" : "text-[var(--uc-text)]"
                  }`}
                >
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
