/**
 * Feature Helpers
 * Utility functions for working with feature flags in components
 */

import type { DemoState, FeatureId } from "./demoTypes";
import { isFeatureActive } from "./featureResolver";

/**
 * Feature flags object for convenient access in components
 */
export interface FeatureFlags {
  newPaymentsHub: boolean;
  cardsRedesign: boolean;
  evo2027Homepage: boolean;
  unplannedBanner: boolean;
  transactionsFilters: boolean;
  quickActionsRedesign: boolean;
  enhancedAnalytics: boolean;
}

/**
 * Create a convenient feature flags object from demo state
 * 
 * This function provides a clean API for accessing feature flags
 * in components without repetitive isFeatureActive() calls.
 * 
 * @param demoState - Current demo state
 * @returns Object with camelCase boolean properties for each feature
 * 
 * @example
 * ```tsx
 * const features = getFeatureFlags(demoState);
 * 
 * return (
 *   <div>
 *     <QuickActions 
 *       showPaymentsHub={features.newPaymentsHub}
 *       showRedesign={features.quickActionsRedesign}
 *     />
 *     {features.unplannedBanner && <UnplannedBanner />}
 *   </div>
 * );
 * ```
 */
export function getFeatureFlags(demoState: DemoState): FeatureFlags {
  return {
    newPaymentsHub: isFeatureActive(demoState, "fx_newPaymentsHub"),
    cardsRedesign: isFeatureActive(demoState, "fx_cardsRedesign"),
    evo2027Homepage: isFeatureActive(demoState, "fx_evo2027Homepage"),
    unplannedBanner: isFeatureActive(demoState, "fx_unplannedBanner"),
    transactionsFilters: isFeatureActive(demoState, "fx_transactionsFilters"),
    quickActionsRedesign: isFeatureActive(demoState, "fx_quickActionsRedesign"),
    enhancedAnalytics: isFeatureActive(demoState, "fx_enhancedAnalytics"),
  };
}

/**
 * Type-safe feature flag accessor
 * 
 * @param demoState - Current demo state
 * @param featureId - Feature identifier
 * @returns boolean indicating if feature is active
 * 
 * @example
 * ```ts
 * const isActive = checkFeature(demoState, "fx_newPaymentsHub");
 * ```
 */
export function checkFeature(
  demoState: DemoState,
  featureId: FeatureId
): boolean {
  return isFeatureActive(demoState, featureId);
}

/**
 * Get multiple feature flags at once
 * 
 * @param demoState - Current demo state
 * @param featureIds - Array of feature identifiers
 * @returns Record mapping feature IDs to boolean values
 * 
 * @example
 * ```ts
 * const flags = checkFeatures(demoState, [
 *   "fx_newPaymentsHub",
 *   "fx_cardsRedesign"
 * ]);
 * // { fx_newPaymentsHub: true, fx_cardsRedesign: false }
 * ```
 */
export function checkFeatures(
  demoState: DemoState,
  featureIds: FeatureId[]
): Record<FeatureId, boolean> {
  return featureIds.reduce((acc, featureId) => {
    acc[featureId] = isFeatureActive(demoState, featureId);
    return acc;
  }, {} as Record<FeatureId, boolean>);
}
