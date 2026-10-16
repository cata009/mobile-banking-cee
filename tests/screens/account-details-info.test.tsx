// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/app/contexts/LanguageContext";
import AccountDetailScreen from "@/app/screens/accounts/AccountDetailScreen";
import AccountDetailsInfoScreen from "@/app/screens/accounts/AccountDetailsInfoScreen";
import { DEFAULT_PRODUCT_COUNTS, DemoProvider } from "@/app/state/demoStore";
import { resolveAccountBalanceCard } from "@/app/components/contracts/accountBalanceCard";
import { getLoanDetails, getTermDepositDetails } from "@/data/accountProductDetails";
import { deriveProductCategories } from "@/features/products/selectors";
import {
  asyncNativeReady,
  resetNativeWebRendererDiagnostics,
} from "../helpers/nativeWebRenderer";

vi.mock("@/app/components/demo/nativeDemoLoader", async () => {
  const { loadNativeDemoModuleForWebTest } = await import("../helpers/nativeWebRenderer");
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest };
});

function AppProviders({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: "RO", product: "PI", release: "release-current" }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  );
}

function renderDetails(selectedProductId: string, onBack = vi.fn()) {
  const result = render(
    <AccountDetailsInfoScreen selectedProductId={selectedProductId} onBack={onBack} />,
    { wrapper: AppProviders },
  );
  return { ...result, onBack };
}

async function waitForNativeScreen(container: HTMLElement) {
  await asyncNativeReady(container);
  await waitFor(() => {
    expect(container.querySelector('[data-testid="ro-account-info-page"]')).toBeInTheDocument();
  }, { timeout: 5000 });
}

function accountInfoText(container: HTMLElement) {
  const page = container.querySelector<HTMLElement>('[data-testid="ro-account-info-page"]');
  expect(page).toBeInTheDocument();
  return page?.textContent?.toLocaleLowerCase("en") ?? "";
}

function expectFieldOrder(container: HTMLElement, labels: readonly string[]) {
  const text = accountInfoText(container);
  let cursor = -1;

  for (const label of labels) {
    const index = text.indexOf(label.toLocaleLowerCase("en"), cursor + 1);
    expect(index, `expected “${label}” after the preceding Native field`).toBeGreaterThan(cursor);
    cursor = index;
  }
}

beforeEach(() => resetNativeWebRendererDiagnostics());

afterEach(() => {
  cleanup();
  resetNativeWebRendererDiagnostics();
});

