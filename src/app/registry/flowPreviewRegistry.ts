/**
 * Flow preview meta registry.
 *
 * Meta is DERIVED from the flow definitions in
 * `@/app/screens/flow-library/flows` so there is a single source of truth: adding
 * or editing a flow happens in one data module, and this registry (consumed by the
 * app shell, the top-bar and deep-link parsing) stays automatically in sync.
 */

import { FLOW_DEFINITIONS, FLOW_ORDER } from "@/app/screens/flow-library/flows";
import type { CountryId } from "@/app/state/demoTypes";
import type { FlowPreviewId, FlowStatus } from "@/app/screens/flow-library/flows/types";

export type { FlowPreviewId } from "@/app/screens/flow-library/flows/types";

export interface FlowPreviewMeta {
  id: FlowPreviewId;
  title: string;
  label: string;
  countryScope: readonly CountryId[];
  status: FlowStatus;
  domain: string;
  figmaFile: string;
  figmaNodeId: string;
  sourceUrl: string;
  summary: string;
}

export const FLOW_PREVIEW_ORDER: readonly FlowPreviewId[] = FLOW_ORDER;

export const FLOW_PREVIEWS: Record<FlowPreviewId, FlowPreviewMeta> = FLOW_ORDER.reduce(
  (acc, id) => {
    const flow = FLOW_DEFINITIONS[id];
    acc[id] = {
      id: flow.id,
      title: flow.title,
      label: flow.label,
      countryScope: flow.countryScope,
      status: flow.status,
      domain: flow.domain,
      figmaFile: flow.figmaFile,
      figmaNodeId: flow.figmaNodeId,
      sourceUrl: flow.sourceUrl,
      summary: flow.summary,
    };
    return acc;
  },
  {} as Record<FlowPreviewId, FlowPreviewMeta>,
);

export function getFlowPreviewMeta(flowId: FlowPreviewId): FlowPreviewMeta {
  return FLOW_PREVIEWS[flowId];
}
