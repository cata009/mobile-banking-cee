// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import InvestmentOrderDocumentsAccordion from "@/app/screens/investments/InvestmentOrderDocumentsAccordion";

afterEach(cleanup);

describe("InvestmentOrderDocumentsAccordion initial disclosure state", () => {
  it("keeps the production default closed", () => {
    render(<InvestmentOrderDocumentsAccordion currency="EUR" />);

    expect(screen.getByRole("button", { name: /Ex-Ante cost information/i })).toHaveAttribute("aria-expanded", "false");
  });

  it("can initialize only Ex-Ante as open for a review prototype", () => {
    render(<InvestmentOrderDocumentsAccordion currency="EUR" initialOpenSection="ex-ante" />);

    expect(screen.getByRole("button", { name: /Ex-Ante cost information/i })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: /Product documents/i })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: /Important information/i })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: /Investment disclaimer/i })).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps all detailed financial content continuously inside Ex-Ante Costs and uses a generic disclaimer", () => {
    render(<InvestmentOrderDocumentsAccordion currency="EUR" initialOpenSection="ex-ante" />);

    expect(screen.getByText("NET INVESTMENT AMOUNT")).toBeInTheDocument();
    expect(screen.getByRole("tablist", { name: "Performance scenario view" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Investment disclaimer/i }));

    expect(screen.getByText(/Investments can rise or fall in value/i)).toBeInTheDocument();
    expect(screen.queryByRole("tablist", { name: "Performance scenario view" })).not.toBeInTheDocument();
  });
});
