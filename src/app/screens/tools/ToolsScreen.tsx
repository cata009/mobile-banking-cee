/**
 * Stakeholder Tools surface.
 *
 * Full-width platform screen (like the Design System and Flow Library tabs)
 * hosting internal tools for QA, business, analysts and design: side-by-side
 * country comparison, component translation tester and translation review.
 */

import { useState } from "react";
import { AppIcon, type IconName } from "@/app/components/icons";
import { ToolErrorBoundary } from "./toolsUi";
import { SideBySideTool } from "./SideBySideTool";
import { TranslationTesterTool } from "./TranslationTesterTool";
import { TranslationReviewTool } from "./TranslationReviewTool";

type ToolId = "side-by-side" | "translation-tester" | "translation-review";

interface ToolMeta {
  id: ToolId;
  label: string;
  icon: IconName;
  description: string;
  audience: string;
}

const TOOLS: readonly ToolMeta[] = [
  {
    id: "side-by-side",
    label: "Side-by-side countries",
    icon: "grid-2x2",
    description:
      "Render the same screen for 2–3 countries as live app frames in parallel and compare the CEE differences directly.",
    audience: "Business · Management · BA",
  },
  {
    id: "translation-tester",
    label: "Component translation tester",
    icon: "clipboard-check",
    description:
      "Stress a design-system component with custom copy or with the real translations of all 14 languages, with overflow detection.",
    audience: "Design · QA",
  },
  {
    id: "translation-review",
    label: "Translation review table",
    icon: "book-open",
    description:
      "Every string of a translation namespace across all languages, with overflow-risk highlighting and CSV export.",
    audience: "BA · Local market teams",
  },
];

export default function ToolsScreen() {
  const [activeToolId, setActiveToolId] = useState<ToolId | null>(null);
  const activeTool = TOOLS.find((tool) => tool.id === activeToolId) ?? null;

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-[var(--uc-app-bg)]" data-tools-screen="true">
      <div className="mx-auto w-full max-w-[1500px] px-[24px] py-[28px] lg:px-[40px]">
        {activeTool ? (
          <header>
            <button
              type="button"
              onClick={() => setActiveToolId(null)}
              className="mb-[16px] inline-flex items-center gap-[6px] text-[13px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)] transition-colors hover:text-[var(--uc-action)]"
              aria-label="Back to Tools overview"
            >
              <AppIcon name="back-heavy" size={16} color="currentColor" />
              Back to overview
            </button>
            <h1 className="text-[24px] font-bold leading-[30px] tracking-[0] text-[var(--uc-text)]">
              {activeTool.label}
            </h1>
            <p className="mt-[6px] max-w-[860px] text-[14px] leading-[20px] text-[var(--uc-text-muted)]">
              {activeTool.description}
            </p>
          </header>
        ) : (
          <header>
            <h1 className="text-[24px] font-bold leading-[30px] tracking-[0] text-[var(--uc-text)]">Tools</h1>
            <p className="mt-[6px] max-w-[860px] text-[14px] leading-[20px] text-[var(--uc-text-muted)]">
              Internal utilities for the project stakeholders — QA, business, product owners, analysts and design.
              They read the live registries, screens and translations, so they always reflect the current build.
            </p>
          </header>
        )}

        {activeToolId === null ? (
          <div className="mt-[20px] grid gap-[16px] md:grid-cols-2 xl:grid-cols-3">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveToolId(tool.id)}
                data-tool-card={tool.id}
                className="group rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[20px] text-left shadow-sm transition-colors hover:border-[var(--uc-action)]"
              >
                  <div className="flex items-start justify-between gap-[12px]">
                    <span className="grid size-[40px] shrink-0 place-items-center rounded-[8px] bg-[var(--uc-surface-muted)] text-[var(--uc-text)] transition-colors group-hover:text-[var(--uc-action)]">
                      <AppIcon name={tool.icon} size={20} color="currentColor" />
                    </span>
                    <span className="mt-[10px] text-[var(--uc-text-muted)] transition-colors group-hover:text-[var(--uc-action)]">
                      <AppIcon name="arrow-right" size={18} color="currentColor" />
                    </span>
                  </div>
                  <h2 className="mt-[14px] text-[16px] font-bold leading-[21px] text-[var(--uc-text)]">{tool.label}</h2>
                  <p className="mt-[6px] text-[13px] leading-[18px] text-[var(--uc-text-muted)]">{tool.description}</p>
                  <p className="mt-[12px] text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
                    {tool.audience}
                  </p>
                </button>
              ))}
          </div>
        ) : (
          <div className="mt-[20px]">
            <ToolErrorBoundary key={activeToolId} toolLabel={activeTool?.label ?? "Tool"}>
              {activeToolId === "side-by-side" ? (
                <SideBySideTool />
              ) : activeToolId === "translation-tester" ? (
                <TranslationTesterTool />
              ) : (
                <TranslationReviewTool />
              )}
            </ToolErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
}
