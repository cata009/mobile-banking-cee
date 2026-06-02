import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertIncludes(file, expected, label) {
  assert(file.includes(expected), `Missing ${label}: ${expected}`);
}

const demoTypes = read("src/app/state/demoTypes.ts");
const demoConfig = read("src/app/registry/demoConfig.ts");
const projectModel = read("src/app/registry/projectModel.ts");
const releaseRegistry = read("src/app/registry/releaseRegistry.ts");
const baselineRegistry = read("src/app/registry/baselineRegistry.ts");
const featureManifestRegistry = read("src/app/registry/featureManifestRegistry.ts");
const projectPackRegistry = read("src/app/registry/projectPackRegistry.ts");
const scenarioRegistry = read("src/app/platform/banking/bankingScenarioRegistry.ts");
const effectiveContext = read("src/app/platform/effectiveAppContext.ts");
const repositories = read("src/app/platform/data/bankingRepositories.ts");
const sidePanel = read("src/app/components/demo/DemoFeatureSidePanel.tsx");

const products = ["PI", "SME", "KIDS_PI"];
const countries = ["RO", "CZ", "SK", "HU", "RS", "BA", "BA_BL", "SI"];
const scenarios = [
  "retail-prospect",
  "retail-single-account",
  "retail-multi-account-card",
  "retail-deposits-investments",
  "retail-payments-restricted",
  "sme-owner-preview",
  "kids-child-preview",
];
const repositoriesExpected = [
  "accountsRepository",
  "cardsRepository",
  "paymentsRepository",
  "productsRepository",
  "entitlementsRepository",
  "scenarioRepository",
];
const effectiveFields = [
  "baseline",
  "releasePreview",
  "activeFeatures",
  "userScenario",
  "holdings",
  "entitlements",
  "limits",
  "visibleScreens",
  "visibleProducts",
  "enabledActions",
  "disabledActions",
  "dataSnapshot",
];

["baseline-r1", "baseline-r2", "baseline-r3", "baseline-r4"].forEach((baseline) => {
  assertIncludes(demoTypes, baseline, "promotable baseline type");
  assertIncludes(baselineRegistry, baseline, "baseline ledger entry");
});

["getReleaseDiff", "getReleasePromotionReadiness", "promotionTargetBaseline", "flagRetirementCandidates"].forEach((symbol) => {
  assertIncludes(releaseRegistry, symbol, "release OS symbol");
});

["FeatureManifest", "targetBaseline", "retirementRule", "promotionChecks"].forEach((symbol) => {
  assertIncludes(featureManifestRegistry, symbol, "feature manifest contract");
});

products.forEach((product) => assertIncludes(projectModel, product, "project model product"));
countries.forEach((country) => assertIncludes(demoConfig, country, "country registry entry"));
assertIncludes(projectPackRegistry, "PRODUCT_ORDER.flatMap", "generated product coverage");
assertIncludes(projectPackRegistry, "COUNTRIES.map", "generated country coverage");

scenarios.forEach((scenario) => {
  assertIncludes(demoTypes, scenario, "banking scenario type");
  assertIncludes(scenarioRegistry, scenario, "banking scenario registry entry");
});

[
  "payments.domestic.create",
  "payments.foreign.create",
  "payments.exchange.create",
  "sme.payroll.preview",
  "kids.parent-approval.preview",
].forEach((action) => assertIncludes(scenarioRegistry, action, "banking action"));

repositoriesExpected.forEach((repository) => assertIncludes(repositories, repository, "repository export"));
effectiveFields.forEach((field) => assertIncludes(effectiveContext, field, "effective context field"));

["Banking Scenario", "Data Snapshot", "Rights", "Project Pack", "ReadinessChecks"].forEach((panelSection) => {
  assertIncludes(sidePanel, panelSection, "control panel section");
});

console.log(
  [
    "reference-platform audit ok",
    `products=${products.length}`,
    `countries=${countries.length}`,
    `projectPackCombinations=${products.length * countries.length}`,
    `bankingScenarios=${scenarios.length}`,
    `repositories=${repositoriesExpected.length}`,
  ].join(" ")
);
