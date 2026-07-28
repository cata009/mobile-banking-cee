/**
 * Flow Library — typed model.
 *
 * A "flow definition" is the single source of truth for one future/not-yet-baseline
 * journey. It drives three things at once:
 *   1. the interactive journey preview (which DS-composed screen renders per step),
 *   2. the on-screen, spec-grade documentation a business analyst reads, and
 *   3. the exported PDF/Word handoff.
 *
 * Keep this file free of React/DOM imports so it can be imported by data modules,
 * the export layer, and tests without pulling in the preview components.
 */

import type { CountryId } from "@/app/state/demoTypes";

/** Stable ids for the flows shipped in the library. */
export type FlowPreviewId = "ro-round-up" | "ro-card-pin" | "mobile-pi-ethoca";

/**
 * Screen kinds a preview step can render. Each maps to a DS-composed preview in
 * `../components/flowPreviews.tsx`. Adding a screen = add a kind here + a case there.
 */
export type RoundUpScreenKind =
  | "home-entry"
  | "products-round-up"
  | "round-up-info"
  | "open-savings"
  | "setup-form"
  | "sign"
  | "success-active"
  | "accounts-active"
  | "manage"
  | "confirm-deactivate"
  | "success-deactivated";

export type CardPinScreenKind =
  | "cards-credit"
  | "cards-debit"
  | "card-options-credit"
  | "card-options-debit"
  | "pin-faceid-credit"
  | "pin-faceid-debit"
  | "pin-reveal-credit-hidden"
  | "pin-reveal-credit-visible"
  | "pin-reveal-debit-hidden"
  | "pin-reveal-debit-visible"
  | "set-pin-credit-empty"
  | "set-pin-credit-filled"
  | "set-pin-debit-empty"
  | "set-pin-debit-filled"
  | "pin-sign"
  | "pin-success"
  | "pin-not-eligible-credit"
  | "pin-not-eligible-debit";

/** Global card-transaction enrichment states sourced from Mastercard Ethoca. */
export type EthocaScreenKind =
  | "ethoca-list-merchant-logo"
  | "ethoca-account-list-merchant-logo"
  | "ethoca-list-pending-merchant-logo"
  | "ethoca-account-list-pending-merchant-logo"
  | "ethoca-detail-pending-merchant-logo"
  | "ethoca-list-pfm-fallback"
  | "ethoca-detail-partial-data"
  | "ethoca-detail-in-store"
  | "ethoca-detail-online"
  | "ethoca-detail-logo-unavailable";

export type FlowScreenKind = RoundUpScreenKind | CardPinScreenKind | EthocaScreenKind;

/** Where a flow sits on the road to production. Drives the status chip + filtering. */
export type FlowStatus = "future-release-preview" | "in-review" | "baseline-candidate";

export type FlowScenarioKind = "happy" | "alternate" | "error";

/** A single input/data point on a screen — the rows of a BA field table. */
export interface FlowFieldSpec {
  name: string;
  type: string;
  required?: boolean;
  validation?: string;
  notes?: string;
}

/** One CTA / control and what activating it does. */
export interface FlowActionSpec {
  label: string;
  result: string;
}

/**
 * The per-screen specification. Attached to a screen kind (not a step occurrence)
 * so a screen shared across scenarios is documented once.
 */
export interface FlowScreenSpec {
  purpose: string;
  /** UI states / variants the screen can show. */
  states?: string[];
  /** Fields / data points rendered or captured. */
  fields?: FlowFieldSpec[];
  /** Primary + secondary actions and their outcome/routing. */
  actions?: FlowActionSpec[];
  /** What the back / dismiss control does. */
  back?: string;
  /** Non-happy-path situations to design for. */
  edgeCases?: string[];
  /** Testable acceptance criteria. */
  acceptance?: string[];
}

/** A step in a scenario: a labelled stop that renders one screen. */
export interface FlowStep {
  id: string;
  title: string;
  description: string;
  screen: FlowScreenKind;
}

/** A concrete path through the flow (happy path, an alternate, or an error path). */
export interface FlowScenario {
  id: string;
  label: string;
  description: string;
  kind: FlowScenarioKind;
  steps: FlowStep[];
}

/** A named entry point into the flow and the user intent it serves. */
export interface FlowEntryPoint {
  label: string;
  intent: string;
}

/** Long-form analyst prose, preserved from the original UX write-ups. */
export interface FlowNote {
  title: string;
  body: string;
}

/** A concise fact rendered in the BA-style General information section. */
export interface FlowAnalysisFact {
  label: string;
  value: string;
}

/** A concise entry for the BA-style document history. */
export interface FlowAnalysisVersion {
  version: string;
  date: string;
  detail: string;
}

/** An open BA decision with the familiar reference and review status. */
export interface FlowAnalysisOpenIssue {
  reference: string;
  status: "Open" | "Info";
  title: string;
  detail: string;
}

/** A named BA subsection, replacing duplicated scenario-specific spec tabs. */
export interface FlowAnalysisSection {
  title: string;
  description?: string;
  items: readonly string[];
}

/**
 * A business-analysis companion structure for flows that need to mirror the
 * established BA document shape without exposing implementation credentials,
 * service names, or live production data.
 */
export interface FlowBusinessAnalysisSpec {
  generalInformation: readonly FlowAnalysisFact[];
  versionContext: string;
  versionHistory: readonly FlowAnalysisVersion[];
  openIssues: readonly FlowAnalysisOpenIssue[];
  requirements: readonly FlowAnalysisSection[];
  currentStatus: readonly FlowAnalysisSection[];
  proposedSolution: readonly FlowAnalysisSection[];
  nonFunctionalRequirements: readonly FlowAnalysisSection[];
}

/**
 * Flow-level structured specification — the handoff a BA lifts to write the spec.
 * Concise structured fields up top; rich narrative preserved in `notes`.
 */
export interface FlowOverviewSpec {
  purpose: string;
  scopeNote: string;
  /** Optional BA-aligned presentation for complex cross-functional flows. */
  businessAnalysis?: FlowBusinessAnalysisSpec;
  entryPoints: FlowEntryPoint[];
  preconditions: string[];
  businessRules: string[];
  /** Present only for flows that require an explicit signing step. */
  signing?: string;
  successDestinations: string[];
  analyticsEvents: string[];
  openQuestions: string[];
  notes: FlowNote[];
}

/** The single source of truth for one flow. */
export interface FlowDefinition {
  id: FlowPreviewId;
  title: string;
  label: string;
  summary: string;
  /** Product domain used for grouping/filtering (e.g. "Savings", "Cards"). */
  domain: string;
  countryScope: readonly CountryId[];
  status: FlowStatus;
  figmaFile: string;
  figmaNodeId: string;
  sourceUrl: string;
  overview: FlowOverviewSpec;
  /** Per-screen specs, keyed by screen kind (documented once, reused across scenarios). */
  screenSpecs: Partial<Record<FlowScreenKind, FlowScreenSpec>>;
  defaultScenarioId: string;
  scenarios: FlowScenario[];
}
