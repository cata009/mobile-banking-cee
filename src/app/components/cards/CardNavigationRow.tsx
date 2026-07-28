import NavigationCardArt from "@/app/components/cards/NavigationCardArt";
import { type CardVariant } from "@/app/components/cards/Card";
import { AppIcon } from "@/app/components/icons";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { formatMaskedCardNumber } from "@/app/utils/cardNumber";
import type { CreditCard, DebitCard } from "@/data/products";

type PhysicalCard = DebitCard | CreditCard;

interface CardNavigationRowProps {
  card?: PhysicalCard | null;
}

function getCardVariant(card?: PhysicalCard | null): CardVariant {
  if (card?.type === "credit_card") {
    return "mc-credit-partner-standard";
  }

  if (card?.type === "debit_card" && (card.id.endsWith("-2") || card.id === "card-3")) {
    return "mc-debit-standard";
  }

  return "mc-debit-gold";
}

/** The compact card navigation row used for a connected card and card-originated transaction. */
export default function CardNavigationRow({ card }: CardNavigationRowProps) {
  const { t } = useLanguage();
  const isCreditCard = card?.type === "credit_card";
  const cardLabel = isCreditCard
    ? t("runtime.cardUsed.mastercardStandardCredit", "Mastercard Standard Credit")
    : t("runtime.accounts.detailsInfo.mastercardStandardDebit", "Mastercard Standard Debit");
  const maskedNumber = card ? formatMaskedCardNumber(card.cardNumber) : "5545 XXXX XXXX 3250";

  return (
    <button
      type="button"
      className="grid w-full grid-cols-[64px_1fr_24px] items-center gap-[16px] py-[18px] text-left"
      aria-label={`${cardLabel} ${maskedNumber}`}
      data-card-navigation-row
    >
      <NavigationCardArt variant={getCardVariant(card)} />
      <div className="min-w-0">
        <p className="uc-type-n4-strong leading-[20px] text-[var(--uc-text)]">
          {cardLabel}
        </p>
        <p className="uc-type-n5 mt-[2px] leading-[15px] text-[var(--uc-text-muted)]">
          {maskedNumber}
        </p>
      </div>
      <AppIcon name="chevron-link" color="var(--uc-text)" />
    </button>
  );
}
