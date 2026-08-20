// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/app/contexts/LanguageContext";
import { COUNTRIES } from "@/app/registry/demoConfig";
import OrdersToApproveScreen from "@/app/screens/investments/OrdersToApproveScreen";
import { DemoProvider } from "@/app/state/demoStore";

function AppProviders({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: "CZ", product: "PI" }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  );
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollTo", { configurable: true, value: vi.fn() });
});

afterEach(cleanup);

describe("OrdersToApproveScreen", () => {
  it("exposes every pending order as an accessible detail entry", () => {
    const { container } = render(<OrdersToApproveScreen onBack={() => undefined} />, { wrapper: AppProviders });

    expect(container.querySelectorAll("button[data-orders-to-approve-row]")).toHaveLength(5);
  });

  it("opens a selected order as read-only review data with Reject and Sign order actions", () => {
    render(<OrdersToApproveScreen onBack={() => undefined} />, { wrapper: AppProviders });

    fireEvent.click(screen.getAllByRole("button", { name: /Open BUY order/i })[0]!);

    expect(screen.getAllByRole("heading", { name: "Review Data" })).not.toHaveLength(0);
    expect(screen.getByText("ORDER SUMMARY")).toBeInTheDocument();
    expect(screen.getByText("Product ID")).toBeInTheDocument();
    expect(screen.getByText("Market price")).toBeInTheDocument();
    expect(screen.getByText("DOCUMENTS AND TERMS")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign order" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save order" })).not.toBeInTheDocument();
  });

  it.each(COUNTRIES)("opens a populated read-only order detail for %s", (country) => {
    render(
      <DemoProvider initialState={{ country, product: "PI" }}>
        <LanguageProvider initialLanguage="en">
          <OrdersToApproveScreen onBack={() => undefined} />
        </LanguageProvider>
      </DemoProvider>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: /Open BUY order/i })[0]!);

    expect(screen.getAllByRole("heading", { name: "Review Data" })).not.toHaveLength(0);
    expect(screen.getByText("Product ID")).toBeInTheDocument();
    expect(screen.getByText("Cash account")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign order" })).toBeInTheDocument();
  });
});
