import type { CountryId, ProductId } from "@/app/state/demoTypes";

const INVESTMENTS_EXCLUDED_COUNTRIES: readonly CountryId[] = ["BA", "BA_BL"];

export function isInvestmentsCountryEligible(country: CountryId): boolean {
  return !INVESTMENTS_EXCLUDED_COUNTRIES.includes(country);
}

export function isInvestmentsPortfolioAvailable(product: ProductId, country: CountryId): boolean {
  return product === "PI" && isInvestmentsCountryEligible(country);
}
