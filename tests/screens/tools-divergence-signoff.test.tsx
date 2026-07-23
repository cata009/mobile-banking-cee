// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
import {
  SIGNOFF_COLUMNS,
  buildSignoffCsv,
  computeProgress,
  getStatus,
  loadSignoff,
  updateEntry,
} from "@/app/screens/tools/localizationSignoff";
import {
  LOCAL_COLUMNS,
  buildCoverageCsv,
  languageCoverage,
  namespaceCoverage,
  translatedPct,
} from "@/app/screens/tools/localizationCoverage";

function AppProviders({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: "RO", product: "PI" }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  );
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
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

describe("localization sign-off store", () => {
  beforeEach(() => window.localStorage.clear());

  it("only signs off the 7 local-language columns", () => {
    expect(SIGNOFF_COLUMNS).toHaveLength(7);
    expect(SIGNOFF_COLUMNS.every((column) => !column.isEnglish)).toBe(true);
  });

  it("persists a status change and reloads it from storage", () => {
    const languageId = SIGNOFF_COLUMNS[0]!.id;
    const next = updateEntry(loadSignoff(), languageId, "runtime.actions.back", { status: "approved" }, "2026-07-23T10:00:00.000Z");
    expect(getStatus(next, languageId, "runtime.actions.back")).toBe("approved");
    expect(getStatus(loadSignoff(), languageId, "runtime.actions.back")).toBe("approved");
  });

  it("computes progress across a set of paths", () => {
    const languageId = SIGNOFF_COLUMNS[0]!.id;
    const paths = ["a.one", "a.two", "a.three"];
    let store = updateEntry(loadSignoff(), languageId, "a.one", { status: "approved" }, "2026-07-23T10:00:00.000Z");
    store = updateEntry(store, languageId, "a.two", { status: "needs-change" }, "2026-07-23T10:00:00.000Z");
    const progress = computeProgress(store, languageId, paths);
    expect(progress).toMatchObject({ total: 3, approved: 1, needsChange: 1, pending: 1 });
  });

  it("exports a BOM CSV with the sign-off columns", () => {
    const column = SIGNOFF_COLUMNS[0]!;
    const csv = buildSignoffCsv(loadSignoff(), column, ["runtime.actions.back"]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const header = csv.slice(1).split("\r\n")[0] ?? "";
    expect(header).toContain('"Status"');
    expect(header).toContain('"Note"');
  });
});

describe("localization coverage model", () => {
  it("covers the 7 local-language columns", () => {
    expect(LOCAL_COLUMNS).toHaveLength(7);
    expect(LOCAL_COLUMNS.every((column) => !column.isEnglish)).toBe(true);
  });

  it("buckets every key into translated, inherited, or missing with no leakage", () => {
    for (const column of LOCAL_COLUMNS) {
      const counts = languageCoverage(column);
      expect(counts.total).toBeGreaterThan(0);
      expect(counts.translated + counts.inherited + counts.missing).toBe(counts.total);
    }
  });

  it("computes a bounded translated percentage", () => {
    const runtime = namespaceCoverage(LOCAL_COLUMNS[0]!, "runtime");
    const pct = translatedPct(runtime);
    expect(pct).toBeGreaterThanOrEqual(0);
    expect(pct).toBeLessThanOrEqual(100);
  });

  it("exports a BOM CSV with a row per language × namespace", () => {
    const csv = buildCoverageCsv();
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const header = csv.slice(1).split("\r\n")[0] ?? "";
    expect(header).toContain('"Inherited from EN"');
    expect(header).toContain('"Translated %"');
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

  it("opens the localization coverage dashboard with 7 language rows", () => {
    const { container } = render(<ToolsScreen />, { wrapper: AppProviders });
    fireEvent.click(container.querySelector('[data-tool-card="localization-coverage"]') as HTMLElement);

    const tool = container.querySelector("[data-tool-localization-coverage]");
    expect(tool).not.toBeNull();
    expect(tool?.querySelectorAll("[data-coverage-language]")).toHaveLength(7);
    expect(container.querySelector("[data-coverage-export]")).not.toBeNull();
  });

  it("opens the localization sign-off tool and approves a string", () => {
    const { container } = render(<ToolsScreen />, { wrapper: AppProviders });
    fireEvent.click(container.querySelector('[data-tool-card="localization-signoff"]') as HTMLElement);

    const tool = container.querySelector("[data-tool-localization-signoff]");
    expect(tool).not.toBeNull();

    const firstRow = tool?.querySelector("[data-signoff-row]");
    expect(firstRow).not.toBeNull();
    const approveButton = Array.from(firstRow?.querySelectorAll("button") ?? []).find(
      (button) => button.textContent === "Approve",
    );
    expect(approveButton).toBeDefined();
    fireEvent.click(approveButton as HTMLButtonElement);
    expect(firstRow?.querySelector('[data-signoff-status="approved"]')).not.toBeNull();
  });
});
