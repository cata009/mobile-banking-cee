import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import NavigationRow from "@/app/components/NavigationRow";
import PageHeader from "@/app/components/PageHeader";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import type { IconName } from "@/app/components/icons";
import { useProducts } from "@/hooks/useProducts";
import type { CreditCard, DebitCard, Product } from "@/data/products";

interface CardOptionsScreenProps {
  selectedCardId?: string | null;
  onBack: () => void;
}

interface CardOptionItem {
  id: string;
  icon: IconName;
  title: string;
  description: string;
}

function isCardProduct(product: Product): product is DebitCard | CreditCard {
  return product.type === "debit_card" || product.type === "credit_card";
}

const CARD_PROGRAM_ITEMS: readonly CardOptionItem[] = [
  {
    id: "apple-pay",
    icon: "card-options-apple-pay",
    title: "APPLE PAY",
    description: "Active",
  },
  {
    id: "mastercard-priceless",
    icon: "card-options-mastercard",
    title: "MASTERCARD PRICELESS",
    description: "Discover all the advantages of the program",
  },
  {
    id: "card-registrations",
    icon: "card-options-registrations",
    title: "CARD REGISTRATIONS",
    description: "Subscriptions and saved card",
  },
];

const COMMON_SETTINGS_ITEMS: readonly CardOptionItem[] = [
  {
    id: "view-pin",
    icon: "view-pin",
    title: "VIEW PIN",
    description: "View or change your card’s PIN",
  },
  {
    id: "card-limits",
    icon: "card-options-limits",
    title: "CARD LIMITS",
    description: "Manage your card limits",
  },
  {
    id: "push-notifications",
    icon: "account-option-push-notifications",
    title: "PUSH NOTIFICATIONS",
    description: "Manage app notifications",
  },
];

const CREDIT_SETTINGS_ITEMS: readonly CardOptionItem[] = [
  {
    id: "credit-card-statement",
    icon: "account-option-statement",
    title: "CREDIT CARD STATEMENT",
    description: "View your statement",
  },
  {
    id: "change-card-name",
    icon: "card-options-change-name",
    title: "CHANGE CARD NAME",
    description: "Name your card",
  },
  {
    id: "share-details",
    icon: "account-option-share-info",
    title: "SHARE DETAILS",
    description: "Send the card details through email",
  },
];

const DEBIT_SETTINGS_ITEMS: readonly CardOptionItem[] = [
  {
    id: "card-delivery-address",
    icon: "card-options-delivery-address",
    title: "CARD DELIVERY ADDRESS",
    description: "Select the address to deliver the card",
  },
  {
    id: "reissue-card",
    icon: "card-options-reissue",
    title: "REISSUE CARD",
    description: "Request the reissue of this card",
  },
];

function CardOptionRows({ items }: { items: readonly CardOptionItem[] }) {
  return (
    <div className="flex flex-col" role="list">
      {items.map((item) => (
        <div key={item.id} role="listitem" data-card-option={item.id}>
          <NavigationRow
            title={item.title}
            description={item.description}
            leadingIconName={item.icon}
            trailingAccessory="chevron"
            rowHeight={80}
          />
        </div>
      ))}
    </div>
  );
}

export default function CardOptionsScreen({ selectedCardId, onBack }: CardOptionsScreenProps) {
  const { categories } = useProducts();
  const { progress: headerProgress, onScroll: handlePageScroll } = useCollapsingHeader(64);
  const cards = categories.flatMap((category) => category.products).filter(isCardProduct);
  const card = cards.find((candidate) => candidate.id === selectedCardId) ?? cards[0];

  if (!card) {
    return <div className="h-full w-full bg-[var(--uc-surface)]" />;
  }

  const settingsItems = card.type === "credit_card"
    ? [...COMMON_SETTINGS_ITEMS, ...CREDIT_SETTINGS_ITEMS]
    : [...COMMON_SETTINGS_ITEMS, ...DEBIT_SETTINGS_ITEMS];

  return (
    <div
      className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] scrollbar-hide"
      onScroll={handlePageScroll}
    >
      <PageHeader
        title="Card options"
        onBack={onBack}
        showHelp={false}
        collapsedTitleProgress={headerProgress}
        includeSafeArea
      />

      <main className="pb-[40px]">
        <CardOptionRows items={CARD_PROGRAM_ITEMS} />

        <section className="mt-[16px]" aria-label="General settings">
          <div className="px-[24px]">
            <SectionHeadingDivider title="GENERAL SETTINGS" />
          </div>
          <div className="pt-[16px]">
            <CardOptionRows items={settingsItems} />
          </div>
        </section>
      </main>
    </div>
  );
}
