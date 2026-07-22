/**
 * Design System specimens for cards, banners, headers, and buttons.
 *
 * Extracted verbatim from DesignSystemPage.tsx.
 */
import { useState } from "react";
import PageHeader from "@/app/components/PageHeader";
import BottomNavigation from "@/app/components/BottomNavigation";
import HomeHeader from "@/app/screens/home/HomeHeader";
import { MoreHeader } from "@/app/screens/more/MoreHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import Bar, { type BarStatus } from "@/app/components/ui/Bar";
import DateFilter, { type DateFilterType } from "@/app/components/ui/DateFilter";
import PillSorting, { type PillSortingValue } from "@/app/components/ui/PillSorting";
import WalletButton, { type GoogleWalletLocale, type WalletButtonKind, type WalletButtonSize } from "@/app/components/ui/WalletButton";
import { RadioButton } from "@/app/components/common";
import FigmaCard, { CARD_VARIANTS, type CardSize, type CardVariant } from "@/app/components/cards/Card";
import GhostBanner from "@/app/components/cards/GhostBanner";
import InfoBanner from "@/app/components/cards/InfoBanner";
import UserEventCard from "@/app/components/cards/UserEventCard";
import HelperCard from "@/app/components/cards/HelperCard";
import PendingActionCard from "@/app/components/cards/PendingActionCard";
import InvestmentsFundBanner, {
  type InvestmentsFundBannerVariantId,
} from "@/app/components/investments/InvestmentsFundBanner";
import {
  INVESTMENT_FUND_COLLECTIONS,
  getInvestmentFundCollection,
} from "@/app/config/investmentFundCollections";
import ProductMenuCard from "@/app/components/products/ProductMenuCard";
import ProductOfferCard from "@/app/components/products/ProductOfferCard";
import ShopsmartOfferCard from "@/app/components/shopsmart/ShopsmartOfferCard";
import productCardAccountImage from "../../../../../screenshots/account.png";
import productCardCardsImage from "../../../../../screenshots/cards.png";
import productCardInsuranceImage from "../../../../../screenshots/insurance.png";
import productCardInvestmentsImage from "../../../../../screenshots/investments.png";
import productCardMarketHedgingImage from "../../../../../screenshots/market-hedging.png";
import productCardMortgagesImage from "../../../../../screenshots/mortgages.png";
import productCardPartnerOffersImage from "../../../../../screenshots/partner-offers.png";
import productCardShopSmartImage from "../../../../../screenshots/shopsmart.png";
import shopsmartDsOffers1Image from "@/assets/shopsmart/shopsmart-ds-offers-1.png";
import shopsmartDsOffers2Image from "@/assets/shopsmart/shopsmart-ds-offers-2.png";
import PaymentHeroCard, { PAYMENT_HERO_CARD_IMAGE_VARIANTS } from "@/app/components/payments/PaymentHeroCard";
import type { PaymentHeroImageVariant, PaymentHeroItem } from "@/app/config/paymentsMenuConfig";
import { type ProductsCard as ProductsMenuCardData } from "@/app/config/productsMenuConfig";
import StatusBar from "@/app/components/StatusBar";
import DynamicIsland from "@/app/components/DynamicIsland";
import { Button } from "@/app/components/ui/button";
import { PRODUCT_BANNER_TONE_OPTIONS } from "@/app/config/productBannerVariants";
import { noop } from "../inspect/MeasurementSurface";
import { Specimen, VariantSelector, type SelectorOption } from "../specimenShell";

