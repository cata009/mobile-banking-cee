import { describe, expect, it } from "vitest";
import {
  buildFlowDocumentHtml,
  buildFlowWordFile,
  type CapturedFlowStep,
  type FlowExportMeta,
} from "@/app/screens/flow-library/flowExport";

const META: FlowExportMeta = {
  flowTitle: "Round Up",
  flowLabel: "RO Round Up",
  scenarioLabel: "Create & activate",
  scenarioDescription: "User activates Round Up with an existing savings account.",
  countryScope: "RO",
  figmaFile: "RO Enablers",
  sourceUrl: "https://www.figma.com/design/example",
};

const STEPS: CapturedFlowStep[] = [
  { title: "Home <entry>", description: 'Promo card with "Round Up"', pngBase64: "AAAABBBB" },
  { title: "Sign", description: "Standard signing screen", pngBase64: "CCCCDDDD" },
];

const SPEC = [{ title: "Purpose", body: "First paragraph.\n\nSecond paragraph." }];

describe("flow export document", () => {
  it("builds an escaped HTML document with one section per step and the UX spec", () => {
    const html = buildFlowDocumentHtml(META, STEPS, SPEC, (index) => `step-${index + 1}.png`, {
      autoPrint: false,
    });

    expect(html).toContain("Round Up");
    expect(html).toContain("Home &lt;entry&gt;");
    expect(html).toContain("Promo card with &quot;Round Up&quot;");
    expect(html).toContain('src="step-1.png"');
    expect(html).toContain('src="step-2.png"');
    expect(html).toContain("Step 2 of 2");
    expect(html).toContain("UX specification");
    expect(html).toContain("<p>Second paragraph.</p>");
    expect(html).not.toContain("window.print()");
  });

  it("adds the auto-print script only for the PDF variant", () => {
    const html = buildFlowDocumentHtml(META, STEPS, SPEC, () => "ignored.png", { autoPrint: true });
    expect(html).toContain("window.print()");
    expect(html).toContain("Save as PDF");
  });

  it("wraps the document as Word-compatible MHTML with one image part per step", () => {
    const html = buildFlowDocumentHtml(META, STEPS, SPEC, (index) => `step-${index + 1}.png`, {
      autoPrint: false,
    });
    const mhtml = buildFlowWordFile(html, STEPS);

    expect(mhtml).toContain('Content-Type: multipart/related; boundary="----=_NextPart_MOBILE_CEE_FLOW"');
    expect(mhtml).toContain("Content-Location: flow.html");
    expect(mhtml).toContain("Content-Location: step-1.png");
    expect(mhtml).toContain("Content-Location: step-2.png");
    expect(mhtml).toContain("AAAABBBB");
    expect(mhtml.trimEnd().endsWith("--")).toBe(true);
  });
});
