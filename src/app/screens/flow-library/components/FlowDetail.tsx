import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppIcon } from "@/app/components/icons";
import { SelectionChip } from "@/app/screens/tools/toolsUi";
import { COUNTRY_META } from "@/app/registry/demoConfig";
import { createPhoneScreenshotBlob } from "@/app/utils/phoneScreenshot";
import MiniPhone from "./MiniPhone";
import { renderFlowPreview } from "./flowPreviews";
import { FlowNavProvider, type FlowNav } from "./prototypeNav";
import { resolveScenario } from "../flows";
import type {
  FlowBusinessAnalysisSpec,
  FlowDefinition,
  FlowPrototypeSpec,
  FlowScenario,
  FlowScreenKind,
  FlowScreenSpec,
  FlowStep,
} from "../flows/types";
import {
  captureFlowStepImages,
  exportFlowAsPdf,
  type ExportOverview,
  type FlowExportStep,
} from "../flowExport";
import { buildFlowDocument, copyConfluenceDocument, downloadFlowDocx } from "../handoff";

type DetailTab = "journey" | "spec" | "prototype";
/** How a reviewer takes the flow away: print, Confluence paste, or Word/import. */
type ExportKind = "pdf" | "confluence" | "word";
type JourneyView = "focused" | "filmstrip";

const TABS: Array<{ id: DetailTab; label: string }> = [
  { id: "journey", label: "Journey" },
  { id: "spec", label: "Specification" },
  { id: "prototype", label: "Prototype" },
];

const SCENARIO_TONE: Record<FlowScenario["kind"], { label: string; className: string }> = {
  happy: { label: "Happy path", className: "text-[var(--uc-green-status)]" },
  alternate: { label: "Alternate", className: "text-[var(--uc-action)]" },
  error: { label: "Error path", className: "text-[var(--uc-red-main)]" },
};

function toExportOverview(flow: FlowDefinition): ExportOverview {
  const { overview } = flow;
  return {
    purpose: overview.purpose,
    businessAnalysis: overview.businessAnalysis,
    specLayout: flow.specLayout,
    entryPoints: overview.entryPoints,
    preconditions: overview.preconditions,
    businessRules: overview.businessRules,
    signing: overview.signing,
    successDestinations: overview.successDestinations,
    analyticsEvents: overview.analyticsEvents,
    openQuestions: overview.openQuestions,
  };
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function FlowDetail({
  flow,
  onBackToIndex,
}: {
  flow: FlowDefinition;
  onBackToIndex: () => void;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>("journey");
  const tabsRef = useRef<HTMLDivElement>(null);
  const [requestedScenarioId, setRequestedScenarioId] = useState(flow.defaultScenarioId);
  const [stepIndex, setStepIndex] = useState(0);
  const [journeyView, setJourneyView] = useState<JourneyView>("focused");
  const [exportKind, setExportKind] = useState<ExportKind | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const { scenario } = resolveScenario(flow, requestedScenarioId);
  const steps = scenario.steps;
  const safeStepIndex = Math.min(stepIndex, Math.max(0, steps.length - 1));
  const activeStep = steps[safeStepIndex];
  const firstCountry = flow.countryScope[0];
  const countryName = (firstCountry ? COUNTRY_META[firstCountry]?.nameEN : undefined) ?? firstCountry ?? "";

  const selectScenario = (scenarioId: string) => {
    setRequestedScenarioId(scenarioId);
    setStepIndex(0);
  };

  const exportMeta = () => ({
    flowTitle: flow.title,
    flowLabel: flow.label,
    scenarioLabel: scenario.label,
    scenarioDescription: scenario.description,
    countryScope: flow.countryScope.join(", "),
    status: flow.status.replace(/-/g, " "),
    domain: flow.domain,
    figmaFile: flow.figmaFile,
    sourceUrl: flow.sourceUrl,
  });

  const handleExport = async (kind: ExportKind) => {
    if (exportKind) return;
    const container = captureRef.current;

    setExportKind(kind);
    setExportError(null);
    setCopied(false);
    try {
      const overview = toExportOverview(flow);

      // The clipboard route is text and tables only, so it skips the screen
      // capture entirely — the paste lands in Confluence in well under a second.
      if (kind === "confluence") {
        const document = buildFlowDocument(exportMeta(), [], flow.overview.notes, overview, {
          includeScreens: false,
        });
        await copyConfluenceDocument(document);
        setCopied(true);
        return;
      }

      if (!container) return;
      if (steps.length === 0) {
        setExportError("This scenario has no steps to export yet.");
        return;
      }
      const stepElements = Array.from(container.querySelectorAll<HTMLElement>("[data-flow-screen-capture]"));
      const exportSteps: FlowExportStep[] = steps.map((step) => ({
        title: step.title,
        description: step.description,
        spec: flow.screenSpecs[step.screen],
      }));
      const captured = await captureFlowStepImages(stepElements, exportSteps);
      if (captured.length === 0) {
        setExportError("Could not capture the scenario screens. Try again.");
        return;
      }

      const meta = exportMeta();
      if (kind === "pdf") {
        exportFlowAsPdf(meta, captured, flow.overview.notes, overview);
      } else {
        const document = buildFlowDocument(meta, captured, flow.overview.notes, overview, {
          includeScreens: true,
        });
        downloadFlowDocx(document, `flow-${slugify(flow.title)}-${slugify(scenario.label)}.docx`);
      }
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Export failed. Try again.");
    } finally {
      setExportKind(null);
    }
  };

  // Let the "Copied" confirmation fade on its own; a stuck badge reads as state.
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 6000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <div className="flex flex-col gap-[24px]">
      <button
        type="button"
        onClick={onBackToIndex}
        className="inline-flex w-fit items-center gap-[6px] uc-type-n5-strong text-[var(--uc-action)] hover:underline"
      >
        <AppIcon name="back-heavy" size={16} color="currentColor" />
        Flow library
      </button>

      <FlowHeader
        flow={flow}
        exportKind={exportKind}
        exportError={exportError}
        copied={copied}
        onExport={handleExport}
      />

      {/*
        Switching tabs keeps the tab strip where it already is. Without this the
        browser holds the old scroll offset against a panel of a different height,
        so the reader lands somewhere arbitrary in the new tab and has to hunt
        back up to the tabs to move again.
      */}
      <div ref={tabsRef} className="scroll-mt-[16px]">
        <DetailTabs
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            requestAnimationFrame(() => {
              const strip = tabsRef.current;
              if (!strip) return;
              if (strip.getBoundingClientRect().top < 0) strip.scrollIntoView({ block: "start" });
            });
          }}
          hasPrototype={Boolean(flow.prototype)}
        />
      </div>

      {activeTab === "journey" ? (
        <JourneyPanel
          flow={flow}
          scenario={scenario}
          activeStepIndex={safeStepIndex}
          journeyView={journeyView}
          countryName={countryName}
          onScenarioSelect={selectScenario}
          onStepSelect={setStepIndex}
          onJourneyViewChange={setJourneyView}
          onOpenSpec={(index) => {
            setStepIndex(index);
            setActiveTab("spec");
            requestAnimationFrame(() => tabsRef.current?.scrollIntoView({ block: "start" }));
          }}
        />
      ) : null}

      {activeTab === "spec" ? (
        <SpecPanel
          flow={flow}
          scenario={scenario}
          activeStep={activeStep}
          activeStepIndex={safeStepIndex}
          countryName={countryName}
          onScenarioSelect={selectScenario}
          onStepSelect={setStepIndex}
        />
      ) : null}

      {activeTab === "prototype" && flow.prototype ? (
        <PrototypePanel flow={flow} prototype={flow.prototype} countryName={countryName} />
      ) : null}

      {/* Off-screen capture strip: keeps export working from any tab. */}
      <div ref={captureRef} aria-hidden="true" className="pointer-events-none fixed left-[-10000px] top-0">
        {steps.map((step) => (
          <MiniPhone key={step.id} scale={1}>
            {renderFlowPreview(step.screen, { countryName })}
          </MiniPhone>
        ))}
      </div>
    </div>
  );
}

