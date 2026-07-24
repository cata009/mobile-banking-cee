/**
 * RS Teens payments core: the curated Serbian payee catalogue + the
 * parent-approval decision engine.
 *
 * Design intent (product): teens NEVER type a free IBAN. They pick from a short,
 * parent-curated list (family, approved friends, saved merchants & subscriptions).
 * Every payment is scored by `decidePayment`:
 *   - within the instant limit AND to a trusted payee AND covered by the balance
 *     → settles instantly
 *   - over the instant limit OR to a restricted payee → routes to Tata (parent)
 *   - over the per-payee / weekly cap OR exceeding the available balance
 *     → blocked with a reason
 *
 * Improvement over the RO Teens engine: this version is BALANCE-AWARE. RO could
 * green-light an "instant" payment for 50 RON while the balance was 10 RON.
 * Serbia checks `amount > balance` as a hard block, so the decision is honest.
 */
import { formatRsd } from "./money";
import type { PaymentDecision, RsPayee, RsPayeeCategory } from "./types";

/** Below this per-transaction value, trusted payees settle without a parent OK. */
export const RS_INSTANT_THRESHOLD = 500;

/** The weekly spending cap. Money authorised this week counts toward it. */
export const RS_WEEKLY_LIMIT = 3000;

export const RS_PAYEE_CATEGORY_LABEL: Record<RsPayeeCategory, string> = {
  family: "Porodica",
  friend: "Prijatelji",
  merchant: "Prodavnice",
  subscription: "Pretplate",
};

export const RS_PAYEES: readonly [RsPayee, ...RsPayee[]] = [
  // Family — trusted, generous limits, no approval for small amounts.
  {
    id: "payee-tata",
    name: "Tata",
    handle: "Milan Petrović",
    category: "family",
    icon: "user-round",
    accent: "var(--uc-product-blue)",
    initials: "MP",
    perPaymentLimit: 8000,
    alwaysNeedsApproval: false,
    trusted: true,
    note: "Porodica — transfer instant",
  },
  {
    id: "payee-mama",
    name: "Mama",
    handle: "Jelena Petrović",
    category: "family",
    icon: "user-round",
    accent: "var(--uc-product-pink)",
    initials: "JP",
    perPaymentLimit: 8000,
    alwaysNeedsApproval: false,
    trusted: true,
    note: "Porodica — transfer instant",
  },
  {
    id: "payee-sestra",
    name: "Sofija",
    handle: "Mlađa sestra",
    category: "family",
    icon: "user-round",
    accent: "var(--uc-product-mauve)",
    initials: "SP",
    perPaymentLimit: 2000,
    alwaysNeedsApproval: false,
    trusted: true,
    note: "Porodica — transfer instant",
  },
  // Friends — approved by a parent; small amounts instant, larger ones reviewed.
  {
    id: "payee-luka",
    name: "Luka",
    handle: "Prijatelj odobren",
    category: "friend",
    icon: "users",
    accent: "var(--uc-product-blue-deep)",
    initials: "L",
    perPaymentLimit: 1500,
    alwaysNeedsApproval: false,
    trusted: true,
    note: "Prijatelj koga je Tata odobrio",
  },
  {
    id: "payee-ana",
    name: "Ana",
    handle: "Prijatelj odobren",
    category: "friend",
    icon: "users",
    accent: "var(--uc-product-pink)",
    initials: "A",
    perPaymentLimit: 1200,
    alwaysNeedsApproval: false,
    trusted: true,
    note: "Prijatelj koga je Tata odobrio",
  },
  {
    id: "payee-marko",
    name: "Marko",
    handle: "Novi drug iz razreda",
    category: "friend",
    icon: "users",
    accent: "var(--uc-product-slate)",
    initials: "M",
    perPaymentLimit: 800,
    alwaysNeedsApproval: true,
    trusted: false,
    note: "Nova osoba — Tata potvrđuje prvi put",
  },
  // Merchants — real Serbian teen spots; quick-pay style.
  {
    id: "payee-maxi",
    name: "Maxi",
    handle: "Market i online",
    category: "merchant",
    icon: "shopping-bag",
    accent: "var(--uc-product-blue)",
    merchantLogo: "maxi",
    perPaymentLimit: 2500,
    alwaysNeedsApproval: false,
    trusted: true,
    note: "Prodavnica sačuvana",
  },
  {
    id: "payee-gomex",
    name: "Gomex",
    handle: "Poslastičarnica",
    category: "merchant",
    icon: "shopping-bag",
    accent: "var(--uc-product-pink)",
    merchantLogo: "gomex",
    perPaymentLimit: 1500,
    alwaysNeedsApproval: false,
    trusted: true,
    note: "Prodavnica sačuvana",
  },
  {
    id: "payee-yuh",
    name: "Yuh",
    handle: "Online porudžbina",
    category: "merchant",
    icon: "shopping-bag",
    accent: "var(--uc-product-blue-deep)",
    merchantLogo: "yuh",
    perPaymentLimit: 3000,
    alwaysNeedsApproval: true,
    trusted: false,
    note: "Veća kupovina — uz odobrenje",
  },
  // Subscriptions — recurring, low amounts.
  {
    id: "payee-spotify",
    name: "Spotify",
    handle: "Mesečna pretplata",
    category: "subscription",
    icon: "receipt-text",
    accent: "var(--uc-product-mauve)",
    merchantLogo: "spotify",
    perPaymentLimit: 600,
    alwaysNeedsApproval: false,
    trusted: true,
    note: "Pretplata — automatska obnova",
  },
  {
    id: "payee-netflix",
    name: "Netflix",
    handle: "Mesečna pretplata",
    category: "subscription",
    icon: "receipt-text",
    accent: "var(--uc-product-slate)",
    merchantLogo: "netflix",
    perPaymentLimit: 790,
    alwaysNeedsApproval: false,
    trusted: true,
    note: "Pretplata — automatska obnova",
  },
  {
    id: "payee-dm",
    name: "dm",
    handle: "Drogerija",
    category: "subscription",
    icon: "receipt-text",
    accent: "var(--uc-product-blue)",
    merchantLogo: "dm",
    perPaymentLimit: 2000,
    alwaysNeedsApproval: true,
    trusted: false,
    note: "Kupovina — uz odobrenje Tate",
  },
];

