import type { Product } from "@/data/products";

/**
 * Commercial terms for the credit products shown on the Evo Home.
 *
 * The savings side of Home has always printed its rate ("2.5% p.a.", "6.5%
 * p.a."); the credit side printed none, so the app disclosed what it pays and
 * withheld what it charges. These are the figures that close that gap, kept
 * beside the deposit presentations rather than invented at render time.
 *
 * `dueDay` is the day of the month the instalment is collected — an amount
 * without a date is the half of the fact a customer cannot act on.
 */
export interface EvoCreditTerms {
  /** Nominal annual rate, as a fraction. */
  annualRate: number;
  /** Day of month the instalment is collected. */
  dueDay: number;
  /** Instalment as a fraction of the outstanding balance. */
  installmentRate: number;
}

const DEFAULT_LOAN_TERMS: EvoCreditTerms = {
  annualRate: 0.089,
  dueDay: 15,
  installmentRate: 0.009,
};

const EVO_CREDIT_TERMS: Record<string, EvoCreditTerms> = {
  "loan-1": { annualRate: 0.089, dueDay: 15, installmentRate: 0.009 },
  "loan-2": { annualRate: 0.104, dueDay: 8, installmentRate: 0.009 },
  "mort-1": { annualRate: 0.049, dueDay: 20, installmentRate: 0.009 },
  "mort-2": { annualRate: 0.052, dueDay: 5, installmentRate: 0.009 },
};

/** Annual rate charged on a drawn credit-card balance. */
export const EVO_CREDIT_CARD_ANNUAL_RATE = 0.199;

/** Minimum payment as a fraction of the drawn balance. */
export const EVO_CREDIT_CARD_MINIMUM_RATE = 0.05;

export function getEvoCreditTerms(product: Product): EvoCreditTerms {
  return EVO_CREDIT_TERMS[product.id] ?? DEFAULT_LOAN_TERMS;
}

/** Rate paid on a saving account, matching the "2.5% p.a." the card already prints. */
export const EVO_SAVING_ACCOUNT_ANNUAL_RATE = 0.025;

/**
 * The next collection date for an instalment, as `DD/MM/YYYY`.
 *
 * Anchored on the demo's own clock so the date moves with the data rather than
 * with the reader's calendar.
 */
export function formatNextInstalmentDate(dueDay: number, reference: Date): string {
  const candidate = new Date(reference.getFullYear(), reference.getMonth(), dueDay);
  if (candidate.getTime() < reference.getTime()) {
    candidate.setMonth(candidate.getMonth() + 1);
  }

  const day = String(candidate.getDate()).padStart(2, "0");
  const month = String(candidate.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${candidate.getFullYear()}`;
}
