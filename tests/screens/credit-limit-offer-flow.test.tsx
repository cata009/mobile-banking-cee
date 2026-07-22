// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CreditLimitOfferFlow from "@/app/screens/cards/CreditLimitOfferFlow";
import type { CreditCard } from "@/data/products";

const card: CreditCard = {
  id: "card-credit-1",
  type: "credit_card",
  name: "Credit Card",
  accountNumber: "5173500087654321",
  balance: 3200,
  currency: "CZK",
  cardType: "Standard",
  cardNumber: "5173500087654321",
  expiryDate: "12/29",
  creditLimit: 10000,
  availableCredit: 3200,
};

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe("CreditLimitOfferFlow", () => {
  it("requires terms, signs securely, and applies the new limit only from success", () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();

    render(
      <CreditLimitOfferFlow
        card={card}
        country="CZ"
        onCancel={() => undefined}
        onComplete={onComplete}
      />,
    );

    expect(screen.getAllByRole("heading", { name: "Review limit offer" })).not.toHaveLength(0);
    expect(screen.getByText("10 000,00 CZK")).toBeInTheDocument();
    expect(screen.getByText("15 000,00 CZK")).toBeInTheDocument();
    const continueButton = screen.getByRole("button", { name: "Continue" });
    expect(continueButton).toBeDisabled();

    fireEvent.click(screen.getByRole("switch", { name: "Accept credit limit terms" }));
    expect(continueButton).toBeEnabled();
    fireEvent.click(continueButton);
    expect(onComplete).not.toHaveBeenCalled();

    expect(screen.getAllByRole("heading", { name: "Sign limit change" })).not.toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Sign change" }));
    expect(onComplete).not.toHaveBeenCalled();
    expect(document.querySelector('[data-face-id-authenticating="true"]')).not.toBeNull();
    expect(screen.queryByRole("heading", { name: "Limit updated" })).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(840));

    expect(screen.getByRole("heading", { name: "Limit updated" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back to card" }));
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledWith("card-credit-1", 15000);
  });

  it("can be cancelled without changing the card", () => {
    const onCancel = vi.fn();
    const onComplete = vi.fn();

    render(
      <CreditLimitOfferFlow
        card={card}
        country="CZ"
        onCancel={onCancel}
        onComplete={onComplete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