export function getRsPayee(payeeId: string): RsPayee | null {
  return RS_PAYEES.find((payee) => payee.id === payeeId) ?? null;
}

/** Payees surfaced as one-tap tiles on the payments hub (a curated shortlist). */
export const RS_QUICK_PAY_IDS: readonly string[] = [
  "payee-tata",
  "payee-luka",
  "payee-maxi",
  "payee-spotify",
  "payee-ana",
  "payee-gomex",
];

export function getRsQuickPayees(): RsPayee[] {
  return RS_QUICK_PAY_IDS.map(getRsPayee).filter((payee): payee is RsPayee => payee !== null);
}

export type DecidePaymentParams = {
  amount: number;
  payee: RsPayee;
  /** Remaining weekly spending capacity (weeklyLimit - spentThisWeek). */
  weeklyRemaining: number;
  /** Current available balance. The RO engine ignored this — Serbia checks it. */
  balance: number;
  instantThreshold?: number;
};

/**
 * The parent-approval brain. Pure function so it can be unit-tested and reused
 * across the pay flow, the review sheet, and the home summary.
 *
 * Ordering principle: hard blocks first (can't happen at all), then soft
 * approvals (can happen, just needs a parent), then instant settlement.
 */
export function decidePayment(params: DecidePaymentParams): PaymentDecision {
  const { amount, payee, weeklyRemaining, balance } = params;
  const instantThreshold = params.instantThreshold ?? RS_INSTANT_THRESHOLD;

  if (!Number.isFinite(amount) || amount <= 0) {
    return { status: "blocked", reason: "Unesi iznos veći od nule." };
  }

  if (amount > payee.perPaymentLimit) {
    return {
      status: "blocked",
      reason: `Iznad limite od ${formatRsd(payee.perPaymentLimit)} za ${payee.name}.`,
    };
  }

  if (amount > weeklyRemaining) {
    return {
      status: "blocked",
      reason: `Premašuje nedeljni limit. Ostalo ti je ${formatRsd(Math.max(weeklyRemaining, 0))}.`,
    };
  }

  if (amount > balance) {
    return {
      status: "blocked",
      reason: `Nemaš dovoljno. Dostupno: ${formatRsd(Math.max(balance, 0))}.`,
    };
  }

  if (payee.alwaysNeedsApproval) {
    return {
      status: "needs-approval",
      reason: `${payee.name} je na listi koja traži Tatinu potvrdu.`,
    };
  }

  if (!payee.trusted) {
    return {
      status: "needs-approval",
      reason: "Prvi put šalješ ovoj osobi — Tata potvrđuje.",
    };
  }

  if (amount > instantThreshold) {
    return {
      status: "needs-approval",
      reason: `Iznad ${formatRsd(instantThreshold)} — Tata odobrava pre slanja.`,
    };
  }

  return { status: "instant", reason: "Šalje se instant, ispod tvog limita." };
}