function FlowHeader({
  flow,
  exportKind,
  exportError,
  copied,
  onExport,
}: {
  flow: FlowDefinition;
  exportKind: ExportKind | null;
  exportError: string | null;
  copied: boolean;
  onExport: (kind: ExportKind) => void;
}) {
  return (
    <header data-testid="flow-detail-header" className="rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[24px] shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-[20px] sm:flex-nowrap">
        <div className="min-w-0 flex-1">
            <h1 className="text-[32px] font-bold leading-[38px] text-[var(--uc-text)]">{flow.title}</h1>
          <p className="mt-[10px] uc-type-n4 text-[var(--uc-text-muted)]">{flow.summary}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-[8px]">
          <div className="flex items-center gap-[8px]">
            <a
              href={flow.sourceUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Open Figma source"
              title="Open Figma source"
              data-flow-document-action="figma"
              className="grid size-[40px] place-items-center rounded-[10px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] shadow-sm transition-colors hover:border-[#7B61FF] hover:bg-[var(--uc-surface)]"
            >
              <FigmaDocumentIcon />
            </a>
            <ExportButton kind="pdf" busy={exportKind === "pdf"} disabled={exportKind !== null} onClick={() => onExport("pdf")} testId="flow-export-pdf" />
            <ExportButton kind="word" busy={exportKind === "word"} disabled={exportKind !== null} onClick={() => onExport("word")} testId="flow-export-word" />
            <ConfluenceCopyButton
              busy={exportKind === "confluence"}
              disabled={exportKind !== null}
              copied={copied}
              onClick={() => onExport("confluence")}
            />
          </div>
          {copied ? (
            <p role="status" className="max-w-[300px] text-right uc-type-n5 text-[var(--uc-green-status)]">
              Specification copied. Paste into a Confluence page with Ctrl+V.
            </p>
          ) : null}
          {exportError ? (
            <p role="alert" className="max-w-[280px] text-right uc-type-n5 text-[var(--uc-red-main)]">
              {exportError}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function ExportButton({
  kind,
  busy,
  disabled,
  onClick,
  testId,
}: {
  kind: "pdf" | "word";
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
  testId: string;
}) {
  const label =
    kind === "pdf"
      ? "Export flow as PDF"
      : "Download .docx (screens included) — Confluence: Tools > Import Word Document";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      aria-label={busy ? `Preparing ${kind.toUpperCase()} export` : label}
      aria-busy={busy || undefined}
      title={label}
      data-flow-document-action={kind}
      data-export-document="current-flow"
      className={`grid size-[40px] place-items-center rounded-[10px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] shadow-sm transition-colors hover:bg-[var(--uc-surface)] disabled:cursor-not-allowed disabled:opacity-50 ${
        kind === "pdf" ? "hover:border-[#D92D20]" : "hover:border-[#185ABD]"
      }`}
    >
      <DesktopDocumentIcon kind={kind} />
    </button>
  );
}

/**
 * The fast path out of the library: the specification as rich HTML on the
 * clipboard, which Confluence turns into native headings and tables on paste.
 * Labelled rather than iconified because it is the one a reviewer reaches for.
 */
function ConfluenceCopyButton({
  busy,
  disabled,
  copied,
  onClick,
}: {
  busy: boolean;
  disabled: boolean;
  copied: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid="flow-export-confluence"
      aria-busy={busy || undefined}
      title="Copy the specification for Confluence — paste it into a page with Ctrl+V"
      data-flow-document-action="confluence"
      className={`inline-flex h-[40px] items-center gap-[8px] rounded-[10px] border px-[14px] uc-type-n5-strong shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        copied
          ? "border-[var(--uc-green-status)] bg-[var(--uc-surface)] text-[var(--uc-green-status)]"
          : "border-[var(--uc-border)] bg-[var(--uc-surface-muted)] text-[var(--uc-text)] hover:border-[#1868DB] hover:bg-[var(--uc-surface)]"
      }`}
    >
      <ConfluenceIcon copied={copied} />
      {copied ? "Copied" : busy ? "Copying…" : "Copy for Confluence"}
    </button>
  );
}

function ConfluenceIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M3.5 9.5 7 13l7.5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg data-testid="flow-document-icon-confluence" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.3 17.1c-.3.5-.1 1.1.4 1.4l4.6 2.8c.5.3 1.2.1 1.5-.4.9-1.5 1.6-2.3 3-2.3 1 0 2 .3 3.9 1.2l4.5 2.1c.5.2 1.1 0 1.4-.5l2.2-5c.2-.5 0-1.1-.5-1.3-1-.5-2.9-1.4-4.6-2.2-2.5-1.2-4.6-1.8-6.5-1.8-3.3 0-6.1 1.6-7.9 4.6l-2 3.4Z"
        fill="#2681FF"
        transform="translate(-1 -1)"
      />
      <path
        d="M21.7 6.9c.3-.5.1-1.1-.4-1.4L16.7 2.7c-.5-.3-1.2-.1-1.5.4-.9 1.5-1.6 2.3-3 2.3-1 0-2-.3-3.9-1.2L3.8 2.1c-.5-.2-1.1 0-1.4.5L.2 7.6c-.2.5 0 1.1.5 1.3 1 .5 2.9 1.4 4.6 2.2 2.5 1.2 4.6 1.8 6.5 1.8 3.3 0 6.1-1.6 7.9-4.6l2-1.4Z"
        fill="#0052CC"
        transform="translate(1 3)"
      />
    </svg>
  );
}

function FigmaDocumentIcon() {
  return (
    <svg data-testid="flow-document-icon-figma" width="18" height="24" viewBox="0 0 19 29" fill="none" aria-hidden="true">
      <path d="M4.75 0H9.5v9.5H4.75a4.75 4.75 0 1 1 0-9.5Z" fill="#F24E1E" />
      <path d="M9.5 0h4.75a4.75 4.75 0 1 1 0 9.5H9.5V0Z" fill="#FF7262" />
      <path d="M4.75 9.5H9.5V19H4.75a4.75 4.75 0 1 1 0-9.5Z" fill="#A259FF" />
      <circle cx="14.25" cy="14.25" r="4.75" fill="#1ABCFE" />
      <path d="M0 23.75A4.75 4.75 0 0 1 4.75 19H9.5v4.75a4.75 4.75 0 1 1-9.5 0Z" fill="#0ACF83" />
    </svg>
  );
}

function DesktopDocumentIcon({ kind }: { kind: "pdf" | "word" }) {
  const isPdf = kind === "pdf";
  const accent = isPdf ? "#E81123" : "#185ABD";
  const label = isPdf ? "PDF" : "W";

  return (
    <svg data-testid={`flow-document-icon-${kind}`} width="20" height="24" viewBox="0 0 20 24" fill="none" aria-hidden="true">
      <path d="M3 1.25h9l5 5v15.5A1.25 1.25 0 0 1 15.75 23h-12a1.25 1.25 0 0 1-1.25-1.25V2.5A1.25 1.25 0 0 1 3.75 1.25Z" fill="#FFF" stroke="#BFC6CF" />
      <path d="M12 1.25v5h5" fill="#EEF1F5" stroke="#BFC6CF" strokeLinejoin="round" />
      <rect x="1" y="10" width="15" height="7" rx="1.5" fill={accent} />
      <text x={isPdf ? "2.25" : "6.1"} y="15.25" fill="#FFF" fontFamily="Arial, sans-serif" fontSize={isPdf ? "4.1" : "7.2"} fontWeight="700">
        {label}
      </text>
    </svg>
  );
}

function DetailTabs({
  activeTab,
  onTabChange,
  hasPrototype,
}: {
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  hasPrototype: boolean;
}) {
  // A flow without a clickable map simply does not offer the tab.
  const tabs = hasPrototype ? TABS : TABS.filter((tab) => tab.id !== "prototype");
  return (
    <div role="tablist" aria-label="Flow sections" className="flex flex-wrap gap-[8px] border-b border-[var(--uc-border)]">
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            className={`relative min-h-[44px] px-[18px] uc-type-n4-strong transition-colors ${
              active ? "text-[var(--uc-text)]" : "text-[var(--uc-text-muted)] hover:text-[var(--uc-action)]"
            }`}
          >
            {tab.label}
            {active ? <span className="absolute inset-x-[10px] bottom-0 h-[3px] rounded-t-[3px] bg-[var(--uc-action)]" /> : null}
          </button>
        );
      })}
    </div>
  );
}

