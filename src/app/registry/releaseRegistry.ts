/**
 * Release Registry
 * Defines explicit release/baseline bundles for the demo platform.
 */

import type {
  BaselineId,
  FeatureId,
  ReleaseId,
} from "@/app/state/demoTypes";
import { getBaselineFeatures, getPromotionTargetForRelease } from "@/app/registry/baselineRegistry";
import { FEATURE_MANIFESTS } from "@/app/registry/featureManifestRegistry";

export interface ReleaseBundle {
  id: ReleaseId;
  label: string;
  baseline: BaselineId;
  releaseCode: "CURRENT" | "FUTURE" | "R1" | "R2" | "R3" | "R4";
  features: readonly FeatureId[];
  introducedFeatures: readonly FeatureId[];
  promotionTargetBaseline: BaselineId | null;
  status: "baseline" | "release-preview";
}

export interface ReleaseDiff {
  release: ReleaseId;
  baseline: BaselineId;
  baselineFeatures: readonly FeatureId[];
  previewFeatures: readonly FeatureId[];
  addedFeatures: readonly FeatureId[];
  unchangedFeatures: readonly FeatureId[];
  flagRetirementCandidates: readonly FeatureId[];
}

export interface ReleasePromotionCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface ReleasePromotionReadiness {
  release: ReleaseId;
  targetBaseline: BaselineId | null;
  ready: boolean;
  checks: readonly ReleasePromotionCheck[];
}

export const RELEASE_ORDER: readonly ReleaseId[] = [
  "release-current",
  "release-future-cz-coapping",
  "release-future-cz-robo",
  "release-v1",
  "release-v2",
  "release-v3",
  "release-v4",
] as const;

export const RELEASE_BUNDLES: Record<ReleaseId, ReleaseBundle> = {
  "release-current": {
    id: "release-current",
    label: "Baseline",
    baseline: "baseline-current",
    releaseCode: "CURRENT",
    features: [],
    introducedFeatures: [],
    promotionTargetBaseline: null,
    status: "baseline",
  },
  "release-future-cz-coapping": {
    id: "release-future-cz-coapping",
    label: "CZ - Chatbot",
    baseline: "baseline-current",
    releaseCode: "FUTURE",
    features: ["fx_czCoAppingSmartAssistant"],
    introducedFeatures: ["fx_czCoAppingSmartAssistant"],
    promotionTargetBaseline: null,
    status: "release-preview",
  },
  "release-future-cz-robo": {
    id: "release-future-cz-robo",
    label: "CZ - Robo",
    baseline: "baseline-current",
    releaseCode: "FUTURE",
    features: ["fx_czRoboAdvisor"],
    introducedFeatures: ["fx_czRoboAdvisor"],
    promotionTargetBaseline: null,
    status: "release-preview",
  },
  "release-v1": {
    id: "release-v1",
    label: "Release R1 preview",
    baseline: "baseline-current",
    releaseCode: "R1",
    features: ["fx_newPaymentsHub"],
    introducedFeatures: ["fx_newPaymentsHub"],
    promotionTargetBaseline: "baseline-r1",
    status: "release-preview",
  },
  "release-v2": {
    id: "release-v2",
    label: "Release R2 preview",
    baseline: "baseline-current",
    releaseCode: "R2",
    features: ["fx_newPaymentsHub", "fx_cardsRedesign"],
    introducedFeatures: ["fx_cardsRedesign"],
    promotionTargetBaseline: "baseline-r2",
    status: "release-preview",
  },
  "release-v3": {
    id: "release-v3",
    label: "Release R3 preview",
    baseline: "baseline-current",
    releaseCode: "R3",
    features: ["fx_newPaymentsHub", "fx_cardsRedesign"],
    introducedFeatures: [],
    promotionTargetBaseline: "baseline-r3",
    status: "release-preview",
  },
  "release-v4": {
    id: "release-v4",
    label: "Release R4 preview",
    baseline: "baseline-current",
    releaseCode: "R4",
    features: [
      "fx_newPaymentsHub",
      "fx_cardsRedesign",
      "fx_quickActionsRedesign",
      "fx_enhancedAnalytics",
    ],
    introducedFeatures: ["fx_quickActionsRedesign", "fx_enhancedAnalytics"],
    promotionTargetBaseline: "baseline-r4",
    status: "release-preview",
  },
};

