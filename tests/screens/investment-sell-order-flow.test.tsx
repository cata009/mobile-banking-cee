// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { InvestmentCatalogSecurity } from "@/app/config/investmentsPortfolioConfig";
import InvestmentSellOrderFlow from "@/app/screens/investments/InvestmentSellOrderFlow";
import type { CountryId } from "@/app/state/demoTypes";
import type { CurrentAccount } from "@/data/products";

const security: InvestmentCatalogSecurity = {
  id: "climate-focus",
  title: "onemarkets Climate Focus Fund",
  sourceProductName: "Investment account",
  status: "active",
  contributionType: "ONE OFF",
  value: 250,
  currency: "EUR",
  instrumentCurrency: "EUR",
  localValue: 250,
  localCurrency: "EUR",
  securityAccountId: "sec-1",
  securityAccountName: "Securities account",
  securityAccountCurrency: "EUR",
  productType: "Fund",
  assetClass: "Equity",
  marketPrice: 25,
  quantity: 10,
  performanceAmount: 12,
  performancePercent: 5,
  owned: true,
  productId: "LU1234567890",
  inceptionDate: "01.01.2020",
  lastUpdate: "21.07.2026",
  description: "Global equity fund",
  sellOrderMode: "units-and-amount",
  sellAmountLimit: 150,
};

const accounts: CurrentAccount[] = [
  {
    id: "account-1",
    type: "current_account",
    name: "Main account",
    accountNumber: "RO49AAAA1B31007593840000",
    balance: 1_000,
    currency: "EUR",
  },
];

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

function renderFlow(overrides: Partial<InvestmentCatalogSecurity> = {}, country: CountryId = "RO") {
  const onComplete = vi.fn();
  render(
    <InvestmentSellOrderFlow
      security={{ ...security, ...overrides }}
      accounts={accounts}
      country={country}
      amountsHidden={false}
      onBack={() => undefined}
      onComplete={onComplete}
    />,
  );
  return { onComplete };
}

describe("InvestmentSellOrderFlow", () => {
  it("matches the Figma order-data structure and switches between units and amount", () => {
    renderFlow();

    expect(screen.getAllByText("Sell Order")).not.toHaveLength(0);
    expect(screen.getByText("PRODUCT EVALUATION")).toBeInTheDocument();
    expect(screen.getByText("PRODUCT DETAIL")).toBeInTheDocument();
    expect(screen.getByText("ORDER DATA")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Units" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("textbox", { name: "Number of units you want to sell" })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "Sell all units" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Amount" }));
    expect(screen.getByRole("button", { name: "Amount" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("textbox", { name: "Amount you want to receive" })).toBeInTheDocument();
    expect(screen.getByText(/final amount may be higher or lower/i)).toBeInTheDocument();
  });

  it("blocks a units order above the position owned", () => {
    renderFlow();

    fireEvent.change(screen.getByRole("textbox", { name: "Number of units you want to sell" }), {
      target: { value: "10.01" },
    });

    expect(screen.getByText("You can sell up to 10 PCS.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("shows the CTS maximum error when an amount is above the instrument limit", () => {
    renderFlow();
    fireEvent.click(screen.getByRole("button", { name: "Amount" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Amount you want to receive" }), {
      target: { value: "151" },
    });

    expect(screen.getByText("The amount exceeds the maximum allowed for this instrument. Enter a lower amount.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("keeps only units and explains generically when CTS does not allow amount selling", () => {
    renderFlow({
      id: "balanced-income",
      title: "UniCredit Balanced Income Fund",
      sellOrderMode: "units-only",
      sellAmountLimit: undefined,
    });

    expect(screen.getByRole("button", { name: "Units" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Amount" })).not.toBeInTheDocument();
    expect(
      screen.getByText("Selling by amount is not available for this instrument. You can still sell by units."),
    ).toBeInTheDocument();
  });

  it("completes a sell order through review, terms, Face ID and success", () => {
    vi.useFakeTimers();
    const { onComplete } = renderFlow();
    fireEvent.change(screen.getByRole("textbox", { name: "Number of units you want to sell" }), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getAllByText("Review Data")).not.toHaveLength(0);
    expect(screen.getByText("One off SELL")).toBeInTheDocument();
    expect(screen.getByText("2 PCS")).toBeInTheDocument();
    const sellButton = screen.getByRole("button", { name: "Sell" });
    expect(sellButton).toBeDisabled();
    fireEvent.click(screen.getByRole("switch", { name: "Accept terms and conditions" }));
    fireEvent.click(sellButton);

    expect(screen.getAllByRole("heading", { name: "Sign order" })).not.toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Sign order" }));
    expect(document.querySelector('[data-face-id-authenticating="true"]')).not.toBeNull();
    act(() => vi.advanceTimersByTime(840));
    expect(screen.getByRole("heading", { name: "Order accepted" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back to investments" }));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it.each<CountryId>(["RO", "CZ", "SK", "HU", "RS", "BA", "BA_BL", "SI"])(
    "uses the shared Sell implementation for %s",
    (country) => {
      renderFlow({}, country);
      expect(screen.getByRole("button", { name: "Units" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Amount" })).toBeInTheDocument();
    },
  );
});
