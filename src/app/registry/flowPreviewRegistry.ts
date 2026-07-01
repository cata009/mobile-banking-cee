import type { CountryId } from "@/app/state/demoTypes";

export type FlowPreviewId = "ro-round-up" | "ro-card-pin";

export interface FlowPreviewMeta {
  id: FlowPreviewId;
  title: string;
  label: string;
  countryScope: readonly CountryId[];
  status: "future-release-preview";
  figmaFile: string;
  figmaNodeId: string;
  sourceUrl: string;
  summary: string;
}

export const FLOW_PREVIEW_ORDER: readonly FlowPreviewId[] = ["ro-round-up", "ro-card-pin"] as const;

export const FLOW_PREVIEWS: Record<FlowPreviewId, FlowPreviewMeta> = {
  "ro-round-up": {
    id: "ro-round-up",
    title: "Round Up",
    label: "RO Round Up",
    countryScope: ["RO"],
    status: "future-release-preview",
    figmaFile: "RO Enablers",
    figmaNodeId: "2344:10093",
    sourceUrl: "https://www.figma.com/design/sQcjbRC5p4CmldGUqh0mrn/RO-Enablers?node-id=2344-10093",
    summary:
      "Future Romania-only savings flow for rounding eligible card payments and moving spare change into a savings account.",
  },
  "ro-card-pin": {
    id: "ro-card-pin",
    title: "View / Reset PIN",
    label: "RO Card PIN",
    countryScope: ["RO"],
    status: "future-release-preview",
    figmaFile: "RO Enablers",
    figmaNodeId: "2247:16744",
    sourceUrl: "https://www.figma.com/design/sQcjbRC5p4CmldGUqh0mrn/RO-Enablers?node-id=2247-16744",
    summary:
      "Romania PI card flow for viewing a card PIN after Face ID and changing the PIN through Set PIN, Sign, and success states.",
  },
};

export function getFlowPreviewMeta(flowId: FlowPreviewId): FlowPreviewMeta {
  return FLOW_PREVIEWS[flowId];
}
