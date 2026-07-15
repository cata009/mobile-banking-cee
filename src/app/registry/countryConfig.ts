/**
 * Country Configuration Registry
 * Country-specific settings: currency, locale, formatting
 */

import type { CountryId } from "@/app/state/demoTypes";
import type { Currency } from "@/data/products";

/**
 * Country-specific configuration
 */
export interface CountryConfig {
  /** ISO currency code */
  currency: Currency;
  
  /** BCP 47 locale identifier */
  locale: string;
  
  /** Currency symbol (optional, for display) */
  currencySymbol?: string;
  
  /** Optional default scenario for this country */
  defaultScenario?: "inactive" | "active";
  
  /** Optional default release for this country */
  defaultRelease?: string;
}

/**
 * Country configuration mapping
 */
export const COUNTRY_CONFIG: Record<CountryId, CountryConfig> = {
  RO: {
    currency: "RON",
    locale: "ro-RO",
    currencySymbol: "RON",
    defaultScenario: "active",
  },
  RS: {
    currency: "RSD",
    locale: "sr-RS",
    currencySymbol: "RSD",
    defaultScenario: "active",
  },
  HU: {
    currency: "HUF",
    locale: "hu-HU",
    currencySymbol: "Ft",
    defaultScenario: "active",
  },
  BA: {
    currency: "BAM",
    locale: "bs-BA",
    currencySymbol: "KM",
    defaultScenario: "active",
  },
  BA_BL: {
    currency: "BAM",
    locale: "bs-BA",
    currencySymbol: "KM",
    defaultScenario: "active",
  },
  SK: {
    currency: "EUR",
    locale: "sk-SK",
    currencySymbol: "€",
    defaultScenario: "active",
  },
  SI: {
    currency: "EUR",
    locale: "sl-SI",
    currencySymbol: "€",
    defaultScenario: "active",
  },
  CZ: {
    currency: "CZK",
    locale: "cs-CZ",
    currencySymbol: "Kč",
    defaultScenario: "active",
  },
};

/**
 * Get country configuration
 * 
 * @param country - Country code
 * @returns Country-specific configuration
 * 
 * @example
 * ```ts
 * const config = getCountryConfig("RO");
 * // { currency: "RON", locale: "ro-RO", ... }
 * ```
 */
export function getCountryConfig(country: CountryId): CountryConfig {
  return COUNTRY_CONFIG[country];
}

/**
 * Format money amount using country-specific settings
 * 
 * @param amount - Numeric amount to format
 * @param country - Country code for locale/currency
 * @param options - Optional Intl.NumberFormat options
 * @returns Formatted money string
 * 
 * @example
 * ```ts
 * formatMoney(12345.67, "RO");
 * // "12.345,67 RON"
 * 
 * formatMoney(12345.67, "HU");
 * // "12 345,67 Ft"
 * 
 * formatMoney(12345.67, "SK");
 * // "12 345,67 €"
 * ```
 */
export function formatMoney(
  amount: number,
  country: CountryId,
  options?: Intl.NumberFormatOptions
): string {
  const config = getCountryConfig(country);
  
  const formatter = new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });
  
  return formatter.format(amount);
}

/**
 * Format money amount without currency symbol
 * Useful for displaying amounts with separate currency labels
 * 
 * @param amount - Numeric amount to format
 * @param country - Country code for locale
 * @returns Formatted number string
 * 
 * @example
 * ```ts
 * formatMoneyNumber(12345.67, "RO");
 * // "12.345,67"
 * ```
 */
export function formatMoneyNumber(
  amount: number,
  country: CountryId
): string {
  const config = getCountryConfig(country);
  
  const formatter = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

/**
 * Split formatted amount into integer and decimal parts
 * Useful for custom rendering with different styles
 * 
 * @param amount - Numeric amount to format
 * @param country - Country code for locale
 * @returns Object with integer and decimal parts
 * 
 * @example
 * ```ts
 * const parts = splitMoneyAmount(12345.67, "RO");
 * // { integer: "12.345", decimal: "67" }
 * 
 * const parts = splitMoneyAmount(12345.67, "HU");
 * // { integer: "12 345", decimal: "67" }
 * ```
 */
export function splitMoneyAmount(
  amount: number,
  country: CountryId
): { integer: string; decimal: string } {
  const formatted = formatMoneyNumber(amount, country);
  
  // Find the decimal separator (could be . or ,)
  const config = getCountryConfig(country);
  const parts = new Intl.NumberFormat(config.locale).formatToParts(1.1);
  const decimalSeparator = parts.find(part => part.type === "decimal")?.value || ".";
  
  const [integer, decimal] = formatted.split(decimalSeparator);
  
  return {
    integer: integer || "0",
    decimal: decimal || "00",
  };
}

/**
 * Get currency symbol for a country
 * 
 * @param country - Country code
 * @returns Currency symbol
 * 
 * @example
 * ```ts
 * getCurrencySymbol("RO"); // "RON"
 * getCurrencySymbol("HU"); // "Ft"
 * getCurrencySymbol("SK"); // "€"
 * ```
 */
export function getCurrencySymbol(country: CountryId): string {
  const config = getCountryConfig(country);
  return config.currencySymbol || config.currency;
}
