/**
 * RS Teens card definitions (RSD). Two cards in the default portfolio — a debit
 * card and a virtual card — so the Card tab has real depth (RO shipped one card).
 */
export type RsKidsCard = {
  id: string;
  label: string;
  /** Shared Meniga-mapped Card artwork variant (see src/app/components/cards/Card.tsx). */
  variant: "mc-debit-gold" | "mc-debit-standard" | "mc-virtual-standard-violet";
  /** Masked PAN, e.g. "•••• 4912". */
  maskedNumber: string;
  holder: string;
  expiry: string;
  status: "active" | "frozen";
};

export const RS_KIDS_CARDS: readonly [RsKidsCard, ...RsKidsCard[]] = [
  {
    id: "rs-card-primary",
    label: "Debitna kartica",
    variant: "mc-debit-gold",
    maskedNumber: "•••• 4912",
    holder: "NIKOLA PETROVIĆ",
    expiry: "08/29",
    status: "active",
  },
  {
    id: "rs-card-virtual",
    label: "Virtuelna kartica",
    variant: "mc-virtual-standard-violet",
    maskedNumber: "•••• 7720",
    holder: "NIKOLA PETROVIĆ",
    expiry: "11/28",
    status: "active",
  },
];

export const RS_TEEN_CARDHOLDER = "NIKOLA PETROVIĆ";
