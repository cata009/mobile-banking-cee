import { useRef, useState, type ReactNode } from "react";
import { AppIcon } from "@/app/components/icons";
import { SelectionChip, StatusBadge, downloadTextFile } from "@/app/screens/tools/toolsUi";
import { COUNTRY_META } from "@/app/registry/demoConfig";
import { createPhoneScreenshotBlob } from "@/app/utils/phoneScreenshot";
import MiniPhone from "./MiniPhone";
import { renderFlowPreview } from "./flowPreviews";
import { resolveScenario } from "../flows";
import type {
  FlowDefinition,
  FlowScenario,
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

type DetailTab = "overview" | "journey" | "spec";
type JourneyView = "focused" | "filmstrip";

const TABS: Array<{ id: DetailTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "journey", label: "Journey" },
  { id: "spec", label: "Spec" },
];

const SCENARIO_TONE: Record<FlowScenario["kind"], { label: string; className: string }> = {
  happy: { label: "Happy path", className: "text-[var(--uc-green-status)]" },
  alternate: { label: "Alternate", className: "text-[var(--uc-action)]" },
  error: { label: "Error path", className: "text-[var(--uc-red-main)]" },
};

function statusBadgeTone(status: FlowDefinition["status"]): "ok" | "warn" | "risk" {
  return status === "baseline-candidate" ? "ok" : "warn";
}

