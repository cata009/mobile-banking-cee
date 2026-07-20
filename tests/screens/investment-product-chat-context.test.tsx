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
});
