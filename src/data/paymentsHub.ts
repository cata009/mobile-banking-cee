/**
 * Data behind the Evo 2027 Payments hub.
 *
 * The hub replaced four illustrated hero cards with one search field, a grid of
 * up to eight actions, and the people you actually pay. That last list is the
 * part with no home in the baseline data: templates and saved beneficiaries are
 * about *where* money goes, while this is about who you paid recently and how
 * often — so it lives here rather than being squeezed into `paymentTemplates`.
 */

import { getCountryConfig } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import type { Currency } from "@/data/products";
import type { BankId } from "@/app/config/bankLogos";

export interface FrequentBeneficiary {
  id: string;
  name: string;
  /** Masked account, shown under the name the way a Revolt-style list shows a handle. */
  accountNumber: string;
  /** Last amount paid, already signed for display as an outgoing payment. */
  lastAmount: number;
  lastPaidLabel: string;
  currency: Currency;
  /** Receiving bank, badged on the avatar the way a transaction badges its direction. */
  bank: BankId;
}

export type RecurrentPaymentKind = "standing-order" | "direct-debit";

export interface RecurrentPayment {
  id: string;
  kind: RecurrentPaymentKind;
  name: string;
  /** Next execution date, printed exactly as the bank prints it. */
  nextDate: string;
  amount: number;
  currency: Currency;
  /** Direct debits carry a ceiling rather than a fixed amount. */
  isLimit?: boolean;
}

function accountFor(country: CountryId, suffix: string) {
  const prefix = country === "BA_BL" ? "BA" : country;
  return `${prefix}49 BACX **** ${suffix}`;
}

type FrequentBeneficiarySeed = Omit<FrequentBeneficiary, "accountNumber" | "currency"> & { suffix: string };

const FREQUENT_BENEFICIARY_SEEDS: readonly FrequentBeneficiarySeed[] = [
  { id: "maria-popescu", name: "Maria Popescu", suffix: "4101", lastAmount: 320, lastPaidLabel: "Yesterday", bank: "unicredit" },
  { id: "victor-ionescu", name: "Victor Ionescu", suffix: "4102", lastAmount: 150, lastPaidLabel: "3 days ago", bank: "revolut" },
  { id: "homeowners-association", name: "Homeowners association", suffix: "4103", lastAmount: 599.24, lastPaidLabel: "11 Aug", bank: "kb" },
  { id: "bright-future-foundation", name: "Bright Future Foundation", suffix: "4104", lastAmount: 100, lastPaidLabel: "23 Jul", bank: "cs" },
  { id: "anna-novak", name: "Anna Novák", suffix: "4105", lastAmount: 1200, lastPaidLabel: "15 Jun", bank: "unicredit" },
  { id: "city-utilities", name: "City Utilities", suffix: "4106", lastAmount: 245.5, lastPaidLabel: "15 Jun", bank: "raiffeisen" },
  { id: "petr-havelka", name: "Petr Havelka", suffix: "4107", lastAmount: 7500, lastPaidLabel: "12 Jun", bank: "moneta" },
  { id: "school-fees", name: "Sunnyside School", suffix: "4108", lastAmount: 690, lastPaidLabel: "3 Jun", bank: "kb" },
  { id: "elena-marin", name: "Elena Marin", suffix: "4109", lastAmount: 80, lastPaidLabel: "28 May", bank: "unicredit" },
  { id: "internet-provider", name: "Airwaynet", suffix: "4110", lastAmount: 1277, lastPaidLabel: "21 May", bank: "raiffeisen" },
  { id: "daniel-lataretu", name: "Daniel Lătărețu", suffix: "4111", lastAmount: 250, lastPaidLabel: "14 May", bank: "revolut" },
  { id: "insurance-generali", name: "Household insurance", suffix: "4112", lastAmount: 1150, lastPaidLabel: "6 May", bank: "moneta" },
];

export function getFrequentBeneficiaries(country: CountryId): FrequentBeneficiary[] {
  const currency = getCountryConfig(country).currency;

  return FREQUENT_BENEFICIARY_SEEDS.map(({ suffix, ...seed }) => ({
    ...seed,
    accountNumber: accountFor(country, suffix),
    currency,
  }));
}

const STANDING_ORDER_SEEDS: ReadonlyArray<Omit<RecurrentPayment, "currency" | "kind">> = [
  { id: "so-savings", name: "Savings account", nextDate: "09-September-2026", amount: 900 },
  { id: "so-rent", name: "Rent", nextDate: "15-September-2026", amount: 22500 },
  { id: "so-television", name: "Television licence", nextDate: "15-September-2026", amount: 150 },
  { id: "so-radio", name: "Radio licence", nextDate: "16-September-2026", amount: 55 },
  { id: "so-petr-havelka", name: "Petr Havelka", nextDate: "16-September-2026", amount: 7500 },
  { id: "so-internet", name: "Internet provider", nextDate: "21-September-2026", amount: 1277 },
  { id: "so-school", name: "School fees", nextDate: "23-September-2026", amount: 3400 },
];

const DIRECT_DEBIT_SEEDS: ReadonlyArray<Omit<RecurrentPayment, "currency" | "kind">> = [
  { id: "dd-energy", name: "Energy supplier", nextDate: "05-September-2026", amount: 2500, isLimit: true },
  { id: "dd-mobile", name: "Mobile operator", nextDate: "12-September-2026", amount: 800, isLimit: true },
  { id: "dd-insurance", name: "Household insurance", nextDate: "18-September-2026", amount: 1150, isLimit: true },
];

export function getRecurrentPayments(country: CountryId, kind: RecurrentPaymentKind): RecurrentPayment[] {
  const currency = getCountryConfig(country).currency;
  const seeds = kind === "standing-order" ? STANDING_ORDER_SEEDS : DIRECT_DEBIT_SEEDS;

  return seeds.map((seed) => ({ ...seed, kind, currency }));
}
