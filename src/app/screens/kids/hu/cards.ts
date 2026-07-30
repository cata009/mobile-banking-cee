import type { DebitCard } from "@/data/products";

export type HuKidsCard = {
  id: string;
  title: string;
  lastDigits: string;
  holderName: string;
};

export const HU_DEFAULT_KIDS_CARD: HuKidsCard = {
  id: "alexandra-standard-main",
  title: "Mastercard Standard",
  lastDigits: "5678",
  holderName: "ALEXANDRA ALBON",
};

export const HU_KIDS_CARDS: readonly [HuKidsCard, ...HuKidsCard[]] = [HU_DEFAULT_KIDS_CARD];

/**
 * The existing Kids card expressed through the shared Mobile PI card-detail
 * contract. It is presentation-only and lets merchant purchases reuse the
 * established card transaction detail, including the linked card row.
 */
export const HU_KIDS_CARD_DETAIL_PRODUCT: DebitCard = {
  id: "hu-kids-mastercard-standard",
  type: "debit_card",
  name: HU_DEFAULT_KIDS_CARD.title,
  accountNumber: "5313567890125678",
  balance: 0,
  currency: "HUF",
  cardType: "Standard",
  cardNumber: "5313567890125678",
  expiryDate: "12/29",
  cardHolderName: HU_DEFAULT_KIDS_CARD.holderName,
  linkedAccountId: "hu-kids-primary-account",
};