export function CardVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState<CardVariant>("mc-debit-gold");
  const sizes: readonly { id: CardSize; label: string }[] = [
    { id: "figma", label: "64x40" },
    { id: "medium", label: "96x60" },
    { id: "large", label: "160x100" },
  ];
  const variantOptions = Object.entries(CARD_VARIANTS).map(([id, art]) => ({
    id,
    label: `${art.label} (${art.network})`,
  }));

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="card-variant-select"
        value={selectedVariant}
        onChange={(value) => setSelectedVariant(value as CardVariant)}
        options={variantOptions}
      />
      <div className="flex flex-wrap items-end gap-6">
        {sizes.map((size) => (
          <div key={size.id} className="flex flex-col gap-2">
            <FigmaCard
              ariaLabel={`${CARD_VARIANTS[selectedVariant].label} ${size.label}`}
              size={size.id}
              variant={selectedVariant}
            />
            <p className="font-['UniCredit:Regular',sans-serif] text-[12px] text-[var(--uc-text-muted)]">
              {size.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

type GhostBannerVariant = "title-and-description" | "title-only" | "long-description";

const GHOST_BANNER_VARIANTS: Record<GhostBannerVariant, { title: string; description?: string }> = {
  "title-and-description": {
    title: "Apply for a loan",
    description: "Check out our best loan offers with\nfixed and variable interest rate",
  },
  "title-only": {
    title: "Apply for a loan",
  },
  "long-description": {
    title: "Open a savings account",
    description: "Set money aside automatically and earn interest with no monthly fees or hidden costs.",
  },
};

const GHOST_BANNER_VARIANT_OPTIONS = [
  { id: "title-and-description", label: "Title and description" },
  { id: "title-only", label: "Title only" },
  { id: "long-description", label: "Long description" },
] satisfies readonly SelectorOption<GhostBannerVariant>[];

export function GhostBannerVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState<GhostBannerVariant>("title-and-description");
  const active = GHOST_BANNER_VARIANTS[selectedVariant];

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="ghost-banner-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={GHOST_BANNER_VARIANT_OPTIONS}
      />
      <div className="flex w-[375px] flex-col gap-[16px] p-[16px]">
        <GhostBanner title={active.title} description={active.description} onClick={() => undefined} />
      </div>
    </div>
  );
}

type InfoBannerVariant = "with-action" | "no-action" | "title-only";

const INFO_BANNER_VARIANTS: Record<InfoBannerVariant, { title: string; description?: string; actionLabel?: string }> = {
  "with-action": {
    title: "We are completing your investment account opening.",
    description: "It can take up to one business day. Come back again to start investing and grow your money.",
    actionLabel: "EDIT",
  },
  "no-action": {
    title: "We are completing your investment account opening.",
    description: "It can take up to one business day. Come back again to start investing and grow your money.",
  },
  "title-only": {
    title: "Your statement is ready to download.",
    actionLabel: "VIEW",
  },
};

const INFO_BANNER_VARIANT_OPTIONS = [
  { id: "with-action", label: "Title, description and action" },
  { id: "no-action", label: "Title and description" },
  { id: "title-only", label: "Title and action" },
] satisfies readonly SelectorOption<InfoBannerVariant>[];

export function InfoBannerVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState<InfoBannerVariant>("with-action");
  const active = INFO_BANNER_VARIANTS[selectedVariant];

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="info-banner-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={INFO_BANNER_VARIANT_OPTIONS}
      />
      <div className="flex w-[375px] flex-col gap-[16px] p-[16px]">
        <InfoBanner
          title={active.title}
          description={active.description}
          actionLabel={active.actionLabel}
          onActionClick={() => undefined}
        />
      </div>
    </div>
  );
}

export function InvestmentsFundBannerVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState<InvestmentsFundBannerVariantId>("discovery");
  const collection = selectedVariant === "discovery" ? null : getInvestmentFundCollection(selectedVariant);
  const variantOptions = [
    { id: "discovery", label: "Fund discovery" },
    ...INVESTMENT_FUND_COLLECTIONS.map(({ id, title }) => ({ id, label: title })),
  ] satisfies readonly SelectorOption<InvestmentsFundBannerVariantId>[];

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="investments-fund-banner-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={variantOptions}
      />
      <div className="flex w-[375px] flex-col gap-[16px] p-[16px]">
        <InvestmentsFundBanner
          title={collection?.title ?? "Find out the best fund for you"}
          description={collection?.subtitle ?? "Discover our suggestions"}
          actionLabel={collection ? "FIND OUT MORE" : "GO TO FUNDS WINDOW"}
          variant={selectedVariant}
          onClick={() => undefined}
        />
      </div>
    </div>
  );
}

