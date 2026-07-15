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