function toExportOverview(flow: FlowDefinition): ExportOverview {
  const { overview } = flow;
  return {
    purpose: overview.purpose,
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
      <FlowHeader
        flow={flow}
        exportKind={exportKind}
        exportError={exportError}
        onExport={handleExport}
        onBackToIndex={onBackToIndex}
      />

      <DetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "overview" ? (
        <OverviewPanel flow={flow} onOpenScenario={(scenarioId) => { selectScenario(scenarioId); setActiveTab("journey"); }} />
      ) : null}

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
  onBackToIndex,
}: {
  flow: FlowDefinition;
  exportKind: "pdf" | "word" | null;
  exportError: string | null;
  onExport: (kind: "pdf" | "word") => void;
  onBackToIndex: () => void;
}) {
  return (
    <header className="rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[24px] shadow-sm">
      <button
        type="button"
        onClick={onBackToIndex}
        className="mb-[12px] inline-flex items-center gap-[6px] uc-type-n5-strong text-[var(--uc-action)] hover:underline"
      >
        <AppIcon name="back-heavy" size={16} color="currentColor" />
        Flow library
      </button>

      <div className="flex flex-wrap items-start justify-between gap-[20px]">
        <div className="max-w-[760px]">
          <p className="uc-type-n5-strong uppercase tracking-[0.04em] text-[var(--uc-action)]">{flow.domain}</p>
          <h1 className="mt-[6px] text-[32px] font-bold leading-[38px] text-[var(--uc-text)]">{flow.title}</h1>
          <p className="mt-[10px] uc-type-n4 text-[var(--uc-text-muted)]">{flow.summary}</p>
          <div className="mt-[14px] flex flex-wrap items-center gap-[8px]">
            <StatusBadge tone={statusBadgeTone(flow.status)}>{flow.status.replace(/-/g, " ")}</StatusBadge>
            {flow.countryScope.map((country) => (
              <MetaChip key={country}>{country}</MetaChip>
            ))}
            <a
              href={flow.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-[6px] rounded-[16px] border border-[var(--uc-border)] px-[12px] py-[6px] uc-type-n5-strong text-[var(--uc-action)] hover:border-[var(--uc-action)]"
            >
              Figma {flow.figmaNodeId}
            </a>
          </div>
        </div>

        <div className="flex flex-col items-end gap-[8px]">
          <div className="flex flex-wrap gap-[8px]">
            <ExportButton label="Export PDF" busy={exportKind === "pdf"} disabled={exportKind !== null} onClick={() => onExport("pdf")} testId="flow-export-pdf" />
            <ExportButton label="Export Word" busy={exportKind === "word"} disabled={exportKind !== null} onClick={() => onExport("word")} testId="flow-export-word" />
          </div>
          {exportError ? (
            <p role="alert" className="max-w-[280px] text-right uc-type-n5 text-[var(--uc-red-main)]">
              {exportError}
            </p>
          ) : (
            <p className="uc-type-n5 text-[var(--uc-text-muted)]">Screens + full spec, ready for handoff.</p>
          )}
        </div>
      </div>
    </header>
  );
}

function ExportButton({
  label,
  busy,
  disabled,
  onClick,
  testId,
}: {
  label: string;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className="inline-flex items-center gap-[6px] rounded-[20px] bg-[var(--uc-action)] px-[16px] py-[9px] uc-type-n5-strong text-[var(--uc-text-inverse)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <AppIcon name="download" size={15} color="currentColor" />
      {busy ? "Preparing…" : label}
    </button>
  );
}

function DetailTabs({ activeTab, onTabChange }: { activeTab: DetailTab; onTabChange: (tab: DetailTab) => void }) {
  return (
    <div role="tablist" aria-label="Flow sections" className="flex flex-wrap gap-[8px] border-b border-[var(--uc-border)]">
      {TABS.map((tab) => {
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

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section role="tabpanel" className="rounded-[12px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[20px] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-[12px]">
        <h2 className="uc-type-h2 text-[var(--uc-text)]">{title}</h2>
        {action ?? null}
      </div>
      <div className="mt-[16px]">{children}</div>
    </section>
  );
}

function MetaChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-[16px] bg-[var(--uc-surface-muted)] px-[12px] py-[6px] uc-type-n5-strong text-[var(--uc-text)]">
      {children}
    </span>
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

function OverviewPanel({ flow, onOpenScenario }: { flow: FlowDefinition; onOpenScenario: (scenarioId: string) => void }) {
  const { overview } = flow;
  return (
    <div className="grid gap-[24px]">
      <Panel title="At a glance">
        <div className="grid gap-px overflow-hidden rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-border)] sm:grid-cols-2 lg:grid-cols-4">
          <MetaCell label="Status" value={flow.status.replace(/-/g, " ")} />
          <MetaCell label="Domain" value={flow.domain} />
          <MetaCell label="Country scope" value={flow.countryScope.join(", ")} />
          <MetaCell label="Scenarios" value={String(flow.scenarios.length)} />
        </div>
        <p className="mt-[16px] max-w-[860px] uc-type-n4 text-[var(--uc-text)]">{overview.purpose}</p>
        <p className="mt-[8px] max-w-[860px] uc-type-n5 text-[var(--uc-text-muted)]">{overview.scopeNote}</p>
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

      <Panel title="Scenarios">
        <p className="mb-[12px] uc-type-n5 text-[var(--uc-text-muted)]">
          A scenario is one path through the flow; a step is one screen. Open a scenario to walk its screens and read the
          per-screen spec.
        </p>
        <div className="grid gap-[10px]">
          {flow.scenarios.map((scenario) => {
            const tone = SCENARIO_TONE[scenario.kind];
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => onOpenScenario(scenario.id)}
                className="flex items-center justify-between gap-[16px] rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[16px] py-[14px] text-left transition-colors hover:border-[var(--uc-action)]"
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-[8px]">
                    <span className="uc-type-n4-strong text-[var(--uc-text)]">{scenario.label}</span>
                    <span className={`uc-type-n5-strong ${tone.className}`}>{tone.label}</span>
                  </span>
                  <span className="mt-[2px] block uc-type-n5 text-[var(--uc-text-muted)]">{scenario.description}</span>
                </span>
                <span className="flex shrink-0 items-center gap-[8px] uc-type-n5-strong text-[var(--uc-text-muted)]">
                  {scenario.steps.length} steps
                  <AppIcon name="chevron-link" size={20} color="var(--uc-action)" />
                </span>
              </button>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--uc-surface)] p-[14px]">
      <p className="uc-type-n5-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">{label}</p>
      <p className="mt-[4px] uc-type-n4-strong capitalize text-[var(--uc-text)]">{value}</p>
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
              className={`rounded-[8px] px-[14px] py-[6px] uc-type-n5-strong capitalize transition-colors ${
                journeyView === view
                  ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm"
                  : "text-[var(--uc-text-muted)] hover:text-[var(--uc-text)]"
              }`}
            >
              {view}
            </button>
          ))}
        </div>
      }
    >
      <ScenarioChips scenarios={flow.scenarios} selectedScenarioId={scenario.id} onSelect={onScenarioSelect} />
      <p className="mt-[10px] max-w-[860px] uc-type-n5 text-[var(--uc-text-muted)]">{scenario.description}</p>

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
          <div className="flex min-h-[540px] items-center justify-center rounded-[8px] bg-[var(--uc-surface-muted)] p-[24px]">
            {activeStep ? (
              <MiniPhone scale={0.82}>{renderFlowPreview(activeStep.screen, { countryName })}</MiniPhone>
            ) : null}
          </div>
        </div>
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
      )}
    </Panel>
  );
}

