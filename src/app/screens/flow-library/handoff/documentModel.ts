/**
 * Flow handoff — the shared document model.
 *
 * One flow, described once as a small block AST, then rendered to whichever
 * container a business analyst needs: rich HTML on the clipboard for a single
 * paste into Confluence, or a real `.docx` for Confluence's built-in
 * "Import Word Document" (the only route that carries screens across, because
 * the importer uploads embedded images as page attachments).
 *
 * Keeping one AST is the point: a section added here shows up in every export,
 * so the paste and the import can never drift apart.
 */

import type {
  ExportOverview,
  CapturedFlowStep,
  FlowExportMeta,
  FlowExportSpecItem,
  ExportStepSpec,
} from "../flowExport";
import type { FlowBusinessAnalysisSpec } from "../flows/types";

export type DocBlock =
  | { kind: "heading"; level: 1 | 2 | 3 | 4; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "bullets"; items: readonly string[] }
  | { kind: "table"; head?: readonly string[]; rows: readonly (readonly string[])[] }
  | { kind: "image"; base64: string; alt: string };

export interface FlowDocument {
  title: string;
  subtitle: string;
  blocks: DocBlock[];
}

/** What a handoff should carry. Screens are only meaningful where images survive. */
export interface HandoffOptions {
  /** Include the captured journey screens and their per-screen specs. */
  includeScreens: boolean;
}

function push(blocks: DocBlock[], block: DocBlock | null): void {
  if (block) blocks.push(block);
}

function bullets(items: readonly string[] | undefined): DocBlock | null {
  return items && items.length > 0 ? { kind: "bullets", items } : null;
}

function keyValues(rows: readonly { label: string; value: string }[]): DocBlock | null {
  const body = rows.filter((row) => row.value).map((row) => [row.label, row.value]);
  return body.length > 0 ? { kind: "table", rows: body } : null;
}

function analysisSections(
  blocks: DocBlock[],
  title: string,
  sections: FlowBusinessAnalysisSpec["requirements"],
): void {
  if (sections.length === 0) return;
  blocks.push({ kind: "heading", level: 2, text: title });
  for (const section of sections) {
    blocks.push({ kind: "heading", level: 3, text: section.title });
    if (section.description) blocks.push({ kind: "paragraph", text: section.description });
    push(blocks, bullets(section.items));
  }
}

function businessAnalysisBlocks(blocks: DocBlock[], analysis: FlowBusinessAnalysisSpec): void {
  blocks.push({ kind: "heading", level: 2, text: "General information" });
  push(blocks, keyValues(analysis.generalInformation));
  if (analysis.versionContext) blocks.push({ kind: "paragraph", text: analysis.versionContext });
  if (analysis.versionHistory.length > 0) {
    blocks.push({ kind: "heading", level: 3, text: "Document history" });
    blocks.push({
      kind: "table",
      head: ["Version", "Date", "Change"],
      rows: analysis.versionHistory.map((entry) => [entry.version, entry.date, entry.detail]),
    });
  }

  if (analysis.openIssues.length > 0) {
    blocks.push({ kind: "heading", level: 2, text: "Open issues" });
    blocks.push({
      kind: "table",
      head: ["Ref", "Status", "Issue", "Detail"],
      rows: analysis.openIssues.map((issue) => [issue.reference, issue.status, issue.title, issue.detail]),
    });
  }

  analysisSections(blocks, "Requirement", analysis.requirements);
  analysisSections(blocks, "Current status", analysis.currentStatus);
  analysisSections(blocks, "Proposed solution", analysis.proposedSolution);
  analysisSections(blocks, "Non-functional requirements", analysis.nonFunctionalRequirements);
}

