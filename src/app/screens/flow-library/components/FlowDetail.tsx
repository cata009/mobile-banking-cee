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
  exportFlowAsWord,
  type ExportOverview,
  type FlowExportStep,
} from "../flowExport";

type DetailTab = "overview" | "journey" | "spec" | "prototype";
type JourneyView = "focused" | "filmstrip";

const TABS: Array<{ id: DetailTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "journey", label: "Journey" },
  { id: "spec", label: "Spec" },
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
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [requestedScenarioId, setRequestedScenarioId] = useState(flow.defaultScenarioId);
  const [stepIndex, setStepIndex] = useState(0);
  const [journeyView, setJourneyView] = useState<JourneyView>("focused");
  const [exportKind, setExportKind] = useState<"pdf" | "word" | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
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

  const handleExport = async (kind: "pdf" | "word") => {
    const container = captureRef.current;
    if (!container || exportKind) return;
    if (steps.length === 0) {
      setExportError("This scenario has no steps to export yet.");
      return;
    }

    setExportKind(kind);
    setExportError(null);
    try {
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

      const meta = {
        flowTitle: flow.title,
        flowLabel: flow.label,
        scenarioLabel: scenario.label,
        scenarioDescription: scenario.description,
        countryScope: flow.countryScope.join(", "),
        status: flow.status.replace(/-/g, " "),
        domain: flow.domain,
        figmaFile: flow.figmaFile,
        sourceUrl: flow.sourceUrl,
      };
      const overview = toExportOverview(flow);

      if (kind === "pdf") {
        exportFlowAsPdf(meta, captured, flow.overview.notes, overview);
      } else {
        exportFlowAsWord(
          meta,
          captured,
          flow.overview.notes,
          `flow-${slugify(flow.title)}-${slugify(scenario.label)}.doc`,
          overview,
        );
      }
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Export failed. Try again.");
    } finally {
      setExportKind(null);
    }
  };

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
        onExport={handleExport}
      />

      <DetailTabs activeTab={activeTab} onTabChange={setActiveTab} hasPrototype={Boolean(flow.prototype)} />

      {activeTab === "overview" ? <OverviewPanel flow={flow} /> : null}

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
        />
      ) : null}

      {activeTab === "spec" ? (
        <SpecPanel
          flow={flow}
          scenario={scenario}
          activeStep={activeStep}
          activeStepIndex={safeStepIndex}
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
  onExport,
}: {
  flow: FlowDefinition;
  exportKind: "pdf" | "word" | null;
  exportError: string | null;
  onExport: (kind: "pdf" | "word") => void;
}) {
  return (
    <header className="rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[24px] shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-[20px] sm:flex-nowrap">
        <div className="min-w-0 flex-1">
          <p className="uc-type-n5-strong uppercase tracking-[0.04em] text-[var(--uc-action)]">{flow.domain}</p>
          <h1 className="mt-[6px] text-[32px] font-bold leading-[38px] text-[var(--uc-text)]">{flow.title}</h1>
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
          </div>
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
  const label = kind === "pdf" ? "Export flow as PDF" : "Export flow as Word";
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
    <div className="flex flex-wrap gap-[8px]">
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

function OverviewPanel({ flow }: { flow: FlowDefinition }) {
  const { overview } = flow;
  const marketCount = flow.countryScope.length;
  return (
    <div className="grid gap-[24px]">
      <Panel title="At a glance" compact>
        <div data-testid="flow-overview-meta" className="grid grid-cols-2 gap-px overflow-hidden rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-border)] sm:grid-cols-3">
          <MetaCell label="Domain" value={flow.domain} />
          <MetaCell
            label="Markets"
            value={`${marketCount} market${marketCount === 1 ? "" : "s"}`}
            detail={flow.countryScope.join(" · ")}
            testId="flow-overview-country-summary"
          />
          <MetaCell label="Journey paths" value={`${flow.scenarios.length} path${flow.scenarios.length === 1 ? "" : "s"}`} />
        </div>

        <div className="mt-[12px] grid gap-[10px]">
          <OverviewNarrative title="Purpose" className="border-[var(--uc-border)] bg-[var(--uc-surface-muted)] text-[var(--uc-text)]">
            {overview.purpose}
          </OverviewNarrative>
          <OverviewNarrative title="Scope and demo note" className="border-[var(--uc-border)] bg-[var(--uc-surface-muted)] text-[var(--uc-text-muted)]">
            {overview.scopeNote}
          </OverviewNarrative>
        </div>
      </Panel>

      <Panel title="Entry points">
        <div className="grid gap-[12px] sm:grid-cols-3">
          {overview.entryPoints.map((entry) => (
            <div key={entry.label} className="rounded-[8px] bg-[var(--uc-surface-muted)] p-[14px]">
              <p className="uc-type-n5-strong text-[var(--uc-text)]">{entry.label}</p>
              <p className="mt-[4px] uc-type-n5 text-[var(--uc-text-muted)]">{entry.intent}</p>
            </div>
          ))}
        </div>
      </Panel>

    </div>
  );
}

function MetaCell({ label, value, detail, testId }: { label: string; value: string; detail?: string; testId?: string }) {
  return (
    <div data-testid={testId} className="bg-[var(--uc-surface)] p-[10px]">
      <p className="uc-type-n5-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">{label}</p>
      <p className="mt-[2px] uc-type-n5-strong text-[var(--uc-text)]">{value}</p>
      {detail ? <p className="mt-[2px] uc-type-n6 text-[var(--uc-text-muted)]">{detail}</p> : null}
    </div>
  );
}

function OverviewNarrative({
  title,
  className,
  children,
}: {
  title: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <section className={`rounded-[8px] border-l-[3px] px-[12px] py-[10px] ${className}`}>
      <p className="uc-type-n5-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">{title}</p>
      <p className="mt-[3px] max-w-[980px] uc-type-n5">{children}</p>
    </section>
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
}: {
  flow: FlowDefinition;
  scenario: FlowScenario;
  activeStepIndex: number;
  journeyView: JourneyView;
  countryName: string;
  onScenarioSelect: (scenarioId: string) => void;
  onStepSelect: (index: number) => void;
  onJourneyViewChange: (view: JourneyView) => void;
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
        <div className="mt-[20px] grid gap-[24px] xl:grid-cols-[380px_1fr]">
          <div className="grid gap-[8px]">
            {scenario.steps.map((step, index) => {
              const active = index === activeStepIndex;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onStepSelect(index)}
                  aria-current={active}
                  className={`flex min-h-[58px] items-center gap-[12px] rounded-[8px] border px-[12px] text-left transition-colors ${
                    active
                      ? "border-[var(--uc-action)] bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface))]"
                      : "border-[var(--uc-border)] bg-[var(--uc-surface)] hover:border-[var(--uc-action)]"
                  }`}
                >
                  <span
                    className={`grid size-[26px] shrink-0 place-items-center rounded-full uc-type-n5-strong ${
                      active ? "bg-[var(--uc-action)] text-[var(--uc-text-inverse)]" : "bg-[var(--uc-surface-muted)] text-[var(--uc-text-muted)]"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block uc-type-n5-strong text-[var(--uc-text)]">{step.title}</span>
                    <span className="mt-[2px] block uc-type-n5 text-[var(--uc-text-muted)]">{step.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <div
            className="relative flex min-h-[540px] items-center justify-center rounded-[8px] border border-[var(--uc-border-muted)] bg-[var(--uc-neutral-200)] p-[24px]"
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
                  <FilmstripCard step={step} index={index} countryName={countryName} />
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
}: {
  step: FlowStep;
  index: number;
  countryName: string;
  contextLabel?: string;
  testId?: string;
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
    active: true,
  };

  // Keep the current stop in view as the reviewer moves along the line.
  useEffect(() => {
    const active = timelineRef.current?.querySelector<HTMLElement>("[data-timeline-active='true']");
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
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
          {/* Prev / timeline / next — the whole control in one line. */}
          <div className="flex items-center gap-[10px]">
            <TimelineArrow
              direction="back"
              label={history.length ? "Go back" : "Nothing to go back to"}
              disabled={history.length === 0 && !node?.back}
              onClick={stepBack}
            />

            <div ref={timelineRef} className="min-w-0 flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex items-center">
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
                            ? "border-[var(--uc-action)] bg-[var(--uc-action)] text-[var(--uc-text-inverse)]"
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

            <button
              type="button"
              onClick={() => {
                setHistory([]);
                setScreen(prototype.start);
              }}
              className="shrink-0 rounded-[8px] border border-[var(--uc-border)] px-[12px] py-[9px] uc-type-n5-strong text-[var(--uc-text)] transition-colors hover:border-[var(--uc-action)]"
            >
              Restart
            </button>
          </div>

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
  onScenarioSelect,
  onStepSelect,
}: {
  flow: FlowDefinition;
  scenario: FlowScenario;
  activeStep: FlowStep | undefined;
  activeStepIndex: number;
  onScenarioSelect: (scenarioId: string) => void;
  onStepSelect: (index: number) => void;
}) {
  const analysis = flow.overview.businessAnalysis;

  if (analysis) {
    return (
      <Panel title="Business analysis specification">
        <BusinessAnalysisContent analysis={analysis} />
      </Panel>
    );
  }

  const spec = activeStep ? flow.screenSpecs[activeStep.screen] : undefined;

  return (
    <div className="grid gap-[24px]">
      <Panel title="Screen spec">
        <ScenarioChips scenarios={flow.scenarios} selectedScenarioId={scenario.id} onSelect={onScenarioSelect} />
        {scenario.steps.length > 0 ? (
          <div className="mt-[12px] flex flex-wrap gap-[8px]">
            {scenario.steps.map((step, index) => (
              <SelectionChip key={step.id} active={index === activeStepIndex} onClick={() => onStepSelect(index)}>
                {index + 1}. {step.title}
              </SelectionChip>
            ))}
          </div>
        ) : null}

        {activeStep && spec ? (
          <ScreenSpecView step={activeStep} spec={spec} />
        ) : (
          <EmptyState message="No structured spec is attached to this screen yet." />
        )}
      </Panel>

      <FlowLevelSpec flow={flow} />
    </div>
  );
}

function ScreenSpecView({ step, spec }: { step: FlowStep; spec: FlowScreenSpec }) {
  return (
    <div className="mt-[18px] grid gap-[18px]">
      <div>
        <p className="uc-type-n5-strong uppercase tracking-[0.04em] text-[var(--uc-action)]">{step.title}</p>
        <p className="mt-[4px] uc-type-n4 text-[var(--uc-text)]">{spec.purpose}</p>
      </div>

      {spec.states?.length ? (
        <SpecBlock title="UI states">
          <BulletList items={spec.states} />
        </SpecBlock>
      ) : null}

      {spec.fields?.length ? (
        <SpecBlock title="Fields">
          <table className="w-full border-collapse overflow-hidden rounded-[8px] text-left">
            <thead>
              <tr className="bg-[var(--uc-surface-muted)]">
                {["Field", "Type", "Required", "Validation"].map((heading) => (
                  <th key={heading} className="border border-[var(--uc-border)] px-[10px] py-[7px] uc-type-n5-strong uppercase tracking-[0.03em] text-[var(--uc-text-muted)]">
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
                    {[field.validation, field.notes].filter(Boolean).join(" — ") || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SpecBlock>
      ) : null}

      {spec.actions?.length ? (
        <SpecBlock title="Actions">
          <div className="grid gap-[8px]">
            {spec.actions.map((action) => (
              <div key={action.label} className="flex flex-wrap gap-[8px] rounded-[8px] bg-[var(--uc-surface-muted)] px-[12px] py-[9px]">
                <span className="uc-type-n5-strong text-[var(--uc-text)]">{action.label}</span>
                <span className="uc-type-n5 text-[var(--uc-text-muted)]">→ {action.result}</span>
              </div>
            ))}
          </div>
        </SpecBlock>
      ) : null}

      {spec.back ? (
        <SpecBlock title="Back behavior">
          <p className="uc-type-n5 text-[var(--uc-text)]">{spec.back}</p>
        </SpecBlock>
      ) : null}

      {spec.edgeCases?.length ? (
        <SpecBlock title="Edge cases">
          <BulletList items={spec.edgeCases} />
        </SpecBlock>
      ) : null}

      {spec.acceptance?.length ? (
        <SpecBlock title="Acceptance criteria">
          <BulletList items={spec.acceptance} />
        </SpecBlock>
      ) : null}
    </div>
  );
}

function FlowLevelSpec({ flow }: { flow: FlowDefinition }) {
  const { overview } = flow;

  return (
    <Panel title="Flow specification">
      <p className="max-w-[860px] uc-type-n5 text-[var(--uc-text-muted)]">
        A practical reference for review and implementation. Each rule describes the expected customer-facing outcome and
        the data that must stay unchanged.
      </p>
      <div className="mt-[14px] grid gap-[12px]">
        <SpecBlock title="Key decision rules" description="What must happen consistently across the supported Mobile PI markets.">
          <BusinessRuleList items={overview.businessRules} />
        </SpecBlock>
        <SpecBlock title="Preconditions" description="Data and ledger conditions that must be true before enrichment is shown.">
          <BulletList items={overview.preconditions} />
        </SpecBlock>
        <SpecBlock title="Expected result" description="Where customers see the completed experience.">
          <BulletList items={overview.successDestinations} />
        </SpecBlock>
        <SpecBlock title="Analytics events" description="Events available for delivery and adoption monitoring.">
          <div className="flex flex-wrap gap-[8px]">
            {overview.analyticsEvents.map((event) => (
              <code key={event} className="rounded-[6px] bg-[var(--uc-surface-muted)] px-[8px] py-[4px] font-mono text-[12px] text-[var(--uc-text)]">
                {event}
              </code>
            ))}
          </div>
        </SpecBlock>
        <SpecBlock title="Questions to close" description="Items that require a product or delivery decision before release.">
          <BulletList items={overview.openQuestions} />
        </SpecBlock>
        {overview.notes.map((note) => (
          <SpecBlock key={note.title} title={note.title} description="Additional implementation context.">
            <p className="whitespace-pre-line uc-type-n5 text-[var(--uc-text-muted)]">{note.body}</p>
          </SpecBlock>
        ))}
      </div>
    </Panel>
  );
}

function BusinessAnalysisContent({ analysis }: { analysis: FlowBusinessAnalysisSpec }) {
  return (
    <div data-testid="business-analysis-document" className="max-w-[1120px]">
      <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] px-[14px] py-[12px]">
        <p className="uc-type-n5-strong text-[var(--uc-text)]">Reading guide</p>
        <p className="mt-[3px] uc-type-n5 text-[var(--uc-text-muted)]">
          One review document for product, design and delivery. Shared rules appear once; booked, pending, account,
          detail and fallback specifics sit in their relevant section. Credentials, service topology and live operational data are excluded.
        </p>
      </div>
      <div className="mt-[14px] grid gap-[12px]">
        <BusinessAnalysisSection number="01" title="General information" description="The shared business context for product, design and delivery review.">
          <div className="grid overflow-hidden rounded-[8px] border border-[var(--uc-border)] sm:grid-cols-2">
            {analysis.generalInformation.map((fact) => (
              <div key={fact.label} className="border-b border-[var(--uc-border)] bg-[var(--uc-surface)] p-[12px] last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 sm:[&:nth-odd]:border-r">
                <p className="uc-type-n6-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">{fact.label}</p>
                <p className="mt-[3px] uc-type-n5 text-[var(--uc-text)]">{fact.value}</p>
              </div>
            ))}
          </div>
        </BusinessAnalysisSection>
        <BusinessAnalysisSection number="02" title="Version history" description="A compact document history aligned to the BA structure.">
          <div className="overflow-x-auto rounded-[8px] border border-[var(--uc-border)]">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="bg-[var(--uc-surface-muted)]">
                {['Version', 'Date', 'Detail'].map((heading) => (
                  <th key={heading} className="border-b border-r border-[var(--uc-border)] px-[12px] py-[8px] text-left uc-type-n6-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)] last:border-r-0">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analysis.versionHistory.map((entry) => (
                <tr key={`${entry.version}-${entry.date}`}>
                  <td className="border-b border-r border-[var(--uc-border)] px-[12px] py-[9px] uc-type-n5-strong text-[var(--uc-text)]">{entry.version}</td>
                  <td className="border-b border-r border-[var(--uc-border)] px-[12px] py-[9px] uc-type-n5 text-[var(--uc-text)]">{entry.date}</td>
                  <td className="border-b border-[var(--uc-border)] px-[12px] py-[9px] uc-type-n5 text-[var(--uc-text)]">{entry.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </BusinessAnalysisSection>
        <BusinessAnalysisSection number="03" title="Version & change context" description="How this review artifact relates to the existing BA outline.">
          <p className="uc-type-n5 text-[var(--uc-text)]">{analysis.versionContext}</p>
        </BusinessAnalysisSection>
        <BusinessAnalysisSection number="04" title="Open issues" description="Scope boundaries and decisions to close before a production release.">
          <div className="grid gap-[8px]">
            {analysis.openIssues.map((issue) => (
              <article key={issue.reference} className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[12px]">
                <div className="flex flex-wrap items-center gap-[8px]">
                  <span className="rounded-[4px] bg-[var(--uc-surface-muted)] px-[7px] py-[3px] font-mono text-[11px] font-bold text-[var(--uc-text-muted)]">{issue.reference}</span>
                  <span className="rounded-[4px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] px-[7px] py-[3px] uc-type-n6-strong text-[var(--uc-text-muted)]">{issue.status}</span>
                  <h4 className="uc-type-n5-strong text-[var(--uc-text)]">{issue.title}</h4>
                </div>
                <p className="mt-[6px] uc-type-n5 text-[var(--uc-text)]">{issue.detail}</p>
              </article>
            ))}
          </div>
        </BusinessAnalysisSection>
        <AnalysisSectionList number="05" title="Requirement" description="The customer and ledger outcomes that the flow must preserve." sections={analysis.requirements} />
        <AnalysisSectionList number="06" title="Current status" description="What the existing Mobile PI experience already provides and what stays unchanged." sections={analysis.currentStatus} />
        <AnalysisSectionList number="07" title="Proposed solution" description="One decision system, with the specific customer states grouped where a BA expects to find them." sections={analysis.proposedSolution} />
        <AnalysisSectionList number="08" title="Non-functional requirements" description="Delivery guardrails that make the experience reliable, inclusive and safe to evolve." sections={analysis.nonFunctionalRequirements} />
      </div>
    </div>
  );
}

function AnalysisSectionList({ number, title, description, sections }: { number: string; title: string; description: string; sections: FlowBusinessAnalysisSpec['requirements'] }) {
  return (
    <BusinessAnalysisSection number={number} title={title} description={description}>
      <div className="grid gap-[10px]">
        {sections.map((section) => (
          <section key={section.title} className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[12px]">
            <h4 className="uc-type-n5-strong text-[var(--uc-text)]">{section.title}</h4>
            {section.description ? <p className="mt-[3px] uc-type-n5 text-[var(--uc-text-muted)]">{section.description}</p> : null}
            <div className="mt-[8px]"><BulletList items={section.items} /></div>
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
}: {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section data-ba-section={number} className="overflow-hidden rounded-[10px] border border-[var(--uc-border)] bg-[var(--uc-surface)]">
      <header className="flex flex-wrap items-start gap-[10px] border-b border-[var(--uc-border)] bg-[var(--uc-surface-muted)] px-[14px] py-[12px]">
        <span className="mt-[1px] rounded-[4px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[6px] py-[2px] font-mono text-[11px] font-bold text-[var(--uc-text-muted)]">{number}</span>
        <div className="min-w-0 flex-1">
          <h3 className="uc-type-n5-strong text-[var(--uc-text)]">{title}</h3>
          <p className="mt-[2px] uc-type-n5 text-[var(--uc-text-muted)]">{description}</p>
        </div>
      </header>
      <div className="p-[14px]">{children}</div>
    </section>
  );
}

function SpecBlock({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-[10px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[14px]">
      <h3 className="uc-type-n5-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">{title}</h3>
      {description ? <p className="mt-[3px] uc-type-n5 text-[var(--uc-text-muted)]">{description}</p> : null}
      <div className="mt-[8px]">{children}</div>
    </section>
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
    <ol className="grid gap-[8px]">
      {items.map((item, index) => {
        const { lead, detail } = splitLeadingSentence(item);
        return (
          <li key={item} className="grid gap-[8px] rounded-[8px] bg-[var(--uc-surface-muted)] p-[10px] sm:grid-cols-[auto_1fr]">
            <span className="h-fit w-fit rounded-full bg-[var(--uc-action-soft)] px-[8px] py-[3px] uc-type-n6-strong text-[var(--uc-action)]">
              Rule {index + 1}
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
