import { CARD_PIN_FLOW } from "./cardPin";
import { ETHOCA_FLOW } from "./ethoca";
import { ROUND_UP_FLOW } from "./roundUp";
import { RS_PROPERTY_INSURANCE_FLOW } from "./rsPropertyInsurance";
import type { FlowDefinition, FlowPreviewId, FlowScenario } from "./types";

/** Single source of truth for the flows shipped in the library. */
export const FLOW_DEFINITIONS: Record<FlowPreviewId, FlowDefinition> = {
  "ro-round-up": ROUND_UP_FLOW,
  "ro-card-pin": CARD_PIN_FLOW,
  "mobile-pi-ethoca": ETHOCA_FLOW,
  "rs-property-insurance": RS_PROPERTY_INSURANCE_FLOW,
};

/** Display order. Adding a flow = add a data module + one entry here. */
export const FLOW_ORDER: readonly FlowPreviewId[] = ["rs-property-insurance", "mobile-pi-ethoca", "ro-round-up", "ro-card-pin"];

export function getFlowDefinition(id: FlowPreviewId): FlowDefinition {
  return FLOW_DEFINITIONS[id];
}

const EMPTY_SCENARIO: FlowScenario = {
  id: "__empty__",
  label: "No scenarios",
  kind: "happy",
  description: "No scenarios are configured for this flow preview yet.",
  steps: [],
};

/**
 * Resolve a requested scenario id to a real scenario, falling back to the flow's
 * default, then its first scenario, then a safe empty scenario.
 */
export function resolveScenario(
  flow: FlowDefinition,
  requestedScenarioId: string,
): { scenarioId: string; scenario: FlowScenario } {
  const requested = flow.scenarios.find((scenario) => scenario.id === requestedScenarioId);
  if (requested) return { scenarioId: requested.id, scenario: requested };

  const fallback = flow.scenarios.find((scenario) => scenario.id === flow.defaultScenarioId);
  if (fallback) return { scenarioId: fallback.id, scenario: fallback };

  const first = flow.scenarios[0];
  if (first) return { scenarioId: first.id, scenario: first };

  return { scenarioId: EMPTY_SCENARIO.id, scenario: EMPTY_SCENARIO };
}

export type { FlowDefinition, FlowPreviewId, FlowScenario } from "./types";
