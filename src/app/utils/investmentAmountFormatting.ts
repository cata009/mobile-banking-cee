import { getCountryConfig } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import { maskAmountParts } from "@/app/utils/amountPrivacy";

export interface InvestmentAmountParts {
  integer: string;
  decimal: string;
  currency: string;
}

function getNormalizedParts(
  amount: number,
  country: CountryId,
  minimumFractionDigits: number,
  maximumFractionDigits: number,
) {
  const formatted = new Intl.NumberFormat(getCountryConfig(country).locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).formatToParts(Math.abs(amount));
  const integer = formatted
    .filter((part) => part.type === "integer" || part.type === "group")
    .map((part) => part.type === "group" ? "." : part.value)
    .join("") || "0";
  const fraction = formatted.find((part) => part.type === "fraction")?.value ?? "";

  return {
    integer,
    decimal: fraction ? `,${fraction}` : "",
  };
}

export function formatInvestmentAmountParts(
  amount: number,
  country: CountryId,
  currency: string,
  amountsHidden = false,
  includeSign = false,
): InvestmentAmountParts {
  const parts = getNormalizedParts(amount, country, 2, 2);
  const masked = maskAmountParts({ integer: parts.integer, decimals: parts.decimal, currency }, amountsHidden);
  const sign = includeSign ? (amount > 0 ? "+" : amount < 0 ? "−" : "") : "";

  return {
    integer: `${sign}${masked.integer}`,
    decimal: masked.decimals,
    currency: masked.currency,
  };
}

export function formatInvestmentMoney(
  amount: number,
  country: CountryId,
  currency: string,
  amountsHidden = false,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
  includePositiveSign = false,
) {
  const parts = getNormalizedParts(amount, country, minimumFractionDigits, maximumFractionDigits);
  const masked = maskAmountParts({ integer: parts.integer, decimals: parts.decimal, currency }, amountsHidden);
  const sign = amount < 0 ? "−" : includePositiveSign && amount > 0 ? "+" : "";
  const currencySuffix = masked.currency ? ` ${masked.currency}` : "";

  return `${sign}${masked.integer}${masked.decimals}${currencySuffix}`;
}

export function formatInvestmentNumber(
  value: number,
  country: CountryId,
  minimumFractionDigits = 0,
  maximumFractionDigits = 6,
) {
  return formatInvestmentMoney(value, country, "", false, minimumFractionDigits, maximumFractionDigits).trim();
}
