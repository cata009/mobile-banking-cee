/**
 * Registry of design-system components the Component translation tester can
 * stress with copy. Every entry reuses the real shared component — nothing is
 * re-implemented here — and declares which text slots can be overridden.
 */

import type { ReactNode } from "react";
import PrimaryButton from "@/app/components/PrimaryButton";
import PageHeader from "@/app/components/PageHeader";
import NavigationRow from "@/app/components/NavigationRow";
import TextField from "@/app/components/TextField";
import InfoBanner from "@/app/components/cards/InfoBanner";
import GhostBanner from "@/app/components/cards/GhostBanner";
import HelperCard from "@/app/components/cards/HelperCard";
import PendingActionCard from "@/app/components/cards/PendingActionCard";
import UserEventCard from "@/app/components/cards/UserEventCard";
import ProductMenuCard from "@/app/components/products/ProductMenuCard";
import ProductOfferCard from "@/app/components/products/ProductOfferCard";
import PaymentHeroCard from "@/app/components/payments/PaymentHeroCard";
import { ContactsNavigationCard } from "@/app/screens/contacts/ContactsNavigationCard";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import type { ProductsCard } from "@/app/config/productsMenuConfig";
import productCardAccountImage from "../../../../screenshots/account.png";

/**
 * How the specimen sits inside the 375px phone width:
 * - "screen": full-bleed element (e.g. PageHeader)
 * - "card":   element that lives inside a surface card with 16px page inset
 * - "plain":  element placed directly on the app background with 16px inset
 */
export type SpecimenContainer = "screen" | "card" | "plain";

export interface TestableSlot {
  id: string;
  label: string;
  defaultText: string;
}

export interface TestableComponentMeta {
  id: string;
  label: string;
  description: string;
  container: SpecimenContainer;
  slots: readonly TestableSlot[];
  render: (texts: Record<string, string>) => ReactNode;
}

const noop = () => {};

