export type RoTeenCard = {
  id: string;
  title: string;
  network: string;
  lastDigits: string;
  holderName: string;
  expiry: string;
};

export const RO_DEFAULT_CARD: RoTeenCard = {
  id: "andrei-teen-main",
  title: "Mastercard Teen",
  network: "Mastercard",
  lastDigits: "4417",
  holderName: "ANDREI POPESCU",
  expiry: "08/29",
};

export const RO_TEEN_CARDS: readonly [RoTeenCard, ...RoTeenCard[]] = [RO_DEFAULT_CARD];
