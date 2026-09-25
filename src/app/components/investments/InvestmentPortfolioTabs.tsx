import type { InvestmentPortfolioTabOption, InvestmentPortfolioTabId } from "@/app/config/investmentsPortfolioConfig";
import MessagesMailboxTabs from "@/app/components/messages/MessagesMailboxTabs";

interface InvestmentPortfolioTabsProps {
  tabs: readonly InvestmentPortfolioTabOption[];
  selectedTabId: InvestmentPortfolioTabId;
  onChange: (tabId: InvestmentPortfolioTabId) => void;
  variant?: "underline" | "chips";
}

export default function InvestmentPortfolioTabs({
  tabs,
  selectedTabId,
  onChange,
  variant = "underline",
}: InvestmentPortfolioTabsProps) {
  if (variant === "chips") {
    return (
      <div
        className="flex h-[48px] items-center gap-[8px] overflow-x-auto px-[16px] scrollbar-hide"
        role="tablist"
        aria-label="Investments allocation by"
      >
        {tabs.map((tab) => {
          const selected = tab.id === selectedTabId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-pressed={selected}
              onClick={() => onChange(tab.id)}
              className={`h-[34px] shrink-0 whitespace-nowrap rounded-[4px] border px-[12px] text-[14px] font-bold leading-[18px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)] ${
                selected
                  ? "border-[var(--uc-action)] bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]"
                  : "border-transparent bg-[var(--uc-neutral-100)] text-[var(--uc-text)]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <MessagesMailboxTabs
      tabs={tabs}
      activeTabId={selectedTabId}
      onChange={(tabId) => onChange(tabId as InvestmentPortfolioTabId)}
      layout="scrollable"
      minTabWidth={150}
      ariaLabel="Investments portfolio tabs"
      withTopMargin={false}
      className="bg-[var(--uc-surface)]"
    />
  );
}
