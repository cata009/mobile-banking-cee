import { useState } from "react";
import { BottomSheet } from "@/app/components/BottomSheet";
import BottomNavigation from "@/app/components/BottomNavigation";
import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import NewPaymentActionListItem from "@/app/components/payments/NewPaymentActionListItem";
import NewPaymentDiscoverBanner from "@/app/components/payments/NewPaymentDiscoverBanner";
import PaymentHeroCard from "@/app/components/payments/PaymentHeroCard";
import PaymentOtherShortcut from "@/app/components/payments/PaymentOtherShortcut";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useDemo } from "@/app/state/demoStore";
import {
  getPaymentsMenuForCountry,
  type NewPaymentAction,
  type NewPaymentSheetConfig,
  type PaymentHeroItem,
  type PaymentOtherItem,
} from "@/app/config/paymentsMenuConfig";

type NavItem = "home" | "analytics" | "payments" | "products" | "more";

interface PaymentsScreenProps {
  onHomeClick?: () => void;
  onAnalyticsClick?: () => void;
  onMessagesClick?: () => void;
  onProductsClick?: () => void;
  onMoreClick?: () => void;
  onDomesticPaymentClick?: () => void;
}

function PaymentsHeader({ title, onMessagesClick }: { title: string; onMessagesClick?: () => void }) {
  const { t } = useLanguage();
  const handleAction = (action: string) => {
    console.log(`Payments ${action} clicked`);
  };

  return (
    <div className="w-full bg-[var(--uc-surface)]">
      <div className="px-[24px] pb-[20px]">
        <div className="flex min-h-[32px] items-start gap-[8px]">
          <h1
            className="flex-1 min-w-0 font-['UniCredit',sans-serif] font-bold text-[var(--uc-text)]"
            style={{ fontSize: "28px", lineHeight: "normal" }}
          >
            {title}
          </h1>

          <HeaderActionRail>
            <HeaderActionButton icon="profile" label={t("runtime.actions.profile", "Profile")} onClick={() => handleAction("profile")} />
            <HeaderActionButton icon="messages" label={t("runtime.actions.messages", "Messages")} onClick={onMessagesClick} />
            <HeaderActionButton icon="help" label={t("runtime.actions.help", "Help")} onClick={() => handleAction("help")} />
          </HeaderActionRail>
        </div>
      </div>
    </div>
  );
}

function handleOtherPaymentActionClick(item: PaymentOtherItem) {
  console.log(`Payment other action clicked: ${item.id}`);
}

function NewPaymentSheet({
  config,
  onClose,
  onDomesticPaymentClick,
}: {
  config: NewPaymentSheetConfig;
  onClose: () => void;
  onDomesticPaymentClick?: () => void;
}) {
  const { t } = useLanguage();
  const localizedConfig: NewPaymentSheetConfig = {
    ...config,
    title: t("runtime.payments.newPayment.title", config.title),
    actions: config.actions.map((action) => ({
      ...action,
      title: t(`runtime.payments.newPayment.actions.${action.id}.title`, action.title),
      description: t(`runtime.payments.newPayment.actions.${action.id}.description`, action.description),
    })),
    infoBanner: {
      title: t("runtime.payments.newPayment.infoBanner.title", config.infoBanner.title),
      description: t("runtime.payments.newPayment.infoBanner.description", config.infoBanner.description),
    },
  };

  const handleActionSelect = (action: NewPaymentAction) => {
    if (action.id === "domestic-payment") {
      onClose();
      onDomesticPaymentClick?.();
    }
  };

  return (
    <BottomSheet title={localizedConfig.title} onClose={onClose}>
      <div className="flex flex-col">
        {localizedConfig.actions.map((action) => (
          <NewPaymentActionListItem key={action.id} action={action} onSelect={handleActionSelect} />
        ))}
      </div>
      <NewPaymentDiscoverBanner
        title={localizedConfig.infoBanner.title}
        description={localizedConfig.infoBanner.description}
      />
    </BottomSheet>
  );
}

export default function PaymentsScreen({
  onHomeClick,
  onAnalyticsClick,
  onMessagesClick,
  onProductsClick,
  onMoreClick,
  onDomesticPaymentClick,
}: PaymentsScreenProps) {
  const { country } = useDemo();
  const { t } = useLanguage();
  const menu = getPaymentsMenuForCountry(country);
  const localizedPrimaryItems = menu.primaryItems.map((item) => ({
    ...item,
    title: t(`runtime.payments.primaryItems.${item.id}.title`, item.title),
    description: t(`runtime.payments.primaryItems.${item.id}.description`, item.description),
  }));
  const localizedOtherItems = menu.otherItems.map((item) => ({
    ...item,
    label: t(`runtime.payments.otherItems.${item.id}`, item.label),
  }));
  const [isNewPaymentSheetOpen, setIsNewPaymentSheetOpen] = useState(false);

  const handlePrimaryItemSelect = (item: PaymentHeroItem) => {
    if (item.id === "new-payment") {
      setIsNewPaymentSheetOpen(true);
    }
  };

  const handleTabChange = (tab: NavItem) => {
    console.log(`Bottom nav tab clicked from payments: ${tab}`);
    if (tab === "home") {
      onHomeClick?.();
    }
    if (tab === "analytics") {
      onAnalyticsClick?.();
    }
    if (tab === "more") {
      onMoreClick?.();
    }
    if (tab === "products") {
      onProductsClick?.();
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]">
      <div className="h-[54px] flex-shrink-0 bg-[var(--uc-surface)]" />
      <PaymentsHeader title={t("runtime.payments.title", menu.title)} onMessagesClick={onMessagesClick} />

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-[76px]">
        <div className="flex flex-col gap-[13px] px-[20px] pt-[8px]">
          {localizedPrimaryItems.map((item) => (
            <PaymentHeroCard key={item.id} item={item} onSelect={handlePrimaryItemSelect} />
          ))}
        </div>

        <section className="px-[20px] pt-[16px]">
          <h2
            className="px-[10px] font-['UniCredit',sans-serif] font-bold text-[var(--uc-text)]"
            style={{ fontSize: "18px", lineHeight: "20px" }}
          >
            {t("runtime.payments.other", menu.otherTitle)}
          </h2>
          <div className="mt-[5px] h-px w-full bg-[var(--uc-border)]" />
          <div className="overflow-x-auto overflow-y-hidden scrollbar-hide pt-[8px]">
            <div className="flex w-max gap-[18px] pr-[20px]">
              {localizedOtherItems.map((item) => (
                <PaymentOtherShortcut key={item.id} item={item} onClick={handleOtherPaymentActionClick} />
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center border-t border-[var(--uc-border-muted)] bg-[var(--uc-bottom-bar-bg)]">
        <BottomNavigation activeTab="payments" onTabChange={handleTabChange} />
      </div>

      {isNewPaymentSheetOpen && (
        <NewPaymentSheet
          config={menu.newPaymentSheet}
          onClose={() => setIsNewPaymentSheetOpen(false)}
          onDomesticPaymentClick={onDomesticPaymentClick}
        />
      )}
    </div>
  );
}
