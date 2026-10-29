// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ToolsScreen from "@/app/screens/tools/ToolsScreen";
import { TranslationReviewTool } from "@/app/screens/tools/TranslationReviewTool";

describe("retired localization tools", () => {
  it("does not show the localization coverage or sign-off cards", () => {
    const { container } = render(<ToolsScreen />);

    expect(container.querySelector('[data-tool-card="localization-coverage"]')).toBeNull();
    expect(container.querySelector('[data-tool-card="localization-signoff"]')).toBeNull();
    expect(container.querySelector('[data-tool-card="translation-review"]')).not.toBeNull();
  });
});

describe("translation review character display", () => {
  it("renders correct local-language characters across the runtime translation corpus", () => {
    const { container } = render(<TranslationReviewTool />);
    const namespace = container.querySelector<HTMLSelectElement>("[data-translation-review-namespace]");
    expect(namespace).not.toBeNull();
    fireEvent.change(namespace!, { target: { value: "runtime" } });

    const row = screen
      .getByText("runtime.evo.interest.cards.safetyNetAccounts.caption")
      .closest("tr");
    expect(row).not.toBeNull();
    const cells = within(row!).getAllByRole("cell");

    expect(cells[1]).toHaveTextContent("Možnosti si projděte, kdykoli budete potřebovat.");
    expect(cells[3]).toHaveTextContent("Možnosti si prezrite, kedykoľvek budete potrebovať.");
    expect(cells[5]).toHaveTextContent("Revezi opțiunile oricând ai nevoie.");
    expect(cells[7]).toHaveTextContent("Pregledajte opcije kad god vam zatreba.");
    expect(cells[9]).toHaveTextContent("Nézd át a lehetőségeket, amikor csak szükséged van rá.");
    expect(cells[11]).toHaveTextContent("Pregledajte opcije kad god vam zatreba.");
    expect(cells[13]).toHaveTextContent("Možnosti preglejte, kadar koli potrebujete.");
  });
});