describe("Native account information in the Web host", () => {
  it("copies an account number and shows the confirmation toast", async () => {
    const { container } = renderDetails("acc-1");
    await waitForNativeScreen(container);

    fireEvent.click(screen.getByRole("button", { name: "Copy account number" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Account number successfully copied");
  });

  it("shows only account number, account title, and current balance for a saving account", async () => {
    const { container } = renderDetails("sav-1");
    await waitForNativeScreen(container);

    expect(screen.getAllByRole("heading", { name: "Account Details" })).not.toHaveLength(0);
    expectFieldOrder(container, ["Account number", "Account title", "Current balance"]);
    expect(accountInfoText(container)).toContain("3.235,40 ron");
    expect(screen.queryByText(/Available funds/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Blocked\/reserved amount/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Overdraft/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Connected cards/i)).not.toBeInTheDocument();
  });

  it("keeps the extended fields and connected card for a current account", async () => {
    const { container } = renderDetails("acc-1");
    await waitForNativeScreen(container);

    expectFieldOrder(container, [
      "Account number",
      "Available funds",
      "Current balance",
      "Blocked/reserved amount",
      "Overdraft",
      "Account title",
      "Offer",
    ]);
    expect(screen.getByRole("button", { name: /Show less/i })).toBeInTheDocument();
    expect(screen.getByText(/Connected cards/i)).toBeInTheDocument();
  });

  it("shows term-deposit fields in the supplied order without current-account fields", async () => {
    const { container } = renderDetails("term-1");
    await waitForNativeScreen(container);

    expectFieldOrder(container, [
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
    expect(screen.queryByText(/Available funds/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Current balance/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Blocked\/reserved amount/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Overdraft/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Connected cards/i)).not.toBeInTheDocument();
  });

  it.each([
    ["loan-1", "PERSONAL LOAN", "9.706,21 RON", "16.177,02 RON", "291,19 RON"],
    ["mort-1", "MORTGAGE", "614.726,36 RON", "731.817,10 RON", "3.512,72 RON"],
  ])("shows connected loan details in order for %s", async (
    productId,
    accountTitle,
    ownedAmount,
    originalAmount,
    nextInstallment,
  ) => {
    const { container } = renderDetails(productId);
    await waitForNativeScreen(container);

    expectFieldOrder(container, [
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
    expect(accountInfoText(container)).toContain(nextInstallment.toLocaleLowerCase("en"));
    expect(accountInfoText(container)).toContain(ownedAmount.toLocaleLowerCase("en"));
    expect(accountInfoText(container)).toContain(originalAmount.toLocaleLowerCase("en"));
    expect(accountInfoText(container)).toContain(accountTitle.toLocaleLowerCase("en"));
    expect(screen.queryByText(/Available funds/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Connected cards/i)).not.toBeInTheDocument();
  });

  it("keeps the Source progress fractions on the Native product cards", async () => {
    const { container } = render(
      <AccountDetailScreen
        selectedProductId="term-1"
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
      />,
      { wrapper: AppProviders },
    );
    await asyncNativeReady(container);
    await waitFor(() => {
      expect(screen.getByText("Maturity date 20.09.2026")).toBeInTheDocument();
    }, { timeout: 5000 });

    const sourceProducts = deriveProductCategories({
      country: "RO",
      release: "release-current",
      resolvedProductCounts: DEFAULT_PRODUCT_COUNTS,
    }).flatMap(category => category.products);
    const termDeposit = sourceProducts.find(product => product.type === "term_deposit");
    const loan = sourceProducts.find(product => product.type === "loan");
    const mortgage = sourceProducts.find(product => product.type === "mortgage");
    if (!termDeposit || termDeposit.type !== "term_deposit" || !loan || loan.type !== "loan" || !mortgage || mortgage.type !== "mortgage") {
      throw new Error("Expected Source deposit and repayment fixtures");
    }
    const sourceWidth = (fraction: number) =>
      `${(resolveAccountBalanceCard({ progress: fraction }).progressFraction ?? 0) * 100}%`;
    const sourceAriaPercent = (fraction: number) =>
      String(resolveAccountBalanceCard({ progress: fraction }).progressPercent);
    // Source rounds the ARIA percent, but keeps the exact fraction for the bar fill.
    const sourceProgress = [
      ["Term deposit maturity progress", getTermDepositDetails(termDeposit, "").progress, "83"],
      ["Personal loan repayment progress", getLoanDetails(loan).progress, "40"],
      ["Mortgage repayment progress", getLoanDetails(mortgage).progress, "16"],
    ] as const;
    for (const [label, fraction, expectedAriaPercent] of sourceProgress) {
      const progress = screen.getByRole("progressbar", { name: label });
      const fill = progress.firstElementChild as HTMLElement | null;
      expect(fill).toBeInTheDocument();
      expect(progress).toHaveAttribute("aria-valuenow", expectedAriaPercent);
      expect(sourceAriaPercent(fraction)).toBe(expectedAriaPercent);
      expect(window.getComputedStyle(fill!).width).toBe(sourceWidth(fraction));
    }
  });

  it("titles the Native account carousel My Products", async () => {
    const { container } = render(
      <AccountDetailScreen
        selectedProductId="sav-1"
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
      />,
      { wrapper: AppProviders },
    );
    await asyncNativeReady(container);
    await waitFor(() => {
      expect(screen.getAllByRole("heading", { name: "My Products" })).not.toHaveLength(0);
    }, { timeout: 5000 });
    expect(screen.queryByRole("heading", { name: "Accounts" })).not.toBeInTheDocument();
  });

  it("copies from the account product carousel", async () => {
    const { container } = render(
      <AccountDetailScreen
        selectedProductId="acc-1"
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
      />,
      { wrapper: AppProviders },
    );
    await asyncNativeReady(container);
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: "Copy account number" }).length).toBeGreaterThan(0);
    }, { timeout: 5000 });

    fireEvent.click(screen.getAllByRole("button", { name: "Copy account number" })[0]!);
    expect(await screen.findByRole("status")).toHaveTextContent("Account number successfully copied");
  });

  it("keeps copying available on an inactive account card", async () => {
    const { container } = render(
      <AccountDetailScreen
        selectedProductId="acc-1"
        onBack={() => undefined}
        onDetailsClick={() => undefined}
        onOptionsClick={() => undefined}
      />,
      { wrapper: AppProviders },
    );
    await asyncNativeReady(container);
    await waitFor(() => {
      expect(container.querySelector('[data-testid="ro-account-carousel-acc-2"] [aria-label="Copy account number"]')).toBeInTheDocument();
    }, { timeout: 5000 });

    const inactiveCopy = container.querySelector<HTMLElement>(
      '[data-testid="ro-account-carousel-acc-2"] [aria-label="Copy account number"]',
    );
    expect(inactiveCopy).toBeEnabled();
    fireEvent.click(inactiveCopy!);
    expect(await screen.findByRole("status")).toHaveTextContent("Account number successfully copied");
  });
});
