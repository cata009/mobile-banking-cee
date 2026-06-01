import { getCountryConfig } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import type { Currency } from "@/data/products";

export const EXCHANGE_RATE_DATE = "2026-05-28";

export const EXCHANGE_RATE_SOURCE =
  "Demo FX table. EUR base, aligned to latest available 2026-05-28 reference context: ECB 2026-05-27 for EUR quoted currencies, NBS official middle rate for RSD, and BAM fixed peg.";

export const EUR_REFERENCE_RATES: Record<Currency, number> = {
  EUR: 1,
  CZK: 24.284,
  RON: 5.2379,
  BAM: 1.95583,
  HUF: 354.83,
  RSD: 117.3909,
  USD: 1.1637,
  GBP: 0.86618,
};

export function getCountryCurrency(country: CountryId): Currency {
  return getCountryConfig(country).currency as Currency;
}

export function convertCurrency(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = EUR_REFERENCE_RATES[fromCurrency];
  const toRate = EUR_REFERENCE_RATES[toCurrency];

  if (!fromRate || !toRate) {
    return amount;
  }

  return (amount / fromRate) * toRate;
}

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}
