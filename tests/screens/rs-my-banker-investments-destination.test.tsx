// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/app/App";

const FUTURE_GAIN_INVESTMENTS_URL =
  "/?product=PI&country=RS&scenario=active&ds=current&release=release-future-rs-future-gain" +
  "&bank=retail-multi-account-card&theme=light&lang=en&screen=investments" +
  "&count_accounts=1&count_debit_cards=0&count_credit_cards=1&count_meal_cards=0" +
  "&count_deposits=0&count_savings=0&count_loans=0&count_mortgages=0&count_investments=1";

function renderAt(url: string) {
  window.history.replaceState({}, "", url);
  return render(<App />);
}

beforeEach(() => {
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
  vi.unstubAllGlobals();
  window.history.replaceState({}, "", "/");
});

describe("RS Future Gain investment destination", () => {
  it("opens the current portfolio and investment options without the retired peer card", async () => {
    renderAt(FUTURE_GAIN_INVESTMENTS_URL);

    expect(await screen.findByText("Total value:")).toBeInTheDocument();
    expect(screen.queryByText("15 of 24 clients like you use Overdraft")).not.toBeInTheDocument();
    expect(screen.queryByText("See all recommendations")).not.toBeInTheDocument();
    expect(document.querySelector('[data-ds-label="My Banker entry card"]')).not.toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "PERFORMANCE" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "PRODUCT TYPE" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Invest" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Invest" }));

    expect(document.querySelector('[data-investment-security-list="true"]')).toBeInTheDocument();
    expect(document.querySelectorAll("[data-investment-security-row]").length).toBeGreaterThan(0);
  });
});
