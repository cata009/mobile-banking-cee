/**
 * AI Catalog Export
 * Single structured export for products, design systems, releases, features, screens, flows, and components.
 */

import { COMPONENT_REGISTRY } from "./componentRegistry";
import { FEATURE_META } from "./demoConfig";
import { FLOW_REGISTRY } from "./flowRegistry";
import { BASELINES, DESIGN_SYSTEMS, PRODUCTS, PROJECT_COUNTRIES } from "./projectModel";
import { RELEASE_BUNDLES } from "./releaseRegistry";
import { SCREEN_REGISTRY } from "./screenRegistry";
import { TEMPLATE_REGISTRY } from "./templateRegistry";

export const AI_CATALOG_VERSION = "2026-06-02.templates-contract";

export const AI_CATALOG = {
  version: AI_CATALOG_VERSION,
  products: PRODUCTS,
  countries: PROJECT_COUNTRIES,
  designSystems: DESIGN_SYSTEMS,
  baselines: BASELINES,
  releases: RELEASE_BUNDLES,
  features: FEATURE_META,
  screens: SCREEN_REGISTRY,
  templates: TEMPLATE_REGISTRY,
  flows: FLOW_REGISTRY,
  components: COMPONENT_REGISTRY,
} as const;

export type AiCatalog = typeof AI_CATALOG;

export function getAiCatalog(): AiCatalog {
  return AI_CATALOG;
}
