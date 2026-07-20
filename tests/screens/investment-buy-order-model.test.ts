import { describe, expect, it } from "vitest";
import { COUNTRY_CONFIG } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import type { InvestmentCatalogSecurity } from "@/app/config/investmentsPortfolioConfig";
import type { CurrentAccount, Currency } from "@/data/products";
import {
  buildInvestmentBuyOrderQuote,
  getInvestmentBuyOrderValidation,
  parseInvestmentOrderQuantity,
} from "@/app/screens/investments/investmentBuyOrderModel";

const COUNTRIES: readonly CountryId[] = ["RO", "CZ", "SK", "HU", "RS", "BA", "BA_BL", "SI"];

function security(overrides: Partial<InvestmentCatalogSecurity> = {}): InvestmentCatalogSecurity {
  return {
    id: "security-1",
    title: "onemarkets Climate Focus Fund",
    sourceProductName: "Investment catalogue",
    status: "active",
    contributionType: "ONE OFF",
    value: 1200,
    currency: "EUR",
    instrumentCurrency: "EUR",
    localValue: 1200,
    localCurrency: "EUR",
    securityAccountId: "security-account-1",
    securityAccountName: "Security account",
    securityAccountCurrency: "EUR",
    productType: "Fund",
    assetClass: "Equity",
    marketPrice: 25,
    quantity: 0,
    performanceAmount: 12,
    performancePercent: 1,
    owned: false,
    productId: "ROSECURITY1",
    inceptionDate: "19.07.2022",
    lastUpdate: "03.01.2026",
    description: "A test security.",
    ...overrides,
  };
}

function account(currency: Currency, balance = 10_000): CurrentAccount {
  return {
    id: `account-${currency}`,
    type: "current_account",
    name: `${currency} current account`,
    accountNumber: `${currency}1234567890`,
    balance,
    currency,
  };
}

describe("parseInvestmentOrderQuantity", () => {
  it.each(["", "0", "-1", "1.5", "abc", "  "])("rejects %j", (value) => {
    expect(parseInvestmentOrderQuantity(value)).toBeNull();
  });

  it("accepts a trimmed positive whole number", () => {
    expect(parseInvestmentOrderQuantity(" 12 ")).toBe(12);
  });
});

describe("buildInvestmentBuyOrderQuote", () => {
  it("calculates a same-currency market quote", () => {
    const selectedAccount = account("EUR");
    const quote = buildInvestmentBuyOrderQuote(security(), selectedAccount, 4);

    expect(quote).toMatchObject({
      quantity: 4,
      marketPrice: 25,
      productCurrency: "EUR",
      productAmount: 100,
      accountCurrency: "EUR",
      debitAmount: 100,
      hasSufficientBalance: true,
    });
    expect(getInvestmentBuyOrderValidation(quote, selectedAccount)).toBeNull();
  });

  it("converts the estimated debit into the selected account currency", () => {
    const selectedAccount = account("RON");
    const quote = buildInvestmentBuyOrderQuote(security(), selectedAccount, 4);

    expect(quote.productAmount).toBe(100);
    expect(quote.debitAmount).toBe(523.79);
    expect(quote.accountCurrency).toBe("RON");
  });

  it("reports insufficient balance", () => {
    const selectedAccount = account("EUR", 99);
    const quote = buildInvestmentBuyOrderQuote(security(), selectedAccount, 4);

    expect(quote.hasSufficientBalance).toBe(false);
    expect(getInvestmentBuyOrderValidation(quote, selectedAccount)).toBe("Insufficient balance. Required 100.00 EUR.");
  });

  it.each(COUNTRIES)("quotes an order for %s in its local account currency", (country) => {
    const localCurrency = COUNTRY_CONFIG[country].currency as Currency;
    const selectedAccount = account(localCurrency);
    const quote = buildInvestmentBuyOrderQuote(security(), selectedAccount, 2);

    expect(quote.accountCurrency).toBe(localCurrency);
    expect(quote.debitAmount).toBeGreaterThan(0);
  });
});
