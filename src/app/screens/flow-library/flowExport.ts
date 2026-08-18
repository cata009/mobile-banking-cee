/**
 * Flow export helpers — PDF and Word, dependency-free by design (adding
 * packages requires separate approval in this repo).
 *
 * PDF: a print-formatted HTML document (cover, per-step screen + spec tables, and
 * a flow-spec appendix) opens in a new tab and triggers the browser print dialog,
 * where stakeholders pick "Save as PDF".
 *
 * Word: the same document is wrapped in the MHTML container format that Microsoft
 * Word opens natively (`.doc`), with every captured step screen embedded as a
 * base64 image part.
 *
 * The structured `spec`/`overview` inputs are optional and additive: when omitted,
 * the document renders exactly as before (screens + prose appendix).
 */

import { createPhoneScreenshotBlob } from "@/app/utils/phoneScreenshot";
import type { FlowBusinessAnalysisSpec } from "./flows/types";

export interface ExportFieldSpec {
  name: string;
  type: string;
  required?: boolean;
  validation?: string;
  notes?: string;
}

export interface ExportActionSpec {
  label: string;
  result: string;
}

/** Per-step specification rendered as tables under each screen. */
export interface ExportStepSpec {
  purpose?: string;
  states?: readonly string[];
  fields?: readonly ExportFieldSpec[];
  actions?: readonly ExportActionSpec[];
  back?: string;
  edgeCases?: readonly string[];
  acceptance?: readonly string[];
}

export interface FlowExportStep {
  title: string;
  description: string;
  spec?: ExportStepSpec;
}

export interface CapturedFlowStep extends FlowExportStep {
  pngBase64: string;
}

/** Flow-level structured spec rendered as front-matter tables. */
export interface ExportOverview {
  purpose?: string;
  businessAnalysis?: FlowBusinessAnalysisSpec;
  /** Mirrors FlowDefinition.specLayout; decides what follows a BA document. */
  specLayout?: "document-only" | "document-and-screens";
  entryPoints?: readonly { label: string; intent: string }[];
  preconditions?: readonly string[];
  businessRules?: readonly string[];
  signing?: string;
  successDestinations?: readonly string[];
  analyticsEvents?: readonly string[];
  openQuestions?: readonly string[];
}

export interface FlowExportMeta {
  flowTitle: string;
  flowLabel: string;
  scenarioLabel: string;
  scenarioDescription: string;
  countryScope: string;
  figmaFile: string;
  sourceUrl: string;
  status?: string;
  domain?: string;
}

export interface FlowExportSpecItem {
  title: string;
  body: string;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read captured screen"));
    reader.readAsDataURL(blob);
  });
}

/**
 * Capture the already-rendered journey step screens (in DOM order) as PNGs.
 * `stepElements[i]` must be the capture root of `steps[i]`. Any structured spec on
 * a step is carried through to the captured result.
 */
