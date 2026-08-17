// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/app/contexts/LanguageContext";
import AccountDetailScreen from "@/app/screens/accounts/AccountDetailScreen";
import AccountDetailsInfoScreen from "@/app/screens/accounts/AccountDetailsInfoScreen";
import { DemoProvider } from "@/app/state/demoStore";

function AppProviders({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: "RO", product: "PI" }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  );
}

function renderDetails(selectedProductId: string) {
  return render(
    <AccountDetailsInfoScreen
      selectedProductId={selectedProductId}
      onBack={() => undefined}
    />,
    { wrapper: AppProviders },
  );
}

function getDetailLabels(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>("[data-account-details-info-field]"))
    .map((field) => field.querySelector("p")?.textContent);
}

function getDetailValue(container: HTMLElement, label: string) {
  const field = Array.from(container.querySelectorAll<HTMLElement>("[data-account-details-info-field]"))
    .find((candidate) => candidate.querySelector("p")?.textContent === label);

  return field?.querySelectorAll("p")[1]?.textContent;
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(cleanup);

describe("AccountDetailsInfoScreen", () => {
  it("shows the shared dark confirmation toast when the account number is copied from account info", async () => {
    const { container } = renderDetails("acc-1");

    fireEvent.click(screen.getByRole("button", { name: "Copy account number" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Account number successfully copied");
    expect(container.querySelector("[data-copy-toast]")).toBeInTheDocument();
  });

  it("shows only account number, account title, and current balance for a saving account", () => {
    const { container } = renderDetails("sav-1");

    expect(screen.getAllByRole("heading", { name: "Account Details" })).not.toHaveLength(0);
    expect(getDetailLabels(container)).toEqual([
      "Account number",
      "Account title",
      "Current balance",
    ]);
    expect(getDetailValue(container, "Current balance")).toBe("3.235,40 RON");
    expect(screen.queryByText("Available funds")).not.toBeInTheDocument();
    expect(screen.queryByText("Blocked/reserved amount")).not.toBeInTheDocument();
    expect(screen.queryByText("Overdraft")).not.toBeInTheDocument();
    expect(screen.queryByText("Offer")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Show less" })).not.toBeInTheDocument();
    expect(screen.queryByText("Connected cards")).not.toBeInTheDocument();
  });

  it("keeps the extended details for a current account", () => {
    const { container } = renderDetails("acc-1");

    expect(getDetailLabels(container)).toEqual([
      "Account number",
      "Available funds",
      "Current balance",
      "Blocked/reserved amount",
      "Overdraft",
      "Account title",
      "Offer",
    ]);
    expect(screen.getByRole("button", { name: "Show less" })).toBeInTheDocument();
    expect(screen.getByText("Connected cards")).toBeInTheDocument();
  });

  it("shows the term-deposit detail fields in the supplied order", () => {
    const { container } = renderDetails("term-1");

    expect(getDetailLabels(container)).toEqual([
      "Maturity amount",
      "Interest amount before tax",
      "Maturity date",
      "Rollover",
      "Account title",
      "Account owner",
      "Deposit Amount",
      "Start/Value Date",
      "Maturity period",
      "Interest rate/year",
      "Current account number",
      "Decrease amount by",
      "Reinvest the interest",
    ]);
    expect(screen.queryByText("Available funds")).not.toBeInTheDocument();
    expect(screen.queryByText("Current balance")).not.toBeInTheDocument();
    expect(screen.queryByText("Blocked/reserved amount")).not.toBeInTheDocument();
    expect(screen.queryByText("Overdraft")).not.toBeInTheDocument();
    expect(screen.queryByText("Offer")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Show less" })).not.toBeInTheDocument();
    expect(screen.queryByText("Connected cards")).not.toBeInTheDocument();
  });

  it.each([
    ["loan-1", "PERSONAL LOAN", "9.706,21 RON", "16.177,02 RON", "291,19 RON"],
    ["mort-1", "MORTGAGE", "614.726,36 RON", "731.817,10 RON", "3.512,72 RON"],
  ])("shows the connected loan details in order for %s", (
    productId,
    accountTitle,
    ownedAmount,
    originalAmount,
    nextInstallment,
  ) => {
    const { container } = renderDetails(productId);

    expect(getDetailLabels(container)).toEqual([
      "Next installment",
      "Next installment date",
      "Interest rate",
      "Overdue amount",
      "Overdue interest rate",
      "Owned amount",
      "Original amount",
      "Account title",
      "IBAN",
      "Account owner",
      "Start date",
      "Final payment",
    ]);
    expect(getDetailValue(container, "Next installment")).toBe(nextInstallment);
    expect(getDetailValue(container, "Owned amount")).toBe(ownedAmount);
    expect(getDetailValue(container, "Original amount")).toBe(originalAmount);
    expect(getDetailValue(container, "Account title")).toBe(accountTitle);
    expect(screen.queryByText("Available funds")).not.toBeInTheDocument();
    expect(screen.queryByText("Connected cards")).not.toBeInTheDocument();
  });

  it("shows connected maturity and repayment progress on the product cards", () => {
    const { container } = render(
      <AccountDetailScreen
        selectedProductId="term-1"
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
      />,
      { wrapper: AppProviders },
    );

    expect(screen.getByText("Maturity date 20.09.2026")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Term deposit maturity progress" })).toHaveAttribute("aria-valuenow", "83");
    expect(screen.getByRole("progressbar", { name: "Personal loan repayment progress" })).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByRole("progressbar", { name: "Mortgage repayment progress" })).toHaveAttribute("aria-valuenow", "16");

    const personalLoanCard = container.querySelector('[data-account-product-id="loan-1"]');
    const mortgageCard = container.querySelector('[data-account-product-id="mort-1"]');
    expect(personalLoanCard).toHaveTextContent("Remaining loan amount9.706,21 RON");
    expect(personalLoanCard).toHaveTextContent("Next installment291,19 RON");
    expect(mortgageCard).toHaveTextContent("Remaining loan amount614.726,36 RON");
    expect(mortgageCard).toHaveTextContent("Next installment3.512,72 RON");
  });

  it("titles the account carousel My Products", () => {
    render(
      <AccountDetailScreen
        selectedProductId="sav-1"
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
      />,
      { wrapper: AppProviders },
    );

    expect(screen.getAllByRole("heading", { name: "My Products" })).not.toHaveLength(0);
    expect(screen.queryByRole("heading", { name: "Accounts" })).not.toBeInTheDocument();
  });

  it("shows the shared dark confirmation toast when the account number is copied from the product card", async () => {
    const { container } = render(
      <AccountDetailScreen
        selectedProductId="acc-1"
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
      />,
      { wrapper: AppProviders },
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Copy account number" })[0] as HTMLElement);

    expect(await screen.findByRole("status")).toHaveTextContent("Account number successfully copied");
    expect(container.querySelector("[data-copy-toast]")).toBeInTheDocument();
  });
});