function stepSpecBlocks(blocks: DocBlock[], spec: ExportStepSpec | undefined): void {
  if (!spec) return;
  if (spec.purpose) blocks.push({ kind: "paragraph", text: spec.purpose });
  if (spec.states?.length) {
    blocks.push({ kind: "heading", level: 4, text: "UI states" });
    push(blocks, bullets(spec.states));
  }
  if (spec.fields?.length) {
    blocks.push({ kind: "heading", level: 4, text: "Fields" });
    blocks.push({
      kind: "table",
      head: ["Field", "Type", "Required", "Validation"],
      rows: spec.fields.map((field) => [
        field.name,
        field.type,
        field.required ? "Yes" : "No",
        [field.validation, field.notes].filter(Boolean).join(" / ") || "Not specified",
      ]),
    });
  }
  if (spec.actions?.length) {
    blocks.push({ kind: "heading", level: 4, text: "Actions" });
    blocks.push({
      kind: "table",
      head: ["Action", "Result"],
      rows: spec.actions.map((action) => [action.label, action.result]),
    });
  }
  if (spec.back) {
    blocks.push({ kind: "heading", level: 4, text: "Back behavior" });
    blocks.push({ kind: "paragraph", text: spec.back });
  }
  if (spec.edgeCases?.length) {
    blocks.push({ kind: "heading", level: 4, text: "Edge cases" });
    push(blocks, bullets(spec.edgeCases));
  }
  if (spec.acceptance?.length) {
    blocks.push({ kind: "heading", level: 4, text: "Acceptance criteria" });
    push(blocks, bullets(spec.acceptance));
  }
}

function flowSpecBlocks(blocks: DocBlock[], overview: ExportOverview): void {
  const before = blocks.length;
  if (overview.purpose) {
    blocks.push({ kind: "heading", level: 3, text: "Purpose" });
    blocks.push({ kind: "paragraph", text: overview.purpose });
  }
  if (overview.entryPoints?.length) {
    blocks.push({ kind: "heading", level: 3, text: "Entry points" });
    blocks.push({
      kind: "table",
      head: ["Entry point", "Intent"],
      rows: overview.entryPoints.map((entry) => [entry.label, entry.intent]),
    });
  }
  const simple: [string, readonly string[] | undefined][] = [
    ["Preconditions", overview.preconditions],
    ["Business rules", overview.businessRules],
    ["Success destinations", overview.successDestinations],
    ["Analytics events", overview.analyticsEvents],
    ["Open questions", overview.openQuestions],
  ];
  for (const [title, items] of simple) {
    if (!items?.length) continue;
    blocks.push({ kind: "heading", level: 3, text: title });
    push(blocks, bullets(items));
  }
  if (overview.signing) {
    blocks.push({ kind: "heading", level: 3, text: "Signing" });
    blocks.push({ kind: "paragraph", text: overview.signing });
  }
  if (blocks.length > before) blocks.splice(before, 0, { kind: "heading", level: 2, text: "Flow specification" });
}

/**
 * Assemble the handoff document. Mirrors what the Specification tab shows, then
 * — when the container can carry images — the captured journey screens.
 */
export function buildFlowDocument(
  meta: FlowExportMeta,
  steps: readonly CapturedFlowStep[],
  spec: readonly FlowExportSpecItem[],
  overview: ExportOverview | undefined,
  options: HandoffOptions,
): FlowDocument {
  const blocks: DocBlock[] = [];

  push(
    blocks,
    keyValues([
      { label: "Flow", value: meta.flowLabel },
      { label: "Scenario", value: meta.scenarioLabel },
      { label: "Domain", value: meta.domain ?? "" },
      { label: "Status", value: meta.status ?? "" },
      { label: "Countries", value: meta.countryScope },
      { label: "Figma", value: meta.figmaFile },
      { label: "Source", value: meta.sourceUrl },
    ]),
  );

  const analysis = overview?.businessAnalysis;
  if (analysis) {
    blocks.push({ kind: "heading", level: 1, text: "Business analysis specification" });
    businessAnalysisBlocks(blocks, analysis);
  }

  // A BA document stands as the whole specification unless the flow asks for both.
  const wantsFlowSpec = !analysis || overview?.specLayout === "document-and-screens";
  if (overview && wantsFlowSpec) flowSpecBlocks(blocks, overview);

  if (spec.length > 0) {
    blocks.push({ kind: "heading", level: 2, text: "UX specification" });
    for (const item of spec) {
      blocks.push({ kind: "heading", level: 3, text: item.title });
      for (const part of item.body.split(/\n{2,}/)) {
        const text = part.trim();
        if (text) blocks.push({ kind: "paragraph", text });
      }
    }
  }

  if (options.includeScreens && steps.length > 0) {
    blocks.push({ kind: "heading", level: 1, text: "Screens" });
    steps.forEach((step, index) => {
      blocks.push({ kind: "heading", level: 2, text: `${index + 1}. ${step.title}` });
      if (step.description) blocks.push({ kind: "paragraph", text: step.description });
      blocks.push({ kind: "image", base64: step.pngBase64, alt: step.title });
      stepSpecBlocks(blocks, step.spec);
    });
  }

  return { title: meta.flowTitle, subtitle: meta.scenarioDescription, blocks };
}
