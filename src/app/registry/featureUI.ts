/**
 * Feature-to-UI Mapping Registry
 * Centralized configuration for feature flag UI impact
 */

import type { FeatureId } from "@/app/state/demoTypes";

/**
 * UI location identifiers where features can be applied
 */
export type UILocation =
  | "app.assistant"
  | "investments.robo"
  | "home.app2027"
  | "home.header"
  | "home.accountSummary"
  | "home.quickActions"
  | "home.transactions"
  | "home.banner";

/**
 * Feature UI configuration
 * Defines where and how a feature impacts the UI
 */
export interface FeatureUIConfig {
  /** Feature identifier */
  id: FeatureId;
  
  /** UI locations affected by this feature */
  locations: UILocation[];
  
  /** Optional description of UI changes */
  description?: string;
}

/**
 * Feature-to-UI mapping registry
 * 
 * This centralized configuration defines which features affect which UI components.
 * When adding new features, update this map to maintain clear documentation
 * of feature impact across the application.
 */
export const FEATURE_UI_MAP: Record<FeatureId, FeatureUIConfig> = {
  fx_czCoAppingSmartAssistant: {
    id: "fx_czCoAppingSmartAssistant",
    locations: ["app.assistant"],
    description: "Adds the portable Co-Apping Smart Assistant to supported app screens",
  },
  fx_czRoboAdvisor: {
    id: "fx_czRoboAdvisor",
    locations: ["investments.robo"],
    description: "Adds the isolated CZ Future goal-based Robo Advisor journey inside Investments",
  },
  fx_evo2027Homepage: {
    id: "fx_evo2027Homepage",
    locations: ["home.app2027"],
    description: "Applies the CZ-only Evo 2027 Homepage presentation through the shared 2027 home components",
  },

  // ─── RELEASE FEATURES ────────────────────────────────────────
  fx_newPaymentsHub: {
    id: "fx_newPaymentsHub",
    locations: ["home.quickActions"],
    description: "Adds Payments Hub button to quick actions",
  },
  
  fx_cardsRedesign: {
    id: "fx_cardsRedesign",
    locations: ["home.accountSummary"],
    description: "Applies gradient background and updates label on balance card",
  },
  
  fx_quickActionsRedesign: {
    id: "fx_quickActionsRedesign",
    locations: ["home.quickActions"],
    description: "Modernizes quick actions layout with 3-column grid and animations",
  },
  
  // ─── UNPLANNED FEATURES ──────────────────────────────────────
  fx_unplannedBanner: {
    id: "fx_unplannedBanner",
    locations: ["home.banner"],
    description: "Displays yellow maintenance warning banner",
  },
  
  fx_transactionsFilters: {
    id: "fx_transactionsFilters",
    locations: ["home.transactions"],
    description: "Adds filter row above transactions list",
  },
  
  fx_enhancedAnalytics: {
    id: "fx_enhancedAnalytics",
    locations: ["home.header"],
    description: "Adds analytics card with spending insights",
  },
};

/**
 * Get all features affecting a specific UI location
 * 
 * @param location - UI location identifier
 * @returns Array of feature IDs affecting this location
 * 
 * @example
 * ```ts
 * const features = getFeaturesForLocation("home.quickActions");
 * // ["fx_newPaymentsHub", "fx_quickActionsRedesign"]
 * ```
 */
export function getFeaturesForLocation(location: UILocation): FeatureId[] {
  return (Object.keys(FEATURE_UI_MAP) as FeatureId[]).filter((featureId) =>
    FEATURE_UI_MAP[featureId].locations.includes(location)
  );
}

/**
 * Get UI locations affected by a specific feature
 * 
 * @param featureId - Feature identifier
 * @returns Array of UI locations affected by this feature
 * 
 * @example
 * ```ts
 * const locations = getLocationsForFeature("fx_newPaymentsHub");
 * // ["home.quickActions"]
 * ```
 */
export function getLocationsForFeature(featureId: FeatureId): UILocation[] {
  return FEATURE_UI_MAP[featureId]?.locations || [];
}

/**
 * Check if a feature affects a specific UI location
 * 
 * @param featureId - Feature identifier
 * @param location - UI location identifier
 * @returns true if feature affects this location
 * 
 * @example
 * ```ts
 * const affects = featureAffectsLocation("fx_newPaymentsHub", "home.quickActions");
 * // true
 * ```
 */
export function featureAffectsLocation(
  featureId: FeatureId,
  location: UILocation
): boolean {
  return FEATURE_UI_MAP[featureId]?.locations.includes(location) || false;
}
