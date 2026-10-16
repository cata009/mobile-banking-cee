// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/app/contexts/LanguageContext";
import InvestmentsPortfolioScreen from "@/app/screens/investments/InvestmentsPortfolioScreen";
import { DemoProvider } from "@/app/state/demoStore";
import {
  asyncNativeReady,
  resetNativeWebRendererDiagnostics,
} from "../helpers/nativeWebRenderer";

vi.mock("@/app/components/demo/nativeDemoLoader", async () => {
  const renderer = await import("../helpers/nativeWebRenderer");
  return { loadNativeDemoModule: renderer.loadNativeDemoModuleForWebTest };
});

function AppProviders({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: "CZ", product: "PI" }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  );
}

function containsText(value: string) {
  return (_content: string, element: Element | null) =>
    element?.textContent?.replace(/\s+/g, " ").includes(value) ?? false;
}

beforeEach(() => {
  resetNativeWebRendererDiagnostics();
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

afterEach(() => {
  cleanup();
  resetNativeWebRendererDiagnostics();
  vi.unstubAllGlobals();
});

async function renderNative(ui: ReactElement) {
  const view = render(ui, { wrapper: AppProviders });
  await asyncNativeReady(view.container);
  return view;
}

describe("investment product chat context handoff", () => {
  it("keeps the Robo Advisor entry out of the baseline Investments portfolio", async () => {
    await renderNative(<InvestmentsPortfolioScreen onBack={() => undefined} />);

    expect(screen.queryByRole("button", { name: "Create investment goal" })).not.toBeInTheDocument();
  });

  it("keeps the redundant Robo Advisor promo out of the Future CZ Investments portfolio", async () => {
    await renderNative(
      <InvestmentsPortfolioScreen
        onBack={() => undefined}
        roboAdvisorEnabled
      />,
    );

    expect(screen.queryByText("Investment goals")).not.toBeInTheDocument();
    expect(screen.queryByText("Invest towards what matters")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Open investment goals" })).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "PERFORMANCE" })).toBeInTheDocument();
  });

  it("opens the orders-to-approve entry from the Investments action bar", async () => {
    const onOrdersToApproveClick = vi.fn();

    await renderNative(
      <InvestmentsPortfolioScreen
        onBack={() => undefined}
        onOrdersToApproveClick={onOrdersToApproveClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "To approve" }));

    await waitFor(() => expect(onOrdersToApproveClick).toHaveBeenCalledOnce());
  });

  it("publishes the selected security and clears it when returning to the portfolio", async () => {
    const onSelectedSecurityChange = vi.fn();

    await renderNative(
      <InvestmentsPortfolioScreen
        onBack={() => undefined}
        onSelectedSecurityChange={onSelectedSecurityChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "UniCredit Balanced Income Fund" }));

    await waitFor(() =>
      expect(onSelectedSecurityChange).toHaveBeenCalledWith(
        expect.objectContaining({ id: "balanced-income", title: "UniCredit Balanced Income Fund", owned: true }),
      ),
    );

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    await waitFor(() => expect(onSelectedSecurityChange).toHaveBeenLastCalledWith(null));
  });

  it("opens the Sell Order flow for an owned security", async () => {
    await renderNative(<InvestmentsPortfolioScreen onBack={() => undefined} />);

    fireEvent.click(screen.getByRole("button", { name: "UniCredit Balanced Income Fund" }));
    fireEvent.click(await screen.findByRole("button", { name: "Sell" }));

    expect((await screen.findAllByText(containsText("Sell Order"))).length).toBeGreaterThan(0);
  });

  it("opens the buy order for the exact held security requested by chat", async () => {
    const onBuyRequestConsumed = vi.fn();

    await renderNative(
      <InvestmentsPortfolioScreen
        onBack={() => undefined}
        buyRequest={{ requestId: 1, securityId: "balanced-income" }}
        onBuyRequestConsumed={onBuyRequestConsumed}
      />,
    );

    expect((await screen.findAllByText("One off BUY Order")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("UniCredit Balanced Income Fund").length).toBeGreaterThan(0);
    expect(onBuyRequestConsumed).toHaveBeenCalledWith(1);
  });

  it("opens Review Data with the exact complete draft collected by chat", async () => {
    await renderNative(
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
    );

    expect((await screen.findAllByText("Review Data")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("UniCredit Balanced Income Fund").length).toBeGreaterThan(0);
    expect(screen.getByText("2 PCS")).toBeInTheDocument();
    expect(screen.getByText(/Primary Account 2/)).toBeInTheDocument();
    expect(screen.getByText("Next business day")).toBeInTheDocument();
  });

  it("falls back to Order Data when a chat draft names an invalid cash account", async () => {
    await renderNative(
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
    );

    expect((await screen.findAllByText("One off BUY Order")).length).toBeGreaterThan(0);
    expect(screen.queryByText("Review Data")).not.toBeInTheDocument();
  });

  it("opens the buy order for an exact catalogue security that is not yet held", async () => {
    await renderNative(
      <InvestmentsPortfolioScreen
        onBack={() => undefined}
        buyRequest={{ requestId: 2, securityId: "catalog-climate-focus" }}
      />,
    );

    expect((await screen.findAllByText("One off BUY Order")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("onemarkets Climate Focus Fund").length).toBeGreaterThan(0);
  });

  it("navigates from a chat funds-window handoff through a collection to the existing detail", async () => {
    const { rerender, container } = await renderNative(
      <InvestmentsPortfolioScreen onBack={() => undefined} />,
    );
    expect(screen.queryByRole("button", { name: /Find out the best fund for you/i })).not.toBeInTheDocument();

    rerender(<InvestmentsPortfolioScreen onBack={() => undefined} fundsWindowRequest={{ requestId: 8 }} />);
    await asyncNativeReady(container);
    expect((await screen.findAllByText(containsText("Our funds selection"))).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /Our Onemarket funds/i }));
    expect(await screen.findByTestId("investment-fund-collection-onemarket")).toBeInTheDocument();

    const firstFund = screen.getByRole("button", { name: /onemarkets Climate Focus Fund/i });
    fireEvent.click(firstFund);
    expect((await screen.findAllByRole("heading", { name: "onemarkets Climate Focus Fund" })).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(await screen.findByTestId("investment-fund-collection-onemarket")).toBeInTheDocument();
    expect((await screen.findAllByRole("heading", { name: "Our Onemarket funds" })).length).toBeGreaterThan(0);
  });

  it("opens the matching fund collection when the chatbot goal hands off to Investments", async () => {
    await renderNative(
      <InvestmentsPortfolioScreen
        onBack={() => undefined}
        fundsWindowRequest={{ requestId: 7, collectionId: "balanced" }}
      />,
    );

    expect(await screen.findByTestId("investment-fund-collection-balanced")).toBeInTheDocument();
    expect((await screen.findAllByText("Balanced funds")).length).toBeGreaterThan(0);
    expect(screen.queryAllByText("Our funds selection")).toHaveLength(0);
  });

  it("consumes an unknown or repeated buy request without opening the wrong product", async () => {
    const onBuyRequestConsumed = vi.fn();
    const { rerender, container } = await renderNative(
      <InvestmentsPortfolioScreen
        onBack={() => undefined}
        buyRequest={{ requestId: 3, securityId: "missing-security" }}
        onBuyRequestConsumed={onBuyRequestConsumed}
      />,
    );

    expect((await screen.findAllByRole("heading", { name: "Investment" })).length).toBeGreaterThan(0);
    expect(screen.queryAllByText("One off BUY Order")).toHaveLength(0);
    expect(onBuyRequestConsumed).toHaveBeenCalledTimes(1);

    rerender(
      <InvestmentsPortfolioScreen
        onBack={() => undefined}
        buyRequest={{ requestId: 3, securityId: "balanced-income" }}
        onBuyRequestConsumed={onBuyRequestConsumed}
      />,
    );
    await asyncNativeReady(container);

    expect(screen.queryAllByText("One off BUY Order")).toHaveLength(0);
    expect(onBuyRequestConsumed).toHaveBeenCalledTimes(1);
  });
});
