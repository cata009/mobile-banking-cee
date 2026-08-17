/**
 * Demo Configuration Registry
 * Central configuration for countries, scenarios, and feature metadata.
 */

import type { CountryId, Scenario, FeatureId, FeatureMeta } from "@/app/state/demoTypes";

export const COUNTRIES = [
  "RO",
  "CZ",
  "SK",
  "HU",
  "RS",
  "BA",
  "BA_BL",
  "SI",
] as const satisfies readonly [CountryId, ...CountryId[]];

export const COUNTRY_META: Record<CountryId, { name: string; nameEN: string; flag: string; currency: string }> = {
  RO: { name: "Romania", nameEN: "Romania", flag: "RO", currency: "RON" },
  RS: { name: "Serbia", nameEN: "Serbia", flag: "RS", currency: "RSD" },
  HU: { name: "Hungary", nameEN: "Hungary", flag: "HU", currency: "HUF" },
  BA: { name: "Bosnia and Herzegovina", nameEN: "Bosnia and Herzegovina", flag: "BA", currency: "BAM" },
  BA_BL: { name: "Bosnia Banja Luka", nameEN: "Bosnia Banja Luka", flag: "BA", currency: "BAM" },
  SK: { name: "Slovakia", nameEN: "Slovakia", flag: "SK", currency: "EUR" },
  SI: { name: "Slovenia", nameEN: "Slovenia", flag: "SI", currency: "EUR" },
  CZ: { name: "Czech Republic", nameEN: "Czech Republic", flag: "CZ", currency: "CZK" },
};

export const SCENARIOS: readonly { id: Scenario; label: string; description?: string }[] = [
  {
    id: "active",
    label: "Active App",
    description: "Co-Apping session can be active with a banker.",
  },
  {
    id: "inactive",
    label: "Inactive App",
    description: "Co-Apping session is not active.",
  },
] as const;

export const FEATURE_META: Record<FeatureId, FeatureMeta> = {
  fx_newPaymentsHub: {
    id: "fx_newPaymentsHub",
    label: "New Payments Hub",
    description: "Redesigned payments interface with enhanced UX",
    kind: "release",
    scope: "global",
    products: ["PI"],
    designSystems: ["current"],
    lifecycleStatus: "configured",
    coverageStatus: "implemented",
    introducedIn: "release-v1",
    baselineFrom: null,
    affectedScreens: [
      "pi.home.overview",
      "pi.payments.overview",
      "pi.transaction.detail",
      "pi.payment.domestic-create",
      "pi.payment.review",
      "pi.payment.sign",
      "pi.payment.success",
    ],
  },

  fx_cardsRedesign: {
    id: "fx_cardsRedesign",
    label: "Cards Redesign",
    description: "Modernized card management UI (RO, CZ only)",
    kind: "release",
    scope: "countries",
    countries: ["RO", "CZ"],
    products: ["PI"],
    designSystems: ["current"],
    lifecycleStatus: "implemented",
    coverageStatus: "implemented",
    introducedIn: "release-v2",
    baselineFrom: null,
    affectedScreens: ["pi.home.overview"],
  },

  fx_czCoAppingSmartAssistant: {
    id: "fx_czCoAppingSmartAssistant",
    label: "CZ - Chatbot",
    description: "Pinned Czech Republic feature preview for the portable Co-Apping Smart Assistant chat.",
    kind: "release",
    scope: "countries",
    countries: ["CZ"],
    releases: ["release-future-cz-coapping"],
    products: ["PI"],
    designSystems: ["current"],
    lifecycleStatus: "implemented",
    coverageStatus: "implemented",
    introducedIn: "release-future-cz-coapping",
    baselineFrom: null,
    affectedScreens: [
      "pi.prelogin.active",
      "pi.home.overview",
      "pi.co-apping.session",
    ],
  },

  fx_czRoboAdvisor: {
    id: "fx_czRoboAdvisor",
    label: "CZ - Robo",
    description: "Pinned Czech Republic Future preview for the Investments goal-based Robo Advisor journey.",
    kind: "release",
    scope: "countries",
    countries: ["CZ"],
    releases: [
      "release-future-cz-robo",
      "release-future-evo-2027",
    ],
    products: ["PI"],
    designSystems: ["current"],
    lifecycleStatus: "implemented",
    coverageStatus: "mock-driven",
    introducedIn: "release-future-cz-robo",
    baselineFrom: null,
    affectedScreens: ["pi.investments.portfolio"],
  },

  fx_evo2027Homepage: {
    id: "fx_evo2027Homepage",
    label: "Evo 2027 Homepage",
    description: "Czech-only Evo 2027 preview of the Mobile PI Homepage.",
    kind: "release",
    scope: "countries",
    countries: ["CZ"],
    releases: ["release-future-evo-2027"],
    products: ["PI"],
    designSystems: ["current"],
    lifecycleStatus: "implemented",
    coverageStatus: "implemented",
    introducedIn: "release-future-evo-2027",
    baselineFrom: null,
    affectedScreens: ["pi.home.overview"],
  },

  fx_quickActionsRedesign: {
    id: "fx_quickActionsRedesign",
    label: "Quick Actions Redesign",
    description: "Redesigned quick actions layout with icons and animations",
    kind: "release",
    scope: "global",
    products: ["PI"],
    designSystems: ["current"],
    lifecycleStatus: "configured",
    coverageStatus: "configured",
    introducedIn: "release-v4",
    baselineFrom: null,
    affectedScreens: ["pi.home.overview"],
  },

  fx_unplannedBanner: {
    id: "fx_unplannedBanner",
    label: "Unplanned Maintenance Banner",
    description: "Display urgent maintenance notifications (RO only)",
    kind: "unplanned",
    scope: "countries",
    countries: ["RO"],
    products: ["PI"],
    designSystems: ["current"],
    lifecycleStatus: "implemented",
    coverageStatus: "implemented",
    introducedIn: null,
    baselineFrom: null,
    affectedScreens: ["pi.home.overview"],
  },

  fx_transactionsFilters: {
    id: "fx_transactionsFilters",
    label: "Advanced Transaction Filters",
    description: "Enhanced filtering options for transaction history",
    kind: "unplanned",
    scope: "global",
    products: ["PI"],
    designSystems: ["current"],
    lifecycleStatus: "configured",
    coverageStatus: "configured",
    introducedIn: null,
    baselineFrom: null,
    affectedScreens: ["pi.home.overview"],
  },

  fx_enhancedAnalytics: {
    id: "fx_enhancedAnalytics",
    label: "Enhanced Analytics",
    description: "Advanced spending insights and analytics dashboard",
    kind: "release",
    scope: "global",
    products: ["PI"],
    designSystems: ["current"],
    lifecycleStatus: "configured",
    coverageStatus: "mock-driven",
    introducedIn: "release-v4",
    baselineFrom: null,
    affectedScreens: ["pi.home.overview", "pi.analytics.overview"],
  },
};

export function getFeaturesByKind(kind: "release" | "unplanned"): FeatureId[] {
  return (Object.keys(FEATURE_META) as FeatureId[]).filter(
    (featureId) => FEATURE_META[featureId].kind === kind
  );
}

export function getCountryMeta(country: CountryId) {
  return COUNTRY_META[country];
}

export function getScenarioMeta(scenarioId: Scenario) {
  return SCENARIOS.find((scenario) => scenario.id === scenarioId);
}

export function isReleaseFeature(featureId: FeatureId): boolean {
  return FEATURE_META[featureId]?.kind === "release";
}

export function isUnplannedFeature(featureId: FeatureId): boolean {
  return FEATURE_META[featureId]?.kind === "unplanned";
}
