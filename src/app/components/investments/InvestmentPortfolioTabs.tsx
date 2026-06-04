import type { InvestmentPortfolioTabOption, InvestmentPortfolioTabId } from "@/app/config/investmentsPortfolioConfig";

interface InvestmentPortfolioTabsProps {
  tabs: readonly InvestmentPortfolioTabOption[];
  selectedTabId: InvestmentPortfolioTabId;
  onChange: (tabId: InvestmentPortfolioTabId) => void;
}

export default function InvestmentPortfolioTabs({
  tabs,
  selectedTabId,
  onChange,
}: InvestmentPortfolioTabsProps) {
  return (
    <div className="w-full overflow-x-auto border-b border-[var(--uc-border-muted)] bg-[var(--uc-surface)] scrollbar-hide">
      <div className="flex min-w-max">
        {tabs.map((tab) => {
          const selected = tab.id === selectedTabId;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className="relative flex h-[48px] min-w-[150px] items-center justify-center px-[16px]"
              aria-pressed={selected}
            >
              <span className={`uc-type-n4-strong whitespace-nowrap ${selected ? "text-[var(--uc-text)]" : "text-[var(--uc-text-muted)]"}`}>
                {tab.label}
              </span>
              {selected && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[var(--uc-text)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
