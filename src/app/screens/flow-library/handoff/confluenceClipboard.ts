/**
 * Flow handoff — one paste into Confluence.
 *
 * The clipboard carries two flavors of the same document:
 *
 *   `text/html`  — the primary route. Confluence's editor converts pasted rich
 *                  HTML into native storage format, so headings stay headings and
 *                  tables stay tables, editable in place.
 *   `text/plain` — Confluence wiki markup, not Markdown. On Data Center this is
 *                  the useful fallback: paste it through Insert > Markup >
 *                  Confluence Wiki and the same structure comes back.
 *
 * Screens are deliberately absent. Data Center resolves images to page
 * attachments, and no clipboard flavor can create one — that is what the `.docx`
 * import route is for.
 */

import type { DocBlock, FlowDocument } from "./documentModel";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(value: string): string {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

function blockToHtml(block: DocBlock): string {
  switch (block.kind) {
    case "heading":
      return `<h${block.level}>${inline(block.text)}</h${block.level}>`;
    case "paragraph":
      return `<p>${inline(block.text)}</p>`;
    case "bullets":
      return `<ul>${block.items.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`;
    case "table": {
      const head = block.head
        ? `<thead><tr>${block.head.map((cell) => `<th>${inline(cell)}</th>`).join("")}</tr></thead>`
        : "";
      const body = block.rows
        .map((row) => `<tr>${row.map((cell) => `<td>${inline(cell)}</td>`).join("")}</tr>`)
        .join("");
      return `<table><tbody>${head}${body}</tbody></table>`;
    }
    case "image":
      // Unreachable for the clipboard document; kept so the switch stays total.
      return "";
  }
}

/**
 * Bare, class-free HTML. Confluence's paste handler maps plain tags onto storage
 * format cleanly; styling attributes only survive as noise a reviewer must undo.
 */
export function buildConfluenceHtml(document: FlowDocument): string {
  const body = [
    `<h1>${inline(document.title)}</h1>`,
    document.subtitle ? `<p>${inline(document.subtitle)}</p>` : "",
    ...document.blocks.filter((block) => block.kind !== "image").map(blockToHtml),
  ]
    .filter(Boolean)
    .join("\n");
  return `<meta charset="utf-8">\n${body}`;
}

/** Escape the characters Confluence wiki markup treats as formatting. */
function escapeWiki(value: string): string {
  return value.replace(/([{}[\]|])/g, "\\$1").replace(/\n/g, " ");
}

function blockToWiki(block: DocBlock): string {
  switch (block.kind) {
    case "heading":
      return `h${block.level}. ${escapeWiki(block.text)}\n`;
    case "paragraph":
      return `${escapeWiki(block.text)}\n`;
    case "bullets":
      return `${block.items.map((item) => `* ${escapeWiki(item)}`).join("\n")}\n`;
    case "table": {
      const head = block.head ? `||${block.head.map(escapeWiki).join("||")}||\n` : "";
      const rows = block.rows.map((row) => `|${row.map(escapeWiki).join("|")}|`).join("\n");
      return `${head}${rows}\n`;
    }
    case "image":
      return "";
  }
}

export function buildConfluenceWiki(document: FlowDocument): string {
  return [
    `h1. ${escapeWiki(document.title)}`,
    document.subtitle ? escapeWiki(document.subtitle) : "",
    ...document.blocks.filter((block) => block.kind !== "image").map(blockToWiki),
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Put both flavors on the clipboard. Falls back to a plain-text write where the
 * async clipboard API is unavailable or the page is not a secure context.
 */
export async function copyConfluenceDocument(document: FlowDocument): Promise<void> {
  const html = buildConfluenceHtml(document);
  const wiki = buildConfluenceWiki(document);

  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([wiki], { type: "text/plain" }),
        }),
      ]);
      return;
    } catch {
      // Fall through: some browsers reject multi-flavor writes without a gesture.
    }
  }

  try {
    if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
    await navigator.clipboard.writeText(wiki);
  } catch {
    throw new Error(
      "The browser blocked clipboard access for this page. Allow it in the address-bar site settings, or use the .docx export.",
    );
  }
}
