import type { CountryId, ProductId } from "@/app/state/demoTypes";

export function isInvestmentsCountryEligible(_country: CountryId): boolean {
  return true;
}

export function isInvestmentsPortfolioAvailable(product: ProductId, country: CountryId): boolean {
  return product === "PI" && isInvestmentsCountryEligible(country);
}