function FilmstripCard({ step, index, countryName }: { step: FlowStep; index: number; countryName: string }) {
  const screenRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    const element = screenRef.current;
    if (!element || busy) return;
    setBusy(true);
    try {
      const { blob } = await createPhoneScreenshotBlob({ screenElement: element, mode: "visible" });
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
    <article className="w-[200px] shrink-0">
      <div className="relative">
        <MiniPhone ref={screenRef} scale={0.5}>
          {renderFlowPreview(step.screen, { countryName })}
        </MiniPhone>
        <button
          type="button"
          onClick={handleDownload}
          disabled={busy}
          className="absolute right-[8px] top-[8px] z-20 grid size-[30px] place-items-center rounded-full border border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-md hover:border-[var(--uc-action)] hover:text-[var(--uc-action)] disabled:opacity-50"
          aria-label={`Download ${step.title} screen`}
          title={`Download ${step.title}`}
        >
          <AppIcon name="download" size={16} color="currentColor" />
        </button>
      </div>
      <h3 className="mt-[12px] uc-type-n5-strong text-[var(--uc-text)]">
        {index + 1}. {step.title}
      </h3>
      <p className="mt-[4px] uc-type-n5 text-[var(--uc-text-muted)]">{step.description}</p>
    </article>
  );
}

function JourneyArrow() {
  return (
    <div className="mt-[190px] flex h-[32px] w-[28px] items-center justify-center text-[var(--uc-action)]" aria-hidden="true">
      <div className="h-[2px] w-[24px] bg-[var(--uc-action)]" />
      <div className="ml-[-7px] h-[10px] w-[10px] rotate-45 border-r-[2px] border-t-[2px] border-[var(--uc-action)]" />
    </div>
  );
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
  const spec = activeStep ? flow.screenSpecs[activeStep.screen] : undefined;

  const handleCopy = () => {
    downloadTextFile(`flow-${flow.id}-spec.txt`, buildSpecText(flow), "text/plain");
  };

  return (
    <div className="grid gap-[24px]">
      <Panel
        title="Screen spec"
        action={
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-[6px] rounded-[20px] bg-[var(--uc-surface-muted)] px-[14px] py-[8px] uc-type-n5-strong text-[var(--uc-text)] hover:bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface-muted))]"
          >
            <AppIcon name="download" size={15} color="currentColor" />
            Download .txt
          </button>
        }
      >
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
      <div className="grid gap-[18px]">
        <SpecBlock title="Business rules">
          <BulletList items={overview.businessRules} />
        </SpecBlock>
        <SpecBlock title="Preconditions">
          <BulletList items={overview.preconditions} />
        </SpecBlock>
        <SpecBlock title="Signing">
          <p className="uc-type-n5 text-[var(--uc-text)]">{overview.signing}</p>
        </SpecBlock>
        <SpecBlock title="Success destinations">
          <BulletList items={overview.successDestinations} />
        </SpecBlock>
        <SpecBlock title="Analytics events">
          <div className="flex flex-wrap gap-[8px]">
            {overview.analyticsEvents.map((event) => (
              <code key={event} className="rounded-[6px] bg-[var(--uc-surface-muted)] px-[8px] py-[4px] font-mono text-[12px] text-[var(--uc-text)]">
                {event}
              </code>
            ))}
          </div>
        </SpecBlock>
        <SpecBlock title="Open questions">
          <BulletList items={overview.openQuestions} />
        </SpecBlock>
        {overview.notes.map((note) => (
          <SpecBlock key={note.title} title={note.title}>
            <p className="whitespace-pre-line uc-type-n5 text-[var(--uc-text-muted)]">{note.body}</p>
          </SpecBlock>
        ))}
      </div>
    </Panel>
  );
}

function SpecBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="uc-type-n5-strong uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">{title}</h3>
      <div className="mt-[8px]">{children}</div>
    </div>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid list-disc gap-[6px] pl-[18px]">
      {items.map((item) => (
        <li key={item} className="uc-type-n5 text-[var(--uc-text)]">
          {item}
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-[16px] rounded-[8px] border border-dashed border-[var(--uc-border)] bg-[var(--uc-surface-muted)] px-[16px] py-[24px] text-center uc-type-n5 text-[var(--uc-text-muted)]">
      {message}
    </div>
  );
}

function buildSpecText(flow: FlowDefinition): string {
  const lines: string[] = [`${flow.title} — flow specification`, ""];
  lines.push(`Purpose: ${flow.overview.purpose}`, "");
  lines.push("Business rules:");
  flow.overview.businessRules.forEach((rule) => lines.push(`  - ${rule}`));
  lines.push("", "Scenarios:");
  flow.scenarios.forEach((scenario) => {
    lines.push(`  ${scenario.label} (${scenario.kind}) — ${scenario.description}`);
    scenario.steps.forEach((step, index) => {
      const spec = flow.screenSpecs[step.screen];
      lines.push(`    ${index + 1}. ${step.title}${spec ? ` — ${spec.purpose}` : ""}`);
    });
  });
  return lines.join("\n");
}
