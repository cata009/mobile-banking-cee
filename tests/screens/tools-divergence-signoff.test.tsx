// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { LanguageProvider } from "@/app/contexts/LanguageContext";
import { DemoProvider } from "@/app/state/demoStore";
import ToolsScreen from "@/app/screens/tools/ToolsScreen";
import {
  buildDivergenceCsv,
  computeDivergenceRows,
  divergenceCountByCountry,
  isCellDivergent,
  rowHasDivergence,
} from "@/app/screens/tools/countryDivergence";

function AppProviders({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: "RO", product: "PI" }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  );
}

afterEach(() => {
  cleanup();
});

describe("country divergence model", () => {
  const rows = computeDivergenceRows();
  const rowById = (id: string) => {
    const row = rows.find((entry) => entry.id === id);
    if (!row) throw new Error(`missing row ${id}`);
    return row;
  };

  it("marks Co-Apping as available only for CZ and SK", () => {
    const row = rowById("cap.co-apping");
    expect(row.values.CZ.kind).toBe("yes");
    expect(row.values.SK.kind).toBe("yes");
    expect(row.values.RO.kind).toBe("no");
    expect(rowHasDivergence(row, null)).toBe(true);
  });

  it("treats a global feature as shared across every country (no divergence)", () => {
    const row = rowById("feature.fx_newPaymentsHub");
    expect(rowHasDivergence(row, null)).toBe(false);
  });

  it("flags the RO-scoped maintenance banner as divergent from the majority", () => {
    const row = rowById("feature.fx_unplannedBanner");
    expect(isCellDivergent(row, "RO", null)).toBe(true);
    expect(isCellDivergent(row, "CZ", null)).toBe(false);
  });

  it("counts divergences relative to a reference country", () => {
    const counts = divergenceCountByCountry(rows, "RO");
    expect(counts.RO).toBe(0);
    expect(counts.CZ).toBeGreaterThan(0);
  });

  it("exports a BOM CSV whose header lists all 8 countries", () => {
    const csv = buildDivergenceCsv(rows);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const header = csv.slice(1).split("\r\n")[0] ?? "";
    expect(header).toContain('"Romania"');
    expect(header).toContain('"Czech Republic"');
    expect(header.split(",").length).toBe(10); // Category + Dimension + 8 countries
  });
});

describe("Tools surface — new cards", () => {
  it("opens the country divergence matrix with 8 country columns", () => {
    const { container } = render(<ToolsScreen />, { wrapper: AppProviders });
    fireEvent.click(container.querySelector('[data-tool-card="country-divergence"]') as HTMLElement);

    const tool = container.querySelector("[data-tool-country-divergence]");
    expect(tool).not.toBeNull();
    expect(tool?.querySelectorAll("thead th")).toHaveLength(9); // Dimension + 8 countries
    expect(container.querySelector("[data-divergence-export]")).not.toBeNull();
  });

});
