/**
 * Project Pack Registry
 * One readiness entry per application/country pair for Creator-style handoff.
 */

import { COUNTRIES } from "@/app/registry/demoConfig";
import { PRODUCT_ORDER } from "@/app/registry/projectModel";
import type {
  BaselineId,
  BankingScenarioId,
  CapabilityStatus,
  CountryId,
  DataSourceAuthority,
  DesignSystemId,
  FeatureId,
  ProductId,
  ReleaseId,
  ScreenId,
} from "@/app/state/demoTypes";

export interface KnowledgeSourceBinding {
  id: string;
  authority: DataSourceAuthority;
  description: string;
}

export interface ProjectPack {
  id: string;
  product: ProductId;
  country: CountryId;
  market: CountryId;
  label: string;
  designSystems: readonly DesignSystemId[];
  baselines: readonly BaselineId[];
  releases: readonly ReleaseId[];
  defaultScenario: BankingScenarioId;
  featureSet: readonly FeatureId[];
  demoEntries: readonly ScreenId[];
  templatePack: string;
  knowledgeSources: readonly KnowledgeSourceBinding[];
  runtimeCoverage: CapabilityStatus;
  integrationReadiness: "implemented" | "prepared" | "placeholder";
  notes: string;
}

function productSlug(product: ProductId): string {
  return product.toLowerCase().replace("_", "-");
}

function productLabel(product: ProductId): string {
  switch (product) {
    case "SME":
      return "Mobile SME";
    case "KIDS_PI":
      return "Mobile PI Kids";
    default:
      return "Mobile PI";
  }
}

function defaultScenario(product: ProductId): BankingScenarioId {
  switch (product) {
    case "SME":
      return "sme-owner-preview";
    case "KIDS_PI":
      return "kids-child-preview";
    default:
      return "retail-single-account";
  }
}

function runtimeCoverage(product: ProductId, country: CountryId): CapabilityStatus {
  if (product === "PI") {
    return "implemented";
  }

  if (product === "KIDS_PI" && country === "RO") {
    return "mock-driven";
  }

  return "planned";
}

function integrationReadiness(product: ProductId, country: CountryId): ProjectPack["integrationReadiness"] {
  if (product === "PI" || (product === "KIDS_PI" && country === "RO")) {
    return "implemented";
  }

  return "prepared";
}

function demoEntries(product: ProductId, country: CountryId): readonly ScreenId[] {
  if (product === "KIDS_PI") {
    return country === "RO" ? ["kids.ro.prototype"] : [];
  }

  if (product === "SME") {
    return [];
  }

  return [
    "pi.home.overview",
    "pi.payments.overview",
    "pi.products.overview",
    "pi.more.overview",
  ];
}

function featureSet(product: ProductId): readonly FeatureId[] {
  if (product === "PI") {
    return [
      "fx_newPaymentsHub",
      "fx_cardsRedesign",
      "fx_quickActionsRedesign",
      "fx_enhancedAnalytics",
      "fx_unplannedBanner",
      "fx_transactionsFilters",
    ];
  }

  return [];
}

function knowledgeSources(product: ProductId, country: CountryId): readonly KnowledgeSourceBinding[] {
  const baseSources: KnowledgeSourceBinding[] = [
    {
      id: "screenRegistry",
      authority: "authority",
      description: "Authoritative screen IDs, runtime screen keys, and product/country scope.",
    },
    {
      id: "featureManifestRegistry",
      authority: "authority",
      description: "Authoritative feature lifecycle, release, and promotion metadata.",
    },
    {
      id: "templateRegistry",
      authority: "reference",
      description: "Reusable template examples with explicit do-not-invent rules.",
    },
    {
      id: "bankingScenarioRegistry",
      authority: "reference",
      description: "Mock holdings, rights, limits, and disabled-action reasons.",
    },
  ];

  if (product === "KIDS_PI" && country !== "RO") {
    return [
      ...baseSources,
      {
        id: "kidsFutureConcept",
        authority: "inspiration",
        description: "Future country-specific Kids app concept placeholder; not runtime authority yet.",
      },
    ];
  }

  if (product === "SME") {
    return [
      ...baseSources,
      {
        id: "smeFutureConcept",
        authority: "inspiration",
        description: "Future country-specific SME app concept placeholder; not runtime authority yet.",
      },
    ];
  }

  return baseSources;
}

function buildProjectPack(product: ProductId, country: CountryId): ProjectPack {
  return {
    id: `${productSlug(product)}-${country.toLowerCase()}`,
    product,
    country,
    market: country,
    label: `${productLabel(product)} ${country}`,
    designSystems: ["current", "next"],
    baselines: ["baseline-current", "baseline-r1", "baseline-r2", "baseline-r3", "baseline-r4", "uat-current"],
    releases: ["release-current", "release-v1", "release-v2", "release-v3", "release-v4"],
    defaultScenario: defaultScenario(product),
    featureSet: featureSet(product),
    demoEntries: demoEntries(product, country),
    templatePack: `${productSlug(product)}-${country.toLowerCase()}-reference`,
    knowledgeSources: knowledgeSources(product, country),
    runtimeCoverage: runtimeCoverage(product, country),
    integrationReadiness: integrationReadiness(product, country),
    notes:
      product === "PI"
        ? "Runtime demo is available today; country specifics continue to mature through config and manifests."
        : "Future application variant is intentionally prepared as metadata, scenarios, and integration readiness before real screens are added.",
  };
}

export const PROJECT_PACKS: readonly ProjectPack[] = PRODUCT_ORDER.flatMap((product) =>
  COUNTRIES.map((country) => buildProjectPack(product, country))
);

export function getProjectPack(product: ProductId, country: CountryId): ProjectPack {
  const pack = PROJECT_PACKS.find((candidate) => candidate.product === product && candidate.country === country);
  if (!pack) {
    throw new Error(`Missing project pack for ${product}/${country}`);
  }

  return pack;
}

export function getProjectPacksByProduct(product: ProductId): readonly ProjectPack[] {
  return PROJECT_PACKS.filter((pack) => pack.product === product);
}

export function getPreparedFuturePacks(): readonly ProjectPack[] {
  return PROJECT_PACKS.filter((pack) => pack.integrationReadiness === "prepared");
}
