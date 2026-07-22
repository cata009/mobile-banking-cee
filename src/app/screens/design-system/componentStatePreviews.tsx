/**
 * Per-state live previews for the Implementation Package "States" section.
 *
 * Every entry reuses the real component with the exact props that produce the
 * declared state (same source of truth as the live View-tab preview / the
 * Components catalog specimens) — never a redrawn lookalike. A state with no
 * mapped preview renders the standard "Not part of the current public
 * component contract" placeholder in `ComponentImplementationPackage.tsx`.
 */
import type { ReactNode } from "react";
import PrimaryButton from "@/app/components/PrimaryButton";
import StatusBar from "@/app/components/StatusBar";
import HomeHeader from "@/app/screens/home/HomeHeader";
import { MoreHeader } from "@/app/screens/more/MoreHeader";
import PageHeader from "@/app/components/PageHeader";
import BottomNavigation from "@/app/components/BottomNavigation";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import Bar from "@/app/components/ui/Bar";
import LanguageSelectorButton from "@/app/components/ui/LanguageSelectorButton";
import NavigationLink from "@/app/components/ui/NavigationLink";
import PreLoginHeading from "@/app/components/ui/PreLoginHeading";
import { RadioButton } from "@/app/components/common";
import LinkButton from "@/app/components/ui/LinkButton";
import { Button as GenericButton } from "@/app/components/ui/button";
import { Badge as GenericBadge } from "@/app/components/ui/badge";
import { Input as GenericInput } from "@/app/components/ui/input";
import { Checkbox as GenericCheckbox } from "@/app/components/ui/checkbox";
import { Alert as GenericAlert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Tabs as GenericTabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import FloatingCoAppingButton from "@/app/components/FloatingCoAppingButton";
import TextField from "@/app/components/TextField";
import AmountField from "@/app/components/AmountField";
import CodeField from "@/app/components/CodeField";
import DateFilter from "@/app/components/ui/DateFilter";
import PillSorting from "@/app/components/ui/PillSorting";
import ToggleButton from "@/app/components/ToggleButton";
import NavigationRow from "@/app/components/NavigationRow";
import ProfileAvatar from "@/app/components/ProfileAvatar";
import avatarPhotoSample from "@/assets/kids/woman-profile.png";
import GhostBanner from "@/app/components/cards/GhostBanner";
import InfoBanner from "@/app/components/cards/InfoBanner";
import UserEventCard from "@/app/components/cards/UserEventCard";
import HelperCard from "@/app/components/cards/HelperCard";
import PendingActionCard from "@/app/components/cards/PendingActionCard";
import FigmaCard from "@/app/components/cards/Card";
import InvestmentsFundBanner from "@/app/components/investments/InvestmentsFundBanner";
import ProductOfferCard from "@/app/components/products/ProductOfferCard";
import ProductMenuCard from "@/app/components/products/ProductMenuCard";
import ShopsmartOfferCard from "@/app/components/shopsmart/ShopsmartOfferCard";
import shopsmartDsOffers1Image from "@/assets/shopsmart/shopsmart-ds-offers-1.png";
import shopsmartDsOffers2Image from "@/assets/shopsmart/shopsmart-ds-offers-2.png";
import productCardAccountImage from "../../../../screenshots/account.png";
import productCardCardsImage from "../../../../screenshots/cards.png";
import AccountBalanceCard from "@/app/components/accounts/AccountBalanceCard";
import AccountActionBar, { type AccountActionBarItem } from "@/app/components/accounts/AccountActionBar";
import AccountCarouselIndicator from "@/app/components/accounts/AccountCarouselIndicator";
import AccountDetailsInfoField from "@/app/components/accounts/AccountDetailsInfoField";
import MessagesMailboxTabs from "@/app/components/messages/MessagesMailboxTabs";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import AccountTransactionRow from "@/app/components/accounts/AccountTransactionRow";
import PaymentHeroCard, { PAYMENT_HERO_CARD_IMAGE_VARIANTS } from "@/app/components/payments/PaymentHeroCard";
import { ContactsNavigationCard } from "@/app/screens/contacts/ContactsNavigationCard";
import ProductCard from "@/app/components/ProductCard";
import ProductsList from "@/app/components/ProductsList";
import CardComponent from "@/app/components/cards/CardComponent";
import ToastMessage from "@/app/components/ui/ToastMessage";
import WalletButton from "@/app/components/ui/WalletButton";
import Pill from "@/app/components/ui/Pill";
import { LogoutConfirmDialog } from "@/app/components/LogoutConfirmDialog";
import PanelWithTranslations from "@/app/components/PanelWithTranslations";
import PanelWithoutCoAppingTranslations from "@/app/components/PanelWithoutCoAppingTranslations";
import { getAccountIdentity } from "@/data/accountDetails";
import { AppIcon } from "@/app/components/icons";
import { HeaderPreviewFrame } from "./specimens/cardSpecimens";

type StatePreviewMap = Record<string, Partial<Record<string, () => ReactNode>>>;

function MiniProductIcon() {
  return (
    <div className="flex size-[32px] items-center justify-center rounded-full bg-[var(--uc-action-soft)]">
      <AppIcon name="accounts-coins" size={20} color="var(--uc-action)" />
    </div>
  );
}

export const COMPONENT_STATE_PREVIEWS: StatePreviewMap = {
  "ui.primary-button": {
    action: () => <PrimaryButton className="!w-full">Continue</PrimaryButton>,
    surface: () => (
      <PrimaryButton className="!w-full" variant="surface">
        Continue
      </PrimaryButton>
    ),
    pressed: () => <PrimaryButton className="!w-full !scale-[0.98]">Continue</PrimaryButton>,
    disabled: () => (
      <PrimaryButton className="!w-full" disabled>
        Continue
      </PrimaryButton>
    ),
    focus: () => (
      <PrimaryButton className="!w-full ring-2 ring-[var(--uc-action)] ring-offset-2 ring-offset-[var(--uc-app-bg)]">
        Continue
      </PrimaryButton>
    ),
    "large-label": () => (
      <PrimaryButton className="!w-full" labelSize="18">
        Continue
      </PrimaryButton>
    ),
  },

  "shell.status-bar": {
    light: () => (
      <div className="relative h-[54px] w-full overflow-hidden rounded-[4px] bg-[var(--uc-surface)]">
        <StatusBar variant="light" />
      </div>
    ),
    dark: () => (
      <div className="relative h-[54px] w-full overflow-hidden rounded-[4px] bg-[var(--uc-static-black)]">
        <StatusBar variant="dark" />
      </div>
    ),
    "co-apping": () => (
      <div className="relative h-[54px] w-full overflow-hidden rounded-[4px] bg-[var(--uc-static-black)]">
        <StatusBar variant="dark" isCoAppingActive />
      </div>
    ),
  },

  "shell.home-header": {
    default: () => (
      <div className="rounded-[8px] bg-[var(--uc-app-bg)] pt-[8px]">
        <HomeHeader onPrimeClick={() => {}} onMessagesClick={() => {}} showTitle={false} />
      </div>
    ),
    "with-title": () => (
      <div className="rounded-[8px] bg-[var(--uc-app-bg)] pt-[8px]">
        <HomeHeader onPrimeClick={() => {}} onMessagesClick={() => {}} />
      </div>
    ),
  },

  "shell.more-header": {
    default: () => (
      <div className="rounded-[8px] bg-[var(--uc-surface)] pt-[8px]">
        <MoreHeader onProfile={() => {}} onMessages={() => {}} onLogout={() => {}} messageCount={0} />
      </div>
    ),
    unread: () => (
      <div className="rounded-[8px] bg-[var(--uc-surface)] pt-[8px]">
        <MoreHeader onProfile={() => {}} onMessages={() => {}} onLogout={() => {}} messageCount={7} />
      </div>
    ),
    "contact-messages": () => (
      <div className="rounded-[8px] bg-[var(--uc-surface)] pt-[8px]">
        <MoreHeader
          onContactPhone={() => {}}
          onProfile={() => {}}
          onMessages={() => {}}
          onLogout={() => {}}
          actionVariant="contact-messages"
          messageCount={2}
        />
      </div>
    ),
  },

  "shell.page-header": {
    "level-1-page": () => (
      <HeaderPreviewFrame tone="surface">
        <PageHeader title="Select language" onBack={() => {}} variant="light" />
      </HeaderPreviewFrame>
    ),
    "level-1-center": () => (
      <HeaderPreviewFrame tone="surface">
        <PageHeader title="Account Details" onBack={() => {}} variant="light" largeTitleAlign="center" />
      </HeaderPreviewFrame>
    ),
    "level-1-categorized": () => (
      <HeaderPreviewFrame tone="surface">
        <PageHeader title="Utility bill" onBack={() => {}} variant="light" largeTitleColor="var(--uc-pfm-utilities)" />
      </HeaderPreviewFrame>
    ),
    collapsed: () => (
      <HeaderPreviewFrame tone="surface">
        <PageHeader title="Account Details" onBack={() => {}} variant="light" collapsedTitleProgress={1} />
      </HeaderPreviewFrame>
    ),
    dark: () => (
      <HeaderPreviewFrame tone="dark">
        <PageHeader title="Account Details" onBack={() => {}} variant="dark" />
      </HeaderPreviewFrame>
    ),
  },

  "shell.bottom-navigation": {
    home: () => (
      <div className="w-full rounded border bg-[var(--uc-surface)]">
        <BottomNavigation activeTab="home" onTabChange={() => {}} />
      </div>
    ),
    analytics: () => (
      <div className="w-full rounded border bg-[var(--uc-surface)]">
        <BottomNavigation activeTab="analytics" onTabChange={() => {}} />
      </div>
    ),
    products: () => (
      <div className="w-full rounded border bg-[var(--uc-surface)]">
        <BottomNavigation activeTab="products" onTabChange={() => {}} />
      </div>
    ),
  },

  "ui.section-heading-divider": {
    "small-title-data": () => <SectionHeadingDivider variant="small-title-data" title="UPCOMING PAYMENTS" secondaryText="30,000.00 RSD" />,
    "medium-title": () => <SectionHeadingDivider variant="medium-title" title="TITLE" />,
    "with-counter": () => <SectionHeadingDivider variant="with-counter" title="TITLE" count={18} />,
    "large-title": () => <SectionHeadingDivider variant="large-title" title="November" />,
    "action-date": () => <SectionHeadingDivider variant="action-date" title="SELECT ALL" secondaryText="DD/MM/YY - DD/MM/YY" />,
    "name-action": () => <SectionHeadingDivider variant="name-action" title="PAYMENT DETAILS 2" secondaryText="REMOVE" />,
    "light-title": () => <SectionHeadingDivider variant="light-title" title="ALL PRODUCTS" secondaryText="N" />,
  },

  "ui.bar": {
    empty: () => (
      <div className="w-full overflow-x-auto">
        <Bar status="empty" />
      </div>
    ),
    full: () => (
      <div className="w-full overflow-x-auto">
        <Bar status="full" />
      </div>
    ),
    "mid-1": () => (
      <div className="w-full overflow-x-auto">
        <Bar status="mid-1" />
      </div>
    ),
    "mid-2": () => (
      <div className="w-full overflow-x-auto">
        <Bar status="mid-2" />
      </div>
    ),
    small: () => (
      <div className="w-full overflow-x-auto">
        <Bar status="small" />
      </div>
    ),
    thin: () => (
      <div className="w-full overflow-x-auto">
        <Bar status="thin" />
      </div>
    ),
  },

  "ui.language-selector-button": {
    default: () => (
      <div className="rounded-[8px] bg-[var(--uc-static-black)] p-4">
        <LanguageSelectorButton onClick={() => {}} language="en" />
      </div>
    ),
  },

  "ui.navigation-link": {
    default: () => (
      <div className="rounded-[8px] bg-[var(--uc-static-black)] p-4">
        <NavigationLink text="FIND OUT MORE" onClick={() => {}} />
      </div>
    ),
  },

  "ui.prelogin-heading": {
    default: () => (
      <div className="w-full rounded-[8px] bg-[var(--uc-static-black)] p-4">
        <PreLoginHeading
          h1="New look, & more services."
          h2="Open an account"
          h3="Open an account quickly and easily from the comfort of your home."
        />
      </div>
    ),
  },

  "ui.radio-button": {
    selected: () => <RadioButton selected label="ENGLISH" onClick={() => {}} />,
    unselected: () => <RadioButton selected={false} label="ROMANIAN" onClick={() => {}} />,
  },

  "ui.link-button": {
    default: () => (
      <div className="flex min-h-[72px] items-center justify-center rounded-[8px] bg-[var(--uc-surface)] p-[16px]">
        <LinkButton onClick={() => {}}>SEE MORE TRANSACTIONS</LinkButton>
      </div>
    ),
    disabled: () => (
      <div className="flex min-h-[72px] items-center justify-center rounded-[8px] bg-[var(--uc-surface)] p-[16px]">
        <LinkButton onClick={() => {}} disabled>
          SEE MORE TRANSACTIONS
        </LinkButton>
      </div>
    ),
  },

  "ui.button-registry": {
    default: () => <GenericButton>Continue</GenericButton>,
    secondary: () => <GenericButton variant="secondary">Continue</GenericButton>,
    outline: () => <GenericButton variant="outline">Continue</GenericButton>,
    ghost: () => <GenericButton variant="ghost">Continue</GenericButton>,
    destructive: () => <GenericButton variant="destructive">Delete</GenericButton>,
  },

  "ui.generic-controls": {
    button: () => <GenericButton>Continue</GenericButton>,
    badge: () => <GenericBadge>Badge</GenericBadge>,
    input: () => <GenericInput placeholder="Input specimen" />,
    checkbox: () => <GenericCheckbox defaultChecked />,
    alert: () => (
      <GenericAlert className="w-full">
        <AlertTitle>Alert primitive</AlertTitle>
        <AlertDescription>Generic registry component, separate from bespoke banners.</AlertDescription>
      </GenericAlert>
    ),
    tabs: () => (
      <GenericTabs value="current" className="w-full">
        <TabsList>
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="variant">Variant</TabsTrigger>
        </TabsList>
        <TabsContent value="current" className="rounded-[8px] border bg-[var(--uc-surface)] p-4">
          Tabs content: current.
        </TabsContent>
        <TabsContent value="variant" className="rounded-[8px] border bg-[var(--uc-surface)] p-4">
          Tabs content: variant.
        </TabsContent>
      </GenericTabs>
    ),
  },

  "co-apping.floating-button": {
    default: () => (
      <div className="relative h-[170px] w-[120px] rounded border bg-[var(--uc-app-bg)]">
        <FloatingCoAppingButton onClick={() => {}} />
      </div>
    ),
    "slide-in": () => (
      <div className="relative h-[170px] w-[120px] rounded border bg-[var(--uc-app-bg)]">
        <FloatingCoAppingButton onClick={() => {}} showSlideIn />
      </div>
    ),
  },

  "ui.text-field": {
    empty: () => <TextField label="Title" value="" onChange={() => {}} visualState="empty" />,
    "on-focus": () => <TextField label="Title" value="Textfield" onChange={() => {}} visualState="on-focus" />,
    filled: () => <TextField label="Title" value="Textfield" onChange={() => {}} visualState="filled" />,
    "error-filled": () => (
      <TextField
        label="Title"
        value="Textfield"
        onChange={() => {}}
        visualState="error-filled"
        errorText="Message"
      />
    ),
    "disabled-filled": () => (
      <TextField label="Title" value="Textfield" onChange={() => {}} visualState="disabled-filled" />
    ),
    "multiple-filled": () => (
      <TextField
        label="Title"
        value=""
        onChange={() => {}}
        visualState="multiple-filled"
        multipleValues={["Textfield", "textfield", "textfield", "textfield"]}
        multipleCount={4}
      />
    ),
  },

  "ui.amount-field": {
    empty: () => <AmountField label="Amount" value="" onChange={() => {}} visualState="empty" currency="RSD" />,
    "on-focus": () => <AmountField label="Amount" value="Insert amount" onChange={() => {}} visualState="on-focus" currency="RSD" />,
    filled: () => <AmountField label="Amount" value="1.250,00" onChange={() => {}} visualState="filled" currency="RSD" />,
    "error-filled": () => (
      <AmountField
        label="Amount"
        value="1.250,00"
        onChange={() => {}}
        visualState="error-filled"
        errorText="Message"
        currency="RSD"
      />
    ),
    "disabled-filled": () => (
      <AmountField label="Amount" value="1.250,00" onChange={() => {}} visualState="disabled-filled" currency="RSD" />
    ),
    "multiple-filled": () => (
      <AmountField
        label="Amount"
        value=""
        onChange={() => {}}
        visualState="multiple-filled"
        multipleValues={["1.250,00", "350,00", "2.100,00", "90,00"]}
        multipleCount={4}
        currency="RSD"
      />
    ),
  },

  "ui.code-field": {
    filled: () => <CodeField value="1111" onChange={() => {}} visualState="filled" ariaLabel="Verification code" />,
    error: () => <CodeField value="1111" onChange={() => {}} visualState="error" errorText="Message" ariaLabel="Verification code" />,
    empty: () => <CodeField value="" onChange={() => {}} visualState="empty" ariaLabel="Verification code" />,
    disabled: () => <CodeField value="1111" disabled visualState="disabled" ariaLabel="Verification code" />,
  },

  "ui.date-filter": {
    "five-item": () => <DateFilter type="five" />,
    "four-item": () => <DateFilter type="four" />,
  },

  "ui.pill-sorting": {
    selected: () => <PillSorting selectedValue="max-percent" />,
    none: () => <PillSorting selectedValue={null} />,
  },

  "ui.toggle-button": {
    checked: () => <ToggleButton ariaLabel="Toggle specimen" checked onToggle={() => {}} />,
    unchecked: () => <ToggleButton ariaLabel="Toggle specimen" checked={false} onToggle={() => {}} />,
  },

  "ui.navigation-row": {
    "icon-title": () => (
      <div className="w-full bg-[var(--uc-neutral-200)]">
        <NavigationRow title="TITLE LOREM IPSUM" leadingIconName="account-details" trailingAccessory="chevron" onClick={() => {}} />
      </div>
    ),
    "icon-description": () => (
      <div className="w-full bg-[var(--uc-neutral-200)]">
        <NavigationRow
          title="TITLE LOREM IPSUM"
          description="Description short"
          leadingIconName="account-details"
          trailingAccessory="chevron"
          onClick={() => {}}
        />
      </div>
    ),
    "icon-cta": () => (
      <div className="w-full bg-[var(--uc-neutral-200)]">
        <NavigationRow title="TITLE LOREM IPSUM" linkLabel="CTA" leadingIconName="account-details" onClick={() => {}} />
      </div>
    ),
    "toggle-title": () => (
      <div className="w-full bg-[var(--uc-neutral-200)]">
        <NavigationRow title="TITLE LOREM IPSUM" trailingAccessory="toggle" toggleChecked onToggle={() => {}} />
      </div>
    ),
    "special-card": () => (
      <div className="w-full bg-[var(--uc-neutral-200)]">
        <NavigationRow title="TITLE LOREM IPSUM" description="Description short" leadingIconName="accounts-coins" trailingAccessory="chevron" onClick={() => {}} />
      </div>
    ),
    "special-cta": () => (
      <div className="w-full bg-[var(--uc-neutral-200)]">
        <NavigationRow title="SHOW MORE" rowHeight={64} centerContent titleTone="action" titleClassName="uc-type-n5-strong" onClick={() => {}} />
      </div>
    ),
    "special-payment-type": () => (
      <div className="w-full bg-[var(--uc-neutral-200)]">
        <NavigationRow title="PAYMENT TYPE" rowHeight={64} leadingIconName="transaction-transfer" trailingAccessory="toggle" toggleChecked onToggle={() => {}} />
      </div>
    ),
  },

  "ui.profile-avatar": {
    "photo-full": () => (
      <ProfileAvatar ariaLabel="Profile avatar photo full" imageAlt="Profile avatar sample" imageSrc={avatarPhotoSample} variant="photo" />
    ),
    "photo-profile": () => (
      <ProfileAvatar
        ariaLabel="Profile avatar profile"
        imageAlt="Profile avatar sample"
        imageSrc={avatarPhotoSample}
        photoStyle="profile"
        showNotification
        variant="photo"
      />
    ),
    initials: () => <ProfileAvatar ariaLabel="Profile avatar initials" initials="MR" variant="initials" />,
    ai: () => <ProfileAvatar ariaLabel="Profile avatar AI" variant="ai" />,
  },

  "cards.ghost-banner": {
    "title-and-description": () => (
      <GhostBanner title="Apply for a loan" description={"Check out our best loan offers with\nfixed and variable interest rate"} onClick={() => {}} />
    ),
    "title-only": () => <GhostBanner title="Apply for a loan" onClick={() => {}} />,
    "long-description": () => (
      <GhostBanner
        title="Open a savings account"
        description="Set money aside automatically and earn interest with no monthly fees or hidden costs."
        onClick={() => {}}
      />
    ),
  },

  "cards.info-banner": {
    "with-action": () => (
      <InfoBanner
        title="We are completing your investment account opening."
        description="It can take up to one business day. Come back again to start investing and grow your money."
        actionLabel="EDIT"
        onActionClick={() => {}}
      />
    ),
    "no-action": () => (
      <InfoBanner
        title="We are completing your investment account opening."
        description="It can take up to one business day. Come back again to start investing and grow your money."
      />
    ),
    "title-only": () => <InfoBanner title="Your statement is ready to download." actionLabel="VIEW" onActionClick={() => {}} />,
  },

  "cards.user-event-card": {
    "link-and-options": () => (
      <UserEventCard
        title="Expenses higher than usual"
        description={"Track your spending and try to get\nthe most our of your money."}
        iconName="user-event-badge"
        actionLabel="FIND OUT MORE"
        showOptions
        onActionClick={() => {}}
        onOptionsClick={() => {}}
      />
    ),
    plain: () => (
      <UserEventCard
        title="Expenses higher than usual"
        description={"Track your spending and try to get\nthe most our of your money."}
        iconName="user-event-refresh"
      />
    ),
  },

  "cards.helper-card": {
    "with-link": () => (
      <HelperCard title="Details" description="Use Details to view more information." actionLabel="SEE DETAILS" onActionClick={() => {}} />
    ),
    plain: () => <HelperCard title="Details" description="Use Details to view more information." />,
  },

  "cards.pending-action-card": {
    "with-tag": () => (
      <PendingActionCard
        title="Pending Action"
        description="You have to reject or confirm a pending payment"
        tagLabel="Expiring on 12.04.25"
        onClick={() => {}}
      />
    ),
    "no-tag": () => (
      <PendingActionCard title="Pending Action" description="You have to reject or confirm a pending payment" onClick={() => {}} />
    ),
  },

  "cards.card": {
    "mc-debit-gold": () => <FigmaCard variant="mc-debit-gold" size="figma" ariaLabel="MC Debit Gold" />,
    "mc-credit-premium-gold": () => <FigmaCard variant="mc-credit-premium-gold" size="figma" ariaLabel="MC Credit Premium Gold" />,
    "mc-credit-partner-standard": () => <FigmaCard variant="mc-credit-partner-standard" size="figma" ariaLabel="MC Credit Partner Standard" />,
    "mc-debit-standard": () => <FigmaCard variant="mc-debit-standard" size="figma" ariaLabel="MC Debit Standard" />,
    "mc-virtual-standard-violet": () => <FigmaCard variant="mc-virtual-standard-violet" size="figma" ariaLabel="MC Virtual Standard Electric Violet" />,
    "mc-virtual-standard-orange": () => <FigmaCard variant="mc-virtual-standard-orange" size="figma" ariaLabel="MC Virtual Standard Vibrant Orange" />,
  },

  "investments.fund-banner": {
    discovery: () => (
      <InvestmentsFundBanner
        title="Find out the best fund for you"
        description="Discover our suggestions"
        actionLabel="GO TO FUNDS WINDOW"
        variant="discovery"
        onClick={() => {}}
      />
    ),
    balanced: () => (
      <InvestmentsFundBanner title="Balanced funds" description="A balanced mix of growth and stability" actionLabel="FIND OUT MORE" variant="balanced" onClick={() => {}} />
    ),
    equity: () => (
      <InvestmentsFundBanner title="Equity funds" description="Higher growth potential for long-term goals" actionLabel="FIND OUT MORE" variant="equity" onClick={() => {}} />
    ),
  },

  "products.offer-card": {
    "standard-normal": () => (
      <ProductOfferCard
        colorFamily="green"
        offer={{ id: "ds-offer-standard", title: "Premium current\naccount offer", description: "Enjoy zero monthly fee\nand smart everyday\nbanking benefits." }}
      />
    ),
    "compact-normal": () => (
      <ProductOfferCard
        variant="compact"
        colorFamily="green"
        offer={{
          id: "ds-offer-compact",
          title: "Premium current\naccount offer",
          description: "Enjoy zero monthly fee\nand smart everyday\nbanking benefits.",
          caption: "Limited-time offer, terms apply",
        }}
      />
    ),
    "standard-light": () => (
      <ProductOfferCard
        colorFamily="blue"
        lightVersion
        offer={{ id: "ds-offer-light", title: "Open a savings\naccount", description: "Set money aside automatically\nand earn interest." }}
      />
    ),
  },

  "products.product-card": {
    "account-standard": () => (
      <ProductMenuCard
        card={{ id: "account", title: "Current\naccounts", background: "var(--uc-product-blue-deep)", illustration: "flowers", imageSrc: productCardAccountImage }}
      />
    ),
    "cards-standard": () => (
      <ProductMenuCard card={{ id: "cards", title: "Cards", background: "var(--uc-red-card)", illustration: "bag", imageSrc: productCardCardsImage }} />
    ),
    "account-compact": () => (
      <ProductMenuCard
        variant="compact"
        card={{ id: "account", title: "Current\naccounts", background: "var(--uc-product-blue-deep)", illustration: "flowers", imageSrc: productCardAccountImage }}
      />
    ),
  },

  "products.shopsmart-offer-card": {
    "offers1-pill": () => (
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
    ),
    "offers2-tag": () => (
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
    ),
  },

  "home.account-balance-card": {
    "current-account": () => (
      <AccountBalanceCard
        account={getAccountIdentity("RO", 0)}
        availableInteger="25.902"
        availableDecimals=",92"
        currency="RON"
        currentBalance="23.902,92"
      />
    ),
    "saving-account": () => (
      <AccountBalanceCard
        account={getAccountIdentity("RO", 0)}
        availableInteger="10.000"
        availableDecimals=",00"
        currency="RON"
        currentBalance="10.000,00"
        productType="saving_account"
        showSubAccount={false}
      />
    ),
    "with-progress": () => (
      <AccountBalanceCard
        account={getAccountIdentity("RO", 0)}
        availableInteger="8.500"
        availableDecimals=",00"
        currency="RON"
        currentBalance="1.500,00"
        productType="loan"
        progress={0.65}
        showSubAccount={false}
      />
    ),
  },

  "accounts.action-bar": {
    "4-elements": () => (
      <AccountActionBar
        items={[
          { id: "details", iconName: "account-details", label: "Details" },
          { id: "options", iconName: "account-options", label: "Options" },
          { id: "add-money", iconName: "add-money", label: "Add money" },
          { id: "mcash", iconName: "mcash", label: "mCash" },
        ]}
      />
    ),
    "3-elements": () => (
      <AccountActionBar
        items={[
          { id: "details", iconName: "account-details", label: "Details" },
          { id: "options", iconName: "account-options", label: "Options" },
          { id: "add-money", iconName: "add-money", label: "Add money", hidden: true },
          { id: "mcash", iconName: "mcash", label: "mCash" },
        ]}
      />
    ),
    "2-elements": () => (
      <AccountActionBar
        items={[
          { id: "details", iconName: "account-details", label: "Details" },
          { id: "options", iconName: "account-options", label: "Options", hidden: true },
          { id: "add-money", iconName: "add-money", label: "Add money", hidden: true },
          { id: "mcash", iconName: "mcash", label: "mCash" },
        ]}
      />
    ),
    "1-element": () => {
      const items: AccountActionBarItem[] = [
        { id: "details", iconName: "account-details", label: "Details", hidden: true },
        { id: "options", iconName: "account-options", label: "Options", hidden: true },
        { id: "add-money", iconName: "add-money", label: "Add money", hidden: true },
        { id: "mcash", iconName: "mcash", label: "mCash" },
      ];
      return <AccountActionBar items={items} />;
    },
  },

  "accounts.carousel-indicator": {
    "4-first": () => <AccountCarouselIndicator count={4} activeIndex={0} onSelect={() => {}} />,
    "4-last": () => <AccountCarouselIndicator count={4} activeIndex={3} onSelect={() => {}} />,
    "7-first": () => <AccountCarouselIndicator count={7} activeIndex={0} onSelect={() => {}} />,
    "7-more": () => <AccountCarouselIndicator count={7} activeIndex={3} onSelect={() => {}} />,
  },

  "accounts.details-info-field": {
    "with-icon": () => (
      <AccountDetailsInfoField
        title="Account number"
        subtitle="1234567890123456"
        trailingIcon={<AppIcon name="copy-documents" color="var(--uc-text)" />}
      />
    ),
    default: () => <AccountDetailsInfoField title="Available funds" subtitle="614,83 RON" />,
  },

  "messages.mailbox-tabs": {
    "inbox-new": () => (
      <MessagesMailboxTabs
        tabs={[
          { id: "inbox", label: "Inbox", hasNewItems: true },
          { id: "outbox", label: "Outbox" },
        ]}
        activeTabId="inbox"
        onChange={() => {}}
      />
    ),
    inbox: () => (
      <MessagesMailboxTabs
        tabs={[
          { id: "inbox", label: "Inbox" },
          { id: "outbox", label: "Outbox" },
        ]}
        activeTabId="inbox"
        onChange={() => {}}
      />
    ),
    outbox: () => (
      <MessagesMailboxTabs
        tabs={[
          { id: "inbox", label: "Inbox" },
          { id: "outbox", label: "Outbox" },
        ]}
        activeTabId="outbox"
        onChange={() => {}}
      />
    ),
  },

  "accounts.transaction-search": {
    default: () => <AccountSearchBar />,
    filled: () => <AccountSearchBar value="Carrefour" onValueChange={() => {}} />,
    "filters-active": () => <AccountSearchBar filtersActive onFilterClick={() => {}} onRemoveFilters={() => {}} />,
  },

  "accounts.transaction-row": {
    credit: () => (
      <AccountTransactionRow
        transaction={{
          id: "sample-credit",
          day: "11",
          month: "APR",
          monthKey: "2026-04",
          monthTitle: "APRIL 2026",
          label: "Transfer",
          amount: 25902.92,
          type: "credit",
          category: "Transfers",
          pfmCategory: "Transfers",
          pfmSubcategory: "Incoming transfer",
          status: "Booked",
        }}
        formattedAmount="25.902,92"
        currency="RON"
      />
    ),
    debit: () => (
      <AccountTransactionRow
        transaction={{
          id: "sample-debit",
          day: "09",
          month: "APR",
          monthKey: "2026-04",
          monthTitle: "APRIL 2026",
          label: "Transfer",
          amount: -900,
          type: "debit",
          category: "Transfers",
          pfmCategory: "Transfers",
          pfmSubcategory: "Outgoing transfer",
          status: "Booked",
        }}
        formattedAmount="900,00"
        currency="RON"
      />
    ),
  },

  "payments.hero-card": {
    "payments-1": () => (
      <PaymentHeroCard
        item={{ id: "new-payment", title: PAYMENT_HERO_CARD_IMAGE_VARIANTS[0].title, description: PAYMENT_HERO_CARD_IMAGE_VARIANTS[0].description, illustration: "wallet", imageVariant: "payments-1" }}
        imageVariant="payments-1"
      />
    ),
    "payments-2": () => (
      <PaymentHeroCard
        item={{ id: "new-payment", title: PAYMENT_HERO_CARD_IMAGE_VARIANTS[1].title, description: PAYMENT_HERO_CARD_IMAGE_VARIANTS[1].description, illustration: "laptop", imageVariant: "payments-2" }}
        imageVariant="payments-2"
      />
    ),
    "payments-6": () => (
      <PaymentHeroCard
        item={{ id: "new-payment", title: PAYMENT_HERO_CARD_IMAGE_VARIANTS[5].title, description: PAYMENT_HERO_CARD_IMAGE_VARIANTS[5].description, illustration: "pen", imageVariant: "payments-6" }}
        imageVariant="payments-6"
      />
    ),
  },

  "contacts.navigation-card": {
    prime: () => <ContactsNavigationCard icon="prime" title="PRIME" hasChevron onClick={() => {}} />,
    location: () => <ContactsNavigationCard icon="location" title="LOCATION" onClick={() => {}} />,
    time: () => <ContactsNavigationCard icon="time" title="TIME" subtitle="Mon - Sun | 07:00 - 22:00" onClick={() => {}} />,
    phone: () => <ContactsNavigationCard icon="phone" title="PHONE" value="+420 221 210 031" onClick={() => {}} />,
  },

  "products.product-card-list-total": {
    "pi-default": () => (
      <div className="w-full py-[16px] bg-[var(--uc-surface)]">
        <div className="px-[24px]">
          <ProductCard
            icon={<MiniProductIcon />}
            title="Primary Account"
            accountNumber="RO49 BACX 0000 0000"
            amount="25,678"
            decimals=",00"
            currency="RON"
            variant="evolution"
            productStyle="pi"
            stackRole="single"
          />
        </div>
      </div>
    ),
    "pi-accordion": () => (
      <div className="w-full py-[16px] bg-[var(--uc-surface)]">
        <ProductsList isOpen={false} variant="evolution" productStyle="pi">
          <ProductCard
            icon={<MiniProductIcon />}
            title="Primary Account"
            accountNumber="RO49 BACX 0000 0000"
            amount="25,678"
            decimals=",00"
            currency="RON"
            variant="evolution"
            productStyle="pi"
            stackRole="single"
          />
        </ProductsList>
      </div>
    ),
    "pi-open": () => (
      <div className="w-full py-[16px] bg-[var(--uc-surface)]">
        <ProductsList
          isOpen
          showTotal
          variant="evolution"
          productStyle="pi"
          totalData={{ integer: "45,678", decimals: ",00", currency: "RON" }}
        >
          <ProductCard
            icon={<MiniProductIcon />}
            title="Primary Account"
            accountNumber="RO49 BACX 0000 0000"
            amount="25,678"
            decimals=",00"
            currency="RON"
            variant="evolution"
            productStyle="pi"
            stackRole="first"
          />
          <ProductCard
            icon={<MiniProductIcon />}
            title="Saving account"
            accountNumber="RO22 BACX 1111 1111"
            amount="20,000"
            decimals=",00"
            currency="RON"
            variant="evolution"
            productStyle="pi"
            stackRole="middle"
          />
        </ProductsList>
      </div>
    ),
  },

  "ui.toast-message": {
    "action-required": () => (
      <div className="flex min-h-[64px] w-full items-center justify-center rounded-[8px] bg-[var(--uc-surface)] p-[16px]">
        <ToastMessage variant="action-required" />
      </div>
    ),
    aware: () => (
      <div className="flex min-h-[64px] w-full items-center justify-center rounded-[8px] bg-[var(--uc-static-black)] p-[16px]">
        <ToastMessage variant="aware" />
      </div>
    ),
    "google-pay": () => (
      <div className="flex min-h-[64px] w-full items-center justify-center rounded-[8px] bg-[var(--uc-static-black)] p-[16px]">
        <ToastMessage variant="google-pay" />
      </div>
    ),
  },

  "ui.wallet-button": {
    "google-wallet-condensed": () => <WalletButton kind="google-wallet" size="condensed" locale="EN" />,
    "apple-wallet-condensed": () => <WalletButton kind="apple-wallet" size="condensed" />,
    "click-to-pay-condensed": () => <WalletButton kind="click-to-pay" size="condensed" />,
    "google-wallet-long": () => <WalletButton kind="google-wallet" size="long" locale="EN" />,
  },

  "ui.pill": {
    primary: () => <Pill variant="primary" onClick={() => {}} />,
    secondary: () => <Pill variant="secondary" onClick={() => {}} />,
    "active-counter": () => <Pill variant="active-counter" onClick={() => {}} />,
    "loading-counter": () => <Pill variant="loading-counter" onClick={() => {}} />,
    activated: () => <Pill variant="activated" onClick={() => {}} />,
  },

  "dialogs.logout-confirmation": {
    open: () => (
      <div className="relative h-[220px] w-full overflow-hidden rounded border bg-[var(--uc-app-bg)]">
        <LogoutConfirmDialog isOpen onClose={() => {}} onConfirm={() => {}} />
      </div>
    ),
  },

  "cards.card-component": {
    default: () => (
      <div className="w-full max-w-[375px]">
        <CardComponent />
      </div>
    ),
  },

  "prelogin.other-panel": {
    default: () => (
      <div className="relative h-[430px] w-full max-w-[375px] overflow-hidden rounded border">
        <PanelWithTranslations
          aboutSmartBanking="ABOUT SMART BANKING"
          exchangeRates="EXCHANGE RATES"
          findAtmBranches="FIND ATM & BRANCHES"
          startCoAppingSession="START CO-APPING SESSION"
          onClose={() => {}}
          onStartCoApping={() => {}}
        />
      </div>
    ),
  },

  "prelogin.other-panel-basic": {
    default: () => (
      <div className="relative h-[350px] w-full max-w-[375px] overflow-hidden rounded border">
        <PanelWithoutCoAppingTranslations
          aboutSmartBanking="ABOUT SMART BANKING"
          exchangeRates="EXCHANGE RATES"
          findAtmBranches="FIND ATM & BRANCHES"
          onClose={() => {}}
        />
      </div>
    ),
  },
};

/** Returns the real-component preview for a (componentId, stateId) pair, or null. */
export function getComponentStatePreview(componentId: string, stateId: string): ReactNode | null {
  return COMPONENT_STATE_PREVIEWS[componentId]?.[stateId]?.() ?? null;
}