type UserEventCardVariant = "link-and-options" | "plain";

type UserEventCardVariantData = {
  iconName: "user-event-badge" | "user-event-refresh";
  actionLabel?: string;
  showOptions?: boolean;
};

const USER_EVENT_CARD_VARIANTS: Record<UserEventCardVariant, UserEventCardVariantData> = {
  "link-and-options": { iconName: "user-event-badge", actionLabel: "FIND OUT MORE", showOptions: true },
  "plain": { iconName: "user-event-refresh" },
};

const USER_EVENT_CARD_VARIANT_OPTIONS = [
  { id: "link-and-options", label: "With link and options" },
  { id: "plain", label: "Without link and options" },
] satisfies readonly SelectorOption<UserEventCardVariant>[];

export function UserEventCardVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState<UserEventCardVariant>("link-and-options");
  const active = USER_EVENT_CARD_VARIANTS[selectedVariant];

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="user-event-card-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={USER_EVENT_CARD_VARIANT_OPTIONS}
      />
      <div className="flex w-[375px] flex-col gap-[16px] p-[16px]">
        <UserEventCard
          title="Expenses higher than usual"
          description={"Track your spending and try to get\nthe most our of your money."}
          iconName={active.iconName}
          actionLabel={active.actionLabel}
          showOptions={active.showOptions}
          onActionClick={() => undefined}
          onOptionsClick={() => undefined}
        />
      </div>
    </div>
  );
}

type HelperCardVariant = "with-link" | "plain";

const HELPER_CARD_VARIANTS: Record<HelperCardVariant, { actionLabel?: string; dismissible?: boolean }> = {
  "with-link": { actionLabel: "SEE DETAILS", dismissible: false },
  "plain": { dismissible: false },
};

const HELPER_CARD_VARIANT_OPTIONS = [
  { id: "with-link", label: "With link" },
  { id: "plain", label: "Without link" },
] satisfies readonly SelectorOption<HelperCardVariant>[];

export function HelperCardVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState<HelperCardVariant>("with-link");
  const active = HELPER_CARD_VARIANTS[selectedVariant];

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="helper-card-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={HELPER_CARD_VARIANT_OPTIONS}
      />
      <div className="flex w-[375px] flex-col gap-[16px] p-[16px]">
        <HelperCard
          title="Details"
          description="Use Details to view more information."
          actionLabel={active.actionLabel}
          dismissible={active.dismissible}
          onActionClick={() => undefined}
          onClose={() => undefined}
        />
      </div>
    </div>
  );
}

export function PendingActionCardVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("with-tag");
  const showTag = selectedVariant === "with-tag";

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="pending-action-card-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "with-tag", label: "With expiring tag" },
          { id: "no-tag", label: "Without tag" },
        ]}
      />
      <div className="flex w-[375px] flex-col gap-[16px] p-[16px]">
        <PendingActionCard
          title="Pending Action"
          description="You have to reject or confirm a pending payment"
          tagLabel={showTag ? "Expiring on 12.04.25" : undefined}
          onClick={() => undefined}
        />
      </div>
    </div>
  );
}

