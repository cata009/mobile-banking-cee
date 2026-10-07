import { describe, expect, it, vi } from "vitest";
import { INVESTMENTS_BULK_APPROVAL_FLOW } from "@/app/screens/flow-library/flows/investmentsBulkApproval";
import { FLOW_SCREEN_SOURCES } from "@/app/screens/flow-library/components/screenSources";
import { buildFlowReferencePackage, mockDataSource } from "@/app/screens/flow-library/handoff/referencePackage";
import { unzipSync, strFromU8 } from "fflate";
import { BULK_DRAFTS, DEFAULT_SELECTED_IDS, STATIC_REVIEW_SELECTED_IDS, getSelectedDrafts, getSelectableDraftIds, toggleSelectedDraftIds, toggleAllDraftIds, getSummaryOrderStatus, getSummaryStatusLabel } from "@/features/investments/bulk-approval/model";

// This suite exercises the registry/data entry points without the UI runtime.
vi.mock("react", () => { throw new Error("Bulk metadata must not eagerly import React"); });

describe("bulk approval ownership and source package", () => {
  it("keeps the public metadata entry identical to the compatibility export", async () => {
    const metadata = await import("@/flows/shared/investments-bulk-approval");
    expect(metadata.INVESTMENTS_BULK_APPROVAL_FLOW).toBe(INVESTMENTS_BULK_APPROVAL_FLOW);
  });
  it("preserves the fixture order and local rejection interpretation", () => {
    expect(BULK_DRAFTS.map(({ id, amount, status }) => [id, amount, status])).toEqual([
      ["draft-01", 5000, "available"], ["draft-02", -3200, "available"],
      ["draft-03", 750, "available"], ["draft-04", 2400, "available"],
      ["draft-05", -1650, "available"], ["draft-06", 1800, "available"],
      ["draft-07", 300, "available"], ["draft-08", 1250, "available"],
      ["draft-09", 900, "available"], ["draft-10", 1100, "rejected"],
    ]);
    expect(DEFAULT_SELECTED_IDS).toEqual([]);
    expect(STATIC_REVIEW_SELECTED_IDS).toEqual(["draft-01", "draft-02", "draft-03"]);
    // The seeded status is presentation data; only session rejection hides a draft.
    expect(getSelectableDraftIds([])).toContain("draft-10");
    expect(getSelectedDrafts(["draft-10", "draft-02", "draft-01"], ["draft-02"]).map(({ id }) => id))
      .toEqual(["draft-01", "draft-10"]);
    expect(getSummaryOrderStatus(BULK_DRAFTS[9]!, [], [])).toBe("Not signed");
    expect(getSummaryOrderStatus(BULK_DRAFTS[9]!, ["draft-10"], [])).toBe("Marked to sign");
    expect(getSummaryOrderStatus(BULK_DRAFTS[9]!, ["draft-10"], ["draft-10"])).toBe("Rejected");
    expect(getSummaryStatusLabel("Not signed")).toBe("Not selected to be signed");
  });

  it("preserves selection order and the existing select-all length rule", () => {
    expect(toggleSelectedDraftIds(["draft-02"], "draft-01")).toEqual(["draft-02", "draft-01"]);
    expect(toggleSelectedDraftIds(["draft-02", "draft-01"], "draft-02")).toEqual(["draft-01"]);
    expect(toggleAllDraftIds(["draft-01"], ["draft-01", "draft-10"])).toEqual(["draft-01", "draft-10"]);
    expect(toggleAllDraftIds(["draft-10", "draft-01"], ["draft-01", "draft-10"])).toEqual([]);
  });
  it("preserves the ordered countries, scenarios and rule identities", () => {
    const flow = INVESTMENTS_BULK_APPROVAL_FLOW;
    expect(flow.id).toBe("investments-bulk-approval");
    expect(flow.countryScope).toEqual(["RO", "RS", "HU", "BA", "BA_BL", "SK", "SI", "CZ"]);
    expect(flow.scenarios.map((scenario) => scenario.id)).toEqual([
      "bulk-review-and-sign", "summary-before-review-complete", "prototype-signing-failure",
    ]);
    expect(flow.overview.rules?.map((rule) => rule.id)).toEqual([
      "R1", "R2", "R3", "R4", "R5", "R6", "R7", "R8", "R9", "R10", "R11", "R12",
    ]);
  });

  it("ships the actual preview and extracted model under their repository paths", async () => {
    const source = FLOW_SCREEN_SOURCES["investments-bulk-approval"]!;
    const blob = buildFlowReferencePackage(INVESTMENTS_BULK_APPROVAL_FLOW, source);
    const bytes = await blob.arrayBuffer();
    const files = unzipSync(new Uint8Array(bytes));
    const preview = "src/flows/shared/investments-bulk-approval/investmentsBulkApprovalPreviews.tsx";
    const model = "src/features/investments/bulk-approval/model.ts";
    expect(files[preview]).toBeDefined();
    expect(files[model]).toBeDefined();
    expect(strFromU8(files[preview]!)).toBe(source.source);
    expect(strFromU8(files[preview]!)).toContain('@/features/investments/bulk-approval/model');
    expect(strFromU8(files[model]!)).toContain('export const BULK_DRAFTS');
    expect(strFromU8(files[model]!)).toMatch(/id:\s*["']draft-10["']/);
    expect(strFromU8(files["src/mockData.ts"]!)).toMatch(/type DraftStatus\s*=\s*["']available["']\s*\|\s*["']rejected["']/);
    expect(strFromU8(files["src/mockData.ts"]!)).toMatch(/id:\s*["']draft-01["']/);
    expect(strFromU8(files["src/mockData.ts"]!)).not.toContain('export export');
  });

  it("still extracts an inline fixture for legacy callers", () => {
    expect(mockDataSource({ file: "legacy.tsx", source: 'const BULK_DRAFTS: readonly BulkDraft[] = [\n] as const;' }))
      .toContain('export const BULK_DRAFTS');
  });

  it('retains aliases and representative rows from semicolon-free formatted source', () => {
    const source = "export type DraftStatus = 'available' | 'rejected'\nexport type Draft = {\n  id: string\n  status: DraftStatus\n}\nexport const DRAFTS: readonly Draft[] = [\n  { id: 'draft-01', status: 'available' },\n] as const\n"
    const mock = mockDataSource({file:'model.ts',source});
    expect(mock).toContain("type DraftStatus = 'available' | 'rejected'");
    expect(mock).toContain('type Draft = {');
    expect(mock).toContain('export const DRAFTS');
    expect(mock).toContain("id: 'draft-01'");
    expect(mock).not.toContain('export export');
  });
});
