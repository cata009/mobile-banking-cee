/**
 * Baseline Ledger
 * Describes how release previews become official baselines.
 */

import { PROJECT_COUNTRIES, PRODUCT_ORDER } from "@/app/registry/projectModel";
import type { BaselineId, FeatureId, ProductId, CountryId, ReleaseId } from "@/app/state/demoTypes";

export interface BaselineLedgerEntry {
  id: BaselineId;
  label: string;
  status: "current" | "future" | "uat";
  promotedFromRelease: ReleaseId | null;
  promotedFeatures: readonly FeatureId[];
  productScope: readonly ProductId[];
  countryScope: readonly CountryId[];
  promotionRule: string;
}

export const BASELINE_LEDGER: Record<BaselineId, BaselineLedgerEntry> = {
  "baseline-current": {
    id: "baseline-current",
    label: "Current official baseline",
    status: "current",
    promotedFromRelease: "release-current",
    promotedFeatures: [],
    productScope: PRODUCT_ORDER,
    countryScope: PROJECT_COUNTRIES,
    promotionRule: "Stable reference state. Release features are excluded until explicitly promoted.",
  },
  "baseline-r1": {
    id: "baseline-r1",
    label: "R1 promoted baseline",
    status: "future",
    promotedFromRelease: "release-v1",
    promotedFeatures: ["fx_newPaymentsHub"],
    productScope: PRODUCT_ORDER,
    countryScope: PROJECT_COUNTRIES,
    promotionRule: "Created when Release R1 is approved and feature gates are retired into baseline behavior.",
  },
  "baseline-r2": {
    id: "baseline-r2",
    label: "R2 promoted baseline",
    status: "future",
    promotedFromRelease: "release-v2",
    promotedFeatures: ["fx_newPaymentsHub", "fx_cardsRedesign"],
    productScope: PRODUCT_ORDER,
    countryScope: PROJECT_COUNTRIES,
    promotionRule: "Created when Release R2 is approved; R2 features become baseline and later previews build on top.",
  },
  "baseline-r3": {
    id: "baseline-r3",
    label: "R3 promoted baseline",
    status: "future",
    promotedFromRelease: "release-v3",
    promotedFeatures: ["fx_newPaymentsHub", "fx_cardsRedesign"],
    productScope: PRODUCT_ORDER,
    countryScope: PROJECT_COUNTRIES,
    promotionRule: "Created when Release R3 is approved; no new feature is currently modeled beyond the R2 stack.",
  },
  "baseline-r4": {
    id: "baseline-r4",
    label: "R4 promoted baseline",
    status: "future",
    promotedFromRelease: "release-v4",
    promotedFeatures: [
      "fx_newPaymentsHub",
      "fx_cardsRedesign",
      "fx_quickActionsRedesign",
      "fx_enhancedAnalytics",
    ],
    productScope: PRODUCT_ORDER,
    countryScope: PROJECT_COUNTRIES,
    promotionRule: "Created when Release R4 is approved; release preview flags become baseline behavior.",
  },
  "uat-current": {
    id: "uat-current",
    label: "Current UAT reference",
    status: "uat",
    promotedFromRelease: null,
    promotedFeatures: [],
    productScope: PRODUCT_ORDER,
    countryScope: PROJECT_COUNTRIES,
    promotionRule: "Stakeholder review baseline; not a production release by itself.",
  },
};

export function getBaselineLedgerEntry(baseline: BaselineId): BaselineLedgerEntry {
  return BASELINE_LEDGER[baseline];
}

export function getBaselineFeatures(baseline: BaselineId): readonly FeatureId[] {
  return BASELINE_LEDGER[baseline].promotedFeatures;
}

export function getPromotionTargetForRelease(release: ReleaseId): BaselineLedgerEntry | null {
  return Object.values(BASELINE_LEDGER).find((entry) => entry.promotedFromRelease === release) ?? null;
}
