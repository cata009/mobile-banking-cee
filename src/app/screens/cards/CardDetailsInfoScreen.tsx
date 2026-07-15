import { useState } from "react";
import type { UIEvent } from "react";
import PageHeader from "@/app/components/PageHeader";
import AccountDetailsInfoField from "@/app/components/accounts/AccountDetailsInfoField";
import { useDemo } from "@/app/state/demoStore";
import { useProducts } from "@/hooks/useProducts";
import { formatMoneyNumber, getCountryConfig } from "@/app/registry/countryConfig";
import { maskFormattedAmount } from "@/app/utils/amountPrivacy";
import { formatMaskedCardNumber } from "@/app/utils/cardNumber";
import type { CreditCard, DebitCard, Product } from "@/data/products";

interface CardDetailsInfoScreenProps {
  selectedCardId?: string | null;
  onBack: () => void;
}

function isCardProduct(product: Product): product is DebitCard | CreditCard {
  return product.type === "debit_card" || product.type === "credit_card";
}

export default function CardDetailsInfoScreen({ selectedCardId, onBack }: CardDetailsInfoScreenProps) {
  const { country, amountsHidden } = useDemo();
  const { categories } = useProducts();
  const [headerProgress, setHeaderProgress] = useState(0);
  const cards = categories.flatMap((category) => category.products).filter(isCardProduct);
  const card = cards.find((candidate) => candidate.id === selectedCardId) ?? cards[0];
  const config = getCountryConfig(country);

  const handlePageScroll = (event: UIEvent<HTMLDivElement>) => {
    setHeaderProgress(Math.min(1, Math.max(0, event.currentTarget.scrollTop / 64)));
  };

  if (!card) {
    return <div className="h-full w-full bg-[var(--uc-surface)]" />;
  }

  const cardCurrency = card.currency || config.currency;
  const cardNumber = formatMaskedCardNumber(card.cardNumber);
  const amount = (value: number) => maskFormattedAmount(formatMoneyNumber(value, country), amountsHidden);

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] scrollbar-hide" onScroll={handlePageScroll}>
      <PageHeader
        title="Card details"
        onBack={onBack}
        showHelp={false}
        collapsedTitleProgress={headerProgress}
        includeSafeArea
      />

      <div className="px-[24px] pb-[40px]">
        <div className="pt-[8px]">
          <AccountDetailsInfoField title="Card type" subtitle={card.cardType} />
          <AccountDetailsInfoField title="Card number" subtitle={cardNumber} />
          <AccountDetailsInfoField title="Expiry date" subtitle={card.expiryDate} />
          {card.type === "credit_card" ? (
            <>
              <AccountDetailsInfoField title="Credit limit" subtitle={`${amount(card.creditLimit)} ${cardCurrency}`} />
              <AccountDetailsInfoField title="Available credit" subtitle={`${amount(card.availableCredit)} ${cardCurrency}`} />
            </>
          ) : (
            <AccountDetailsInfoField title="Linked account" subtitle={card.linkedAccountId} />
          )}
          <AccountDetailsInfoField title="Status" subtitle="Active" />
        </div>
      </div>
    </div>
  );
}
