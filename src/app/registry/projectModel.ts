/**
 * Project Model Registry
 * Stable taxonomy for products, countries, design systems, baselines, and releases.
 */

import type {
  BaselineId,
  CountryId,
  DesignSystemId,
  ProductId,
  ReleaseId,
} from "@/app/state/demoTypes";

export interface ProductMeta {
  id: ProductId;
  label: string;
  description: string;
  status: "active" | "planned";
  selectorVisibility: "visible" | "hidden";
}

export const PRODUCT_ORDER: readonly ProductId[] = ["PI", "SME", "KIDS_PI"] as const;

export interface DesignSystemMeta {
  id: DesignSystemId;
  label: string;
  description: string;
  status: "active" | "planned";
}

export interface BaselineMeta {
  id: BaselineId;
  label: string;
  description: string;
  status: "active" | "planned";
}

export interface ReleaseMeta {
  id: ReleaseId;
  label: string;
  description: string;
  status: "active" | "planned" | "legacy-mapped";
}

export const PRODUCTS: Record<ProductId, ProductMeta> = {
  PI: {
    id: "PI",
    label: "Mobile PI",
    description: "Personal individual mobile banking demo application.",
    status: "active",
    selectorVisibility: "visible",
  },
  SME: {
    id: "SME",
    label: "Mobile SME",
    description: "Small and medium enterprise mobile banking demo application.",
    status: "planned",
    selectorVisibility: "visible",
  },
  KIDS_PI: {
    id: "KIDS_PI",
    label: "Mobile PI Kids",
    description: "Kids-focused personal individual mobile banking demo layer with selected active market concepts.",
    status: "active",
    selectorVisibility: "visible",
  },
};

export const DESIGN_SYSTEMS: Record<DesignSystemId, DesignSystemMeta> = {
  current: {
    id: "current",
    label: "Current CEE Light Restyle",
    description: "Current UniCredit CEE mobile design system used by the demo.",
    status: "active",
  },
  next: {
    id: "next",
    label: "Next Design System",
    description: "Future design-system deviation with possible layout changes.",
    status: "planned",
  },
};

export const DESIGN_SYSTEM_ORDER: readonly DesignSystemId[] = ["current", "next"] as const;

export const BASELINES: Record<BaselineId, BaselineMeta> = {
  "baseline-current": {
    id: "baseline-current",
    label: "Baseline",
    description: "Stable current demo state without future release previews.",
    status: "active",
  },
  "baseline-r1": {
    id: "baseline-r1",
    label: "R1 Promoted Baseline",
    description: "Future official baseline after Release R1 is promoted.",
    status: "planned",
  },
  "baseline-r2": {
    id: "baseline-r2",
    label: "R2 Promoted Baseline",
    description: "Future official baseline after Release R2 is promoted.",
    status: "planned",
  },
  "baseline-r3": {
    id: "baseline-r3",
    label: "R3 Promoted Baseline",
    description: "Future official baseline after Release R3 is promoted.",
    status: "planned",
  },
  "baseline-r4": {
    id: "baseline-r4",
    label: "R4 Promoted Baseline",
    description: "Future official baseline after Release R4 is promoted.",
    status: "planned",
  },
  "uat-current": {
    id: "uat-current",
    label: "Current UAT",
    description: "UAT target baseline for stakeholder review.",
    status: "planned",
  },
};

export const BASELINE_ORDER: readonly BaselineId[] = [
  "baseline-current",
  "baseline-r1",
  "baseline-r2",
  "baseline-r3",
  "baseline-r4",
  "uat-current",
] as const;

export const RELEASES: Record<ReleaseId, ReleaseMeta> = {
  "release-current": {
    id: "release-current",
    label: "Baseline",
    description: "Current stable release baseline.",
    status: "active",
  },
  "release-future-cz-coapping": {
    id: "release-future-cz-coapping",
    label: "CZ - Chatbot",
    description: "Pinned future feature preview based on the current CZ Mobile PI baseline.",
    status: "active",
  },
  "release-future-cz-robo": {
    id: "release-future-cz-robo",
    label: "CZ - Robo",
    description: "Pinned future Robo Advisor preview based on the current CZ Mobile PI Investments baseline.",
    status: "active",
  },
  "release-future-app-2027": {
    id: "release-future-app-2027",
    label: "App 2027",
    description: "Global App 2027 preview based on the current Mobile PI baseline.",
    status: "active",
  },
  "release-future-evo-2027": {
    id: "release-future-evo-2027",
    label: "Evo 2027",
    description: "Czech-only Evo 2027 preview based on the current Mobile PI App 2027 composition.",
    status: "active",
  },
  "release-v1": {
    id: "release-v1",
    label: "Release R1",
    description: "First release preview bundle.",
    status: "active",
  },
  "release-v2": {
    id: "release-v2",
    label: "Release R2",
    description: "Second release preview bundle.",
    status: "active",
  },
  "release-v3": {
    id: "release-v3",
    label: "Release R3",
    description: "Third release preview bundle.",
    status: "active",
  },
  "release-v4": {
    id: "release-v4",
    label: "Release R4",
    description: "Fourth release preview bundle.",
    status: "active",
  },
};

export const PROJECT_COUNTRIES: readonly CountryId[] = [
  "RO",
  "CZ",
  "SK",
  "HU",
  "RS",
  "BA",
  "BA_BL",
  "SI",
] as const;
