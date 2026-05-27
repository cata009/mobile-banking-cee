/**
 * Release Registry
 * Defines explicit release/baseline bundles for the demo platform.
 */

import type {
  BaselineId,
  FeatureId,
  ReleaseId,
} from "@/app/state/demoTypes";

export interface ReleaseBundle {
  id: ReleaseId;
  label: string;
  baseline: BaselineId;
  features: readonly FeatureId[];
  status: "baseline" | "release-preview";
}

export const RELEASE_ORDER: readonly ReleaseId[] = [
  "release-current",
  "release-v1",
  "release-v2",
  "release-v3",
  "release-v4",
] as const;

export const RELEASE_BUNDLES: Record<ReleaseId, ReleaseBundle> = {
  "release-current": {
    id: "release-current",
    label: "Current baseline",
    baseline: "baseline-current",
    features: [],
    status: "baseline",
  },
  "release-v1": {
    id: "release-v1",
    label: "Release V1 preview",
    baseline: "baseline-current",
    features: ["fx_newPaymentsHub"],
    status: "release-preview",
  },
  "release-v2": {
    id: "release-v2",
    label: "Release V2 preview",
    baseline: "baseline-current",
    features: ["fx_newPaymentsHub", "fx_cardsRedesign"],
    status: "release-preview",
  },
  "release-v3": {
    id: "release-v3",
    label: "Release V3 preview",
    baseline: "baseline-current",
    features: ["fx_newPaymentsHub", "fx_cardsRedesign"],
    status: "release-preview",
  },
  "release-v4": {
    id: "release-v4",
    label: "Release V4 preview",
    baseline: "baseline-current",
    features: ["fx_quickActionsRedesign", "fx_enhancedAnalytics"],
    status: "release-preview",
  },
};

export function getReleaseBundle(release: ReleaseId): ReleaseBundle {
  return RELEASE_BUNDLES[release];
}
