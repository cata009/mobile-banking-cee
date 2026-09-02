/**
 * Flow handoff — the two routes a business analyst uses to move a specification
 * into Confluence without retyping it.
 *
 *   Copy for Confluence — one paste, text and tables, no file involved.
 *   Word (.docx)        — Confluence Data Center's "Import Word Document", the
 *                         only route that carries the screens across, because the
 *                         importer turns embedded images into page attachments.
 */

export { buildFlowDocument, type FlowDocument, type DocBlock, type HandoffOptions } from "./documentModel";
export { buildConfluenceHtml, buildConfluenceWiki, copyConfluenceDocument } from "./confluenceClipboard";
export { buildFlowDocx } from "./docx";

import type { FlowDocument } from "./documentModel";
import { buildFlowDocx } from "./docx";

/** Download the handoff document as a real `.docx`. */
export function downloadFlowDocx(document: FlowDocument, filename: string): void {
  const url = URL.createObjectURL(buildFlowDocx(document));
  const link = window.document.createElement("a");
  link.href = url;
  link.download = filename;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
