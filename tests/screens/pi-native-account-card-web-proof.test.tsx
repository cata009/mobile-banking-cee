// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/app/contexts/LanguageContext";
import { NativeScreenPreview } from "@/app/components/demo/NativeScreenPreview";
import { DemoProvider } from "@/app/state/demoStore";
import type { ProductCounts } from "@/app/state/demoTypes";
import { mockProducts } from "@/data/products";
import {
  asyncNativeReady,
  resetNativeWebRendererDiagnostics,
} from "../helpers/nativeWebRenderer";

vi.mock("@/app/components/demo/nativeDemoLoader", async () => {
  const { loadNativeDemoModuleForWebTest } = await import("../helpers/nativeWebRenderer");
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest };
});

const productCounts: ProductCounts = {
  accounts: 2,
  debitCards: 2,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 1,
  mortgages: 1,
  investments: 1,
};

function AppProviders({
  children,
  amountsHidden = false,
}: PropsWithChildren<{ amountsHidden?: boolean }>) {
  return (
    <DemoProvider
      initialState={{
        country: "RO",
        product: "PI",
        release: "release-current",
        amountsHidden,
        productCounts,
      }}
    >
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  );
}

beforeEach(() => resetNativeWebRendererDiagnostics());

afterEach(() => {
  cleanup();
  resetNativeWebRendererDiagnostics();
});

describe("PI Native account and card screens in the Web host", () => {
  it("renders account information, copies its canonical account number, and returns through Back", async () => {
    const onBack = vi.fn();
    const { container } = render(
      <NativeScreenPreview
        route={{ screen: "account-info", params: { productId: "acc-2" } }}
        snapshot={{ productCounts }}
        onBack={onBack}
      />,
      { wrapper: AppProviders },
    );
    await asyncNativeReady(container);

    const page = container.querySelector<HTMLElement>('[data-testid="ro-account-info-page"]');
    expect(page).toBeInTheDocument();
    expect(page).toHaveTextContent("Account Details");
    expect(page).toHaveTextContent("RO44BACX1234567890123402");
    expect(page).toHaveTextContent("20.442,68 RON");

    fireEvent.click(screen.getByRole("button", { name: "Copy account number" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Account number successfully copied");

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("keeps the direct card information page informational while hiding full card credentials", async () => {
    const card = mockProducts.find(product => product.id === "card-2");
    if (!card || card.type !== "credit_card") throw new Error("Expected the credit card fixture");

    const { container } = render(
      <NativeScreenPreview
        route={{ screen: "card-info", params: { productId: card.id } }}
        snapshot={{ productCounts }}
      />,
      { wrapper: ({ children }) => <AppProviders amountsHidden>{children}</AppProviders> },
    );
    await asyncNativeReady(container);

    const page = container.querySelector("[data-native-current-host]");
    expect(page).toHaveTextContent("Card product");
    expect(page).toHaveTextContent("Card status");
    expect(page).toHaveTextContent("Credit limit");
    expect(screen.queryByText(card.cardNumber, { exact: true })).not.toBeInTheDocument();
    expect(card.securityCode).toBeDefined();
    expect(screen.queryByText(card.securityCode!, { exact: true })).not.toBeInTheDocument();
  });
});
