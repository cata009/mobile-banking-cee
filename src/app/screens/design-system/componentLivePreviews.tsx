/**
 * Resolves the "View" tab live preview for any Design System component detail page.
 *
 * Every entry reuses a real, already-wired specimen: most delegate straight to the
 * same `*VariantSpecimen` component already rendered on the Components catalog page
 * (imported from cardSpecimens.tsx / fieldSpecimens.tsx / shadcnSpecimens.tsx), so the
 * preview and the catalog card can never drift apart. A handful of components that are
 * only ever inlined directly in DesignSystemPage.tsx get a very small thin adapter here
 * that imports the real component and supplies demonstrative props — never a redrawn
 * lookalike.
 */
import { useState } from "react";
import type { ReactNode } from "react";
import StatusBar from "@/app/components/StatusBar";
import DynamicIsland from "@/app/components/DynamicIsland";
import HomeHeader from "@/app/screens/home/HomeHeader";
import { MoreHeader } from "@/app/screens/more/MoreHeader";
import LanguageSelectorButton from "@/app/components/ui/LanguageSelectorButton";
import NavigationLink from "@/app/components/ui/NavigationLink";
import PreLoginHeading from "@/app/components/ui/PreLoginHeading";
import LinkButton from "@/app/components/ui/LinkButton";
import FloatingCoAppingButton from "@/app/components/FloatingCoAppingButton";
import { LogoutConfirmDialog } from "@/app/components/LogoutConfirmDialog";
import PanelWithTranslations from "@/app/components/PanelWithTranslations";
import PanelWithoutCoAppingTranslations from "@/app/components/PanelWithoutCoAppingTranslations";
import CardComponent from "@/app/components/cards/CardComponent";
import { noop } from "./inspect/MeasurementSurface";
import { ShadcnSpecimens } from "./shadcnSpecimens";
import {
  BarVariantSpecimen,
  BottomNavigationVariantSpecimen,
  ButtonRegistryVariantSpecimen,
  CardVariantSpecimen,
  DateFilterVariantSpecimen,
  GhostBannerVariantSpecimen,
  HeaderPreviewFrame,
  HelperCardVariantSpecimen,
  InfoBannerVariantSpecimen,
  InvestmentsFundBannerVariantSpecimen,
  PageHeaderVariantSpecimen,
  PaymentHeroCardVariantSpecimen,
  PendingActionCardVariantSpecimen,
  PillSortingVariantSpecimen,
  PrimaryButtonVariantSpecimen,
  ProductMenuCardVariantSpecimen,
  ProductOfferCardVariantSpecimen,
  RadioButtonVariantSpecimen,
  ShopsmartOfferCardVariantSpecimen,
  UserEventCardVariantSpecimen,
  WalletButtonVariantSpecimen,
} from "./specimens/cardSpecimens";
import {
  AccountActionBarVariantSpecimen,
  AccountBalanceCardCountrySpecimen,
  AccountCarouselIndicatorVariantSpecimen,
  AccountDetailsInfoFieldVariantSpecimen,
  AccountSearchBarVariantSpecimen,
  AccountTransactionRowVariantSpecimen,
  AmountFieldSpecimens,
  CodeFieldSpecimens,
  ContactsNavigationCardVariantSpecimen,
  MessagesMailboxTabsVariantSpecimen,
  NavigationRowVariantSpecimen,
  PillVariantSpecimen,
  ProductCardListTotalRowEvolutionSpecimen,
  ProfileAvatarVariantSpecimen,
  SectionHeadingDividerVariantSpecimen,
  TextFieldSpecimens,
  ToastMessageVariantSpecimen,
  ToggleButtonVariantSpecimen,
} from "./specimens/fieldSpecimens";

function LogoutConfirmDialogPreview() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="relative h-[280px] w-[375px] overflow-hidden rounded border bg-[var(--uc-app-bg)]">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="m-4 rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-4 py-2 text-[13px] font-bold text-[var(--uc-text)]"
        >
          Open logout dialog
        </button>
      ) : null}
      <LogoutConfirmDialog isOpen={isOpen} onClose={() => setIsOpen(false)} onConfirm={noop} />
    </div>
  );
}