export function ProductOfferCardVariantSpecimen() {
  const [selectedToneId, setSelectedToneId] = useState(PRODUCT_BANNER_TONE_OPTIONS[0]?.id ?? "green-normal");
  const [selectedSize, setSelectedSize] = useState<"standard" | "compact">("standard");
  const selectedTone =
    PRODUCT_BANNER_TONE_OPTIONS.find((tone) => tone.id === selectedToneId) ?? PRODUCT_BANNER_TONE_OPTIONS[0];

  if (!selectedTone) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <VariantSelector
          id="product-offer-tone-select"
          value={selectedTone.id}
          onChange={setSelectedToneId}
          options={PRODUCT_BANNER_TONE_OPTIONS.map((tone) => ({ id: tone.id, label: tone.label }))}
          extras={
            <div className="flex items-center gap-3 text-[12px] text-[var(--uc-text-muted)]">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-[3px] border border-[var(--uc-border)]" style={{ backgroundColor: selectedTone.backgroundColor }} />
              bg
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-[3px] border border-[var(--uc-border)]" style={{ backgroundColor: selectedTone.chevronColor }} />
              chevron
            </span>
          </div>
          }
        />
        <VariantSelector
          id="product-offer-size-select"
          value={selectedSize}
          onChange={setSelectedSize}
          options={[
            { id: "standard", label: "Standard 22/18px" },
            { id: "compact", label: "Compact 20/16/14px" },
          ]}
        />
      </div>

      <ProductOfferCard
        variant={selectedSize}
        colorFamily={selectedTone.family}
        lightVersion={selectedTone.lightVersion}
        offer={{
          id: "ds-offer-sample",
          title: "Premium current\naccount offer",
          description: "Enjoy zero monthly fee\nand smart everyday\nbanking benefits.",
          caption: "Limited-time offer, terms apply",
        }}
      />
    </div>
  );
}

export function ShopsmartOfferCardVariantSpecimen() {
  return (
    <div className="flex flex-wrap items-start gap-[16px]">
      <div className="h-[218px] w-[255px] overflow-visible">
        <div className="origin-top-left scale-[0.78]">
          <ShopsmartOfferCard
            merchant="Hilton Bucharest"
            title="10% cashback"
            statusText="Until 31.12.2024"
            imageSrc={shopsmartDsOffers1Image}
            imageHeight={143}
            imageOverlay
            pillLabel="Activate"
            pillTone="teal"
            distance="11.5 km"
            trailingIcon="partners"
          />
        </div>
      </div>
      <div className="h-[218px] w-[255px] overflow-visible">
        <div className="origin-top-left scale-[0.78]">
          <ShopsmartOfferCard
            merchant="Hilton Bucharest"
            title="10% cashback"
            statusText="Bookings over 2,000 RON"
            imageSrc={shopsmartDsOffers2Image}
            imageHeight={143}
            imageOverlay
            tagLabel="FREE SHIPPING"
            distance="11.5 km"
            trailingIcon="partners"
          />
        </div>
      </div>
    </div>
  );
}

export function ProductMenuCardVariantSpecimen() {
  const cards = [
    {
      id: "account",
      title: "Current\naccounts",
      background: "var(--uc-product-blue-deep)",
      illustration: "flowers",
      imageSrc: productCardAccountImage,
    },
    {
      id: "cards",
      title: "Cards",
      background: "var(--uc-red-card)",
      illustration: "bag",
      imageSrc: productCardCardsImage,
    },
    {
      id: "mortgages-loans",
      title: "Mortgages and\nLoans",
      background: "var(--uc-product-mauve)",
      illustration: "pillow",
      imageSrc: productCardMortgagesImage,
    },
    {
      id: "insurance",
      title: "Insurance",
      background: "var(--uc-product-blue)",
      illustration: "umbrella",
      imageSrc: productCardInsuranceImage,
    },
    {
      id: "investments-savings",
      title: "Investments &\nSavings",
      background: "var(--uc-product-slate)",
      illustration: "branch",
      imageSrc: productCardInvestmentsImage,
    },
    {
      id: "market-hedging",
      title: "Market Hedging",
      background: "var(--uc-product-hedging)",
      illustration: "arrow",
      imageSrc: productCardMarketHedgingImage,
    },
    {
      id: "shopsmart",
      title: "Shopsmart",
      background: "var(--uc-green-main)",
      illustration: "bag",
      imageSrc: productCardShopSmartImage,
    },
    {
      id: "partner-offers",
      title: "Partner\nOffers",
      background: "var(--uc-orange-main)",
      illustration: "arrow",
      imageSrc: productCardPartnerOffersImage,
    },
  ] as const satisfies readonly [ProductsMenuCardData, ...ProductsMenuCardData[]];
  type ProductMenuCardSampleId = (typeof cards)[number]["id"];
  const [selectedCardId, setSelectedCardId] = useState<ProductMenuCardSampleId>(cards[0].id);
  const [selectedSize, setSelectedSize] = useState<"standard" | "compact">("standard");
  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? cards[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <VariantSelector
          id="product-menu-card-select"
          value={selectedCard.id}
          onChange={setSelectedCardId}
          options={cards.map((card) => ({ id: card.id, label: card.title.replace(/\n/g, " ") }))}
          extras={
            <div className="flex items-center gap-1.5 text-[12px] text-[var(--uc-text-muted)]">
              <span
                className="size-3 rounded-[3px] border border-[var(--uc-border)]"
                style={{ background: selectedCard.background }}
              />
              background
            </div>
          }
        />
        <VariantSelector
          id="product-menu-card-size-select"
          value={selectedSize}
          onChange={setSelectedSize}
          options={[
            { id: "standard", label: "Standard 120px" },
            { id: "compact", label: "Compact 72px" },
          ]}
        />
      </div>

      <ProductMenuCard card={selectedCard} variant={selectedSize} />
    </div>
  );
}