export async function captureFlowStepImages(
  stepElements: readonly HTMLElement[],
  steps: readonly FlowExportStep[],
): Promise<CapturedFlowStep[]> {
  const captured: CapturedFlowStep[] = [];
  for (let index = 0; index < steps.length; index += 1) {
    const element = stepElements[index];
    const step = steps[index];
    if (!element || !step) continue;
    const { blob } = await createPhoneScreenshotBlob({ screenElement: element, mode: "visible" });
    captured.push({ ...step, pngBase64: await blobToBase64(blob) });
  }
  return captured;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function paragraphs(value: string): string {
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${escapeHtml(part.trim()).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function bulletList(items: readonly string[]): string {
  if (items.length === 0) return "";
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function keyValueTable(rows: readonly { label: string; value: string }[]): string {
  const body = rows
    .filter((row) => row.value)
    .map((row) => `<tr><td class="k">${escapeHtml(row.label)}</td><td>${escapeHtml(row.value)}</td></tr>`)
    .join("");
  return body ? `<table class="spec-table">${body}</table>` : "";
}

function fieldsTable(fields: readonly ExportFieldSpec[]): string {
  if (fields.length === 0) return "";
  const head = `<tr><th>Field</th><th>Type</th><th>Required</th><th>Validation</th></tr>`;
  const rows = fields
    .map(
      (field) =>
        `<tr><td>${escapeHtml(field.name)}</td><td>${escapeHtml(field.type)}</td><td>${
          field.required ? "Yes" : "No"
        }</td><td>${escapeHtml([field.validation, field.notes].filter(Boolean).join(" — ") || "—")}</td></tr>`,
    )
    .join("");
  return `<table class="spec-table"><thead>${head}</thead><tbody>${rows}</tbody></table>`;
}

function actionsTable(actions: readonly ExportActionSpec[]): string {
  if (actions.length === 0) return "";
  const head = `<tr><th>Action</th><th>Result</th></tr>`;
  const rows = actions
    .map((action) => `<tr><td>${escapeHtml(action.label)}</td><td>${escapeHtml(action.result)}</td></tr>`)
    .join("");
  return `<table class="spec-table"><thead>${head}</thead><tbody>${rows}</tbody></table>`;
}

function stepSpecHtml(spec: ExportStepSpec | undefined): string {
  if (!spec) return "";
  const parts: string[] = [];
  if (spec.purpose) parts.push(`<p class="spec-purpose">${escapeHtml(spec.purpose)}</p>`);
  if (spec.states?.length) parts.push(`<h4>UI states</h4>${bulletList(spec.states)}`);
  if (spec.fields?.length) parts.push(`<h4>Fields</h4>${fieldsTable(spec.fields)}`);
  if (spec.actions?.length) parts.push(`<h4>Actions</h4>${actionsTable(spec.actions)}`);
  if (spec.back) parts.push(`<h4>Back behavior</h4><p>${escapeHtml(spec.back)}</p>`);
  if (spec.edgeCases?.length) parts.push(`<h4>Edge cases</h4>${bulletList(spec.edgeCases)}`);
  if (spec.acceptance?.length) parts.push(`<h4>Acceptance criteria</h4>${bulletList(spec.acceptance)}`);
  return parts.length ? `<div class="step-spec">${parts.join("")}</div>` : "";
}

function businessAnalysisHtml(analysis: FlowBusinessAnalysisSpec): string {
  const sections = [
    `<h3>General information</h3>${keyValueTable(analysis.generalInformation)}`,
    `<h3>Version history</h3>${keyValueTable(analysis.versionHistory.map((entry) => ({ label: `${entry.version} · ${entry.date}`, value: entry.detail })) )}`,
    `<h3>Version &amp; change context</h3><p>${escapeHtml(analysis.versionContext)}</p>`,
    `<h3>Open issues</h3>${bulletList(analysis.openIssues.map((issue) => `${issue.reference} [${issue.status}] ${issue.title}. ${issue.detail}`))}`,
    analysisSectionsHtml("Requirement", analysis.requirements),
    analysisSectionsHtml("Current status", analysis.currentStatus),
    analysisSectionsHtml("Proposed solution", analysis.proposedSolution),
    analysisSectionsHtml("Non-functional requirements", analysis.nonFunctionalRequirements),
  ];
  return `<section class="step"><h2>Business analysis specification</h2>${sections.join("")}</section>`;
}

function analysisSectionsHtml(title: string, sections: FlowBusinessAnalysisSpec['requirements']): string {
  return `<h3>${escapeHtml(title)}</h3>${sections
    .map(
      (section) =>
        `<h4>${escapeHtml(section.title)}</h4>${section.description ? `<p>${escapeHtml(section.description)}</p>` : ""}${bulletList(section.items)}`,
    )
    .join("")}`;
}

function overviewHtml(overview: ExportOverview | undefined): string {
  if (!overview) return "";
  // A BA document is the whole export unless the flow asks for both: then the
  // document carries the business case, and the rules, signing, analytics and
  // open questions that follow it are what delivery works from.
  if (overview.businessAnalysis && overview.specLayout !== "document-and-screens") {
    return businessAnalysisHtml(overview.businessAnalysis);
  }
  const analysis = overview.businessAnalysis ? businessAnalysisHtml(overview.businessAnalysis) : "";
  const sections: string[] = [];
  if (overview.purpose) sections.push(`<h3>Purpose</h3><p>${escapeHtml(overview.purpose)}</p>`);
  if (overview.entryPoints?.length) {
    sections.push(
      `<h3>Entry points</h3>${keyValueTable(
        overview.entryPoints.map((entry) => ({ label: entry.label, value: entry.intent })),
      )}`,
    );
  }
  if (overview.preconditions?.length) sections.push(`<h3>Preconditions</h3>${bulletList(overview.preconditions)}`);
  if (overview.businessRules?.length) sections.push(`<h3>Business rules</h3>${bulletList(overview.businessRules)}`);
  if (overview.signing) sections.push(`<h3>Signing</h3><p>${escapeHtml(overview.signing)}</p>`);
  if (overview.successDestinations?.length)
    sections.push(`<h3>Success destinations</h3>${bulletList(overview.successDestinations)}`);
  if (overview.analyticsEvents?.length) sections.push(`<h3>Analytics events</h3>${bulletList(overview.analyticsEvents)}`);
  if (overview.openQuestions?.length) sections.push(`<h3>Open questions</h3>${bulletList(overview.openQuestions)}`);
  const flowSpec = sections.length
    ? `<section class="step"><h2>Flow specification</h2>${sections.join("")}</section>`
    : "";
  return `${analysis}${flowSpec}`;
}

/**
 * The shared export document. `imageSrc(index)` decides how step images are
 * referenced: a data URL for the print/PDF tab, a part location for Word MHTML.
 */
export function buildFlowDocumentHtml(
  meta: FlowExportMeta,
  steps: readonly CapturedFlowStep[],
  spec: readonly FlowExportSpecItem[],
  imageSrc: (index: number) => string,
  options: { autoPrint: boolean },
  overview?: ExportOverview,
): string {
  const generatedOn = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const stepsHtml = steps
    .map(
      (step, index) => `
    <section class="step">
      <p class="kicker">Step ${index + 1} of ${steps.length}</p>
      <h2>${escapeHtml(step.title)}</h2>
      <p class="description">${escapeHtml(step.description)}</p>
      <img src="${imageSrc(index)}" alt="${escapeHtml(step.title)}" width="300" />
      ${stepSpecHtml(step.spec)}
    </section>`,
    )
    .join("\n");

  const specHtml =
    spec.length > 0
      ? `
    <section class="step">
      <h2>UX specification</h2>
      ${spec.map((item) => `<h3>${escapeHtml(item.title)}</h3>${paragraphs(item.body)}`).join("\n")}
    </section>`
      : "";

  const autoPrintScript = options.autoPrint
    ? `<script>window.addEventListener("load", function () { setTimeout(function () { window.print(); }, 400); });</script>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(meta.flowTitle)} — ${escapeHtml(meta.scenarioLabel)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  body { font-family: "Segoe UI", Arial, sans-serif; color: #262626; margin: 24px; }
  .kicker { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #666666; margin: 0 0 4px; }
  h1 { font-size: 26px; margin: 6px 0 10px; }
  h2 { font-size: 18px; margin: 0 0 8px; }
  h3 { font-size: 14px; margin: 14px 0 4px; }
  h4 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: #454545; margin: 12px 0 4px; }
  p { font-size: 12px; line-height: 1.55; margin: 0 0 8px; }
  ul { font-size: 12px; line-height: 1.55; margin: 0 0 8px; padding-left: 18px; }
  .description { color: #454545; max-width: 460px; }
  .spec-purpose { color: #454545; }
  .meta-table { margin-top: 14px; border-collapse: collapse; }
  .meta-table td { font-size: 12px; padding: 3px 14px 3px 0; vertical-align: top; }
  .meta-table td.label { color: #666666; text-transform: uppercase; font-size: 10px; letter-spacing: 0.06em; padding-top: 5px; }
  .spec-table { border-collapse: collapse; width: 100%; max-width: 520px; margin: 4px 0 10px; }
  .spec-table th, .spec-table td { border: 1px solid #d8d8d8; font-size: 11px; line-height: 1.45; padding: 5px 8px; text-align: left; vertical-align: top; }
  .spec-table th { background: #f5f5f5; text-transform: uppercase; letter-spacing: 0.04em; font-size: 10px; }
  .spec-table td.k { color: #666666; width: 34%; }
  .step { page-break-before: always; padding-top: 8px; }
  .step-spec { margin-top: 10px; }
  img { border: 1px solid #d8d8d8; }
  .print-hint { background: #f5f5f5; padding: 8px 10px; font-size: 11px; color: #454545; margin-top: 18px; }
  @media print { .print-hint { display: none; } }
</style>
${autoPrintScript}
</head>
<body>
  <section class="cover">
    <p class="kicker">UniCredit Mobile Banking CEE — Flow export</p>
    <h1>${escapeHtml(meta.flowTitle)}</h1>
    <p class="description">${escapeHtml(meta.scenarioDescription)}</p>
    <table class="meta-table">
      <tr><td class="label">Flow</td><td>${escapeHtml(meta.flowLabel)}</td></tr>
      <tr><td class="label">Scenario</td><td>${escapeHtml(meta.scenarioLabel)}</td></tr>
      ${meta.domain ? `<tr><td class="label">Domain</td><td>${escapeHtml(meta.domain)}</td></tr>` : ""}
      ${meta.status ? `<tr><td class="label">Status</td><td>${escapeHtml(meta.status)}</td></tr>` : ""}
      <tr><td class="label">Countries</td><td>${escapeHtml(meta.countryScope)}</td></tr>
      <tr><td class="label">Figma</td><td>${escapeHtml(meta.figmaFile)}</td></tr>
      <tr><td class="label">Source</td><td>${escapeHtml(meta.sourceUrl)}</td></tr>
      <tr><td class="label">Steps</td><td>${steps.length}</td></tr>
      <tr><td class="label">Generated</td><td>${escapeHtml(generatedOn)}</td></tr>
    </table>
    ${options.autoPrint ? `<p class="print-hint">Choose “Save as PDF” in the print dialog. If the dialog did not open automatically, press Ctrl+P.</p>` : ""}
  </section>
${overviewHtml(overview)}
${stepsHtml}
${specHtml}
</body>
</html>`;
}

function utf8ToBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function chunkBase64(base64: string): string {
  return base64.replace(/(.{76})/g, "$1\r\n");
}

/** Word-compatible MHTML container with the HTML part and one PNG part per step. */
export function buildFlowWordFile(html: string, steps: readonly CapturedFlowStep[]): string {
  const boundary = "----=_NextPart_MOBILE_CEE_FLOW";
  const parts: string[] = [
    `MIME-Version: 1.0\r\nContent-Type: multipart/related; boundary="${boundary}"; type="text/html"\r\n\r\n`,
    `--${boundary}\r\nContent-Type: text/html; charset="utf-8"\r\nContent-Transfer-Encoding: base64\r\nContent-Location: flow.html\r\n\r\n${chunkBase64(utf8ToBase64(html))}\r\n\r\n`,
  ];
  steps.forEach((step, index) => {
    parts.push(
      `--${boundary}\r\nContent-Type: image/png\r\nContent-Transfer-Encoding: base64\r\nContent-Location: step-${index + 1}.png\r\n\r\n${chunkBase64(step.pngBase64)}\r\n\r\n`,
    );
  });
  parts.push(`--${boundary}--\r\n`);
  return parts.join("");
}

/** Open the print-ready document in a new tab; the user saves it as PDF. */
export function exportFlowAsPdf(
  meta: FlowExportMeta,
  steps: readonly CapturedFlowStep[],
  spec: readonly FlowExportSpecItem[],
  overview?: ExportOverview,
): void {
  const html = buildFlowDocumentHtml(
    meta,
    steps,
    spec,
    (index) => `data:image/png;base64,${steps[index]?.pngBase64 ?? ""}`,
    { autoPrint: true },
    overview,
  );
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const printWindow = window.open(url, "_blank");
  if (!printWindow) {
    URL.revokeObjectURL(url);
    throw new Error("The browser blocked the export tab. Allow pop-ups for this site and retry.");
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
}

/** Download the flow as a Word-compatible `.doc` file. */
export function exportFlowAsWord(
  meta: FlowExportMeta,
  steps: readonly CapturedFlowStep[],
  spec: readonly FlowExportSpecItem[],
  filename: string,
  overview?: ExportOverview,
): void {
  const html = buildFlowDocumentHtml(
    meta,
    steps,
    spec,
    (index) => `step-${index + 1}.png`,
    { autoPrint: false },
    overview,
  );
  const blob = new Blob([buildFlowWordFile(html, steps)], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
