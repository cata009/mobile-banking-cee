/**
 * TransactionsPreview - Recent transactions list with optional filters
 */

import { ChevronRight, Filter } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

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
      <div className="bg-white rounded-[8px] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-[16px] py-[12px] border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-['UniCredit',sans-serif] text-[16px] font-bold text-[#262626]">
            {t('home.transactions.title')}
          </h3>
          <button className="text-red-600 text-[14px] font-semibold hover:underline">
            {t('home.transactions.viewAll')}
          </button>
        </div>

        {/* Filters Row (conditional) */}
        {showFilters && (
          <div className="px-[16px] py-[10px] bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-[8px] overflow-x-auto scrollbar-hide">
              <button className="flex items-center gap-[6px] px-[12px] py-[6px] bg-white border border-gray-300 rounded-[6px] text-[13px] font-medium text-[#262626] hover:bg-gray-100 whitespace-nowrap">
                <Filter size={14} />
                {t('home.transactions.filter.all')}
              </button>
              <button className="px-[12px] py-[6px] bg-white border border-gray-300 rounded-[6px] text-[13px] font-medium text-[#262626] hover:bg-gray-100 whitespace-nowrap">
                {t('home.transactions.filter.income')}
              </button>
              <button className="px-[12px] py-[6px] bg-white border border-gray-300 rounded-[6px] text-[13px] font-medium text-[#262626] hover:bg-gray-100 whitespace-nowrap">
                {t('home.transactions.filter.expenses')}
              </button>
              <button className="px-[12px] py-[6px] bg-white border border-gray-300 rounded-[6px] text-[13px] font-medium text-[#262626] hover:bg-gray-100 whitespace-nowrap">
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
                hover:bg-gray-50 cursor-pointer transition-colors
                ${index < mockTransactions.length - 1 ? "border-b border-gray-100" : ""}
              `}
            >
              <div className="flex-1">
                <p className="font-['UniCredit',sans-serif] text-[14px] font-semibold text-[#262626]">
                  {transaction.description}
                </p>
                <p className="font-['UniCredit',sans-serif] text-[12px] text-[#666666] mt-[2px]">
                  {transaction.date}
                </p>
              </div>
              <div className="flex items-center gap-[8px]">
                <span
                  className={`font-['UniCredit',sans-serif] text-[16px] font-bold ${
                    transaction.type === "credit" ? "text-green-600" : "text-[#262626]"
                  }`}
                >
                  {transaction.amount} CZK
                </span>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}