function HeaderPreviewFrame({
  children,
  tone = "surface",
  height,
}: {
  children: React.ReactNode;
  tone?: "surface" | "app" | "dark";
  height?: number;
}) {
  const surfaceClass =
    tone === "dark"
      ? "bg-[var(--uc-app-bg)]"
      : tone === "app"
        ? "bg-[var(--uc-app-bg)]"
        : "bg-[var(--uc-surface)]";

  return (
    <div
      className={`relative w-[375px] overflow-hidden border border-[var(--uc-border)] ${tone === "dark" ? "dark" : ""} ${surfaceClass}`}
      style={height ? { height } : undefined}
    >
      {children}
    </div>
  );
}

export function StatusBarVariantSpecimen() {
  return (
    <Specimen name="Status bar" detailsHref="#component/shell.status-bar">
      {(themeMode) => {
        const isDark = themeMode === "dark";

        return (
          <HeaderPreviewFrame tone="surface" height={54}>
            <StatusBar variant={isDark ? "dark" : "light"} isCoAppingActive={isDark} />
            <DynamicIsland variant={isDark ? "dark" : "light"} />
          </HeaderPreviewFrame>
        );
      }}
    </Specimen>
  );
}

export function HomeHeaderSpecimen() {
  return (
    <Specimen name="Home">
      <HeaderPreviewFrame tone="app">
        <div className="pt-[24px]">
          <HomeHeader onPrimeClick={noop} onMessagesClick={noop} />
        </div>
      </HeaderPreviewFrame>
    </Specimen>
  );
}

export function MoreHeaderSpecimen() {
  return (
    <Specimen name="More">
      <HeaderPreviewFrame tone="surface">
        <div className="pt-[24px]">
          <MoreHeader onProfile={noop} onMessages={noop} onLogout={noop} messageCount={7} />
        </div>
      </HeaderPreviewFrame>
    </Specimen>
  );
}

const PAGE_HEADER_VARIANTS = [
  { id: "level-1-page", label: "Level 1 page" },
  { id: "level-1-center", label: "Level 1 center" },
  { id: "level-1-categorized", label: "Level 1 categorized" },
  { id: "level-1-uncategorized", label: "Level 1 uncategorized" },
  { id: "collapsed", label: "Collapsed" },
] satisfies readonly SelectorOption[];

