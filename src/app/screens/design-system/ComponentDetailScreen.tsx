/**
 * Component detail page.
 *
 * Reached from any Design System specimen card via "Details →". Shows the
 * component's live preview (View tab) and its source code in three languages
 * (Code tab: React / Swift / Kotlin).
 *
 * The Code tab is the primary value of this page — React is a real hand-curated
 * snippet from the component source; Swift and Kotlin are production-faithful
 * reference ports (this repo has no native codebase).
 */
import { useMemo, useState } from "react";
import { AppIcon } from "@/app/components/icons";
import CodeBlock, { type CodeLanguage } from "@/app/components/CodeBlock";
import { COMPONENT_REGISTRY, getComponentMeta } from "@/app/registry/componentRegistry";
import {
  COMPONENT_CODE_SAMPLES,
  resolveComponentCodeSample,
  type ComponentCodeSample,
} from "@/app/registry/componentCodeSamples";
import ThemeModeSegment from "@/app/components/ThemeModeSegment";
import ComponentImplementationPackage from "./ComponentImplementationPackage";
import { getComponentImplementationPackage } from "@/app/registry/componentImplementationPackages";
import { getComponentLivePreview } from "./componentLivePreviews";

type CodeSegment = "react" | "swift" | "kotlin";
type DetailTab = "view" | "code" | "package";

interface ComponentDetailScreenProps {
  componentId: string;
  variantId?: string;
  onVariantChange?: (variantId: string) => void;
  onBack: () => void;
}

const FILE_NAME_BY_SEGMENT: Record<CodeLanguage, (componentPath: string) => string> = {
  tsx: (path) => path.split("/").pop() ?? "Component.tsx",
  swift: () => "Component.swift",
  kotlin: () => "Component.kt",
};

export default function ComponentDetailScreen({
  componentId,
  variantId,
  onVariantChange,
  onBack,
}: ComponentDetailScreenProps) {
  const implementationPackage = getComponentImplementationPackage(componentId);
  const [tab, setTab] = useState<DetailTab>(() => implementationPackage ? "package" : "code");
  const [segment, setSegment] = useState<CodeSegment>("react");
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  const meta = getComponentMeta(componentId as keyof typeof COMPONENT_REGISTRY);
  const sample: ComponentCodeSample | undefined = COMPONENT_CODE_SAMPLES[componentId];

  const resolved = useMemo(
    () => resolveComponentCodeSample(sample, variantId),
    [sample, variantId],
  );

  const livePreview = useMemo(
    () => getComponentLivePreview(componentId, themeMode),
    [componentId, themeMode],
  );

  if (!meta) {
    return (
      <div className="px-6 py-10">
        <button
          type="button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-[6px] text-[13px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)] hover:text-[var(--uc-action)]"
        >
          <AppIcon name="back-heavy" size={16} color="currentColor" />
          Back to components
        </button>
        <p className="text-[14px] text-[var(--uc-text-muted)]">
          Unknown component: <code>{componentId}</code>
        </p>
      </div>
    );
  }

  const variantOptions = sample?.variants ? Object.keys(sample.variants) : [];
  const detailTabs: readonly DetailTab[] = implementationPackage ? ["view", "package"] : ["view", "code"];

  return (
    <div className="px-6 py-8 lg:px-10">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-[6px] text-[13px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)] hover:text-[var(--uc-action)]"
        aria-label="Back to components"
      >
        <AppIcon name="back-heavy" size={16} color="currentColor" />
        Back to components
      </button>

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] font-bold leading-[32px] text-[var(--uc-text)]">{meta.label}</h1>
          <p className="mt-2 font-mono text-[13px] text-[var(--uc-text-muted)]">{meta.componentPath}</p>
          {meta.notes ? (
            <p className="mt-3 max-w-[760px] text-[14px] leading-[20px] text-[var(--uc-text-muted)]">{meta.notes}</p>
          ) : null}
        </div>
        {variantOptions.length > 0 && onVariantChange ? (
          <label className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">Variant</span>
            <select
              aria-label="Variant"
              value={variantId ?? variantOptions[0]}
              onChange={(event) => onVariantChange(event.target.value)}
              className="uc-select h-[36px] min-w-[200px] rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] pl-3 text-[14px] text-[var(--uc-text)]"
            >
              {variantOptions.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </label>
        ) : null}
      </header>

      {/* View / Code toggle */}
      <div className="mt-6 inline-flex rounded-[10px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-[2px]">
        {detailTabs.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => setTab(entry)}
            className={`rounded-[8px] px-[16px] py-[6px] text-[13px] font-bold uppercase tracking-wide transition-colors ${
              tab === entry
                ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm"
                : "text-[var(--uc-text-muted)] hover:text-[var(--uc-text)]"
            }`}
          >
            {entry === "package" ? "Implementation package" : entry}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="mt-6">
        {tab === "view" ? (
          <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">
                Live preview
              </span>
              <ThemeModeSegment value={themeMode} onChange={setThemeMode} ariaLabel={`${meta.label} preview theme`} />
            </div>
            <div className={`${themeMode === "dark" ? "dark" : ""} ${themeMode === "dark" ? "bg-[var(--uc-static-black)]" : "bg-[var(--uc-app-bg)]"} rounded-[12px] p-5`}>
              {livePreview ? (
                <div className="mx-auto w-full max-w-[375px]">{livePreview}</div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-[14px] text-[var(--uc-text-muted)]">
                    No isolated live preview for this component yet.
                  </p>
                  <p className="mt-1 text-[13px] text-[var(--uc-text-muted)]">
                    See it in context in the Components tab.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : tab === "package" && implementationPackage && resolved ? (
          <ComponentImplementationPackage
            componentId={componentId}
            componentPath={meta.componentPath}
            code={resolved}
            data={implementationPackage}
          />
        ) : (
          <div>
            {/* Language segments */}
            <div className="mb-4 inline-flex rounded-[10px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-[2px]">
              {(["react", "swift", "kotlin"] as const).map((entry) => (
                <button
                  key={entry}
                  type="button"
                  onClick={() => setSegment(entry)}
                  className={`rounded-[8px] px-[16px] py-[6px] text-[13px] font-bold uppercase tracking-wide transition-colors ${
                    segment === entry
                      ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm"
                      : "text-[var(--uc-text-muted)] hover:text-[var(--uc-text)]"
                  }`}
                >
                  {entry === "react" ? "React" : entry === "swift" ? "Swift" : "Kotlin"}
                </button>
              ))}
            </div>

            {segment !== "react" ? (
              <p className="mb-3 text-[12px] text-[var(--uc-text-muted)]">
                Reference port — no native source exists in this repo. Adapt naming, theming
                and lifecycle to your native project conventions.
              </p>
            ) : null}

            {resolved ? (
              <CodeBlock
                code={resolved[segment]}
                language={segment === "react" ? "tsx" : segment}
                fileName={segment === "react" ? FILE_NAME_BY_SEGMENT.tsx(meta.componentPath) : FILE_NAME_BY_SEGMENT[segment](meta.componentPath)}
              />
            ) : (
              <div className="rounded-[8px] border border-dashed border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-10 text-center">
                <p className="text-[14px] font-bold text-[var(--uc-text)]">Code samples pending</p>
                <p className="mt-1 text-[13px] text-[var(--uc-text-muted)]">
                  This component&apos;s React/Swift/Kotlin samples have not been authored yet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
