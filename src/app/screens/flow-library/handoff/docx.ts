/**
 * Flow handoff — real OOXML `.docx`.
 *
 * Built for one job: Confluence Data Center's "Import Word Document". That
 * importer maps Word heading styles onto page headings and — the reason this
 * route exists at all — uploads embedded images as page attachments, which a
 * clipboard paste can never do.
 *
 * Everything is emitted by hand (no packaging library; adding one needs separate
 * approval here), so the part list is deliberately the minimum Word will open:
 * content types, package rels, styles, numbering, the document, its rels, media.
 */

import type { DocBlock, FlowDocument } from "./documentModel";
import { base64ToBytes, createZip, type ZipEntry } from "./zip";

/** English Metric Units per pixel at 96 DPI — the unit Word sizes drawings in. */
const EMU_PER_PIXEL = 9525;
/** Screens are rendered at a readable, page-safe width rather than capture size. */
const IMAGE_WIDTH_PX = 280;

/**
 * XML 1.0 cannot represent control characters, and Word refuses a file that
 * holds them. Tab, newline and carriage return are the legal exceptions.
 */
function stripControlChars(value: string): string {
  let result = "";
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code === 9 || code === 10 || code === 13 || code >= 32) result += char;
  }
  return result;
}

function escapeXml(value: string): string {
  return stripControlChars(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Read intrinsic size from a PNG IHDR chunk, so screens keep their aspect ratio. */
function readPngSize(bytes: Uint8Array): { width: number; height: number } {
  if (bytes.length < 24) return { width: IMAGE_WIDTH_PX, height: IMAGE_WIDTH_PX * 2 };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

/** Split on newlines so a multi-line value keeps its breaks inside one paragraph. */
function runs(text: string): string {
  return text
    .split("\n")
    .map((line, index) => `${index > 0 ? "<w:br/>" : ""}<w:t xml:space="preserve">${escapeXml(line)}</w:t>`)
    .join("");
}

function paragraph(text: string, styleId?: string): string {
  const properties = styleId ? `<w:pPr><w:pStyle w:val="${styleId}"/></w:pPr>` : "";
  return `<w:p>${properties}<w:r>${runs(text)}</w:r></w:p>`;
}

function bulletParagraph(text: string): string {
  return `<w:p><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr><w:r>${runs(
    text,
  )}</w:r></w:p>`;
}

function tableCell(text: string, header: boolean): string {
  const shading = header ? '<w:shd w:val="clear" w:fill="F0F1F2"/>' : "";
  const bold = header ? "<w:rPr><w:b/></w:rPr>" : "";
  return `<w:tc><w:tcPr>${shading}</w:tcPr><w:p><w:r>${bold}${runs(text)}</w:r></w:p></w:tc>`;
}

function table(block: Extract<DocBlock, { kind: "table" }>): string {
  const borders = ["top", "left", "bottom", "right", "insideH", "insideV"]
    .map((side) => `<w:${side} w:val="single" w:sz="4" w:space="0" w:color="D8D8D8"/>`)
    .join("");
  const properties = `<w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>${borders}</w:tblBorders></w:tblPr>`;
  // Word treats a table without a grid as malformed, so declare even columns.
  const columns = Math.max(block.head?.length ?? 0, ...block.rows.map((row) => row.length), 1);
  const grid = `<w:tblGrid>${`<w:gridCol w:w="${Math.floor(9638 / columns)}"/>`.repeat(columns)}</w:tblGrid>`;
  const head = block.head
    ? `<w:tr><w:trPr><w:tblHeader/></w:trPr>${block.head.map((cell) => tableCell(cell, true)).join("")}</w:tr>`
    : "";
  const body = block.rows
    .map((row) => `<w:tr>${row.map((cell) => tableCell(cell, false)).join("")}</w:tr>`)
    .join("");
  // Word collapses a table that touches the next block; an empty paragraph separates them.
  return `<w:tbl>${properties}${grid}${head}${body}</w:tbl><w:p/>`;
}

function drawing(relationshipId: string, docPrId: number, alt: string, widthPx: number, heightPx: number): string {
  const width = Math.round(IMAGE_WIDTH_PX * EMU_PER_PIXEL);
  const height = Math.round((heightPx / Math.max(1, widthPx)) * IMAGE_WIDTH_PX * EMU_PER_PIXEL);
  const name = escapeXml(alt);
  return `<w:p><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0">
<wp:extent cx="${width}" cy="${height}"/><wp:docPr id="${docPrId}" name="Picture ${docPrId}" descr="${name}"/>
<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
<pic:nvPicPr><pic:cNvPr id="${docPrId}" name="${name}"/><pic:cNvPicPr/></pic:nvPicPr>
<pic:blipFill><a:blip r:embed="${relationshipId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${width}" cy="${height}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
}

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Default Extension="png" ContentType="image/png"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>`;

const PACKAGE_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

/**
 * Heading styles carry the whole import: Confluence reads `Heading1`..`Heading4`
 * and nothing else to decide the page outline.
 */
const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="120"/></w:pPr><w:rPr><w:b/><w:sz w:val="52"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:rPr><w:color w:val="5A5A5A"/><w:sz w:val="24"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:outlineLvl w:val="0"/><w:spacing w:before="360" w:after="120"/></w:pPr><w:rPr><w:b/><w:sz w:val="36"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:outlineLvl w:val="1"/><w:spacing w:before="280" w:after="100"/></w:pPr><w:rPr><w:b/><w:sz w:val="30"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:pPr><w:outlineLvl w:val="2"/><w:spacing w:before="240" w:after="80"/></w:pPr><w:rPr><w:b/><w:sz w:val="26"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading4"><w:name w:val="heading 4"/><w:basedOn w:val="Normal"/><w:pPr><w:outlineLvl w:val="3"/><w:spacing w:before="200" w:after="80"/></w:pPr><w:rPr><w:b/><w:sz w:val="23"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:pPr><w:contextualSpacing/></w:pPr></w:style>
</w:styles>`;

const NUMBERING = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:abstractNum w:abstractNumId="0"><w:multiLevelType w:val="hybridMultilevel"/>
<w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="&#8226;"/><w:lvlJc w:val="left"/>
<w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr><w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol" w:hint="default"/></w:rPr></w:lvl>
</w:abstractNum>
<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
</w:numbering>`;

/** Render the shared document model as a `.docx` blob. */
export function buildFlowDocx(document: FlowDocument): Blob {
  const media: ZipEntry[] = [];
  const imageRels: string[] = [];
  const body: string[] = [];

  body.push(paragraph(document.title, "Title"));
  if (document.subtitle) body.push(paragraph(document.subtitle, "Subtitle"));

  for (const block of document.blocks) {
    switch (block.kind) {
      case "heading":
        body.push(paragraph(block.text, `Heading${block.level}`));
        break;
      case "paragraph":
        body.push(paragraph(block.text));
        break;
      case "bullets":
        for (const item of block.items) body.push(bulletParagraph(item));
        break;
      case "table":
        body.push(table(block));
        break;
      case "image": {
        const index = media.length + 1;
        const bytes = base64ToBytes(block.base64);
        const { width, height } = readPngSize(bytes);
        const relationshipId = `rIdImg${index}`;
        media.push({ name: `word/media/screen-${index}.png`, data: bytes });
        imageRels.push(
          `<Relationship Id="${relationshipId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/screen-${index}.png"/>`,
        );
        body.push(drawing(relationshipId, index, block.alt, width, height));
        break;
      }
    }
  }

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
<w:body>${body.join("")}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body>
</w:document>`;

  const documentRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
<Relationship Id="rIdNumbering" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
${imageRels.join("\n")}
</Relationships>`;

  const encoder = new TextEncoder();
  const text = (name: string, content: string): ZipEntry => ({ name, data: encoder.encode(content) });

  const zip = createZip([
    text("[Content_Types].xml", CONTENT_TYPES),
    text("_rels/.rels", PACKAGE_RELS),
    text("word/document.xml", documentXml),
    text("word/_rels/document.xml.rels", documentRels),
    text("word/styles.xml", STYLES),
    text("word/numbering.xml", NUMBERING),
    ...media,
  ]);

  return new Blob([zip], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