function PageHeaderVariantSpecimen({
  themeMode,
}: {
  themeMode: "light" | "dark";
}) {
  const [selectedVariant, setSelectedVariant] = useState("level-1-page");
  const isDark = themeMode === "dark";
  const variantProps = (() => {
    switch (selectedVariant) {
      case "level-1-center":
        return {
          title: "Account Details",
          largeTitleAlign: "center" as const,
        };
      case "level-1-categorized":
        return {
          title: "Utility bill",
          largeTitleColor: "var(--uc-pfm-utilities)",
        };
      case "level-1-uncategorized":
        return {
          title: "Uncategorized",
          largeTitleColor: "var(--uc-pfm-uncategorized)",
        };
      case "collapsed":
        return {
          title: "Account Details",
          collapsedTitleProgress: 1,
        };
      default:
        return {
          title: "Select language",
        };
    }
  })();

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="page-header-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={PAGE_HEADER_VARIANTS}
      />
      <HeaderPreviewFrame tone={isDark ? "dark" : "surface"}>
        <PageHeader
          onBack={noop}
          variant={isDark ? "dark" : "light"}
          {...variantProps}
        />
      </HeaderPreviewFrame>
    </div>
  );
}

export function PageHeaderSpecimen() {
  return (
    <Specimen name="PageHeader" detailsHref="#component/shell.page-header">
      {(themeMode) => <PageHeaderVariantSpecimen themeMode={themeMode} />}
    </Specimen>
  );
}

export function BottomNavigationVariantSpecimen() {
  const [selectedTab, setSelectedTab] = useState("home");
  const options = [
    { id: "home", label: "Home" },
    { id: "analytics", label: "Spending" },
    { id: "payments", label: "Payments" },
    { id: "products", label: "Products" },
    { id: "more", label: "More" },
  ] satisfies readonly SelectorOption[];

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="bottom-navigation-variant-select"
        label="Active tab"
        value={selectedTab}
        onChange={setSelectedTab}
        options={options}
      />
      <div className="w-[375px] rounded border bg-[var(--uc-surface)]">
        <BottomNavigation activeTab={selectedTab as "home" | "analytics" | "payments" | "products" | "more"} onTabChange={noop} />
      </div>
    </div>
  );
}

export function PaymentHeroCardVariantSpecimen() {
  const [selectedVariantId, setSelectedVariantId] = useState<PaymentHeroImageVariant>(PAYMENT_HERO_CARD_IMAGE_VARIANTS[0].id);
  const selectedVariant =
    PAYMENT_HERO_CARD_IMAGE_VARIANTS.find((variant) => variant.id === selectedVariantId) ??
    PAYMENT_HERO_CARD_IMAGE_VARIANTS[0];
  const selectedItem: PaymentHeroItem = {
    id: "new-payment",
    title: selectedVariant.title,
    description: selectedVariant.description,
    illustration: "wallet",
    imageVariant: selectedVariant.id,
  };

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="payment-hero-card-select"
        label="Card"
        value={selectedVariant.id}
        onChange={setSelectedVariantId}
        options={PAYMENT_HERO_CARD_IMAGE_VARIANTS.map((variant) => ({ id: variant.id, label: variant.label }))}
      />
      <div className="w-full max-w-[327px]">
        <PaymentHeroCard item={selectedItem} imageVariant={selectedVariant.id} />
      </div>
    </div>
  );
}

export function RadioButtonVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("selected");

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="radio-button-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "selected", label: "Selected" },
          { id: "unselected", label: "Unselected" },
        ]}
      />
      <div className="w-full max-w-[327px]">
        <RadioButton
          selected={selectedVariant === "selected"}
          label={selectedVariant === "selected" ? "ENGLISH" : "ROMANIAN"}
          onClick={noop}
        />
      </div>
    </div>
  );
}

export function PrimaryButtonVariantSpecimen() {
  return (
    <div className="w-[327px]">
      <PrimaryButton variant="action" labelSize="16" className="w-full">
        Continue
      </PrimaryButton>
    </div>
  );
}