const LIVE_PREVIEW_BUILDERS: Record<string, (themeMode: "light" | "dark") => ReactNode> = {
  "shell.status-bar": (themeMode) => (
    <HeaderPreviewFrame tone="surface" height={54}>
      <StatusBar variant={themeMode === "dark" ? "dark" : "light"} isCoAppingActive={themeMode === "dark"} />
      <DynamicIsland variant={themeMode === "dark" ? "dark" : "light"} />
    </HeaderPreviewFrame>
  ),
  "shell.home-header": () => (
    <HeaderPreviewFrame tone="app">
      <div className="pt-[24px]">
        <HomeHeader onPrimeClick={noop} onMessagesClick={noop} />
      </div>
    </HeaderPreviewFrame>
  ),
  "shell.more-header": () => (
    <HeaderPreviewFrame tone="surface">
      <div className="pt-[24px]">
        <MoreHeader onProfile={noop} onMessages={noop} onLogout={noop} messageCount={7} />
      </div>
    </HeaderPreviewFrame>
  ),
  "shell.page-header": (themeMode) => <PageHeaderVariantSpecimen themeMode={themeMode} />,
  "shell.bottom-navigation": () => <BottomNavigationVariantSpecimen />,
  "ui.section-heading-divider": () => <SectionHeadingDividerVariantSpecimen />,
  "ui.bar": () => <BarVariantSpecimen />,
  "ui.language-selector-button": () => (
    <div className="rounded-[8px] bg-[var(--uc-static-black)] p-4">
      <LanguageSelectorButton onClick={noop} language="en" />
    </div>
  ),
  "ui.navigation-link": () => (
    <div className="rounded-[8px] bg-[var(--uc-static-black)] p-4">
      <NavigationLink text="FIND OUT MORE" onClick={noop} />
    </div>
  ),
  "ui.prelogin-heading": () => (
    <div className="w-full rounded-[8px] bg-[var(--uc-static-black)] p-4">
      <PreLoginHeading
        h1="New look, & more services."
        h2="Open an account"
        h3="Open an account quickly and easily from the comfort of your home."
      />
    </div>
  ),
  "ui.radio-button": () => <RadioButtonVariantSpecimen />,
  "ui.primary-button": () => <PrimaryButtonVariantSpecimen />,
  "ui.link-button": () => (
    <div className="flex min-h-[72px] items-center justify-center rounded-[8px] bg-[var(--uc-surface)] p-[16px]">
      <LinkButton onClick={noop}>SEE MORE TRANSACTIONS</LinkButton>
    </div>
  ),
  "ui.wallet-button": () => <WalletButtonVariantSpecimen />,
  "ui.pill": () => <PillVariantSpecimen />,
  "ui.button-registry": () => <ButtonRegistryVariantSpecimen />,
  "ui.generic-controls": () => <ShadcnSpecimens />,
  "co-apping.floating-button": () => (
    <div className="relative h-[170px] w-[120px] rounded border bg-[var(--uc-app-bg)]">
      <FloatingCoAppingButton onClick={noop} />
    </div>
  ),
  "ui.text-field": () => <TextFieldSpecimens withChevron={false} />,
  "ui.amount-field": () => <AmountFieldSpecimens />,
  "ui.code-field": () => <CodeFieldSpecimens />,
  "ui.date-filter": () => <DateFilterVariantSpecimen />,
  "ui.pill-sorting": () => <PillSortingVariantSpecimen />,
  "ui.toggle-button": () => <ToggleButtonVariantSpecimen />,
  "ui.navigation-row": () => <NavigationRowVariantSpecimen />,
  "ui.profile-avatar": () => <ProfileAvatarVariantSpecimen />,
  "cards.card": () => <CardVariantSpecimen />,
  "products.offer-card": () => <ProductOfferCardVariantSpecimen />,
  "products.shopsmart-offer-card": () => <ShopsmartOfferCardVariantSpecimen />,
  "products.product-card": () => <ProductMenuCardVariantSpecimen />,
  "home.account-balance-card": () => <AccountBalanceCardCountrySpecimen />,
  "accounts.action-bar": () => <AccountActionBarVariantSpecimen />,
  "cards.ghost-banner": () => <GhostBannerVariantSpecimen />,
  "cards.info-banner": () => <InfoBannerVariantSpecimen />,
  "cards.user-event-card": () => <UserEventCardVariantSpecimen />,
  "cards.helper-card": () => <HelperCardVariantSpecimen />,
  "cards.pending-action-card": () => <PendingActionCardVariantSpecimen />,
  "investments.fund-banner": () => <InvestmentsFundBannerVariantSpecimen />,
  "cards.card-component": () => (
    <div className="w-full max-w-[375px]">
      <CardComponent />
    </div>
  ),
  "accounts.carousel-indicator": () => <AccountCarouselIndicatorVariantSpecimen />,
  "accounts.details-info-field": () => <AccountDetailsInfoFieldVariantSpecimen />,
  "messages.mailbox-tabs": () => <MessagesMailboxTabsVariantSpecimen />,
  "accounts.transaction-search": () => <AccountSearchBarVariantSpecimen />,
  "accounts.transaction-row": () => <AccountTransactionRowVariantSpecimen />,
  "payments.hero-card": () => <PaymentHeroCardVariantSpecimen />,
  "contacts.navigation-card": () => <ContactsNavigationCardVariantSpecimen />,
  "products.product-card-list-total": () => <ProductCardListTotalRowEvolutionSpecimen />,
  "ui.toast-message": () => <ToastMessageVariantSpecimen />,
  "dialogs.logout-confirmation": () => <LogoutConfirmDialogPreview />,
  "prelogin.other-panel": () => (
    <div className="relative h-[430px] w-full max-w-[375px] overflow-hidden rounded border">
      <PanelWithTranslations
        aboutSmartBanking="ABOUT SMART BANKING"
        exchangeRates="EXCHANGE RATES"
        findAtmBranches="FIND ATM & BRANCHES"
        startCoAppingSession="START CO-APPING SESSION"
        onClose={noop}
        onStartCoApping={noop}
      />
    </div>
  ),
  "prelogin.other-panel-basic": () => (
    <div className="relative h-[350px] w-full max-w-[375px] overflow-hidden rounded border">
      <PanelWithoutCoAppingTranslations
        aboutSmartBanking="ABOUT SMART BANKING"
        exchangeRates="EXCHANGE RATES"
        findAtmBranches="FIND ATM & BRANCHES"
        onClose={noop}
      />
    </div>
  ),
};

/**
 * Returns the live preview node for a component id, or null when no isolated
 * preview has been wired for it yet.
 */
export function getComponentLivePreview(componentId: string, themeMode: "light" | "dark"): ReactNode | null {
  const build = LIVE_PREVIEW_BUILDERS[componentId];
  return build ? build(themeMode) : null;
}
