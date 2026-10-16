// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/app/App";
import { asyncNativeReady, resetNativeWebRendererDiagnostics } from "../helpers/nativeWebRenderer";

vi.mock("@/app/components/demo/nativeDemoLoader", async () => {
  const renderer = await import("../helpers/nativeWebRenderer");
  return { loadNativeDemoModule: renderer.loadNativeDemoModuleForWebTest };
});

const FUTURE_GAIN_INVESTMENTS_URL =
  "/?product=PI&country=RS&scenario=active&ds=current&release=release-future-rs-future-gain" +
  "&bank=retail-multi-account-card&theme=light&lang=en&screen=investments" +
  "&count_accounts=1&count_debit_cards=0&count_credit_cards=1&count_meal_cards=0" +
  "&count_deposits=0&count_savings=0&count_loans=0&count_mortgages=0&count_investments=1";

async function renderAt(url: string) {
  window.history.replaceState({}, "", url);
  const view = render(<App />);
  await asyncNativeReady(view.container);
  return view;
}

beforeEach(() => {
  resetNativeWebRendererDiagnostics();
  vi.stubGlobal(
    "ResizeObserver",
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  resetNativeWebRendererDiagnostics();
  vi.unstubAllGlobals();
  window.history.replaceState({}, "", "/");
});

describe("RS Future Gain investment destination", () => {
  it("opens the current portfolio and investment options without the retired peer card", async () => {
    const { container } = await renderAt(FUTURE_GAIN_INVESTMENTS_URL);

    const nativeText = container.querySelector('[data-native-current-host]')?.textContent?.replace(/\s+/g, ' ') ?? '';
    expect(nativeText).toContain('Total value:');
    expect(screen.queryByText("15 of 24 clients like you use Overdraft")).not.toBeInTheDocument();
    expect(screen.queryByText("See all recommendations")).not.toBeInTheDocument();
    // The retired Source data-ds-label was structural; peer copy absence is asserted above.
    expect(screen.getByRole("tab", { name: "PERFORMANCE" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "PRODUCT TYPE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Invest" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Invest" }));

    expect((await screen.findAllByRole('heading', { name: 'List of securities' })).length).toBeGreaterThan(0);
    expect(document.querySelectorAll('[data-testid^="baseline-investment-catalog-row-"]').length).toBeGreaterThan(0);
  });
});
