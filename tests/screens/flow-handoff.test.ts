import { describe, expect, it } from "vitest";
import {
  buildConfluenceHtml,
  buildConfluenceWiki,
  buildFlowDocument,
  buildFlowDocx,
} from "@/app/screens/flow-library/handoff";
import type { CapturedFlowStep, ExportOverview, FlowExportMeta } from "@/app/screens/flow-library/flowExport";

const META: FlowExportMeta = {
  flowTitle: "Bulk approval of investment orders",
  flowLabel: "Investments bulk approval",
  scenarioLabel: "Approve every marked order",
  scenarioDescription: "Selecting pending drafts and authorizing them once.",
  countryScope: "RO, CZ",
  domain: "Investments",
  status: "in review",
  figmaFile: "Investments CEE",
  sourceUrl: "https://www.figma.com/design/example",
};

const OVERVIEW: ExportOverview = {
  purpose: "Approve several drafts with one authorization.",
  specLayout: "document-only",
  businessAnalysis: {
    generalInformation: [{ label: "Product", value: "Investments" }],
    versionContext: "Draft for review.",
    versionHistory: [{ version: "0.1", date: "2026-08-01", detail: "First draft" }],
    openIssues: [
      { reference: "OI-1", status: "Open", title: "Signing limit", detail: "Per-order or per-batch?" },
    ],
    requirements: [
      { title: "Selection", description: "What a customer may mark.", items: ["Only pending drafts"] },
    ],
    currentStatus: [{ title: "Today", items: ["One order at a time"] }],
    proposedSolution: [{ title: "Batch", items: ["One authorization for the batch"] }],
    nonFunctionalRequirements: [{ title: "Performance", items: ["Summary within 2s"] }],
  },
};

const STEPS: CapturedFlowStep[] = [
  {
    title: "Selection",
    description: "Pick the pending drafts.",
    // 1x1 transparent PNG — enough for the IHDR read and the media part.
    pngBase64:
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    spec: {
      purpose: "Mark what to approve.",
      fields: [{ name: "Order", type: "checkbox", required: true }],
      actions: [{ label: "Continue", result: "Opens the first order" }],
      edgeCases: ["No drafts available"],
    },
  },
];

function specDocument() {
  return buildFlowDocument(META, [], [], OVERVIEW, { includeScreens: false });
}

describe("flow handoff — document model", () => {
  it("keeps the specification sections and leaves screens out when they are not requested", () => {
    const document = specDocument();
    const headings = document.blocks
      .filter((block) => block.kind === "heading")
      .map((block) => (block.kind === "heading" ? block.text : ""));

    expect(document.title).toBe(META.flowTitle);
    expect(headings).toContain("Business analysis specification");
    expect(headings).toContain("Open issues");
    expect(headings).toContain("Non-functional requirements");
    expect(document.blocks.some((block) => block.kind === "image")).toBe(false);
  });

  it("adds the captured screens and their per-screen specs when asked", () => {
    const document = buildFlowDocument(META, STEPS, [], OVERVIEW, { includeScreens: true });
    const images = document.blocks.filter((block) => block.kind === "image");

    expect(images).toHaveLength(1);
    expect(
      document.blocks.some((block) => block.kind === "heading" && block.text === "1. Selection"),
    ).toBe(true);
    expect(document.blocks.some((block) => block.kind === "table" && block.head?.[0] === "Field")).toBe(true);
  });

  it("treats a BA document as the whole spec unless the flow asks for both", () => {
    const both = buildFlowDocument(META, [], [], { ...OVERVIEW, specLayout: "document-and-screens" }, {
      includeScreens: false,
    });
    const headings = (document: ReturnType<typeof buildFlowDocument>) =>
      document.blocks.flatMap((block) => (block.kind === "heading" ? [block.text] : []));

    expect(headings(specDocument())).not.toContain("Flow specification");
    expect(headings(both)).toContain("Flow specification");
  });
});

describe("flow handoff — Confluence clipboard", () => {
  it("emits class-free HTML with real headings and tables", () => {
    const html = buildConfluenceHtml(specDocument());

    expect(html).toContain("<h1>Bulk approval of investment orders</h1>");
    expect(html).toContain("<h2>Open issues</h2>");
    expect(html).toContain("<th>Ref</th>");
    expect(html).toContain("<li>Only pending drafts</li>");
    expect(html).not.toContain("class=");
    expect(html).not.toContain("style=");
  });

  it("escapes markup so a spec value cannot break the paste", () => {
    const html = buildConfluenceHtml(
      buildFlowDocument({ ...META, flowTitle: "A <b>bold</b> & risky title" }, [], [], undefined, {
        includeScreens: false,
      }),
    );

    expect(html).toContain("A &lt;b&gt;bold&lt;/b&gt; &amp; risky title");
  });

  it("offers wiki markup as the plain-text flavor for Data Center", () => {
    const wiki = buildConfluenceWiki(specDocument());

    expect(wiki).toContain("h1. Bulk approval of investment orders");
    expect(wiki).toContain("h2. Open issues");
    expect(wiki).toContain("||Ref||Status||Issue||Detail||");
    expect(wiki).toContain("* Only pending drafts");
  });
});

describe("flow handoff — docx", () => {
  async function readZip(blob: Blob) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const text = new TextDecoder("latin1").decode(bytes);
    return { bytes, text };
  }

  it("packages the parts Word and the Confluence importer require", async () => {
    const { bytes, text } = await readZip(
      buildFlowDocx(buildFlowDocument(META, STEPS, [], OVERVIEW, { includeScreens: true })),
    );

    // Local file header signature, then every part the importer resolves.
    expect(Array.from(bytes.slice(0, 4))).toEqual([0x50, 0x4b, 0x03, 0x04]);
    for (const part of [
      "[Content_Types].xml",
      "_rels/.rels",
      "word/document.xml",
      "word/_rels/document.xml.rels",
      "word/styles.xml",
      "word/numbering.xml",
      "word/media/screen-1.png",
    ]) {
      expect(text).toContain(part);
    }
    // End-of-central-directory signature closes the archive.
    expect(Array.from(bytes.slice(-22, -18))).toEqual([0x50, 0x4b, 0x05, 0x06]);
  });

  it("maps document headings onto the Word heading styles Confluence reads", async () => {
    const { text } = await readZip(buildFlowDocx(specDocument()));

    expect(text).toContain('w:pStyle w:val="Heading1"');
    expect(text).toContain('w:pStyle w:val="Heading2"');
    expect(text).toContain("<w:tbl>");
    expect(text).toContain('w:numId w:val="1"');
  });

  it("embeds each screen as a drawing bound to its image relationship", async () => {
    const { text } = await readZip(
      buildFlowDocx(buildFlowDocument(META, STEPS, [], OVERVIEW, { includeScreens: true })),
    );

    expect(text).toContain('r:embed="rIdImg1"');
    expect(text).toContain('Target="media/screen-1.png"');
  });
});
