// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "@/app/App";

const MY_BANKER_INVESTMENTS_URL =
  "/?product=PI&country=RS&scenario=active&ds=current&release=release-future-rs-my-banker" +
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

describe("RS My Banker investment destination", () => {
  it("keeps My Banker above the current portfolio and investment options", async () => {
    renderAt(MY_BANKER_INVESTMENTS_URL);

    expect(await screen.findByText("15 of 24 clients like you use Overdraft")).toBeInTheDocument();
    expect(screen.getByText("See all recommendations")).toBeInTheDocument();
    expect(screen.getByText("Investment Options")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Term deposit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Investment funds" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stocks" })).toBeInTheDocument();
    expect(screen.queryByText("PERFORMANCE")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Stocks" }));

    expect(document.querySelector('[data-investment-security-list="true"]')).toBeInTheDocument();
  });
});
