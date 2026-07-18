/**
 * HU Kids Payments and More pages, plus the payment hero sheet.
 *
 * Extracted verbatim from KidsMarketHomeApp.tsx.
 */
import { useState } from "react";
import { BottomSheet } from "@/app/components/BottomSheet";
import NewPaymentActionListItem from "@/app/components/payments/NewPaymentActionListItem";
import NewPaymentDiscoverBanner from "@/app/components/payments/NewPaymentDiscoverBanner";
import PaymentHeroCard from "@/app/components/payments/PaymentHeroCard";
import PaymentOtherShortcut from "@/app/components/payments/PaymentOtherShortcut";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { getDocumentsCountForCountry } from "@/app/config/documentsConfig";
import { getMoreCardsForCountry, type MoreCardType } from "@/app/config/moreCardsConfig";
import { getPaymentsMenuForCountry, type NewPaymentAction, type NewPaymentSheetConfig, type PaymentHeroItem } from "@/app/config/paymentsMenuConfig";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { ContactsCard } from "@/app/screens/more/cards/ContactsCard";
import { DocumentsCard } from "@/app/screens/more/cards/DocumentsCard";
import { MyRequestsCard } from "@/app/screens/more/cards/MyRequestsCard";
import { SettingsCard } from "@/app/screens/more/cards/SettingsCard";
import { TutorialCard } from "@/app/screens/more/cards/TutorialCard";
import { type HuThemePreset } from "../theme";
import { HU_KIDS_HIDDEN_PAYMENT_OTHER_IDS, HU_KIDS_HIDDEN_PAYMENT_PRIMARY_IDS, HU_KIDS_RUNTIME_COUNTRY, HU_KIDS_SIMPLIFIED_MENU_SHAPE_COUNTRY } from "../data";
import { HuKidsPiMenuFrame } from "../chrome";

export function HuKidsPaymentHeroSheet({
  config,
  heroId,
  onClose,
}: {
  config: NewPaymentSheetConfig;
  heroId: PaymentHeroItem["id"];
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const localizedConfig: NewPaymentSheetConfig = {
    ...config,
    title: t(`runtime.payments.primaryItems.${heroId}.title`, config.title),
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
  const handleActionSelect = (_action: NewPaymentAction) => {
    onClose();
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

export function HuKidsPaymentsPage({
  onMessages,
  onToggleAmounts,
  showAmounts,
  theme,
}: {
  onMessages?: () => void;
  onToggleAmounts: () => void;
  showAmounts: boolean;
  theme: HuThemePreset;
}) {
  const { t } = useLanguage();
  const menu = getPaymentsMenuForCountry(HU_KIDS_RUNTIME_COUNTRY);
  const [selectedPrimaryItemId, setSelectedPrimaryItemId] = useState<PaymentHeroItem["id"] | null>(null);
  const selectedHeroSheet = selectedPrimaryItemId ? menu.heroSheets[selectedPrimaryItemId] : null;
  const localizedPrimaryItems = menu.primaryItems
    .filter((item) => !HU_KIDS_HIDDEN_PAYMENT_PRIMARY_IDS.has(item.id))
    .map((item) => ({
      ...item,
      title: t(`runtime.payments.primaryItems.${item.id}.title`, item.title),
      description: t(`runtime.payments.primaryItems.${item.id}.description`, item.description),
    }));
  const localizedOtherItems = menu.otherItems
    .filter((item) => !HU_KIDS_HIDDEN_PAYMENT_OTHER_IDS.has(item.id))
    .map((item) => ({
      ...item,
      label: t(`runtime.payments.otherItems.${item.id}`, item.label),
    }));

  return (
    <>
      <HuKidsPiMenuFrame
        onMessages={onMessages}
        onToggleAmounts={onToggleAmounts}
        showAmounts={showAmounts}
        theme={theme}
        title={t("runtime.payments.title", menu.title)}
      >
        <div className="flex flex-col gap-[13px] px-[20px] pt-[8px]">
          {localizedPrimaryItems.map((item) => (
            <PaymentHeroCard
              key={item.id}
              item={item}
              onSelect={(selectedItem) => setSelectedPrimaryItemId(selectedItem.id)}
            />
          ))}
        </div>

        <section className="px-[20px] pt-[16px]">
          <SectionHeadingDivider title={t("runtime.payments.other", menu.otherTitle)} />
          <div className="scrollbar-hide overflow-x-auto overflow-y-hidden pt-[8px]">
            <div className="flex w-max gap-[18px] pr-[20px]">
              {localizedOtherItems.map((item) => (
                <PaymentOtherShortcut key={item.id} item={item} onClick={() => undefined} />
              ))}
            </div>
          </div>
        </section>
      </HuKidsPiMenuFrame>

      {selectedHeroSheet && selectedPrimaryItemId ? (
        <HuKidsPaymentHeroSheet
          config={selectedHeroSheet}
          heroId={selectedPrimaryItemId}
          onClose={() => setSelectedPrimaryItemId(null)}
        />
      ) : null}
    </>
  );
}

export function HuKidsMorePage({
  onContacts,
  onMessages,
  onToggleAmounts,
  onSettings,
  showAmounts,
  theme,
}: {
  onContacts: () => void;
  onMessages?: () => void;
  onToggleAmounts: () => void;
  onSettings: () => void;
  showAmounts: boolean;
  theme: HuThemePreset;
}) {
  const { t } = useLanguage();
  const availableCards = getMoreCardsForCountry(HU_KIDS_SIMPLIFIED_MENU_SHAPE_COUNTRY).filter(
    (cardType) => cardType !== "my-requests",
  );
  const documentsCount = getDocumentsCountForCountry(HU_KIDS_RUNTIME_COUNTRY);
  const cardLabels: Record<MoreCardType, string> = {
    contacts: t("more.cards.contacts", "Contact"),
    documents: t("more.cards.documents", "Documents"),
    settings: t("more.cards.settings", "Settings"),
    "gdpr-consent": t("more.cards.gdprConsent", "GDPR Consent"),
    "third-party-consent": t("more.cards.thirdPartyConsent", "Third party consents"),
    "digital-activities": t("more.cards.digitalActivities", "Digital activity record"),
    "my-requests": t("more.cards.myRequests", "Product applications and cancellations"),
    tutorial: t("more.cards.tutorial", "Tutorials"),
  };

  const renderCard = (cardType: MoreCardType) => {
    switch (cardType) {
      case "contacts":
        return <ContactsCard key="contacts" title={cardLabels.contacts} onClick={onContacts} />;
      case "documents":
        return (
          <DocumentsCard
            key="documents"
            title={cardLabels.documents}
            badgeCount={documentsCount}
            onClick={() => undefined}
          />
        );
      case "settings":
        return <SettingsCard key="settings" title={cardLabels.settings} onClick={onSettings} />;
      case "my-requests":
        return <MyRequestsCard key="my-requests" title={cardLabels["my-requests"]} onClick={() => undefined} />;
      case "tutorial":
        return <TutorialCard key="tutorial" title={cardLabels.tutorial} onClick={() => undefined} />;
      default:
        return null;
    }
  };

  return (
    <HuKidsPiMenuFrame
      onMessages={onMessages}
      onToggleAmounts={onToggleAmounts}
      showAmounts={showAmounts}
      theme={theme}
      title={t("more.title", "More")}
    >
      <div className="px-[16px] pt-[16px]">
        <div className="grid grid-cols-2 gap-x-[15px] gap-y-[16px]">
          {availableCards.map((cardType) => renderCard(cardType))}
        </div>
      </div>
    </HuKidsPiMenuFrame>
  );
}