export function ButtonRegistryVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("default");
  const label = selectedVariant === "destructive" ? "Delete" : selectedVariant === "ghost" ? "Ghost" : "Continue";

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="button-registry-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "default", label: "Default" },
          { id: "secondary", label: "Secondary" },
          { id: "outline", label: "Outline" },
          { id: "ghost", label: "Ghost" },
          { id: "destructive", label: "Destructive" },
        ]}
      />
      <div className="flex flex-wrap gap-3">
        <Button variant={selectedVariant as "default" | "secondary" | "outline" | "ghost" | "destructive"}>
          {label}
        </Button>
      </div>
    </div>
  );
}

export function WalletButtonVariantSpecimen() {
  const [kind, setKind] = useState<WalletButtonKind>("google-wallet");
  const [size, setSize] = useState<WalletButtonSize>("condensed");
  const [locale, setLocale] = useState<GoogleWalletLocale>("EN");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <VariantSelector
          id="wallet-button-kind-select"
          label="Wallet kind"
          value={kind}
          onChange={(value) => setKind(value as WalletButtonKind)}
          options={[
            { id: "google-wallet", label: "Google wallet" },
            { id: "apple-wallet", label: "Apple wallet" },
            { id: "click-to-pay", label: "Click to Pay" },
          ]}
        />
        <VariantSelector
          id="wallet-button-size-select"
          label="Wallet size"
          value={size}
          onChange={(value) => setSize(value as WalletButtonSize)}
          options={[
            { id: "condensed", label: "Condensed" },
            { id: "long", label: "Long / 327px" },
          ]}
        />
        {kind === "google-wallet" ? (
          <VariantSelector
            id="wallet-button-locale-select"
            label="Google locale"
            value={locale}
            onChange={(value) => setLocale(value as GoogleWalletLocale)}
            options={[
              { id: "EN", label: "EN" },
              { id: "HU", label: "HU" },
              { id: "SK", label: "SK" },
              { id: "CZ", label: "CZ" },
            ]}
          />
        ) : null}
      </div>
      <div className="flex min-h-[104px] w-[375px] items-center justify-center rounded-[8px] bg-[var(--uc-surface)] p-[24px]">
        <WalletButton kind={kind} size={size} locale={locale} />
      </div>
    </div>
  );
}

export function BarVariantSpecimen() {
  const [status, setStatus] = useState<BarStatus>("full");

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="bar-status-select"
        value={status}
        onChange={(value) => setStatus(value as BarStatus)}
        options={[
          { id: "empty", label: "Empty" },
          { id: "full", label: "Full" },
          { id: "mid-1", label: "Mid 1" },
          { id: "mid-2", label: "Mid 2" },
          { id: "small", label: "Small" },
          { id: "thin", label: "Thin" },
        ]}
      />
      <div className="flex min-h-[96px] w-[420px] items-center justify-center rounded-[8px] bg-[var(--uc-neutral-200)] p-[24px]">
        <Bar status={status} />
      </div>
    </div>
  );
}

export function DateFilterVariantSpecimen() {
  const [type, setType] = useState<DateFilterType>("five");

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="date-filter-type-select"
        value={type}
        onChange={(value) => setType(value as DateFilterType)}
        options={[
          { id: "five", label: "5 items" },
          { id: "four", label: "4 items" },
        ]}
      />
      <div className="flex min-h-[80px] w-[327px] items-center justify-center rounded-[8px] bg-[var(--uc-surface)] p-[16px]">
        <DateFilter type={type} />
      </div>
    </div>
  );
}

export function PillSortingVariantSpecimen() {
  const [selectedValue, setSelectedValue] = useState<PillSortingValue | null>("max-percent");

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="pill-sorting-state-select"
        value={selectedValue ?? "none"}
        onChange={(value) => setSelectedValue(value === "none" ? null : (value as PillSortingValue))}
        options={[
          { id: "max-percent", label: "Selected / MAX %" },
          { id: "none", label: "Rest / no selection" },
        ]}
      />
      <div className="w-[375px] rounded-[8px] bg-[var(--uc-surface)] py-[16px]">
        <PillSorting selectedValue={selectedValue} />
      </div>
    </div>
  );
}
