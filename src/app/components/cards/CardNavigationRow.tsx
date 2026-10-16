import NavigationCardArt from "@/app/components/cards/NavigationCardArt";
import { resolveCardNavigationRow } from "@/app/components/contracts/cardNavigationRow";
import { AppIcon } from "@/app/components/icons";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { formatMaskedCardNumber } from "@/app/utils/cardNumber";
import type { CreditCard, DebitCard } from "@/data/products";

type PhysicalCard = DebitCard | CreditCard;

interface CardNavigationRowProps {
  card?: PhysicalCard | null;
}

/** The compact card navigation row used for a connected card and card-originated transaction. */
export default function CardNavigationRow({ card }: CardNavigationRowProps) {
  const { t } = useLanguage();
  const state = resolveCardNavigationRow(card);
  const cardLabel = state.credit
    ? t("runtime.cardUsed.mastercardStandardCredit", "Mastercard Standard Credit")
    : t("runtime.accounts.detailsInfo.mastercardStandardDebit", "Mastercard Standard Debit");
  const maskedNumber = card ? formatMaskedCardNumber(card.cardNumber) : state.fallbackMaskedNumber;

  return (
    <button
      type="button"
      className={state.rootClass}
      aria-label={`${cardLabel} ${maskedNumber}`}
      data-card-navigation-row
    >
      <NavigationCardArt variant={state.artVariant} />
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
