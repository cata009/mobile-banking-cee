import MerchantLogo from "@/app/components/merchants/MerchantLogo";
import PfmCategoryIcon, { type PfmCategoryIconVariant } from "@/app/components/pfm/PfmCategoryIcon";
import TransactionPairAvatar from "@/app/components/transactions/TransactionPairAvatar";
import TransactionPartyAvatar from "@/app/components/transactions/TransactionPartyAvatar";
import type { AccountTransaction } from "@/data/accountDetails";
import { isNonMerchantCounterparty, resolveTransactionMerchant } from "@/data/merchantDirectory";

/**
 * Which question the leading visual answers.
 *
 * - `identity` — "who was this with": the merchant, the pair of accounts, or
 *   the counterparty. Used on home, account detail, card detail and the
 *   transaction detail, where the customer is reading their statement.
 * - `category` — "what kind of spending was this": the PFM category icon.
 *   Used inside the PFM surfaces, where the category is the subject.
 */
export type TransactionAvatarPresentation = "identity" | "category";

interface TransactionAvatarProps {
  transaction: AccountTransaction;
  /** Roundel diameter. 32 in transaction lists, 42 on the Evo 2027 home, 64 on detail. */
  size?: number;
  presentation?: TransactionAvatarPresentation;
  /** PFM presentation used when the row falls back to its category. */
  pfmVariant?: PfmCategoryIconVariant;
  /** Adds the soft drop shadow used by the Evo 2027 home activity rows. */
  elevated?: boolean;
}

function PfmFallback({
  transaction,
  size,
  pfmVariant,
}: {
  transaction: AccountTransaction;
  size: number;
  pfmVariant: PfmCategoryIconVariant;
}) {
  return (
    <span
      className="flex shrink-0 items-center justify-center"
      data-ds-label={`Transaction icon box ${size}x${size}`}
      data-transaction-avatar="pfm-category"
      style={{ width: size, height: size }}
    >
      <PfmCategoryIcon category={transaction.pfmCategory} size={size} variant={pfmVariant} />
    </span>
  );
}

/**
 * The leading visual of a transaction row, and the single place the identity
 * rules are decided:
 *
 * - both ends are the customer's own money (own-account transfer, currency
 *   exchange) → the pair of accounts, payer behind and destination in front;
 * - a card purchase at a branded merchant → the merchant's brand mark;
 * - money sent to or received from someone → their initials, with an arrow
 *   badge for money out and a plus badge for money in;
 * - activity with no counterparty at all — ATM cash, a cash deposit, the
 *   bank's own fee, a wallet top-up — or a card purchase we cannot brand →
 *   the PFM category icon.
 *
 * Every transaction surface renders this, so the rules cannot drift per screen.
 */
export default function TransactionAvatar({
  transaction,
  size = 32,
  presentation = "identity",
  pfmVariant = "category-circle",
  elevated = false,
}: TransactionAvatarProps) {
  if (presentation === "category") {
    return <PfmFallback transaction={transaction} size={size} pfmVariant={pfmVariant} />;
  }

  // Every identity mark is a filled roundel — a merchant, a party, a pair of
  // accounts. A bare category glyph next to them reads as a different system,
  // so the identity presentation always uses the circled category variant.
  const identityPfmVariant: PfmCategoryIconVariant = "category-circle";

  if (transaction.transferPair) {
    return <TransactionPairAvatar pair={transaction.transferPair} size={size} currency={transaction.currency} />;
  }

  const merchant = resolveTransactionMerchant(transaction);
  if (merchant) {
    return <MerchantLogo merchant={merchant} size={size} elevated={elevated} />;
  }

  // A card purchase we cannot brand keeps the category icon rather than
  // inventing a counterparty out of a processor descriptor.
  const hasCounterparty =
    transaction.source !== "card" && !isNonMerchantCounterparty(transaction.label);

  if (hasCounterparty) {
    return (
      <TransactionPartyAvatar
        name={transaction.label}
        direction={transaction.type === "credit" ? "in" : "out"}
        size={size}
      />
    );
  }

  return <PfmFallback transaction={transaction} size={size} pfmVariant={identityPfmVariant} />;
}
