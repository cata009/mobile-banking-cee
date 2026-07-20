/**
 * Flow export helpers — PDF and Word, dependency-free by design (adding
 * packages requires separate approval in this repo).
 *
 * PDF: a print-formatted HTML document (cover, one page per step, UX spec
 * appendix) opens in a new tab and triggers the browser print dialog, where
 * stakeholders pick "Save as PDF".
 *
 * Word: the same document is wrapped in the MHTML container format that
 * Microsoft Word opens natively (`.doc`), with every captured step screen
 * embedded as a base64 image part.
 */

import { createPhoneScreenshotBlob } from "@/app/utils/phoneScreenshot";

export interface FlowExportStep {
  title: string;
  description: string;
}

export interface CapturedFlowStep extends FlowExportStep {
  pngBase64: string;
}

export interface FlowExportMeta {
  flowTitle: string;
  flowLabel: string;
  scenarioLabel: string;
  scenarioDescription: string;
  countryScope: string;
  figmaFile: string;
  sourceUrl: string;
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
 * `stepElements[i]` must be the capture root of `steps[i]`.
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
      <img src="${imageSrc(index)}" alt="${escapeHtml(step.title)}" width="320" />
    </section>`,
    )
    .join("\n");

  const specHtml =
    spec.length > 0
      ? `
    <section class="step">
      <h2>UX specification</h2>
      ${spec
        .map((item) => `<h3>${escapeHtml(item.title)}</h3>${paragraphs(item.body)}`)
        .join("\n")}
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
  p { font-size: 12px; line-height: 1.55; margin: 0 0 8px; }
  .description { color: #454545; max-width: 460px; }
  .meta-table { margin-top: 14px; border-collapse: collapse; }
  .meta-table td { font-size: 12px; padding: 3px 14px 3px 0; vertical-align: top; }
  .meta-table td.label { color: #666666; text-transform: uppercase; font-size: 10px; letter-spacing: 0.06em; padding-top: 5px; }
  .step { page-break-before: always; padding-top: 8px; }
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
      <tr><td class="label">Countries</td><td>${escapeHtml(meta.countryScope)}</td></tr>
      <tr><td class="label">Figma</td><td>${escapeHtml(meta.figmaFile)}</td></tr>
      <tr><td class="label">Source</td><td>${escapeHtml(meta.sourceUrl)}</td></tr>
      <tr><td class="label">Steps</td><td>${steps.length}</td></tr>
      <tr><td class="label">Generated</td><td>${escapeHtml(generatedOn)}</td></tr>
    </table>
    ${options.autoPrint ? `<p class="print-hint">Choose “Save as PDF” in the print dialog. If the dialog did not open automatically, press Ctrl+P.</p>` : ""}
  </section>
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
): void {
  const html = buildFlowDocumentHtml(
    meta,
    steps,
    spec,
    (index) => `data:image/png;base64,${steps[index]?.pngBase64 ?? ""}`,
    { autoPrint: true },
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
): void {
  const html = buildFlowDocumentHtml(meta, steps, spec, (index) => `step-${index + 1}.png`, {
    autoPrint: false,
  });
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
