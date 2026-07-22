// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { InvestmentCatalogSecurity } from "@/app/config/investmentsPortfolioConfig";
import { InvestmentSecurityListScreen } from "@/app/screens/investments/InvestmentSecurityScreens";

const securities: InvestmentCatalogSecurity[] = [
  {
    id: "one-off-fund",
    title: "One-off Climate Fund",
    sourceProductName: "Investment catalogue",
    status: "active",
    contributionType: "ONE OFF",
    value: 42.68,
    currency: "EUR",
    instrumentCurrency: "EUR",
    localValue: 1_100,
    localCurrency: "CZK",
    securityAccountId: "catalog-eur",
    securityAccountName: "Available funds",
    securityAccountCurrency: "EUR",
    productType: "Fund",
    assetClass: "Equity",
    marketPrice: 42.68,
    quantity: 0,
    performanceAmount: 20,
    performancePercent: 2.21,
    logoId: "unicredit",
    owned: false,
    productId: "CZONEOFF1",
    inceptionDate: "19.07.2020",
    lastUpdate: "21.07.2026",
    description: "One-off fund",
  },
  {
    id: "regular-fund",
    title: "Regular Sustainable Fund",
    sourceProductName: "Investment catalogue",
    status: "active",
    contributionType: "RECURRENT",
    value: 35.27,
    currency: "EUR",
    instrumentCurrency: "EUR",
    localValue: 900,
    localCurrency: "CZK",
    securityAccountId: "catalog-eur",
    securityAccountName: "Available funds",
    securityAccountCurrency: "EUR",
    productType: "Fund",
    assetClass: "Balanced",
    marketPrice: 35.27,
    quantity: 0,
    performanceAmount: 15,
    performancePercent: 1.8,
    logoId: "unicredit",
    owned: false,
    productId: "CZREGULAR1",
    inceptionDate: "20.07.2021",
    lastUpdate: "21.07.2026",
    description: "Regular fund",
  },
];

afterEach(cleanup);

function renderCatalogue(country: "CZ" | "RO" = "CZ") {
  render(
    <InvestmentSecurityListScreen
      securities={securities}
      country={country}
      amountsHidden={false}
      onBack={vi.fn()}
      onSelect={vi.fn()}
    />,
  );
}

describe("CZ Basket Funds catalogue", () => {
  it("adds the Figma basket carousel only to the CZ catalogue", () => {
    const { rerender } = render(
      <InvestmentSecurityListScreen
        securities={securities}
        country="CZ"
        amountsHidden={false}
        onBack={vi.fn()}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getAllByText("Buy securities")).not.toHaveLength(0);
    expect(screen.getByRole("tab", { name: "All products" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Regular Plan" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Basket funds carousel" })).toBeInTheDocument();
    expect(screen.getByText("BASKET FUNDS")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "See all basket funds" })).toBeInTheDocument();

    rerender(
      <InvestmentSecurityListScreen
        securities={securities}
        country="RO"
        amountsHidden={false}
        onBack={vi.fn()}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getAllByText("List of securities")).not.toHaveLength(0);
    expect(screen.queryByRole("tab", { name: "All products" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Basket funds carousel" })).not.toBeInTheDocument();
  });

  it("filters CZ securities and carousel content for Regular Plan", () => {
    renderCatalogue();

    fireEvent.click(screen.getByRole("tab", { name: "Regular Plan" }));

    expect(screen.queryByText("One-off Climate Fund")).not.toBeInTheDocument();
    expect(screen.getByText("Regular Sustainable Fund")).toBeInTheDocument();
    const carousel = screen.getByRole("region", { name: "Basket funds carousel" });
    expect(within(carousel).getByRole("button", { name: /onemarkets Chase Regular EUR/i })).toBeInTheDocument();
    expect(within(carousel).queryByRole("button", { name: /Global growth Basket/i })).not.toBeInTheDocument();
  });

  it("opens the grouped Basket Funds page and expands each group independently", () => {
    renderCatalogue();

    fireEvent.click(screen.getByRole("button", { name: "See all basket funds" }));

    expect(screen.getAllByText("Basket Funds")).not.toHaveLength(0);
    expect(screen.getByText(/diversified portfolios that combine multiple investment funds/i)).toBeInTheDocument();
    const oneOff = screen.getByRole("region", { name: /one off investment baskets/i });
    const regular = screen.getByRole("region", { name: /regular investment baskets/i });
    expect(within(oneOff).getByText("6")).toBeInTheDocument();
    expect(within(regular).getByText("14")).toBeInTheDocument();
    expect(oneOff.querySelectorAll("[data-basket-fund-row]")).toHaveLength(4);
    expect(regular.querySelectorAll("[data-basket-fund-row]")).toHaveLength(4);

    fireEvent.click(within(oneOff).getByRole("button", { name: "See more one off investment baskets" }));
    expect(oneOff.querySelectorAll("[data-basket-fund-row]")).toHaveLength(6);
    expect(regular.querySelectorAll("[data-basket-fund-row]")).toHaveLength(4);
    expect(within(oneOff).getByRole("button", { name: "See less one off investment baskets" })).toBeInTheDocument();
  });

  it("preserves the selected catalogue tab after returning from Basket Funds", () => {
    renderCatalogue();
    fireEvent.click(screen.getByRole("tab", { name: "Regular Plan" }));
    fireEvent.click(screen.getByRole("button", { name: /onemarkets Chase Regular EUR/i }));

    expect(screen.getAllByText("Basket Funds")).not.toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByRole("tab", { name: "Regular Plan" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Regular Sustainable Fund")).toBeInTheDocument();
  });
});
