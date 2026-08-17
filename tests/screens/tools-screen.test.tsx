// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { LanguageProvider } from "@/app/contexts/LanguageContext";
import ToolsScreen from "@/app/screens/tools/ToolsScreen";
import {
  LANGUAGE_COLUMNS,
  buildTranslationCsv,
  findLongestValue,
  getNamespaceLeafPaths,
  getTranslationValue,
  isOverflowRisk,
  TRANSLATION_NAMESPACES,
} from "@/app/screens/tools/translationCorpus";
import { DemoProvider } from "@/app/state/demoStore";

function AppProviders({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: "RO", product: "PI" }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  );
}

function renderTools() {
  return render(<ToolsScreen />, { wrapper: AppProviders });
}

afterEach(() => {
  cleanup();
});

describe("translation corpus", () => {
  it("exposes the 14 language columns (7 countries x local+EN, BA_BL shares BA)", () => {
    expect(LANGUAGE_COLUMNS).toHaveLength(14);
    expect(LANGUAGE_COLUMNS.filter((column) => column.isEnglish)).toHaveLength(7);
    expect(LANGUAGE_COLUMNS.some((column) => column.country === "BA_BL")).toBe(false);
  });

  it("resolves real translation values by dot-path", () => {
    expect(getTranslationValue("RO", "en", "runtime.actions.back")).toBe("Back");
    expect(getTranslationValue("RO", "en", "runtime.actions.missing-key")).toBeUndefined();
  });

  it("flattens namespaces into leaf paths", () => {
    expect(TRANSLATION_NAMESPACES.length).toBeGreaterThan(0);
    const runtimePaths = getNamespaceLeafPaths("runtime");
    expect(runtimePaths).toContain("runtime.actions.back");
    expect(runtimePaths.every((path) => path.startsWith("runtime."))).toBe(true);
  });

  it("finds the longest real translation of a key", () => {
    const worst = findLongestValue("runtime.actions.back");
    expect(worst).not.toBeNull();
    expect(worst?.value.length).toBeGreaterThanOrEqual(4);
  });

  it("flags only meaningfully longer strings as overflow risks", () => {
    expect(isOverflowRisk("Short", "Short")).toBe(false);
    expect(isOverflowRisk("A localized string that got much much longer", "Short label")).toBe(true);
    expect(isOverflowRisk(undefined, "Short")).toBe(false);
  });

  it("builds a CSV with a BOM, the key column and all language columns", () => {
    const csv = buildTranslationCsv("runtime");
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const header = csv.slice(1).split("\r\n")[0] ?? "";
    expect(header).toContain('"Key"');
    expect(header).toContain('"CZ · CS"');
    expect(header.split(",").length).toBe(15);
  });
});

describe("ToolsScreen", () => {
  it("renders the overview with all tool cards", () => {
    const { container } = renderTools();
    expect(screen.getByRole("heading", { name: "Tools", level: 1 })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-tool-card]")).toHaveLength(6);
  });

  it("opens the side-by-side tool with two live country frames by default", () => {
    const { container } = renderTools();
    fireEvent.click(container.querySelector('[data-tool-card="side-by-side"]') as HTMLElement);

    const frames = container.querySelectorAll("iframe");
    expect(frames).toHaveLength(2);
    for (const frame of Array.from(frames)) {
      expect(frame.getAttribute("src")).toContain("frame=0");
      expect(frame.getAttribute("src")).toContain("country=");
      expect(frame.getAttribute("src")).toContain("screen=homepage");
    }
  });

  it("switches both comparison frames to Evo 2027 and adds a third country only on request", () => {
    const { container } = renderTools();
    fireEvent.click(container.querySelector('[data-tool-card="side-by-side"]') as HTMLElement);

    expect(container.querySelectorAll("iframe")).toHaveLength(2);
    expect(container.querySelectorAll("[data-side-by-side-empty-slot]")).toHaveLength(1);

    fireEvent.change(screen.getByRole("combobox", { name: "App version" }), {
      target: { value: "release-future-evo-2027" },
    });

    for (const frame of Array.from(container.querySelectorAll("iframe"))) {
      expect(frame.getAttribute("src")).toContain("release=release-future-evo-2027");
    }

    fireEvent.click(screen.getByTitle("Add Slovakia to comparison"));
    expect(container.querySelectorAll("iframe")).toHaveLength(3);
    expect(container.querySelectorAll("[data-side-by-side-empty-slot]")).toHaveLength(0);
  });

  it("opens the translation tester with a custom-text preview", () => {
    const { container } = renderTools();
    fireEvent.click(container.querySelector('[data-tool-card="translation-tester"]') as HTMLElement);

    const input = container.querySelector<HTMLTextAreaElement>("[data-tester-custom-text]");
    expect(input).not.toBeNull();
    fireEvent.change(input as HTMLTextAreaElement, {
      target: { value: "A very very long stress label for the component" },
    });
    expect(screen.getByText(/47 characters/)).toBeInTheDocument();
  });

  it("keeps each slot's edited custom text when switching between slots", () => {
    const { container } = renderTools();
    fireEvent.click(container.querySelector('[data-tool-card="translation-tester"]') as HTMLElement);

    // Pick a multi-slot component (InfoBanner: Title + Description).
    fireEvent.change(container.querySelector<HTMLSelectElement>('[data-testable-component-select]') as HTMLSelectElement, {
      target: { value: "info-banner" },
    });

    const textArea = () => container.querySelector<HTMLTextAreaElement>("[data-tester-custom-text]")!;

    // Edit the Title slot.
    fireEvent.change(textArea(), { target: { value: "My custom title text" } });

    // Switch to the Description slot, which must NOT carry the title's text.
    fireEvent.click(screen.getByRole("button", { name: "Description" }));
    expect(textArea().value).toBe("Payments will be unavailable on Sunday between 02:00 and 04:00.");
    fireEvent.change(textArea(), { target: { value: "My custom description text" } });

    // Switch back to Title: the earlier edit must survive the round-trip.
    fireEvent.click(screen.getByRole("button", { name: "Title" }));
    expect(textArea().value).toBe("My custom title text");
  });

  it("opens the translation review table with rows and namespace selector", () => {
    const { container } = renderTools();
    fireEvent.click(container.querySelector('[data-tool-card="translation-review"]') as HTMLElement);

    expect(container.querySelector("[data-translation-review-namespace]")).not.toBeNull();
    expect(container.querySelectorAll("tbody tr").length).toBeGreaterThan(0);
    expect(container.querySelector("[data-translation-review-export]")).not.toBeNull();
  });
});
