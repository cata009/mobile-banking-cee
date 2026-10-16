// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentType, PropsWithChildren, ReactElement } from "react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider } from "@/app/contexts/LanguageContext";
import { COUNTRIES } from "@/app/registry/demoConfig";
import type { NativeScreenPreviewProps } from "@/app/components/demo/NativeScreenPreview";
import OrdersToApproveScreen from "@/app/screens/investments/OrdersToApproveScreen";
import { DemoProvider } from "@/app/state/demoStore";
import { asyncNativeReady, resetNativeWebRendererDiagnostics } from "../helpers/nativeWebRenderer";

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

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollTo", { configurable: true, value: vi.fn() });
});

beforeEach(() => resetNativeWebRendererDiagnostics());

afterEach(() => {
  cleanup();
  resetNativeWebRendererDiagnostics();
});

async function renderNative(ui: ReactElement, wrapper?: ComponentType<PropsWithChildren>) {
  const view = render(ui, wrapper ? { wrapper } : undefined);
  await asyncNativeReady(view.container);
  return view;
}

describe("OrdersToApproveScreen", () => {
  it("exposes every pending order as an accessible detail entry", async () => {
    await renderNative(<OrdersToApproveScreen onBack={() => undefined} />, AppProviders);

    expect(screen.getAllByRole("button", { name: /Open .* order for /i })).toHaveLength(5);
  });

  it("opens a selected order as read-only review data with Reject and Sign order actions", async () => {
    await renderNative(<OrdersToApproveScreen onBack={() => undefined} />, AppProviders);

    fireEvent.click(screen.getAllByRole("button", { name: /Open BUY order/i })[0]!);

    expect((await screen.findAllByRole("heading", { name: "Review Data" })).length).toBeGreaterThan(0);
    expect(screen.getByText("ORDER SUMMARY")).toBeInTheDocument();
    expect(screen.getByText("Product ID")).toBeInTheDocument();
    expect(screen.getByText("Market price")).toBeInTheDocument();
    expect(screen.getByText("DOCUMENTS AND TERMS")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign order" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save order" })).not.toBeInTheDocument();
  });

  it.each(COUNTRIES.filter((country) => country !== "IT"))("opens a populated read-only order detail for %s", async (country) => {
    await renderNative(
      <DemoProvider initialState={{ country, product: "PI" }}>
        <LanguageProvider initialLanguage="en">
          <OrdersToApproveScreen onBack={() => undefined} />
        </LanguageProvider>
      </DemoProvider>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: /Open BUY order/i })[0]!);

    expect((await screen.findAllByRole("heading", { name: "Review Data" })).length).toBeGreaterThan(0);
    expect(screen.getByText("Product ID")).toBeInTheDocument();
    expect(screen.getByText("Cash account")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign order" })).toBeInTheDocument();
  });

  it("keeps the Italy Source approvals route contract without claiming Native detail support", () => {
    const onBack = vi.fn();
    const preview = OrdersToApproveScreen({ onBack }) as ReactElement<NativeScreenPreviewProps>;

    expect(preview.props.route).toEqual({
      screen: "investments",
      params: { entry: "approvals" },
    });
    expect(preview.props.snapshot?.primaryNavigationVisible).toBe(false);
    expect(preview.props.onBack).toBe(onBack);
  });
});
