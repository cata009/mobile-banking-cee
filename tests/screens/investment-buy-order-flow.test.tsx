// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import InvestmentBuyOrderFlow from "@/app/screens/investments/InvestmentBuyOrderFlow";
import { InvestmentSecurityDetailScreen } from "@/app/screens/investments/InvestmentSecurityScreens";
import type { InvestmentCatalogSecurity } from "@/app/config/investmentsPortfolioConfig";
import type { CurrentAccount } from "@/data/products";

const security: InvestmentCatalogSecurity = {
  id: "security-1",
  title: "Amundi Global Equity",
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
  owned: false,
  productId: "LU1234567890",
  inceptionDate: "01.01.2020",
  lastUpdate: "19.07.2026",
  description: "Global equity fund",
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
  {
    id: "account-2",
    type: "current_account",
    name: "Daily account",
    accountNumber: "RO49AAAA1B31007593840001",
    balance: 5_000,
    currency: "RON",
  },
];

beforeAll(() => {
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});

afterAll(() => vi.unstubAllGlobals());
afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe("InvestmentBuyOrderFlow", () => {
  it("starts directly on Review Data with a validated draft collected by chat", () => {
    render(
      <InvestmentBuyOrderFlow
        security={security}
        accounts={accounts}
        country="RO"
        amountsHidden={false}
        initialDraft={{
          quantity: 4,
          accountId: "account-2",
          frequency: "one-off",
          executionTiming: "next-business-day",
        }}
        onBack={() => undefined}
        onComplete={() => undefined}
      />,
    );

    expect(screen.getAllByText("Review Data")).not.toHaveLength(0);
    expect(screen.getByText("4 PCS")).toBeInTheDocument();
    expect(screen.getByText(/Daily account/)).toBeInTheDocument();
    expect(screen.getByText("Next business day")).toBeInTheDocument();
    expect(screen.getByText("100,00 EUR")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buy" })).toBeDisabled();
  });

  it("completes a one-off buy order from order data to success", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();

    render(
      <InvestmentBuyOrderFlow
        security={security}
        accounts={accounts}
        country="RO"
        amountsHidden={false}
        onBack={() => undefined}
        onComplete={onComplete}
      />,
    );

    expect(screen.getAllByText("One off BUY Order")).not.toHaveLength(0);
    fireEvent.change(screen.getByRole("textbox", { name: "Quantity" }), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getAllByText("Review Data")).not.toHaveLength(0);
    expect(screen.getByText("100,00 EUR")).toBeInTheDocument();
    const buyButton = screen.getByRole("button", { name: "Buy" });
    expect(buyButton).toBeDisabled();
    fireEvent.click(screen.getByRole("switch", { name: "Accept terms and conditions" }));
    fireEvent.click(buyButton);

    expect(screen.getAllByRole("heading", { name: "Sign order" })).not.toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Sign order" }));
    expect(document.querySelector('[data-face-id-authenticating="true"]')).not.toBeNull();
    expect(screen.queryByRole("heading", { name: "Order accepted" })).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(840));
    expect(screen.getByRole("heading", { name: "Order accepted" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back to investments" }));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("validates quantity and available balance before review", () => {
    render(
      <InvestmentBuyOrderFlow
        security={security}
        accounts={[{ ...accounts[0]!, balance: 10 }]}
        country="RO"
        amountsHidden={false}
        onBack={() => undefined}
        onComplete={() => undefined}
      />,
    );

    const nextButton = screen.getByRole("button", { name: "Next" });
    fireEvent.change(screen.getByRole("textbox", { name: "Quantity" }), { target: { value: "0" } });
    expect(screen.getByText("Enter a positive whole number.")).toBeInTheDocument();
    expect(nextButton).toBeDisabled();

    fireEvent.change(screen.getByRole("textbox", { name: "Quantity" }), { target: { value: "1" } });
    expect(screen.getByText(/Insufficient balance/)).toBeInTheDocument();
    expect(nextButton).toBeDisabled();
  });

  it("allows changing the cash account", () => {
    render(
      <InvestmentBuyOrderFlow
        security={security}
        accounts={accounts}
        country="RO"
        amountsHidden={false}
        onBack={() => undefined}
        onComplete={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole("textbox", { name: /Cash account, Main account/ }));
    expect(screen.getByRole("dialog", { name: "Select cash account" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Daily account/ }));
    expect(screen.getByRole("textbox", { name: /Cash account, Daily account/ })).toBeInTheDocument();
  });

  it("maps product details and order data to the established investment and DS field components", () => {
    render(
      <InvestmentBuyOrderFlow
        security={security}
        accounts={accounts}
        country="RO"
        amountsHidden={false}
        onBack={() => undefined}
        onComplete={() => undefined}
      />,
    );

    expect(screen.getByText(security.productId).closest('[data-investment-detail-field="Product ID"]')).not.toBeNull();
    expect(screen.getByText(security.productType).closest('[data-investment-detail-field="Product type"]')).not.toBeNull();
    expect(screen.getByText(security.assetClass).closest('[data-investment-detail-field="Asset class"]')).not.toBeNull();

    expect(screen.getByRole("textbox", { name: "Security account" })).toHaveAttribute("readonly");
    expect(screen.getByRole("textbox", { name: /Cash account, Main account/ }).closest('[data-component="TextField"]')).not.toBeNull();
    expect(screen.getByRole("textbox", { name: "Quantity" })).toHaveAttribute("inputmode", "numeric");
    expect(screen.getByText("Minimum 1 PCS")).toBeInTheDocument();
  });

  it("handles the no-account state", () => {
    render(
      <InvestmentBuyOrderFlow
        security={security}
        accounts={[]}
        country="RO"
        amountsHidden={false}
        onBack={() => undefined}
        onComplete={() => undefined}
      />,
    );

    expect(screen.getByText("No current account is available.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("moves backward through sign and review before leaving order data", () => {
    const onBack = vi.fn();

    render(
      <InvestmentBuyOrderFlow
        security={security}
        accounts={accounts}
        country="RO"
        amountsHidden={false}
        onBack={onBack}
        onComplete={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("switch", { name: "Accept terms and conditions" }));
    fireEvent.click(screen.getByRole("button", { name: "Buy" }));
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getAllByText("Review Data")).not.toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getAllByText("One off BUY Order")).not.toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});

describe("investment product detail", () => {
  it("starts the buy order flow from the Buy action", () => {
    const onBuy = vi.fn();

    render(
      <InvestmentSecurityDetailScreen
        security={security}
        country="RO"
        amountsHidden={false}
        onBack={() => undefined}
        onBuyClick={onBuy}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Buy" }));
    expect(onBuy).toHaveBeenCalledOnce();
  });

  it("starts the sell order flow from the Sell action", () => {
    const onSell = vi.fn();

    render(
      <InvestmentSecurityDetailScreen
        security={{ ...security, owned: true, quantity: 10 }}
        country="RO"
        amountsHidden={false}
        onBack={() => undefined}
        onSellClick={onSell}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sell" }));
    expect(onSell).toHaveBeenCalledOnce();
  });

  it("shows Sell only for an active portfolio position with positive quantity", () => {
    const { rerender } = render(
      <InvestmentSecurityDetailScreen
        security={{ ...security, owned: true, quantity: 2 }}
        country="RO"
        amountsHidden={false}
        onBack={() => undefined}
      />,
    );

    expect(screen.getByRole("button", { name: "Sell" })).toBeInTheDocument();

    rerender(
      <InvestmentSecurityDetailScreen
        security={{ ...security, owned: true, quantity: 0 }}
        country="RO"
        amountsHidden={false}
        onBack={() => undefined}
      />,
    );

    expect(screen.queryByRole("button", { name: "Sell" })).not.toBeInTheDocument();

    rerender(
      <InvestmentSecurityDetailScreen
        security={{ ...security, owned: true, quantity: 2, status: "inactive" }}
        country="RO"
        amountsHidden={false}
        onBack={() => undefined}
      />,
    );

    expect(screen.queryByRole("button", { name: "Sell" })).not.toBeInTheDocument();
  });

  it("keeps the hidden Sell slot so the remaining actions stay in position", () => {
    const { container } = render(
      <InvestmentSecurityDetailScreen
        security={{ ...security, owned: false, quantity: 0 }}
        country="RO"
        amountsHidden={false}
        onBack={() => undefined}
      />,
    );

    const actionBar = container.querySelector('[data-ds-label="AccountActionBar"]');
    expect(actionBar).toHaveAttribute("data-action-count", "4");
    expect(actionBar?.children).toHaveLength(4);
    expect(actionBar?.children[2]).toHaveAttribute("aria-hidden", "true");
    expect(actionBar?.children[3]).toHaveAccessibleName("Buy");
  });
});
