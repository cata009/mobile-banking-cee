import { useState } from "react";
import type { UIEvent } from "react";
import PageHeader from "@/app/components/PageHeader";
import AccountDetailsInfoField from "@/app/components/accounts/AccountDetailsInfoField";
import { formatMoneyNumber } from "@/app/registry/countryConfig";
import { useDemo } from "@/app/state/demoStore";
import { useProducts } from "@/hooks/useProducts";
import type { CreditCard, DebitCard, Product } from "@/data/products";

interface CardDetailsInfoScreenProps {
  selectedCardId?: string | null;
  onBack: () => void;
}

function isCardProduct(product: Product): product is DebitCard | CreditCard {
  return product.type === "debit_card" || product.type === "credit_card";
}

export default function CardDetailsInfoScreen({ selectedCardId, onBack }: CardDetailsInfoScreenProps) {
  const { country } = useDemo();
  const { categories } = useProducts();
  const [headerProgress, setHeaderProgress] = useState(0);
  const cards = categories.flatMap((category) => category.products).filter(isCardProduct);
  const card = cards.find((candidate) => candidate.id === selectedCardId) ?? cards[0];

  if (!card) return <div className="h-full w-full bg-[var(--uc-surface)]" />;

  const availableToSpend = card.type === "credit_card" ? card.availableCredit : Math.abs(card.balance);
  const cardProduct = `${card.cardType} ${card.type === "credit_card" ? "Credit card" : "Debit card"}`;

  return (
    <div
      className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] scrollbar-hide"
      onScroll={(event: UIEvent<HTMLDivElement>) => setHeaderProgress(Math.min(1, Math.max(0, event.currentTarget.scrollTop / 64)))}
    >
      <PageHeader title="Card details" onBack={onBack} collapsedTitleProgress={headerProgress} includeSafeArea />
      <div className="px-[24px] pb-[40px] pt-[46px]">
        <AccountDetailsInfoField title="Card product" subtitle={cardProduct} />
        <AccountDetailsInfoField title="Card status" subtitle="Active" />
        <AccountDetailsInfoField title="Card reference" subtitle={`•••• ${card.cardNumber.slice(-4)}`} />
        <AccountDetailsInfoField title="Available to spend" subtitle={`${formatMoneyNumber(availableToSpend, country)} ${card.currency}`} />
        {card.type === "credit_card" ? (
          <AccountDetailsInfoField title="Credit limit" subtitle={`${formatMoneyNumber(card.creditLimit, country)} ${card.currency}`} />
        ) : (
          <AccountDetailsInfoField title="Linked account" subtitle={card.linkedAccountId} />
        )}
      </div>
    </div>
  );
}
