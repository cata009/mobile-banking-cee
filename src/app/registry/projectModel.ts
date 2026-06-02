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
    description: "Romania-first kids-focused personal individual mobile banking demo layer.",
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
    label: "Current Baseline",
    description: "Stable current demo state without future release previews.",
    status: "active",
  },
  "uat-current": {
    id: "uat-current",
    label: "Current UAT",
    description: "UAT target baseline for stakeholder review.",
    status: "planned",
  },
};

export const BASELINE_ORDER: readonly BaselineId[] = ["baseline-current", "uat-current"] as const;

export const RELEASES: Record<ReleaseId, ReleaseMeta> = {
  "release-current": {
    id: "release-current",
    label: "Current",
    description: "Current stable release baseline.",
    status: "active",
  },
  "release-v1": {
    id: "release-v1",
    label: "Release V1",
    description: "First release preview bundle.",
    status: "active",
  },
  "release-v2": {
    id: "release-v2",
    label: "Release V2",
    description: "Second release preview bundle.",
    status: "active",
  },
  "release-v3": {
    id: "release-v3",
    label: "Release V3",
    description: "Third release preview bundle.",
    status: "active",
  },
  "release-v4": {
    id: "release-v4",
    label: "Release V4",
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
