/**
 * Feature Manifest Registry
 * Governs feature authority before runtime UI branches are added.
 */

import { COUNTRIES, FEATURE_META } from "@/app/registry/demoConfig";
import type {
  BaselineId,
  CapabilityStatus,
  CountryId,
  DataSourceAuthority,
  DesignSystemId,
  FeatureId,
  ProductId,
  ReleaseId,
  ScreenId,
} from "@/app/state/demoTypes";

export type FeatureManifestSource = "catalog" | "design-system" | "runtime" | "template" | "knowledge";

export interface FeatureManifest {
  id: FeatureId;
  label: string;
  description: string;
  authority: DataSourceAuthority;
  source: FeatureManifestSource;
  introducedIn: ReleaseId | null;
  targetBaseline: BaselineId | null;
  products: readonly ProductId[];
  countries: readonly CountryId[];
  designSystems: readonly DesignSystemId[];
  affectedScreens: readonly ScreenId[];
  lifecycleStatus: CapabilityStatus;
  coverageStatus: CapabilityStatus;
  promotionChecks: readonly string[];
  retirementRule: string;
}

function countriesForFeature(featureId: FeatureId): readonly CountryId[] {
  const meta = FEATURE_META[featureId];
  return meta.scope === "countries" ? meta.countries ?? [] : COUNTRIES;
}

function productsForFeature(featureId: FeatureId): readonly ProductId[] {
  return FEATURE_META[featureId].products ?? ["PI"];
}

function designSystemsForFeature(featureId: FeatureId): readonly DesignSystemId[] {
  return FEATURE_META[featureId].designSystems ?? ["current"];
}

function targetBaselineForRelease(release: ReleaseId | null | undefined): BaselineId | null {
  switch (release) {
    case "release-v1":
      return "baseline-r1";
    case "release-v2":
      return "baseline-r2";
    case "release-v3":
      return "baseline-r3";
    case "release-v4":
      return "baseline-r4";
    default:
      return null;
  }
}

function buildManifest(featureId: FeatureId, source: FeatureManifestSource): FeatureManifest {
  const meta = FEATURE_META[featureId];
  const introducedIn = meta.introducedIn ?? null;
  const isFutureFeature = introducedIn?.startsWith("release-future") ?? false;

  return {
    id: featureId,
    label: meta.label,
    description: meta.description ?? meta.label,
    authority: meta.kind === "release" ? "authority" : "reference",
    source,
    introducedIn,
    targetBaseline: meta.baselineFrom ?? targetBaselineForRelease(introducedIn),
    products: productsForFeature(featureId),
    countries: countriesForFeature(featureId),
    designSystems: designSystemsForFeature(featureId),
    affectedScreens: meta.affectedScreens ?? [],
    lifecycleStatus: meta.lifecycleStatus ?? "configured",
    coverageStatus: meta.coverageStatus ?? "configured",
    promotionChecks: [
      "manifest present",
      "release bundle references manifest id",
      "affected screens listed",
      "coverage status declared",
      isFutureFeature
        ? "source baseline captured for future feature preview"
        : "target baseline declared for release features",
    ],
    retirementRule:
      isFutureFeature
        ? "Keep pinned to its source baseline until the feature is explicitly rebased or promoted into the official baseline."
        : meta.kind === "release"
        ? "Retire release gating after the target baseline is promoted and the feature is listed in the baseline ledger."
        : "Keep as operator-only scenario flag until it is either promoted into a release manifest or removed.",
  };
}

export const FEATURE_MANIFESTS: Record<FeatureId, FeatureManifest> = {
  fx_newPaymentsHub: buildManifest("fx_newPaymentsHub", "runtime"),
  fx_cardsRedesign: buildManifest("fx_cardsRedesign", "runtime"),
  fx_czCoAppingSmartAssistant: buildManifest("fx_czCoAppingSmartAssistant", "runtime"),
  fx_czRoboAdvisor: buildManifest("fx_czRoboAdvisor", "runtime"),
  fx_app2027Homepage: buildManifest("fx_app2027Homepage", "runtime"),
  fx_evo2027Homepage: buildManifest("fx_evo2027Homepage", "runtime"),
  fx_quickActionsRedesign: buildManifest("fx_quickActionsRedesign", "catalog"),
  fx_unplannedBanner: buildManifest("fx_unplannedBanner", "runtime"),
  fx_transactionsFilters: buildManifest("fx_transactionsFilters", "catalog"),
  fx_enhancedAnalytics: buildManifest("fx_enhancedAnalytics", "runtime"),
};

export function getFeatureManifest(featureId: FeatureId): FeatureManifest {
  return FEATURE_MANIFESTS[featureId];
}

export function getReleaseFeatureManifests(release: ReleaseId): FeatureManifest[] {
  return Object.values(FEATURE_MANIFESTS).filter((manifest) => manifest.introducedIn === release);
}

export function getFeatureManifestsByBaseline(baseline: BaselineId): FeatureManifest[] {
  return Object.values(FEATURE_MANIFESTS).filter((manifest) => manifest.targetBaseline === baseline);
}

export function hasPromotionTarget(featureId: FeatureId): boolean {
  return FEATURE_MANIFESTS[featureId].targetBaseline !== null;
}
