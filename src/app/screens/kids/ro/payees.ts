/**
 * RO Teens payments core: the curated payee catalogue + the parent-approval
 * decision engine.
 *
 * Design intent (product): teens NEVER type a free IBAN. They pick from a short,
 * parent-curated list (family, approved friends, saved merchants & subscriptions).
 * Every payment is scored by `decidePayment`:
 *   - within the instant limit AND to a trusted payee → settles instantly
 *   - over the instant limit OR to a restricted payee   → routes to the parent
 *   - over a per-payee / weekly cap                      → blocked with a reason
 */
import { formatRon } from "./money";
import type { PaymentDecision, RoPayee, RoPayeeCategory } from "./types";

/** Below this per-transaction value, trusted payees settle without a parent OK. */
export const RO_INSTANT_THRESHOLD = 50;

/** How much of the weekly spending limit is available to authorise instantly. */
export const RO_WEEKLY_LIMIT = 250;

export const RO_PAYEE_CATEGORY_LABEL: Record<RoPayeeCategory, string> = {
  family: "Familie",
  friend: "Prieteni",
  merchant: "Magazine",
  subscription: "Abonamente",
};

export const RO_PAYEES: readonly [RoPayee, ...RoPayee[]] = [
  // Family — trusted, generous limits, no approval for small amounts.
  {
    id: "payee-mama",
    name: "Mama",
    handle: "Elena Popescu",
    category: "family",
    icon: "user-round",
    accent: "var(--uc-product-pink)",
    initials: "EP",
    perPaymentLimit: 500,
    alwaysNeedsApproval: false,
    trusted: true,
    note: "Familie — transfer instant",
  },
  {
    id: "payee-tata",
    name: "Tata",
    handle: "Radu Popescu",
    category: "family",
    icon: "user-round",
    accent: "var(--uc-product-blue)",
    initials: "RP",
    perPaymentLimit: 500,
    alwaysNeedsApproval: false,
    trusted: true,
    note: "Familie — transfer instant",
  },
  {
    id: "payee-sora",
    name: "Maria",
    handle: "Sora ta",
    category: "family",
    icon: "user-round",
    accent: "var(--uc-teal-main)",
    initials: "MP",
    perPaymentLimit: 200,
    alwaysNeedsApproval: false,
    trusted: true,
    note: "Familie — transfer instant",
  },
  // Friends — approved by a parent; small amounts instant, larger ones reviewed.
  {
    id: "payee-vlad",
    name: "Vlad",
    handle: "Prieten aprobat",
    category: "friend",
    icon: "users",
    accent: "var(--uc-product-blue-deep)",
    initials: "V",
    perPaymentLimit: 120,
    alwaysNeedsApproval: false,
    trusted: true,
    note: "Prieten aprobat de Mama",
  },
  {
    id: "payee-ioana",
    name: "Ioana",
    handle: "Prieten aprobat",
    category: "friend",
    icon: "users",
    accent: "var(--uc-magenta-main)",
    initials: "I",
    perPaymentLimit: 120,
    alwaysNeedsApproval: false,
    trusted: true,
    note: "Prieten aprobat de Mama",
  },
  {
    id: "payee-david",
    name: "David",
    handle: "Coleg de clasă",
    category: "friend",
    icon: "users",
    accent: "var(--uc-green-deep)",
    initials: "D",
    perPaymentLimit: 100,
    alwaysNeedsApproval: true,
    trusted: false,
    note: "Prieten nou — Mama confirmă prima plată",
  },
  // Merchants — real teen spots; contactless-style quick pay.
  {
    id: "payee-glovo",
    name: "Glovo",
    handle: "Mâncare la comandă",
    category: "merchant",
    icon: "shopping-bag",
    accent: "var(--uc-yellow-gold)",
    perPaymentLimit: 150,
    alwaysNeedsApproval: false,
    trusted: true,
    note: "Magazin salvat",
  },
  {
    id: "payee-emag",
    name: "eMAG",
    handle: "Shopping online",
    category: "merchant",
    icon: "shopping-bag",
    accent: "var(--uc-product-blue)",
    perPaymentLimit: 400,
    alwaysNeedsApproval: true,
    trusted: false,
    note: "Cumpărături mari — cu aprobare",
  },
  {
    id: "payee-kaufland",
    name: "Kaufland",
    handle: "Cumpărături",
    category: "merchant",
    icon: "shopping-bag",
    accent: "var(--uc-red-main)",
    perPaymentLimit: 200,
    alwaysNeedsApproval: false,
    trusted: true,
    note: "Magazin salvat",
  },
  // Subscriptions — recurring, low amounts, instant.
  {
    id: "payee-spotify",
    name: "Spotify",
    handle: "Abonament lunar",
    category: "subscription",
    icon: "receipt-text",
    accent: "var(--uc-green-success)",
    perPaymentLimit: 60,
    alwaysNeedsApproval: false,
    trusted: true,
    note: "Abonament — reînnoire automată",
  },
  {
    id: "payee-netflix",
    name: "Netflix",
    handle: "Abonament lunar",
    category: "subscription",
    icon: "receipt-text",
    accent: "var(--uc-red-main)",
    perPaymentLimit: 80,
    alwaysNeedsApproval: false,
    trusted: true,
    note: "Abonament — reînnoire automată",
  },
  {
    id: "payee-steam",
    name: "Steam",
    handle: "Jocuri",
    category: "subscription",
    icon: "receipt-text",
    accent: "var(--uc-product-blue-deep)",
    perPaymentLimit: 150,
    alwaysNeedsApproval: true,
    trusted: false,
    note: "Jocuri — cu aprobarea Mamei",
  },
];

