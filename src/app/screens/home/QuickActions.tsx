/**
 * QuickActions - Quick action buttons section
 */

import { ArrowRight, CreditCard, Send, PlusCircle } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

interface QuickActionsProps {
  showPaymentsHub?: boolean;
  showRedesign?: boolean;
}

export default function QuickActions({ showPaymentsHub = false, showRedesign = false }: QuickActionsProps) {
  const { t } = useLanguage();
  
  const baseActions = [
    { id: "transfer", label: t('home.quickActions.transfer'), icon: Send },
    { id: "cards", label: t('home.quickActions.cards'), icon: CreditCard },
    { id: "more", label: t('home.quickActions.more'), icon: PlusCircle },
  ];

  // Add Payments Hub action if feature is enabled
  const actions = showPaymentsHub
    ? [
        ...baseActions.slice(0, 2),
        { id: "payments-hub", label: t('home.quickActions.paymentsHub'), icon: ArrowRight },
        baseActions[2],
      ]
    : baseActions;

  return (
    <div className="px-[24px] pt-[24px]">
      <div className={`rounded-[8px] p-[16px] shadow-sm ${
        showRedesign 
          ? 'bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200' 
          : 'bg-white'
      }`}>
        <h3 className="font-['UniCredit',sans-serif] text-[16px] font-bold text-[#262626] mb-[12px]">
          {t('home.quickActions.title')} {showRedesign && "✨"}
        </h3>
        <div className={`grid gap-[12px] ${
          showRedesign ? 'grid-cols-3' : 'grid-cols-2'
        }`}>
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                className={`
                  flex items-center justify-center gap-[8px] p-[12px] rounded-[6px]
                  border transition-all
                  ${
                    action.id === "payments-hub"
                      ? "border-red-500 bg-red-50 hover:bg-red-100"
                      : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                  }
                  ${showRedesign ? 'hover:scale-105 shadow-sm flex-col' : ''}
                `}
              >
                <Icon 
                  size={showRedesign ? 24 : 20} 
                  className={action.id === "payments-hub" ? "text-red-600" : "text-[#262626]"} 
                />
                <span 
                  className={`font-['UniCredit',sans-serif] ${
                    showRedesign ? 'text-[12px]' : 'text-[14px]'
                  } font-semibold ${
                    action.id === "payments-hub" ? "text-red-600" : "text-[#262626]"
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