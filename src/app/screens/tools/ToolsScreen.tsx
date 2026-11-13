/**
 * Stakeholder Tools surface.
 *
 * Full-width platform screen (like the Design System and Flow Library tabs)
 * hosting internal tools for QA, business, analysts and design: side-by-side
 * country comparison, component translation tester and translation review.
 */

import { lazy, Suspense, useState } from "react";
import { AppIcon, type IconName } from "@/app/components/icons";
import { PlatformPageShell } from "@/app/components/platform/PlatformPage";
import { ToolErrorBoundary } from "./toolsUi";
import { SideBySideTool } from "./SideBySideTool";
import { TranslationTesterTool } from "./TranslationTesterTool";
import { TranslationReviewTool } from "./TranslationReviewTool";
import { CountryDivergenceTool } from "./CountryDivergenceTool";
import { PreloginPictureTesterTool } from "./PreloginPictureTesterTool";
import { VisualQaInspectorTool } from "./VisualQaInspectorTool";

const MarketingEmailBuilderTool = lazy(() => import('./MarketingEmailBuilderTool'));

type ToolId =
  | "visual-qa"
  | "marketing-email"
  | "prelogin-picture"
  | "side-by-side"
  | "country-divergence"
  | "translation-tester"
  | "translation-review";

interface ToolMeta {
  id: ToolId;
  label: string;
  icon: IconName;
  description: string;
  audience: string;
}

const TOOLS: readonly ToolMeta[] = [
  {
    id: "visual-qa",
    label: "Visual QA Inspector",
    icon: "eye",
    description: "Compare an interactive demo screen with an app screenshot, highlight visual differences and prepare a report.",
    audience: "QA · Design · Development",
  },
  {
    id: "marketing-email",
    label: "Marketing email builder",
    icon: "send",
    description: "Compose reusable email blocks, preview responsive light/dark HTML, validate content and download an editable campaign package.",
    audience: "Marketing · Design · Local market teams · QA",
  },
  {
    id: "prelogin-picture",
    label: "Prelogin picture tester",
    icon: "camera",
    description:
      "Simulate prelogin images and text, check readability across phone sizes, and download the finished crop with an implementation package.",
    audience: "Design · Local market teams · QA",
  },
  {
    id: "side-by-side",
    label: "Country comparison",
    icon: "repeat",
    description:
      "Render the same screen for 2–3 countries as live app frames in parallel and compare the CEE differences directly.",
    audience: "Business · Management · BA",
  },
  {
    id: "country-divergence",
    label: "Country divergence explorer",
    icon: "chart-bars",
    description:
      "A matrix of every dimension that differs across the 8 countries — currency, locale, capabilities and feature scope — against the majority or a reference country.",
    audience: "BA · Product owners",
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
    label: "Translation review",
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
    <PlatformPageShell data-tools-screen="true">
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
          <div className="grid gap-[16px] md:grid-cols-2 xl:grid-cols-3">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                type="button"
                onClick={() => setActiveToolId(tool.id)}
                data-tool-card={tool.id}
                className="group flex h-full flex-col items-stretch rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[20px] text-left shadow-sm transition-colors hover:border-[var(--uc-action)]"
              >
                  <div className="flex items-start justify-between gap-[12px]">
                    <span className="grid size-[44px] shrink-0 place-items-center rounded-[10px] border border-[color-mix(in_srgb,var(--uc-action)_14%,var(--uc-surface))] bg-[color-mix(in_srgb,var(--uc-action)_8%,var(--uc-surface))] text-[var(--uc-action)] transition-colors group-hover:bg-[color-mix(in_srgb,var(--uc-action)_14%,var(--uc-surface))]">
                      <AppIcon name={tool.icon} size={22} color="currentColor" />
                    </span>
                    <span className="mt-[10px] text-[var(--uc-text-muted)] transition-colors group-hover:text-[var(--uc-action)]">
                      <AppIcon name="arrow-right" size={18} color="currentColor" />
                    </span>
                  </div>
                  <h2 className="mt-[14px] text-[16px] font-bold leading-[21px] text-[var(--uc-text)]">{tool.label}</h2>
                  <p className="mt-[6px] text-[13px] leading-[18px] text-[var(--uc-text-muted)]">{tool.description}</p>
                  <p className="mt-auto pt-[12px] text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
                    {tool.audience}
                  </p>
                </button>
              ))}
          </div>
        ) : (
          <div>
            <ToolErrorBoundary key={activeToolId} toolLabel={activeTool?.label ?? "Tool"}>
              {activeToolId === "visual-qa" ? (
                <VisualQaInspectorTool />
              ) : activeToolId === "marketing-email" ? (
                <Suspense fallback={<p role="status">Se încarcă editorul de emailuri…</p>}><MarketingEmailBuilderTool /></Suspense>
              ) : activeToolId === "prelogin-picture" ? (
                <PreloginPictureTesterTool />
              ) : activeToolId === "side-by-side" ? (
                <SideBySideTool />
              ) : activeToolId === "country-divergence" ? (
                <CountryDivergenceTool />
              ) : activeToolId === "translation-tester" ? (
                <TranslationTesterTool />
              ) : (
                <TranslationReviewTool />
              )}
            </ToolErrorBoundary>
          </div>
        )}
    </PlatformPageShell>
  );
}
