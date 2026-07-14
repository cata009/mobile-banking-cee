import { useState } from "react";
import type { UIEvent } from "react";
import PageHeader from "@/app/components/PageHeader";
import Card, { type CardVariant } from "@/app/components/cards/Card";
import { AppIcon, type IconName } from "@/app/components/icons";
import { useDemo } from "@/app/state/demoStore";
import { useProducts } from "@/hooks/useProducts";
import { formatMaskedCardNumber } from "@/app/utils/cardNumber";
import type { CreditCard, DebitCard, Product } from "@/data/products";

interface CardOptionsScreenProps {
  selectedCardId?: string | null;
  onBack: () => void;
}

function isCardProduct(product: Product): product is DebitCard | CreditCard {
  return product.type === "debit_card" || product.type === "credit_card";
}

function getCardVariant(card: DebitCard | CreditCard): CardVariant {
  if (card.type === "credit_card") return "mc-credit-partner-standard";
  return card.id.endsWith("-2") || card.id === "card-3" ? "mc-debit-standard" : "mc-debit-gold";
}

const CARD_OPTION_ITEMS: readonly { id: string; icon: IconName; title: string; description: string }[] = [
  { id: "view-pin", icon: "view-pin", title: "View PIN", description: "Reveal or change your card PIN securely" },
  { id: "block-card", icon: "block-card", title: "Block card", description: "Temporarily block this card" },
  { id: "limits", icon: "account-options", title: "Card limits", description: "Manage spending and cash withdrawal limits" },
  { id: "notifications", icon: "account-option-push-notifications", title: "Push notifications", description: "Choose which card alerts you receive" },
  { id: "share", icon: "account-option-share-info", title: "Share card details", description: "Share non-sensitive card information" },
];

export default function CardOptionsScreen({ selectedCardId, onBack }: CardOptionsScreenProps) {
  const { amountsHidden } = useDemo();
  const { categories } = useProducts();
  const [headerProgress, setHeaderProgress] = useState(0);
  const cards = categories.flatMap((category) => category.products).filter(isCardProduct);
  const card = cards.find((candidate) => candidate.id === selectedCardId) ?? cards[0];

  const handlePageScroll = (event: UIEvent<HTMLDivElement>) => {
    setHeaderProgress(Math.min(1, Math.max(0, event.currentTarget.scrollTop / 64)));
  };

  if (!card) {
    return <div className="h-full w-full bg-[var(--uc-surface)]" />;
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] scrollbar-hide" onScroll={handlePageScroll}>
      <PageHeader
        title="Card options"
        onBack={onBack}
        showHelp={false}
        collapsedTitleProgress={headerProgress}
        includeSafeArea
      />

      <div className="px-[24px] pb-[40px] pt-[30px]">
        <div className="flex items-center gap-[16px] border-b border-[var(--uc-border)] pb-[24px]">
          <Card ariaLabel={`${card.name} card`} size="medium" variant={getCardVariant(card)} />
          <div className="min-w-0">
            <p className="uc-type-n4-strong truncate text-[var(--uc-text)]">{card.name}</p>
            <p className="uc-type-n5 mt-[4px] text-[var(--uc-text-muted)]">{formatMaskedCardNumber(card.cardNumber)}</p>
          </div>
        </div>

        <div className="pt-[24px]">
          <h2 className="uc-type-n5-strong uppercase text-[var(--uc-text-muted)]">General settings</h2>
          <div className="mt-[8px] h-px w-full bg-[var(--uc-border)]" />
          <div className="pt-[16px]">
            {CARD_OPTION_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="grid min-h-[72px] w-full grid-cols-[32px_minmax(0,1fr)_24px] items-center gap-[16px] border-b border-[var(--uc-border-muted)] text-left"
              >
                <span className="flex size-[32px] items-center justify-center">
                  <AppIcon name={item.icon} color="var(--uc-text)" />
                </span>
                <span className="min-w-0">
                  <span className="uc-type-n5-strong block text-[var(--uc-text)]">{item.title}</span>
                  <span className="uc-type-n5 mt-[2px] block text-[var(--uc-text-muted)]">{item.description}</span>
                </span>
                <AppIcon name="chevron-link" color="var(--uc-text)" />
              </button>
            ))}
          </div>
          <p className="uc-type-n5 mt-[24px] text-[var(--uc-text-muted)]">
            {amountsHidden ? "Sensitive card information is hidden." : "Some actions may require additional verification."}
          </p>
        </div>
      </div>
    </div>
  );
}
