import type { InvestmentPortfolioTabOption, InvestmentPortfolioTabId } from "@/app/config/investmentsPortfolioConfig";
import MessagesMailboxTabs from "@/app/components/messages/MessagesMailboxTabs";

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
