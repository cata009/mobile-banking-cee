import { useState } from "react";
import { BottomSheet } from "@/app/components/BottomSheet";
import BottomNavigation from "@/app/components/BottomNavigation";
import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import NewPaymentActionListItem from "@/app/components/payments/NewPaymentActionListItem";
import NewPaymentDiscoverBanner from "@/app/components/payments/NewPaymentDiscoverBanner";
import PaymentHeroCard from "@/app/components/payments/PaymentHeroCard";
import PaymentOtherShortcut from "@/app/components/payments/PaymentOtherShortcut";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { resolveEffectiveAppContext } from "@/app/platform/effectiveAppContext";
import { useDemo } from "@/app/state/demoStore";
import type { BankingActionId } from "@/app/state/demoTypes";
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
  onContactsClick?: () => void;
  onMessagesClick?: () => void;
  onProductsClick?: () => void;
  onMoreClick?: () => void;
  onDomesticPaymentClick?: () => void;
}

function PaymentsHeader({
  title,
  onContactsClick,
  onMessagesClick,
}: {
  title: string;
  onContactsClick?: () => void;
  onMessagesClick?: () => void;
}) {
  const { country } = useDemo();
  const { t } = useLanguage();
  const usesBosniaHeaderActions = country === "BA" || country === "BA_BL";
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
            {usesBosniaHeaderActions ? (
              <HeaderActionButton icon="contact-phone" label="Contact phone" onClick={onContactsClick} />
            ) : (
              <HeaderActionButton icon="profile" label={t("runtime.actions.profile", "Profile")} onClick={() => handleAction("profile")} />
            )}
            <HeaderActionButton icon="messages" label={t("runtime.actions.messages", "Messages")} onClick={onMessagesClick} />
            {usesBosniaHeaderActions ? null : (
              <HeaderActionButton icon="help" label={t("runtime.actions.help", "Help")} onClick={() => handleAction("help")} />
            )}
          </HeaderActionRail>
        </div>
      </div>
    </div>
  );
}

function handleOtherPaymentActionClick(item: PaymentOtherItem) {
  console.log(`Payment other action clicked: ${item.id}`);
}

function getActionForHeroItem(item: PaymentHeroItem): BankingActionId {
  switch (item.id) {
    case "between-accounts":
      return "payments.exchange.create";
    case "manage-ebills":
      return "payments.ebills.manage";
    case "recurrent-payments":
      return "payments.templates.manage";
    default:
      return "payments.domestic.create";
  }
}

function PaymentHeroSheet({
  config,
  heroId,
  onClose,
  onDomesticPaymentClick,
}: {
  config: NewPaymentSheetConfig;
  heroId: PaymentHeroItem["id"];
  onClose: () => void;
  onDomesticPaymentClick?: () => void;
}) {
  const { t } = useLanguage();
  const localizedConfig: NewPaymentSheetConfig = {
    ...config,
    title: t(`runtime.payments.heroSheets.${heroId}.title`, config.title),
    actions: config.actions.map((action) => ({
      ...action,
      title: t(
        `runtime.payments.heroSheets.${heroId}.actions.${action.id}.title`,
        t(`runtime.payments.newPayment.actions.${action.id}.title`, action.title),
      ),
      description: t(
        `runtime.payments.heroSheets.${heroId}.actions.${action.id}.description`,
        t(`runtime.payments.newPayment.actions.${action.id}.description`, action.description),
      ),
    })),
    infoBanner: {
      title: t(
        `runtime.payments.heroSheets.${heroId}.infoBanner.title`,
        t("runtime.payments.newPayment.infoBanner.title", config.infoBanner.title),
      ),
      description: t(
        `runtime.payments.heroSheets.${heroId}.infoBanner.description`,
        t("runtime.payments.newPayment.infoBanner.description", config.infoBanner.description),
      ),
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
  onContactsClick,
  onMessagesClick,
  onProductsClick,
  onMoreClick,
  onDomesticPaymentClick,
}: PaymentsScreenProps) {
  const demoState = useDemo();
  const { country } = demoState;
  const { t } = useLanguage();
  const effectiveContext = resolveEffectiveAppContext(demoState);
  const disabledActionReasons = new Map(
    effectiveContext.disabledActions.map((disabledAction) => [disabledAction.action, disabledAction.reason])
  );
  const menu = getPaymentsMenuForCountry(country);
  const localizedPrimaryItems = menu.primaryItems.map((item) => {
    const translationKey = item.translationKey === undefined ? item.id : item.translationKey;

    return {
      ...item,
      title: translationKey ? t(`runtime.payments.primaryItems.${translationKey}.title`, item.title) : item.title,
      description: translationKey ? t(`runtime.payments.primaryItems.${translationKey}.description`, item.description) : item.description,
    };
  });
  const localizedOtherItems = menu.otherItems.map((item) => ({
    ...item,
    label: item.translationKey === null
      ? item.label
      : t(`runtime.payments.otherItems.${item.translationKey ?? item.id}`, item.label),
  }));
  const otherTitle = menu.otherTitleTranslationKey === null
    ? menu.otherTitle
    : t(menu.otherTitleTranslationKey ?? "runtime.payments.other", menu.otherTitle);
  const [selectedPrimaryItemId, setSelectedPrimaryItemId] = useState<PaymentHeroItem["id"] | null>(null);
  const selectedHeroSheet = selectedPrimaryItemId ? menu.heroSheets[selectedPrimaryItemId] : null;

  const handlePrimaryItemSelect = (item: PaymentHeroItem) => {
    console.log(`Payment hero action selected: ${item.id}`);
    setSelectedPrimaryItemId(item.id);
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
      <PaymentsHeader
        title={t("runtime.payments.title", menu.title)}
        onContactsClick={onContactsClick}
        onMessagesClick={onMessagesClick}
      />

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-[76px]">
        <div className="flex flex-col gap-[13px] px-[20px] pt-[8px]">
          {localizedPrimaryItems.map((item) => {
            const actionId = getActionForHeroItem(item);
            const disabledReason = disabledActionReasons.get(actionId);

            return (
              <PaymentHeroCard
                key={item.id}
                item={item}
                disabled={Boolean(disabledReason)}
                disabledReason={disabledReason}
                onSelect={handlePrimaryItemSelect}
              />
            );
          })}
        </div>

        <section className="px-[20px] pt-[16px]">
          <SectionHeadingDivider title={otherTitle} />
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

      {selectedHeroSheet && (
        <PaymentHeroSheet
          config={selectedHeroSheet}
          heroId={selectedPrimaryItemId}
          onClose={() => setSelectedPrimaryItemId(null)}
          onDomesticPaymentClick={onDomesticPaymentClick}
        />
      )}
    </div>
  );
}