export function getReleaseBundle(release: ReleaseId): ReleaseBundle {
  return RELEASE_BUNDLES[release];
}

export function getReleaseDiff(release: ReleaseId): ReleaseDiff {
  const bundle = getReleaseBundle(release);
  const baselineFeatures = getBaselineFeatures(bundle.baseline);
  const addedFeatures = bundle.features.filter((featureId) => !baselineFeatures.includes(featureId));
  const unchangedFeatures = bundle.features.filter((featureId) => baselineFeatures.includes(featureId));
  const flagRetirementCandidates = addedFeatures.filter(
    (featureId) => FEATURE_MANIFESTS[featureId]?.targetBaseline === bundle.promotionTargetBaseline
  );

  return {
    release,
    baseline: bundle.baseline,
    baselineFeatures,
    previewFeatures: bundle.features,
    addedFeatures,
    unchangedFeatures,
    flagRetirementCandidates,
  };
}

export function getReleasePromotionReadiness(release: ReleaseId): ReleasePromotionReadiness {
  const bundle = getReleaseBundle(release);
  const targetBaseline = getPromotionTargetForRelease(release);
  const manifests = bundle.features.map((featureId) => FEATURE_MANIFESTS[featureId]).filter(Boolean);
  const missingManifests = bundle.features.filter((featureId) => !FEATURE_MANIFESTS[featureId]);
  const featuresWithoutTargetBaseline = manifests.filter((manifest) => !manifest.targetBaseline);
  const featuresWithoutScreens = manifests.filter((manifest) => manifest.affectedScreens.length === 0);
  const blockedCoverage = manifests.filter((manifest) =>
    ["blocked", "missing", "legacy"].includes(manifest.coverageStatus)
  );
  const isFuturePreview = bundle.releaseCode === "FUTURE";

  const checks: ReleasePromotionCheck[] = [
    {
      id: "target-baseline",
      label: "Target baseline",
      passed: bundle.status === "baseline" || isFuturePreview || targetBaseline !== null,
      detail:
        bundle.status === "baseline"
          ? "Current release is already the baseline state."
          : isFuturePreview
            ? "Future feature previews stay pinned to their source baseline until explicitly promoted."
          : targetBaseline
            ? `${release} promotes to ${targetBaseline.id}.`
            : `${release} has no promotion target.`,
    },
    {
      id: "feature-manifests",
      label: "Feature manifests",
      passed: missingManifests.length === 0,
      detail:
        missingManifests.length === 0
          ? `${bundle.features.length} release features have manifests.`
          : `Missing manifests: ${missingManifests.join(", ")}.`,
    },
    {
      id: "promotion-targets",
      label: "Promotion targets",
      passed: isFuturePreview || featuresWithoutTargetBaseline.length === 0,
      detail:
        isFuturePreview
          ? "No promotion target is required while this remains an isolated future feature preview."
          : featuresWithoutTargetBaseline.length === 0
            ? "Every release feature has a target baseline."
            : `Missing target baseline: ${featuresWithoutTargetBaseline.map((manifest) => manifest.id).join(", ")}.`,
    },
    {
      id: "affected-screens",
      label: "Affected screens",
      passed: featuresWithoutScreens.length === 0,
      detail:
        featuresWithoutScreens.length === 0
          ? "Every release feature lists affected screens."
          : `Missing affected screens: ${featuresWithoutScreens.map((manifest) => manifest.id).join(", ")}.`,
    },
    {
      id: "coverage",
      label: "Coverage status",
      passed: blockedCoverage.length === 0,
      detail:
        blockedCoverage.length === 0
          ? "No release feature is marked blocked, missing, or legacy."
          : `Weak coverage: ${blockedCoverage.map((manifest) => manifest.id).join(", ")}.`,
    },
  ];

  return {
    release,
    targetBaseline: bundle.promotionTargetBaseline,
    ready: checks.every((check) => check.passed),
    checks,
  };
}
