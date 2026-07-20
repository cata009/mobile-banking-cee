import { describe, expect, it } from "vitest";
import {
  buildInvestmentSecurityCatalog,
  type InvestmentSecurity,
} from "@/app/config/investmentsPortfolioConfig";

const ownedSecurity: InvestmentSecurity = {
  id: "climate-focus",
  title: "Owned Climate Focus Fund",
  sourceProductName: "Investment portfolio",
  status: "active",
  contributionType: "ONE OFF",
  value: 100,
  currency: "EUR",
  instrumentCurrency: "EUR",
  localValue: 500,
  localCurrency: "RON",
  securityAccountId: "securities-eur",
  securityAccountName: "EUR Securities Account",
  securityAccountCurrency: "EUR",
  productType: "Fund",
  assetClass: "Equity",
  marketPrice: 50,
  quantity: 2,
  performanceAmount: 10,
  performancePercent: 2,
};

describe("investment security catalogue", () => {
  it("assigns a unique runtime id to every owned and catalogue product", () => {
    const catalogue = buildInvestmentSecurityCatalog([ownedSecurity], "RO");
    const ids = catalogue.map((security) => security.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
