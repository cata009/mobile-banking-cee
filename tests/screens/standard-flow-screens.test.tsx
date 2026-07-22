// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import type { ReactNode } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import StandardSignScreen from "@/app/components/flow/StandardSignScreen";
import StandardSuccessScreen from "@/app/components/flow/StandardSuccessScreen";
import { LanguageProvider } from "@/app/contexts/LanguageContext";
import { PaymentSignScreen, PaymentSuccessScreen } from "@/app/screens/payments/DomesticPaymentFlowScreens";
import { DemoProvider } from "@/app/state/demoStore";

function PaymentProviders({ children }: { children: ReactNode }) {
  return (
    <DemoProvider initialState={{ country: "RO" }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  );
}

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe("standard flow screens", () => {
  it("authenticates with Face ID before completing a standard sign action", () => {
    vi.useFakeTimers();
    const onBack = vi.fn();
    const onSign = vi.fn();

    render(
      <StandardSignScreen
        title="Sign order"
        pinLabel="Enter PIN to sign the order"
        pinHelper="Authorize the investment order"
        actionLabel="Sign order"
        onBack={onBack}
        onSign={onSign}
      />,
    );

    expect(screen.getAllByRole("heading", { name: "Sign order" })).not.toHaveLength(0);
    expect(screen.getByText("Enter PIN to sign the order")).toBeInTheDocument();
    expect(screen.getByText("Authorize the investment order")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.click(screen.getByRole("button", { name: "Sign order" }));
    expect(onBack).toHaveBeenCalledOnce();

    expect(onSign).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(839));
    expect(onSign).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onSign).toHaveBeenCalledOnce();
  });

  it("renders customizable investment success copy and completion", () => {
    const onDone = vi.fn();

    render(
      <StandardSuccessScreen
        title="Order accepted"
        body="You can review it in Investments History."
        actionLabel="Back to investments"
        onDone={onDone}
      />,
    );

    expect(screen.getByRole("heading", { name: "Order accepted" })).toBeInTheDocument();
    expect(screen.getByText("You can review it in Investments History.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back to investments" }));
    expect(onDone).toHaveBeenCalledOnce();
  });
});

describe("payment wrappers", () => {
  it("preserves the existing payment sign copy", () => {
    render(
      <PaymentProviders>
        <PaymentSignScreen onBack={() => undefined} onSign={() => undefined} />
      </PaymentProviders>,
    );

    expect(screen.getAllByRole("heading", { name: "Sign" })).not.toHaveLength(0);
    expect(screen.getByText("Enter pin code")).toBeInTheDocument();
    expect(screen.getByText("Be sure that nobody is watching you")).toBeInTheDocument();
  });

  it("preserves the existing payment success copy", () => {
    render(
      <PaymentProviders>
        <PaymentSuccessScreen onDone={() => undefined} />
      </PaymentProviders>,
    );

    expect(screen.getByRole("heading", { name: "Successful payment" })).toBeInTheDocument();
    expect(screen.getByText("Your payment has been successfully sent to the bank")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ok, got it" })).toBeInTheDocument();
  });
});
