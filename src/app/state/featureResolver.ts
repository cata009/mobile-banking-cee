/**
 * Feature Flag Resolver
 * Business logic for determining feature activation state.
 */

import type { DemoState, FeatureId } from "./demoTypes";
import { FEATURE_META } from "@/app/registry/demoConfig";
import { getReleaseBundle } from "@/app/registry/releaseRegistry";
import { getCurrentFlags } from "./demoStore";

export function isFeatureActive(state: DemoState, featureId: FeatureId): boolean {
  if (state.scenario === "inactive") {
    return false;
  }

  const featureMeta = FEATURE_META[featureId];

  if (!featureMeta) {
    console.warn(`[featureResolver] Unknown feature ID: ${featureId}`);
    return false;
  }

  if (featureMeta.products && !featureMeta.products.includes(state.product)) {
    return false;
  }

  if (featureMeta.designSystems && !featureMeta.designSystems.includes(state.designSystem)) {
    return false;
  }

  if (featureMeta.scope === "countries") {
    if (!featureMeta.countries || featureMeta.countries.length === 0) {
      console.warn(
        `[featureResolver] Feature ${featureId} has scope="countries" but no countries defined`
      );
      return false;
    }

    if (!featureMeta.countries.includes(state.country)) {
      return false;
    }
  }

  if (featureMeta.releases && featureMeta.releases.length > 0) {
    if (!featureMeta.releases.includes(state.release)) {
      return false;
    }
  }

  if (featureMeta.kind === "release") {
    return getReleaseBundle(state.release).features.includes(featureId);
  }

  if (featureMeta.kind === "unplanned") {
    const currentFlags = getCurrentFlags(state);
    return !!currentFlags[featureId];
  }

  return false;
}

export function getActiveFeatures(state: DemoState): FeatureId[] {
  const allFeatureIds = Object.keys(FEATURE_META) as FeatureId[];
  return allFeatureIds.filter((featureId) => isFeatureActive(state, featureId));
}

export function hasAnyActiveFeature(state: DemoState): boolean {
  return getActiveFeatures(state).length > 0;
}

export function getActiveFeaturesByKind(state: DemoState): {
  release: FeatureId[];
  unplanned: FeatureId[];
} {
  const activeFeatures = getActiveFeatures(state);

  return {
    release: activeFeatures.filter((id) => FEATURE_META[id]?.kind === "release"),
    unplanned: activeFeatures.filter((id) => FEATURE_META[id]?.kind === "unplanned"),
  };
}
