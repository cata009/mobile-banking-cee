// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/app/contexts/LanguageContext";
import InvestmentsPortfolioScreen from "@/app/screens/investments/InvestmentsPortfolioScreen";
import { DemoProvider } from "@/app/state/demoStore";

function AppProviders({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: "CZ", product: "PI" }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  );
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    unobserve() {}
    disconnect() {}
  });
});

afterEach(cleanup);

describe("investment product chat context handoff", () => {
  it("publishes the selected security and clears it when returning to the portfolio", () => {
    const onSelectedSecurityChange = vi.fn();

    render(
      <InvestmentsPortfolioScreen
        onBack={() => undefined}
        onSelectedSecurityChange={onSelectedSecurityChange}
      />,
      { wrapper: AppProviders },
    );

    const productButton = screen.getByText("UniCredit Balanced Income Fund").closest("button");
    expect(productButton).not.toBeNull();
    fireEvent.click(productButton!);

    expect(onSelectedSecurityChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: "balanced-income", title: "UniCredit Balanced Income Fund", owned: true }),
    );

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onSelectedSecurityChange).toHaveBeenLastCalledWith(null);
  });

  it("opens the buy order for the exact held security requested by chat", async () => {
    const onBuyRequestConsumed = vi.fn();

    render(
      <InvestmentsPortfolioScreen
        onBack={() => undefined}
        buyRequest={{ requestId: 1, securityId: "balanced-income" }}
        onBuyRequestConsumed={onBuyRequestConsumed}
      />,
      { wrapper: AppProviders },
    );

    expect(await screen.findAllByText("One off BUY Order")).toHaveLength(2);
    expect(screen.getByText("UniCredit Balanced Income Fund")).toBeInTheDocument();
    expect(onBuyRequestConsumed).toHaveBeenCalledWith(1);
  });

  it("opens Review Data with the exact complete draft collected by chat", async () => {
    render(
      <InvestmentsPortfolioScreen
        onBack={() => undefined}
        buyRequest={{
          requestId: 11,
          securityId: "balanced-income",
          draft: {
            quantity: 2,
            accountId: "acc-2",
            frequency: "one-off",
            executionTiming: "next-business-day",
          },
        }}
      />,
      { wrapper: AppProviders },
    );

    expect(await screen.findAllByText("Review Data")).toHaveLength(2);
    expect(screen.getByText("UniCredit Balanced Income Fund")).toBeInTheDocument();
    expect(screen.getByText("2 PCS")).toBeInTheDocument();
    expect(screen.getByText(/Primary Account 2/)).toBeInTheDocument();
    expect(screen.getByText("Next business day")).toBeInTheDocument();
  });

  it("falls back to Order Data when a chat draft names an invalid cash account", async () => {
    render(
      <InvestmentsPortfolioScreen
        onBack={() => undefined}
        buyRequest={{
          requestId: 12,
          securityId: "balanced-income",
          draft: {
            quantity: 2,
            accountId: "missing-account",
            frequency: "one-off",
            executionTiming: "today",
          },
        }}
      />,
      { wrapper: AppProviders },
    );

    expect(await screen.findAllByText("One off BUY Order")).toHaveLength(2);
    expect(screen.queryByText("Review Data")).not.toBeInTheDocument();
  });

  it("opens the buy order for an exact catalogue security that is not yet held", async () => {
    render(
      <InvestmentsPortfolioScreen
        onBack={() => undefined}
        buyRequest={{ requestId: 2, securityId: "catalog-climate-focus" }}
      />,
      { wrapper: AppProviders },
    );

    expect(await screen.findAllByText("One off BUY Order")).toHaveLength(2);
    expect(screen.getByText("onemarkets Climate Focus Fund")).toBeInTheDocument();
  });

  it("navigates from the portfolio banner through a fund collection to the existing fund detail", () => {
    render(<InvestmentsPortfolioScreen onBack={() => undefined} />, { wrapper: AppProviders });

    fireEvent.click(screen.getByRole("button", { name: /Find out the best fund for you/i }));
    expect(screen.getByTestId("investment-funds-selection")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Our Onemarket funds/i }));
    expect(screen.getByTestId("investment-fund-collection-onemarket")).toBeInTheDocument();

    const firstFund = screen.getByRole("button", { name: /onemarkets Climate Focus Fund/i });
    fireEvent.click(firstFund);
    expect(screen.getAllByRole("heading", { name: "onemarkets Climate Focus Fund" })).not.toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByTestId("investment-fund-collection-onemarket")).toBeInTheDocument();
  });

  it("opens the matching fund collection when the chatbot goal hands off to Investments", async () => {
    render(
      <InvestmentsPortfolioScreen
        onBack={() => undefined}
        fundsWindowRequest={{ requestId: 7, collectionId: "balanced" }}
      />,
      { wrapper: AppProviders },
    );

    expect(await screen.findByTestId("investment-fund-collection-balanced")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: "Balanced funds" })).not.toHaveLength(0);
    expect(screen.queryByTestId("investment-funds-selection")).not.toBeInTheDocument();
  });

  it("consumes an unknown or repeated buy request without opening the wrong product", async () => {
    const onBuyRequestConsumed = vi.fn();
    const { rerender } = render(
      <InvestmentsPortfolioScreen
        onBack={() => undefined}
        buyRequest={{ requestId: 3, securityId: "missing-security" }}
        onBuyRequestConsumed={onBuyRequestConsumed}
      />,
      { wrapper: AppProviders },
    );

    expect(await screen.findAllByRole("heading", { name: "Investment" })).toHaveLength(2);
    expect(screen.queryAllByText("One off BUY Order")).toHaveLength(0);
    expect(onBuyRequestConsumed).toHaveBeenCalledTimes(1);

    rerender(
      <InvestmentsPortfolioScreen
        onBack={() => undefined}
        buyRequest={{ requestId: 3, securityId: "balanced-income" }}
        onBuyRequestConsumed={onBuyRequestConsumed}
      />,
    );

    expect(screen.queryAllByText("One off BUY Order")).toHaveLength(0);
    expect(onBuyRequestConsumed).toHaveBeenCalledTimes(1);
  });
});