export function getRoPayee(payeeId: string): RoPayee | null {
  return RO_PAYEES.find((payee) => payee.id === payeeId) ?? null;
}

/** Payees surfaced as one-tap tiles on the payments hub (a curated shortlist). */
export const RO_QUICK_PAY_IDS: readonly string[] = [
  "payee-mama",
  "payee-vlad",
  "payee-glovo",
  "payee-spotify",
  "payee-ioana",
  "payee-emag",
];

export function getRoQuickPayees(): RoPayee[] {
  return RO_QUICK_PAY_IDS.map(getRoPayee).filter((payee): payee is RoPayee => payee !== null);
}

/**
 * The parent-approval brain. Pure function so it can be unit-tested and reused
 * across the pay flow, the review sheet, and the home summary.
 */
export function decidePayment(params: {
  amount: number;
  payee: RoPayee;
  weeklyRemaining: number;
  instantThreshold?: number;
}): PaymentDecision {
  const { amount, payee, weeklyRemaining } = params;
  const instantThreshold = params.instantThreshold ?? RO_INSTANT_THRESHOLD;

  if (!Number.isFinite(amount) || amount <= 0) {
    return { status: "blocked", reason: "Introdu o sumă mai mare ca zero." };
  }

  if (amount > payee.perPaymentLimit) {
    return {
      status: "blocked",
      reason: `Peste limita de ${formatRon(payee.perPaymentLimit)} setată pentru ${payee.name}.`,
    };
  }

  if (amount > weeklyRemaining) {
    return {
      status: "blocked",
      reason: `Depășește limita săptămânală. Îți mai rămân ${formatRon(Math.max(weeklyRemaining, 0))}.`,
    };
  }

  if (payee.alwaysNeedsApproval) {
    return {
      status: "needs-approval",
      reason: `${payee.name} e pe lista care cere confirmarea Mamei.`,
    };
  }

  if (!payee.trusted) {
    return {
      status: "needs-approval",
      reason: "Prima plată către acest destinatar trece pe la Mama.",
    };
  }

  if (amount > instantThreshold) {
    return {
      status: "needs-approval",
      reason: `Peste ${formatRon(instantThreshold)} — Mama aprobă înainte să plece banii.`,
    };
  }

  return { status: "instant", reason: "Se trimite instant, ești sub limita ta." };
}