export const TESTABLE_COMPONENTS: readonly TestableComponentMeta[] = [
  {
    id: "page-header",
    label: "PageHeader",
    description: "Screen title bar with back action",
    container: "screen",
    slots: [{ id: "title", label: "Title", defaultText: "Account details" }],
    render: (texts) => <PageHeader title={texts.title ?? ""} onBack={noop} includeSafeArea={false} />,
  },
  {
    id: "primary-button",
    label: "PrimaryButton",
    description: "Main call-to-action button",
    container: "plain",
    slots: [{ id: "label", label: "Label", defaultText: "Continue" }],
    render: (texts) => <PrimaryButton onClick={noop}>{texts.label ?? ""}</PrimaryButton>,
  },
  {
    id: "navigation-row",
    label: "NavigationRow",
    description: "List row with title, description and chevron",
    container: "card",
    slots: [
      { id: "title", label: "Title", defaultText: "Account settings" },
      { id: "description", label: "Description", defaultText: "Manage limits, cards and security" },
    ],
    render: (texts) => (
      <NavigationRow title={texts.title ?? ""} description={texts.description || undefined} onClick={noop} />
    ),
  },
  {
    id: "text-field",
    label: "TextField",
    description: "Design-system line input with floating label",
    container: "card",
    slots: [
      { id: "label", label: "Label", defaultText: "Account name" },
      { id: "value", label: "Value", defaultText: "Main current account" },
    ],
    render: (texts) => <TextField label={texts.label ?? ""} value={texts.value ?? ""} onChange={noop} />,
  },
  {
    id: "info-banner",
    label: "InfoBanner",
    description: "Informational banner with icon, title and body",
    container: "plain",
    slots: [
      { id: "title", label: "Title", defaultText: "Scheduled maintenance" },
      {
        id: "description",
        label: "Description",
        defaultText: "Payments will be unavailable on Sunday between 02:00 and 04:00.",
      },
    ],
    render: (texts) => <InfoBanner title={texts.title ?? ""} description={texts.description || undefined} />,
  },
  {
    id: "ghost-banner",
    label: "GhostBanner",
    description: "Dashed-border CTA banner",
    container: "plain",
    slots: [
      { id: "title", label: "Title", defaultText: "Add a new product" },
      {
        id: "description",
        label: "Description",
        defaultText: "Open a savings account or explore investment funds.",
      },
    ],
    render: (texts) => <GhostBanner title={texts.title ?? ""} description={texts.description || undefined} onClick={noop} />,
  },
  {
    id: "section-heading",
    label: "SectionHeadingDivider",
    description: "Section heading with secondary text",
    container: "card",
    slots: [
      { id: "title", label: "Title", defaultText: "Transactions" },
      { id: "secondaryText", label: "Secondary text", defaultText: "July 2026" },
    ],
    render: (texts) => (
      <SectionHeadingDivider title={texts.title ?? ""} secondaryText={texts.secondaryText || undefined} />
    ),
  },
  {
    id: "helper-card",
    label: "HelperCard",
    description: "Teal helper card with icon, message and optional link",
    container: "plain",
    slots: [
      { id: "title", label: "Title", defaultText: "Details" },
      { id: "description", label: "Description", defaultText: "Use Details to view more information." },
      { id: "actionLabel", label: "Action label", defaultText: "SEE DETAILS" },
    ],
    render: (texts) => (
      <HelperCard
        title={texts.title ?? ""}
        description={texts.description || undefined}
        actionLabel={texts.actionLabel || undefined}
        onActionClick={noop}
      />
    ),
  },
  {
    id: "pending-action-card",
    label: "PendingActionCard",
    description: "Gradient card for pending actions with optional expiring tag",
    container: "plain",
    slots: [
      { id: "title", label: "Title", defaultText: "Pending Action" },
      {
        id: "description",
        label: "Description",
        defaultText: "You have to reject or confirm a pending payment",
      },
      { id: "tagLabel", label: "Tag label", defaultText: "EXPIRING ON 12.04.25" },
    ],
    render: (texts) => (
      <PendingActionCard
        title={texts.title ?? ""}
        description={texts.description || undefined}
        tagLabel={texts.tagLabel || undefined}
        onClick={noop}
      />
    ),
  },
  {
    id: "user-event-card",
    label: "UserEventCard",
    description: "Avatar card for user events with optional link and options",
    container: "plain",
    slots: [
      { id: "title", label: "Title", defaultText: "Expenses higher than usual" },
      {
        id: "description",
        label: "Description",
        defaultText: "Track your spending and try to get the most our of your money.",
      },
      { id: "actionLabel", label: "Action label", defaultText: "FIND OUT MORE" },
    ],
    render: (texts) => (
      <UserEventCard
        title={texts.title ?? ""}
        description={texts.description || undefined}
        actionLabel={texts.actionLabel || undefined}
        onActionClick={noop}
        showOptions
      />
    ),
  },
  {
    id: "product-offer-card",
    label: "ProductOfferCard",
    description: "Product offer banner with title, description and chevron",
    container: "plain",
    slots: [
      { id: "title", label: "Title", defaultText: "Premium current account offer" },
      {
        id: "description",
        label: "Description",
        defaultText: "Enjoy zero monthly fee and smart everyday banking benefits.",
      },
    ],
    render: (texts) => (
      <ProductOfferCard
        offer={{
          id: "tester-offer",
          title: texts.title ?? "",
          description: texts.description ?? "",
        }}
        onClick={noop}
      />
    ),
  },
  {
    id: "product-offer-card-compact",
    label: "ProductOfferCard (compact)",
    description: "Compact offer banner: 20px title, 16px description, plus a 14px one-line caption",
    container: "plain",
    slots: [
      { id: "title", label: "Title", defaultText: "Premium current account offer" },
      {
        id: "description",
        label: "Description",
        defaultText: "Enjoy zero monthly fee and smart everyday banking benefits.",
      },
      { id: "caption", label: "Caption", defaultText: "Limited-time offer, terms apply" },
    ],
    render: (texts) => (
      <ProductOfferCard
        variant="compact"
        offer={{
          id: "tester-offer-compact",
          title: texts.title ?? "",
          description: texts.description ?? "",
          caption: texts.caption || undefined,
        }}
        onClick={noop}
      />
    ),
  },
  {
    id: "product-menu-card",
    label: "ProductMenuCard",
    description: "Product menu entry card with title and illustration",
    container: "plain",
    slots: [{ id: "title", label: "Title", defaultText: "Current accounts" }],
    render: (texts) => {
      const card: ProductsCard = {
        id: "account",
        title: texts.title ?? "",
        background: "var(--uc-product-blue-deep)",
        illustration: "flowers",
        imageSrc: productCardAccountImage,
      };
      return <ProductMenuCard card={card} onClick={noop} />;
    },
  },
  {
    id: "payment-hero-card",
    label: "PaymentHeroCard",
    description: "Payments hero card with title and description",
    container: "plain",
    slots: [
      { id: "title", label: "Title", defaultText: "Make a payment" },
      {
        id: "description",
        label: "Description",
        defaultText: "Lorem ipsum dolor sit amet, consectetur adipiscing",
      },
    ],
    render: (texts) => (
      <PaymentHeroCard
        item={{
          id: "new-payment",
          title: texts.title ?? "",
          description: texts.description ?? "",
          illustration: "wallet",
          imageVariant: "payments-1",
        }}
        imageVariant="payments-1"
        onSelect={noop}
      />
    ),
  },
  {
    id: "contacts-navigation-card",
    label: "ContactsNavigationCard",
    description: "Contacts entry card with icon, title, value and subtitle",
    container: "plain",
    slots: [
      { id: "title", label: "Title", defaultText: "Phone" },
      { id: "subtitle", label: "Subtitle", defaultText: "Mon–Fri 08:00–20:00" },
      { id: "value", label: "Value", defaultText: "+40 21 200 2020" },
    ],
    render: (texts) => (
      <ContactsNavigationCard
        icon="phone"
        title={texts.title ?? ""}
        subtitle={texts.subtitle || undefined}
        value={texts.value || undefined}
        hasChevron
        onClick={noop}
      />
    ),
  },
];
