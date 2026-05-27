/**
 * TransactionsPreview - Recent transactions list with optional filters
 */

import { useLanguage } from "@/app/contexts/LanguageContext";
import { AppIcon } from "@/app/components/icons";

interface TransactionsPreviewProps {
  showFilters?: boolean;
}

interface Transaction {
  id: string;
  description: string;
  date: string;
  amount: string;
  type: "debit" | "credit";
}

const mockTransactions: Transaction[] = [
  { id: "1", description: "Grocery Store", date: "Today, 14:30", amount: "-450.00", type: "debit" },
  { id: "2", description: "Salary", date: "Yesterday", amount: "+35,000.00", type: "credit" },
  { id: "3", description: "Coffee Shop", date: "Dec 29", amount: "-120.50", type: "debit" },
  { id: "4", description: "Online Shopping", date: "Dec 28", amount: "-2,300.00", type: "debit" },
  { id: "5", description: "Refund", date: "Dec 27", amount: "+890.00", type: "credit" },
];

export default function TransactionsPreview({ showFilters = false }: TransactionsPreviewProps) {
  const { t } = useLanguage();

  return (
    <div className="px-[24px] pt-[24px]">
      <div className="bg-[var(--uc-surface)] rounded-[8px] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-[16px] py-[12px] border-b border-[var(--uc-border-muted)] flex items-center justify-between">
          <h3 className="font-['UniCredit',sans-serif] text-[16px] font-bold text-[var(--uc-text)]">
            {t('home.transactions.title')}
          </h3>
          <button className="text-[var(--uc-brand)] text-[14px] font-semibold hover:underline">
            {t('home.transactions.viewAll')}
          </button>
        </div>

        {/* Filters Row (conditional) */}
        {showFilters && (
          <div className="px-[16px] py-[10px] bg-[var(--uc-surface-muted)] border-b border-[var(--uc-border-muted)]">
            <div className="flex items-center gap-[8px] overflow-x-auto scrollbar-hide">
              <button className="flex items-center gap-[6px] px-[12px] py-[6px] bg-[var(--uc-surface)] border border-[var(--uc-border)] rounded-[6px] text-[13px] font-medium text-[var(--uc-text)] hover:bg-[var(--uc-app-bg)] whitespace-nowrap">
                <AppIcon name="filter" size={14} />
                {t('home.transactions.filter.all')}
              </button>
              <button className="px-[12px] py-[6px] bg-[var(--uc-surface)] border border-[var(--uc-border)] rounded-[6px] text-[13px] font-medium text-[var(--uc-text)] hover:bg-[var(--uc-app-bg)] whitespace-nowrap">
                {t('home.transactions.filter.income')}
              </button>
              <button className="px-[12px] py-[6px] bg-[var(--uc-surface)] border border-[var(--uc-border)] rounded-[6px] text-[13px] font-medium text-[var(--uc-text)] hover:bg-[var(--uc-app-bg)] whitespace-nowrap">
                {t('home.transactions.filter.expenses')}
              </button>
              <button className="px-[12px] py-[6px] bg-[var(--uc-surface)] border border-[var(--uc-border)] rounded-[6px] text-[13px] font-medium text-[var(--uc-text)] hover:bg-[var(--uc-app-bg)] whitespace-nowrap">
                {t('home.transactions.filter.thisMonth')}
              </button>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div>
          {mockTransactions.map((transaction, index) => (
            <div
              key={transaction.id}
              className={`
                px-[16px] py-[12px] flex items-center justify-between
                hover:bg-[var(--uc-surface-muted)] cursor-pointer transition-colors
                ${index < mockTransactions.length - 1 ? "border-b border-[var(--uc-border-muted)]" : ""}
              `}
            >
              <div className="flex-1">
                <p className="font-['UniCredit',sans-serif] text-[14px] font-semibold text-[var(--uc-text)]">
                  {transaction.description}
                </p>
                <p className="font-['UniCredit',sans-serif] text-[12px] text-[var(--uc-text-muted)] mt-[2px]">
                  {transaction.date}
                </p>
              </div>
              <div className="flex items-center gap-[8px]">
                <span
                  className={`font-['UniCredit',sans-serif] text-[16px] font-bold ${
                    transaction.type === "credit" ? "text-[var(--uc-green-success)]" : "text-[var(--uc-text)]"
                  }`}
                >
                  {transaction.amount} CZK
                </span>
                <AppIcon name="chevron-right" size={16} className="text-[var(--uc-text-subtle)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