function Panel({ title, action, children, compact = false }: { title: string; action?: ReactNode; children: ReactNode; compact?: boolean }) {
  return (
    <section role="tabpanel" className={`rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] shadow-sm ${compact ? "p-[16px]" : "p-[20px]"}`}>
      <div className="flex flex-wrap items-center justify-between gap-[12px]">
        <h2 className="uc-type-h2 text-[var(--uc-text)]">{title}</h2>
        {action ?? null}
      </div>
      <div className={compact ? "mt-[12px]" : "mt-[16px]"}>{children}</div>
    </section>
  );
}

function ScenarioChips({
  scenarios,
  selectedScenarioId,
  onSelect,
}: {
  scenarios: readonly FlowScenario[];
  selectedScenarioId: string;
  onSelect: (scenarioId: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-[8px]">
      <span className="uc-type-n6-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">Path</span>
      {scenarios.map((scenario) => (
        <SelectionChip
          key={scenario.id}
          active={selectedScenarioId === scenario.id}
          onClick={() => onSelect(scenario.id)}
          title={SCENARIO_TONE[scenario.kind].label}
        >
          {scenario.label}
        </SelectionChip>
      ))}
    </div>
  );
}

function JourneyPanel({
  flow,
  scenario,
  activeStepIndex,
  journeyView,
  countryName,
  onScenarioSelect,
  onStepSelect,
  onJourneyViewChange,
  onOpenSpec,
}: {
  flow: FlowDefinition;
  scenario: FlowScenario;
  activeStepIndex: number;
  journeyView: JourneyView;
  countryName: string;
  onScenarioSelect: (scenarioId: string) => void;
  onStepSelect: (index: number) => void;
  onJourneyViewChange: (view: JourneyView) => void;
  /** Opens the Spec tab already on this step's screen. */
  onOpenSpec: (index: number) => void;
}) {
  const activeStep = scenario.steps[activeStepIndex] ?? scenario.steps[0];
  const focusedScreenRef = useRef<HTMLDivElement>(null);
  const isEthocaFlow = flow.id === "mobile-pi-ethoca";

  return (
    <Panel
      title="Journey"
      action={
        <div className="inline-flex rounded-[10px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-[2px]">
          {(["focused", "filmstrip"] as const).map((view) => (
            <button
              key={view}
              type="button"
              aria-pressed={journeyView === view}
              onClick={() => onJourneyViewChange(view)}
              className={`rounded-[8px] px-[14px] py-[6px] uc-type-n5-strong transition-colors ${
                journeyView === view
                  ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm"
                  : "text-[var(--uc-text-muted)] hover:text-[var(--uc-text)]"
              }`}
            >
              {view === "focused" ? "Current screen" : "All screens"}
            </button>
          ))}
        </div>
      }
    >
      <ScenarioChips scenarios={flow.scenarios} selectedScenarioId={scenario.id} onSelect={onScenarioSelect} />
      <p className="mt-[10px] max-w-[860px] uc-type-n5 text-[var(--uc-text-muted)]">{scenario.description}</p>
      {isEthocaFlow ? (
        <p className="mt-[8px] max-w-[860px] uc-type-n5 text-[var(--uc-text-muted)]" role="note">
          Review map: Card Detail and the linked Current Account are independent transaction-list entry points. They do not navigate into one another.
        </p>
      ) : null}

      {scenario.steps.length === 0 ? (
        <EmptyState message="No steps are configured for this scenario yet." />
      ) : journeyView === "focused" ? (
        <div className="mt-[20px] grid items-start gap-[24px] xl:grid-cols-[380px_1fr]">
          {/*
            The list scrolls inside its own box rather than stretching the row, so
            the screen beside it keeps one height whatever the scenario's length.
            The fade at the bottom is the affordance: a list cut off by a hard edge
            reads as the end of the list.
          */}
          <div className="relative">
            <div
              data-testid="journey-step-list"
              className="grid max-h-[664px] gap-[8px] overflow-y-auto overscroll-contain pr-[6px] scrollbar-hide"
            >
              {scenario.steps.map((step, index) => {
                const active = index === activeStepIndex;
                return (
                  <div
                    key={step.id}
                    className={`group/step relative rounded-[8px] border transition-colors ${
                      active
                        ? "border-[var(--uc-action)] bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface))]"
                        : "border-[var(--uc-border)] bg-[var(--uc-surface)] hover:border-[var(--uc-action)]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onStepSelect(index)}
                      aria-current={active}
                      aria-label={step.title}
                      className="flex min-h-[58px] w-full items-center gap-[12px] px-[12px] py-[10px] pr-[40px] text-left"
                    >
                      <span
                        className={`grid size-[26px] shrink-0 place-items-center rounded-full uc-type-n5-strong ${
                          active ? "bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]" : "bg-[var(--uc-surface-muted)] text-[var(--uc-text-muted)]"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block uc-type-n5-strong text-[var(--uc-text)]">{step.title}</span>
                        <span className="mt-[2px] block uc-type-n5 text-[var(--uc-text-muted)]">{step.description}</span>
                      </span>
                    </button>
                    <ScreenSpecLink onClick={() => onOpenSpec(index)} title={step.title} />
                  </div>
                );
              })}
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[36px] rounded-b-[8px] bg-gradient-to-t from-[var(--uc-surface)] to-transparent"
            />
          </div>
          <div
            className="relative flex h-[664px] items-center justify-center rounded-[8px] border border-[var(--uc-border-muted)] bg-[var(--uc-neutral-200)] p-[24px]"
            data-testid="journey-current-screen-container"
          >
            {activeStep ? (
              <>
                <MiniPhone ref={focusedScreenRef} scale={0.82} scrollable>{renderFlowPreview(activeStep.screen, { countryName })}</MiniPhone>
                <FlowScreenDownloadButton screenRef={focusedScreenRef} step={activeStep} index={activeStepIndex} placement="container" />
              </>
            ) : null}
          </div>
        </div>
      ) : (
        isEthocaFlow ? (
          <EthocaJourneyGallery scenario={scenario} countryName={countryName} />
        ) : (
          <div className="mt-[20px] overflow-x-auto pb-[12px]">
            <div className="flex min-w-max items-start gap-[12px]">
              {scenario.steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-[12px]">
                  <FilmstripCard step={step} index={index} countryName={countryName} onOpenSpec={() => onOpenSpec(index)} />
                  {index < scenario.steps.length - 1 ? <JourneyArrow /> : null}
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </Panel>
  );
}

function EthocaJourneyGallery({ scenario, countryName }: { scenario: FlowScenario; countryName: string }) {
  const entrySteps = scenario.steps.filter((step) => step.id.includes("list"));
  const detailSteps = scenario.steps.filter((step) => !step.id.includes("list"));
  const hasIndependentEntryPoints = entrySteps.length > 1;

  return (
    <div className="mt-[20px] grid gap-[20px]" data-testid="ethoca-journey-gallery">
      <section className="rounded-[10px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-[16px]" data-testid="ethoca-entry-points">
        <div className="max-w-[820px]">
          <p className="uc-type-n5-strong text-[var(--uc-text)]">
            {hasIndependentEntryPoints ? "Independent transaction-list entry points" : "Transaction-list entry point"}
          </p>
          <p className="mt-[3px] uc-type-n5 text-[var(--uc-text-muted)]">
            {hasIndependentEntryPoints
              ? "The same card purchase can be found from Card Detail or from its linked Current Account. These are alternative entry points, not a navigation sequence."
              : "This list is an entry point for the card transaction shown in the detail examples below."}
          </p>
        </div>
        <div className="mt-[16px] overflow-x-auto pb-[4px]">
          <div className="flex min-w-max items-start gap-[20px]">
            {entrySteps.map((step) => {
              const index = scenario.steps.indexOf(step);
              return (
                <FilmstripCard
                  key={step.id}
                  step={step}
                  index={index}
                  countryName={countryName}
                  contextLabel={ethocaEntryContext(step)}
                  testId={ethocaEntryTestId(step)}
                />
              );
            })}
          </div>
        </div>
      </section>

      {detailSteps.length > 0 ? (
        <section className="rounded-[10px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[16px]" data-testid="ethoca-detail-examples">
          <div className="max-w-[820px]">
            <p className="uc-type-n5-strong text-[var(--uc-text)]">Transaction detail examples</p>
            <p className="mt-[3px] uc-type-n5 text-[var(--uc-text-muted)]">
              {hasIndependentEntryPoints
                ? "Open an ETHOCA-enriched card purchase from either transaction list to see the matching detail. In-store and online purchases use the appropriate detail blocks."
                : "Open the selected card transaction to see the relevant detail treatment."}
            </p>
          </div>
          <div className="mt-[16px] overflow-x-auto pb-[4px]">
            <div className="flex min-w-max items-start gap-[20px]">
              {detailSteps.map((step) => {
                const index = scenario.steps.indexOf(step);
                return (
                  <FilmstripCard
                    key={step.id}
                    step={step}
                    index={index}
                    countryName={countryName}
                    contextLabel="Transaction detail"
                  />
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ethocaEntryContext(step: FlowStep) {
  if (step.id === "card-list" || step.id === "pending-card-list") return "Card Detail transaction list";
  if (step.id === "account-list" || step.id === "pending-account-list") return "Current Account card-transaction list";
  return "Card Detail transaction list";
}

function ethocaEntryTestId(step: FlowStep) {
  if (step.id === "card-list") return "ethoca-entry-card-list";
  if (step.id === "account-list") return "ethoca-entry-account-list";
  return undefined;
}

function FilmstripCard({
  step,
  index,
  countryName,
  contextLabel,
  testId,
  onOpenSpec,
}: {
  step: FlowStep;
  index: number;
  countryName: string;
  contextLabel?: string;
  testId?: string;
  onOpenSpec?: () => void;
}) {
  const screenRef = useRef<HTMLDivElement>(null);

  return (
    <article className="w-[200px] shrink-0" data-testid={testId}>
      <div className="group relative">
        <MiniPhone ref={screenRef} scale={0.5} scrollable>
          {renderFlowPreview(step.screen, { countryName })}
        </MiniPhone>
        <FlowScreenDownloadButton screenRef={screenRef} step={step} index={index} showOnHover />
      </div>
      {contextLabel ? <p className="mt-[12px] uc-type-n5-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">{contextLabel}</p> : null}
      <h3 className={`${contextLabel ? "mt-[4px]" : "mt-[12px]"} uc-type-n5-strong text-[var(--uc-text)]`}>
        {index + 1}. {step.title}
      </h3>
      <p className="mt-[4px] uc-type-n5 text-[var(--uc-text-muted)]">{step.description}</p>
      {onOpenSpec ? <ScreenSpecLink onClick={onOpenSpec} title={step.title} variant="block" /> : null}
    </article>
  );
}

function FlowScreenDownloadButton({
  screenRef,
  step,
  index,
  showOnHover = false,
  placement = "preview",
}: {
  screenRef: { current: HTMLDivElement | null };
  step: FlowStep;
  index: number;
  showOnHover?: boolean;
  placement?: "preview" | "container";
}) {
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    const element = screenRef.current;
    if (!element || busy) return;
    setBusy(true);
    try {
      const { blob } = await createPhoneScreenshotBlob({ screenElement: element, mode: "full" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `flow-step-${index + 1}-${step.id}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Non-fatal: the on-screen preview stays usable.
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={busy}
      data-flow-download-mode="full"
      data-flow-download-placement={placement}
      className={`absolute ${placement === "container" ? "right-[16px] top-[16px]" : "right-[8px] top-[8px]"} z-20 grid size-[30px] place-items-center rounded-full border border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-md transition-[opacity,border-color,color] hover:border-[var(--uc-action)] hover:text-[var(--uc-action)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] disabled:cursor-not-allowed disabled:opacity-50 ${
        showOnHover
          ? "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 focus:pointer-events-auto focus:opacity-100"
          : ""
      }`}
      aria-label={`Download ${step.title} screen`}
      title={`Download complete ${step.title} screen`}
    >
      <AppIcon name="download" size={16} color="currentColor" />
    </button>
  );
}

/**
 * The route from a screen to the words about it. A BA looking at a journey card
 * should not have to change tab, find the scenario again and count chips to reach
 * the spec for the screen already in front of them.
 */
function ScreenSpecLink({ onClick, title, variant = "corner" }: { onClick: () => void; title: string; variant?: "corner" | "block" }) {
  if (variant === "block") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="mt-[10px] flex w-full items-center justify-center gap-[6px] rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[10px] py-[7px] uc-type-n5-strong text-[var(--uc-action)] transition-colors hover:border-[var(--uc-action)]"
        aria-label={`Open the screen spec for ${title}`}
      >
        <AppIcon name="clipboard-check" size={14} color="currentColor" />
        Screen spec
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-[8px] top-1/2 grid size-[28px] -translate-y-1/2 place-items-center rounded-full border border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text-muted)] transition-colors hover:border-[var(--uc-action)] hover:text-[var(--uc-action)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
      aria-label={`Open the screen spec for ${title}`}
      title={`Screen spec: ${title}`}
    >
      <AppIcon name="clipboard-check" size={14} color="currentColor" />
    </button>
  );
}

/**
 * The spec's own download: a labelled control under the picture rather than a
 * glyph floating over it. It captures the whole screen, not the part that happens
 * to be scrolled into view, which is the only version worth putting in a document.
 */
function FlowScreenDownloadLink({
  screenRef,
  step,
  index,
}: {
  screenRef: { current: HTMLDivElement | null };
  step: FlowStep;
  index: number;
}) {
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    const element = screenRef.current;
    if (!element || busy) return;
    setBusy(true);
    try {
      const { blob } = await createPhoneScreenshotBlob({ screenElement: element, mode: "full" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `flow-step-${index + 1}-${step.id}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Non-fatal: the preview stays usable.
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={busy}
      data-flow-download-mode="full"
      className="mt-[10px] flex w-full items-center justify-center gap-[6px] rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[12px] py-[8px] uc-type-n5-strong text-[var(--uc-action)] transition-colors hover:border-[var(--uc-action)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <AppIcon name="download" size={16} color="currentColor" />
      {busy ? "Preparing PNG…" : "Download entire screen (PNG)"}
    </button>
  );
}

function JourneyArrow() {
  return (
    <div className="mt-[190px] flex h-[32px] w-[28px] items-center justify-center text-[var(--uc-action)]" aria-hidden="true" data-testid="journey-arrow">
      <div className="h-[2px] w-[24px] bg-[var(--uc-action)]" />
      <div className="ml-[-7px] h-[10px] w-[10px] rotate-45 border-r-[2px] border-t-[2px] border-[var(--uc-action)]" />
    </div>
  );
}

/**
 * A clickable walk-through: one phone, the real screens, and the connections
 * between them. The Journey tab answers "what are the steps"; this one answers
 * "what happens when I press this", which is the question a filmstrip cannot.
 */
/**
 * A clickable walk-through: one phone, the real screens, and a timeline of the
 * journey under it. The Journey tab answers "what are the steps"; this one
 * answers "what happens when I press this", which a filmstrip cannot.
 */
function PrototypePanel({
  flow,
  prototype,
  countryName,
}: {
  flow: FlowDefinition;
  prototype: FlowPrototypeSpec;
  countryName: string;
}) {
  const [screen, setScreen] = useState<FlowScreenKind>(prototype.start);
  const [history, setHistory] = useState<FlowScreenKind[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);

  const node = prototype.nodes[screen];
  const spec = flow.screenSpecs[screen];

  // The happy path is the spine of the timeline; everything else is a detour off it.
  const spine = useMemo(() => {
    const main = flow.scenarios.find((scenario) => scenario.id === flow.defaultScenarioId) ?? flow.scenarios[0];
    return (main?.steps ?? []).map((step) => step.screen);
  }, [flow]);
  const spineIndex = spine.indexOf(screen);

  const go = (next: FlowScreenKind) => {
    setHistory((current) => [...current, screen]);
    setScreen(next);
  };

  const stepBack = () => {
    setHistory((current) => {
      const previous = current[current.length - 1];
      // A real back stack first; the map's declared back edge only when it is empty.
      if (previous) {
        setScreen(previous);
        return current.slice(0, -1);
      }
      if (node?.back) setScreen(node.back);
      return current;
    });
  };

  const nav: FlowNav = {
    primary: () => {
      if (node?.primary) go(node.primary.to);
    },
    secondary: () => {
      if (node?.secondary) go(node.secondary.to);
    },
    back: stepBack,
    go,
    close: () => {
      if (node?.close) go(node.close);
    },
    canClose: Boolean(node?.close),
    active: true,
  };

  // Keep the current stop in view without asking the browser to scroll every
  // ancestor. `scrollIntoView` also moved the Flow Library's vertical scroller,
  // cutting the phone frame off below the fixed app header.
  useEffect(() => {
    const timeline = timelineRef.current;
    const active = timeline?.querySelector<HTMLElement>("[data-timeline-active='true']");
    if (!timeline || !active) return;

    timeline.scrollTo?.({
      left: Math.max(0, active.offsetLeft + active.offsetWidth / 2 - timeline.clientWidth / 2),
      behavior: "smooth",
    });
  }, [screen]);

  const detours = [
    ...(node?.secondary && node.secondary.to !== node.primary?.to ? [node.secondary] : []),
    ...(node?.extra ?? []),
  ];
  const offSpine = prototype.groups
    .flatMap((group) => group.screens)
    .filter((candidate) => !spine.includes(candidate));

  return (
    // The surface the phone sits on: the same card as every other panel, without a
    // title row — the tab already says what this is.
    <div
      role="tabpanel"
      className="flex flex-col items-center gap-[18px] rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[24px] shadow-sm"
    >
        {/* The same device frame the Demo area uses, so this reads as a phone. */}
        <FlowNavProvider value={nav}>
          <MiniPhone scale={0.86} scrollable device>
            {renderFlowPreview(screen, { countryName })}
          </MiniPhone>
        </FlowNavProvider>

        <div className="w-full max-w-[900px]">
          {/* Arrows belong to the content-sized step group, so they stay next to its first/last stop instead of being pinned to the rail corners. */}
          <div data-testid="flow-prototype-step-rail" className="flex min-h-[40px] w-full items-center justify-center">
            <div data-testid="flow-prototype-step-control-group" className="flex w-fit max-w-[70vw] items-center gap-[10px]">
              <TimelineArrow
                direction="back"
                label={history.length ? "Go back" : "Nothing to go back to"}
                disabled={history.length === 0 && !node?.back}
                onClick={stepBack}
              />

            <div ref={timelineRef} className="w-fit max-w-full overflow-x-auto scrollbar-hide">
              <div data-testid="flow-prototype-steps" className="flex w-max items-center px-[2px]">
                {spine.map((stop, index) => {
                  const active = stop === screen;
                  const passed = spineIndex >= 0 && index < spineIndex;
                  return (
                    <div key={stop} className="flex items-center">
                      {index > 0 ? (
                        <span
                          aria-hidden="true"
                          className={`h-px w-[18px] shrink-0 ${passed ? "bg-[var(--uc-action)]" : "bg-[var(--uc-border)]"}`}
                        />
                      ) : null}
                      <button
                        type="button"
                        data-timeline-active={active ? "true" : undefined}
                        aria-current={active ? "step" : undefined}
                        onClick={() => go(stop)}
                        title={screenLabel(stop)}
                        className={`flex shrink-0 items-center gap-[6px] rounded-full border px-[10px] py-[6px] transition-colors ${
                          active
                            ? "border-[var(--uc-action)] bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]"
                            : passed
                              ? "border-[var(--uc-action)] bg-[var(--uc-surface)] text-[var(--uc-action)]"
                              : "border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text-muted)] hover:border-[var(--uc-action)]"
                        }`}
                      >
                        <span className="uc-type-p2 tabular-nums">{index + 1}</span>
                        {active ? <span className="uc-type-n5-strong whitespace-nowrap">{screenLabel(stop)}</span> : null}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <TimelineArrow
              direction="forward"
              label={node?.primary ? node.primary.label : "This screen ends the flow"}
              disabled={!node?.primary}
              onClick={nav.primary}
            />
          </div>
          </div>
          {screen !== prototype.start ? (
            <div className="mt-[10px] flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setHistory([]);
                  setScreen(prototype.start);
                }}
                className="rounded-[8px] border border-[var(--uc-border)] px-[12px] py-[9px] uc-type-n5-strong text-[var(--uc-text)] transition-colors hover:border-[var(--uc-action)]"
              >
                Restart
              </button>
            </div>
          ) : null}

          {/* Where you are, and the branches leaving it — one line each. */}
          <div className="mt-[14px] flex flex-wrap items-baseline gap-x-[10px] gap-y-[6px]">
            <h3 className="uc-type-n4-strong text-[var(--uc-text)]">{screenLabel(screen)}</h3>
            {spineIndex < 0 ? (
              <span className="rounded-full bg-[var(--uc-surface-muted)] px-[8px] py-[2px] uc-type-p2 text-[var(--uc-text-muted)]">
                off the main path
              </span>
            ) : null}
          </div>
          {spec ? <p className="mt-[4px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">{spec.purpose}</p> : null}

          {detours.length ? (
            <p className="mt-[10px] flex flex-wrap items-baseline gap-x-[6px] gap-y-[4px] uc-type-p2 text-[var(--uc-text-muted)]">
              <span>Also from here:</span>
              {detours.map((transition, index) => (
                <span key={`${transition.label}-${transition.to}`}>
                  <button
                    type="button"
                    onClick={() => go(transition.to)}
                    className="uc-type-n5-strong text-[var(--uc-action)] underline-offset-2 hover:underline"
                  >
                    {transition.label}
                  </button>
                  {index < detours.length - 1 ? <span className="pl-[6px]">·</span> : null}
                </span>
              ))}
            </p>
          ) : null}

          {offSpine.length ? (
            <p className="mt-[10px] flex flex-wrap items-baseline gap-x-[6px] gap-y-[4px] uc-type-p2 text-[var(--uc-text-muted)]">
              <span>Other states:</span>
              {offSpine.map((candidate, index) => (
                <span key={candidate}>
                  <button
                    type="button"
                    onClick={() => go(candidate)}
                    className={`uc-type-n5-strong hover:underline ${
                      candidate === screen ? "text-[var(--uc-text)]" : "text-[var(--uc-action)]"
                    }`}
                  >
                    {screenLabel(candidate)}
                  </button>
                  {index < offSpine.length - 1 ? <span className="pl-[6px]">·</span> : null}
                </span>
              ))}
            </p>
          ) : null}
        </div>
    </div>
  );
}

/** The two ends of the timeline: one step back, one step forward. */
function TimelineArrow({
  direction,
  label,
  disabled,
  onClick,
}: {
  direction: "back" | "forward";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid size-[40px] shrink-0 place-items-center rounded-full border border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)] transition-colors hover:border-[var(--uc-action)] disabled:opacity-35 disabled:hover:border-[var(--uc-border)]"
    >
      <span className={direction === "back" ? "rotate-180" : undefined}>
        <AppIcon name="chevron-link" color="currentColor" />
      </span>
    </button>
  );
}

/** A readable name for a screen kind. */
function screenLabel(screen: FlowScreenKind) {
  return screen
    .replace(/^rs-pi-/, "")
    .replace(/-/g, " ")
    .replace(/^./, (character) => character.toUpperCase());
}


function SpecPanel({
  flow,
  scenario,
  activeStep,
  activeStepIndex,
  countryName,
  onScenarioSelect,
  onStepSelect,
}: {
  flow: FlowDefinition;
  scenario: FlowScenario;
  activeStep: FlowStep | undefined;
  activeStepIndex: number;
  countryName: string;
  onScenarioSelect: (scenarioId: string) => void;
  onStepSelect: (index: number) => void;
}) {
  const analysis = flow.overview.businessAnalysis;
  const spec = activeStep ? flow.screenSpecs[activeStep.screen] : undefined;
  // A BA document is the whole specification unless the flow says otherwise; a
  // flow that also specifies its screens shows the document first and the
  // screen-by-screen detail underneath it.
  const showScreenSpecs = !analysis || flow.specLayout === "document-and-screens";

  if (analysis && !showScreenSpecs) {
    return (
      <Panel title="Business analysis specification">
        <BusinessAnalysisContent analysis={analysis} />
      </Panel>
    );
  }

  return (
    <div className="grid gap-[24px]">
      {analysis ? (
        <Panel title="Business analysis specification">
          <BusinessAnalysisContent analysis={analysis} />
        </Panel>
      ) : null}

      <Panel title="Screen spec">
        <ScenarioChips scenarios={flow.scenarios} selectedScenarioId={scenario.id} onSelect={onScenarioSelect} />
        {scenario.steps.length > 0 ? (
          <div className="mt-[12px] flex flex-wrap items-center gap-[6px] border-t border-[var(--uc-border)] pt-[12px]">
            <span className="uc-type-n6-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">Screen</span>
            {scenario.steps.map((step, index) => {
              const active = index === activeStepIndex;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onStepSelect(index)}
                  aria-current={active ? "true" : undefined}
                  className={`rounded-[6px] border px-[10px] py-[6px] uc-type-n5-strong transition-colors ${
                    active
                      ? "border-[var(--uc-action)] bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface))] text-[var(--uc-action)]"
                      : "border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text-muted)] hover:border-[var(--uc-action)] hover:text-[var(--uc-text)]"
                  }`}
                >
                  {index + 1}. {step.title}
                </button>
              );
            })}
          </div>
        ) : null}

        {activeStep && spec ? (
          <ScreenSpecView step={activeStep} spec={spec} stepIndex={activeStepIndex} countryName={countryName} />
        ) : (
          <EmptyState message="No structured spec is attached to this screen yet." />
        )}
      </Panel>

      <FlowLevelSpec flow={flow} />
    </div>
  );
}

/**
 * One screen and everything specified about it, side by side: the screen on the
 * left at full content height, the specification on the right as one continuous
 * read.
 *
 * No accordions here. A screen spec is short enough to take in at once, and
 * folding six headings over it made a reviewer click five times to see what they
 * came for. The folding belongs to the long documents around it, not to this.
 */
function ScreenSpecView({
  step,
  spec,
  stepIndex,
  countryName,
}: {
  step: FlowStep;
  spec: FlowScreenSpec;
  stepIndex: number;
  countryName: string;
}) {
  const screenRef = useRef<HTMLDivElement>(null);
  return (
    <div className="mt-[18px] flex flex-col gap-[24px] xl:flex-row xl:items-start">
      <div className="shrink-0">
        <MiniPhone ref={screenRef} scale={0.62} scrollable device>
          {renderFlowPreview(step.screen, { countryName })}
        </MiniPhone>
        <FlowScreenDownloadLink screenRef={screenRef} step={step} index={stepIndex} />
      </div>

      <div className="grid min-w-0 flex-1 gap-[20px]">
        <div>
          <p className="uc-type-n5-strong uppercase tracking-[0.04em] text-[var(--uc-action)]">{step.title}</p>
          <p className="mt-[6px] uc-type-n4 text-[var(--uc-text)]">{spec.purpose}</p>
          {step.description ? (
            <p className="mt-[10px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">{step.description}</p>
          ) : null}
        </div>

        {spec.states?.length ? (
          <SpecSection title="UI states">
            <BulletList items={spec.states} />
          </SpecSection>
        ) : null}

        {spec.fields?.length ? (
          <SpecSection title="Fields">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left">
                <thead>
                  <tr className="bg-[var(--uc-surface-muted)]">
                    {["Field", "Type", "Required", "Validation"].map((heading) => (
                      <th key={heading} className="border border-[var(--uc-border)] px-[10px] py-[7px] uc-type-n6-strong uppercase tracking-[0.03em] text-[var(--uc-text-muted)]">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {spec.fields.map((field) => (
                    <tr key={field.name}>
                      <td className="border border-[var(--uc-border)] px-[10px] py-[7px] uc-type-n5-strong text-[var(--uc-text)]">{field.name}</td>
                      <td className="border border-[var(--uc-border)] px-[10px] py-[7px] uc-type-n5 text-[var(--uc-text)]">{field.type}</td>
                      <td className="border border-[var(--uc-border)] px-[10px] py-[7px] uc-type-n5 text-[var(--uc-text-muted)]">{field.required ? "Yes" : "No"}</td>
                      <td className="border border-[var(--uc-border)] px-[10px] py-[7px] uc-type-n5 text-[var(--uc-text-muted)]">
                        {[field.validation, field.notes].filter(Boolean).join(" · ") || "Not specified"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SpecSection>
        ) : null}

        {spec.actions?.length ? (
          <SpecSection title="Actions">
            <div className="grid gap-[6px]">
              {spec.actions.map((action) => (
                <div key={action.label} className="flex flex-wrap gap-[8px] rounded-[8px] bg-[var(--uc-surface-muted)] px-[12px] py-[9px]">
                  <span className="uc-type-n5-strong text-[var(--uc-text)]">{action.label}</span>
                  <span className="uc-type-n5 text-[var(--uc-text-muted)]">→ {action.result}</span>
                </div>
              ))}
            </div>
          </SpecSection>
        ) : null}

        {spec.back ? (
          <SpecSection title="Back behavior">
            <p className="uc-type-n5 leading-[20px] text-[var(--uc-text)]">{spec.back}</p>
          </SpecSection>
        ) : null}

        {spec.edgeCases?.length ? (
          <SpecSection title="Edge cases">
            <BulletList items={spec.edgeCases} />
          </SpecSection>
        ) : null}

        {spec.acceptance?.length ? (
          <SpecSection title="Acceptance criteria">
            <BulletList items={spec.acceptance} />
          </SpecSection>
        ) : null}
      </div>
    </div>
  );
}

/** A labelled run of spec copy. A heading and its content, nothing to open. */
function SpecSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="uc-type-n6-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">{title}</h3>
      <div className="mt-[8px]">{children}</div>
    </section>
  );
}

function FlowLevelSpec({ flow }: { flow: FlowDefinition }) {
  const { overview } = flow;
  const fixedBlocks = [
    "Key decision rules",
    "Preconditions",
    "Expected result",
    "Analytics events",
    "Questions to close",
  ];
  const blockTitles = [...fixedBlocks, ...overview.notes.map((note) => note.title)];
  const badgeFor = (title: string) => String(blockTitles.indexOf(title) + 1).padStart(2, "0");
  const jumpItems = blockTitles.map((title) => ({
    id: `spec-block-${slugify(title)}`,
    label: title,
  }));
  const disclosure = useSectionDisclosure(jumpItems.map((item) => item.id));

  return (
    <Panel title="Flow specification">
      <p className="max-w-[860px] uc-type-n5 text-[var(--uc-text-muted)]">
        A practical reference for review and implementation. Each rule describes the expected customer-facing outcome and
        the data that must stay unchanged.
      </p>
      <SectionJump
        items={jumpItems}
        onJump={disclosure.jump}
        allOpen={disclosure.allOpen}
        onToggleAll={disclosure.toggleAll}
      />
      <div className="mt-[14px] grid gap-[12px]">
        <SpecBlock badge={badgeFor("Key decision rules")} disclosure={disclosure} title="Key decision rules" description="What must happen consistently across the supported markets.">
          <BusinessRuleList items={overview.businessRules} />
        </SpecBlock>
        <SpecBlock badge={badgeFor("Preconditions")} disclosure={disclosure} title="Preconditions" description="Data and ledger conditions that must be true before enrichment is shown.">
          <BulletList items={overview.preconditions} />
        </SpecBlock>
        <SpecBlock badge={badgeFor("Expected result")} disclosure={disclosure} title="Expected result" description="Where customers see the completed experience.">
          <BulletList items={overview.successDestinations} />
        </SpecBlock>
        <SpecBlock badge={badgeFor("Analytics events")} disclosure={disclosure} title="Analytics events" description="Events available for delivery and adoption monitoring.">
          <div className="flex flex-wrap gap-[8px]">
            {overview.analyticsEvents.map((event) => (
              <code key={event} className="rounded-[6px] bg-[var(--uc-surface-muted)] px-[8px] py-[4px] font-mono text-[12px] text-[var(--uc-text)]">
                {event}
              </code>
            ))}
          </div>
        </SpecBlock>
        <SpecBlock badge={badgeFor("Questions to close")} disclosure={disclosure} title="Questions to close" description="Items that require a product or delivery decision before release.">
          <BulletList items={overview.openQuestions} />
        </SpecBlock>
        {overview.notes.map((note) => (
          <SpecBlock key={note.title} badge={badgeFor(note.title)} disclosure={disclosure} title={note.title} description="Additional implementation context.">
            <p className="whitespace-pre-line uc-type-n5 text-[var(--uc-text-muted)]">{note.body}</p>
          </SpecBlock>
        ))}
      </div>
    </Panel>
  );
}

const BA_SECTION_TITLES: Array<{ number: string; title: string }> = [
  { number: "01", title: "General information" },
  { number: "02", title: "Open issues" },
  { number: "03", title: "Requirement" },
  { number: "04", title: "Current status" },
  { number: "05", title: "Proposed solution" },
  { number: "06", title: "Non-functional requirements" },
];

function BusinessAnalysisContent({ analysis }: { analysis: FlowBusinessAnalysisSpec }) {
  const disclosure = useSectionDisclosure(BA_SECTION_TITLES.map((entry) => `ba-section-${entry.number}`));
  return (
    <div data-testid="business-analysis-document" className="max-w-[1120px]">
      {/* Eight sections is a document, not a page: it needs a way in other than
          scrolling from the top every time. */}
      <SectionJump
        items={BA_SECTION_TITLES.map((entry) => ({ id: `ba-section-${entry.number}`, label: entry.title, badge: entry.number }))}
        onJump={disclosure.jump}
        allOpen={disclosure.allOpen}
        onToggleAll={disclosure.toggleAll}
      />
      <div className="mt-[14px] grid gap-[12px]">
        <BusinessAnalysisSection number="01" title="General information" description="The shared business context for product, design and delivery review." disclosure={disclosure}>
          <div className="grid overflow-hidden rounded-[8px] border border-[var(--uc-border)] sm:grid-cols-2">
            {analysis.generalInformation.map((fact) => (
              <div key={fact.label} className="border-b border-[var(--uc-border)] bg-[var(--uc-surface)] p-[12px] last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 sm:[&:nth-odd]:border-r">
                <p className="uc-type-n6-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">{fact.label}</p>
                <p className="mt-[3px] uc-type-n5 text-[var(--uc-text)]">{fact.value}</p>
              </div>
            ))}
          </div>
        </BusinessAnalysisSection>
        <BusinessAnalysisSection number="02" title="Open issues" description="Scope boundaries and decisions to close before a production release." disclosure={disclosure}>
          <div className="grid">
            {analysis.openIssues.map((issue, index) => (
              <article
                key={issue.reference}
                className={index > 0 ? "border-t border-[var(--uc-border)] pt-[14px] mt-[14px]" : ""}
              >
                <div className="flex flex-wrap items-center gap-[8px]">
                  <span className="font-mono text-[11px] font-bold text-[var(--uc-text-muted)]">{issue.reference}</span>
                  <span className="rounded-[4px] border border-[var(--uc-border)] px-[7px] py-[2px] uc-type-n6-strong text-[var(--uc-text-muted)]">{issue.status}</span>
                  <h4 className="uc-type-n5-strong text-[var(--uc-text)]">{issue.title}</h4>
                </div>
                <p className="mt-[6px] uc-type-n5 leading-[20px] text-[var(--uc-text)]">{issue.detail}</p>
              </article>
            ))}
          </div>
        </BusinessAnalysisSection>
        <AnalysisSectionList disclosure={disclosure} number="03" title="Requirement" description="The customer and ledger outcomes that the flow must preserve." sections={analysis.requirements} />
        <AnalysisSectionList disclosure={disclosure} number="04" title="Current status" description="What the app already provides today and what stays unchanged." sections={analysis.currentStatus} />
        <AnalysisSectionList disclosure={disclosure} number="05" title="Proposed solution" description="One decision system, with the specific customer states grouped where a BA expects to find them." sections={analysis.proposedSolution} />
        <AnalysisSectionList disclosure={disclosure} number="06" title="Non-functional requirements" description="Delivery guardrails that make the experience reliable, inclusive and safe to evolve." sections={analysis.nonFunctionalRequirements} />
      </div>
    </div>
  );
}

function AnalysisSectionList({ number, title, description, sections, disclosure }: { number: string; title: string; description: string; sections: FlowBusinessAnalysisSpec['requirements']; disclosure: SectionDisclosure }) {
  return (
    <BusinessAnalysisSection number={number} title={title} description={description} disclosure={disclosure}>
      <div className="grid">
        {sections.map((section, index) => (
          <section
            key={section.title}
            className={index > 0 ? "border-t border-[var(--uc-border)] pt-[16px] mt-[16px]" : ""}
          >
            <h4 className="uc-type-n5-strong text-[var(--uc-text)]">{section.title}</h4>
            {section.description ? <p className="mt-[3px] uc-type-n5 text-[var(--uc-text-muted)]">{section.description}</p> : null}
            <div className="mt-[10px]"><BulletList items={section.items} /></div>
          </section>
        ))}
      </div>
    </BusinessAnalysisSection>
  );
}

function BusinessAnalysisSection({
  number,
  title,
  description,
  children,
  disclosure,
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
  disclosure: SectionDisclosure;
}) {
  return (
    <DisclosureSection
      id={`ba-section-${number}`}
      sectionProps={{ "data-ba-section": number }}
      badge={number}
      title={title}
      titleTone="heading"
      description={description}
      disclosure={disclosure}
    >
      {children}
    </DisclosureSection>
  );
}

/**
 * A jump strip for a long document. Scrolling is deliberate rather than instant:
 * a section that appears without any movement leaves the reader unsure whether
 * the page went anywhere, and an anchor jump that lands under a sticky header is
 * worse than no jump at all, so each target carries its own scroll margin.
 */
/**
 * A contents list, not a row of filters. Stacked and link-styled on purpose: a
 * strip of pills reads as a set of options to choose between, and these are not
 * options — they are the document's own headings, and every one of them is
 * somewhere you can go.
 */
function SectionJump({
  items,
  onJump,
  allOpen,
  onToggleAll,
}: {
  items: Array<{ id: string; label: string; badge?: string }>;
  onJump: (id: string) => void;
  allOpen: boolean;
  onToggleAll: () => void;
}) {
  return (
    <div className="mt-[4px] rounded-[10px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[14px]">
      <div className="flex flex-wrap items-baseline justify-between gap-[10px]">
        <p className="uc-type-n6-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">Contents</p>
        <button
          type="button"
          onClick={onToggleAll}
          className="uc-type-n5-strong text-[var(--uc-action)] underline-offset-[3px] hover:underline"
        >
          {allOpen ? "Collapse all" : "Expand all"}
        </button>
      </div>
      <nav aria-label="Jump to a section" className="mt-[10px] grid gap-[6px]">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onJump(item.id)}
            className="flex w-fit items-baseline gap-[10px] text-left uc-type-n4-strong text-[var(--uc-action)] underline-offset-[3px] hover:underline"
          >
            <span className="shrink-0 font-mono text-[12px] text-[var(--uc-text-muted)]">
              {item.badge ?? String(index + 1).padStart(2, "0")}
            </span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

interface SectionDisclosure {
  isOpen: (id: string) => boolean;
  toggle: (id: string) => void;
  toggleAll: () => void;
  allOpen: boolean;
  jump: (id: string) => void;
}

/**
 * Open/closed state for a document of collapsible sections, plus the jump that
 * opens a section before scrolling to it. Landing on a collapsed heading is not
 * arriving anywhere.
 *
 * Everything starts closed: a document of this length opens as its own contents
 * page, and the reader chooses what to read rather than scrolling past it.
 */
function useSectionDisclosure(ids: string[]): SectionDisclosure {
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const allOpen = ids.length > 0 && ids.every((id) => open.has(id));

  const toggle = (id: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () => setOpen(allOpen ? new Set() : new Set(ids));

  const jump = (id: string) => {
    setOpen((current) => (current.has(id) ? current : new Set(current).add(id)));
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return { isOpen: (id: string) => open.has(id), toggle, toggleAll, allOpen, jump };
}

/**
 * The one collapsible section in the Specification tab. Both the BA document and
 * the flow-level blocks render through it, so a heading cannot end up with a
 * different padding or a stray rule depending on which list it belongs to.
 */
function DisclosureSection({
  id,
  badge,
  title,
  titleTone = "label",
  description,
  children,
  disclosure,
  sectionProps,
}: {
  id: string;
  badge?: string;
  title: string;
  /** "label" reads as a field heading; "heading" as a document section. */
  titleTone?: "label" | "heading";
  description?: string;
  children: ReactNode;
  disclosure: SectionDisclosure;
  sectionProps?: Record<string, string>;
}) {
  const open = disclosure.isOpen(id);
  return (
    <section
      id={id}
      {...sectionProps}
      className="scroll-mt-[16px] rounded-[10px] border border-[var(--uc-border)] bg-[var(--uc-surface)]"
    >
      <button
        type="button"
        onClick={() => disclosure.toggle(id)}
        aria-expanded={open}
        className="flex w-full items-center gap-[10px] rounded-[10px] p-[14px] text-left transition-colors hover:bg-[color-mix(in_srgb,var(--uc-action)_5%,var(--uc-surface))]"
      >
        {badge ? (
          <span className="shrink-0 self-start rounded-[4px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[6px] py-[2px] font-mono text-[11px] font-bold text-[var(--uc-text-muted)]">
            {badge}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span
            className={
              titleTone === "heading"
                ? "block uc-type-n5-strong text-[var(--uc-text)]"
                : "block uc-type-n5-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]"
            }
          >
            {title}
          </span>
          {description ? <span className="mt-[3px] block uc-type-n5 text-[var(--uc-text-muted)]">{description}</span> : null}
        </span>
        <span className={`grid size-[18px] shrink-0 place-items-center text-[var(--uc-text-muted)] transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
          <AppIcon name="chevron-down" size={18} color="currentColor" />
        </span>
      </button>
      {open ? <div className="px-[14px] pb-[14px]">{children}</div> : null}
    </section>
  );
}

function SpecBlock({
  title,
  description,
  children,
  disclosure,
  badge,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  disclosure: SectionDisclosure;
  /** The same number the contents list shows against this entry. */
  badge?: string;
}) {
  return (
    <DisclosureSection
      id={`spec-block-${slugify(title)}`}
      badge={badge}
      title={title}
      description={description}
      disclosure={disclosure}
    >
      {children}
    </DisclosureSection>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid gap-[8px]">
      {items.map((item) => {
        const { lead, detail } = splitLeadingSentence(item);
        return (
          <li key={item} className="flex gap-[8px] uc-type-n5 text-[var(--uc-text)]">
            <span aria-hidden="true" className="mt-[8px] size-[5px] shrink-0 rounded-full bg-[var(--uc-text-muted)]" />
            <span>
              <strong className="font-bold">{lead}</strong>
              {detail ? ` ${detail}` : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function BusinessRuleList({ items }: { items: readonly string[] }) {
  return (
    <ol className="grid gap-[14px]">
      {items.map((item, index) => {
        const { lead, detail } = splitLeadingSentence(item);
        return (
          <li
            className={`grid gap-[10px] sm:grid-cols-[auto_1fr] ${
              index > 0 ? "border-t border-[var(--uc-border)] pt-[14px]" : ""
            }`}
            key={item}
          >
            <span className="h-fit w-fit font-mono text-[11px] font-bold text-[var(--uc-text-muted)]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="uc-type-n5 text-[var(--uc-text)]">
              <strong className="font-bold">{lead}</strong>
              {detail ? ` ${detail}` : null}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

function splitLeadingSentence(value: string) {
  const match = value.match(/^(.+?[.!?])(?:\s+|$)([\s\S]*)$/);
  if (!match) {
    return { lead: value, detail: "" };
  }

  return { lead: match[1], detail: match[2] };
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-[16px] rounded-[8px] border border-dashed border-[var(--uc-border)] bg-[var(--uc-surface-muted)] px-[16px] py-[24px] text-center uc-type-n5 text-[var(--uc-text-muted)]">
      {message}
    </div>
  );
}
