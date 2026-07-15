/**
 * Effective App Context
 * Single resolved view of release, feature, scenario, entitlement, and mock-data state.
 */

import { getBaselineLedgerEntry } from "@/app/registry/baselineRegistry";
import { getProjectPack } from "@/app/registry/projectPackRegistry";
import { getReleaseBundle, getReleaseDiff, getReleasePromotionReadiness } from "@/app/registry/releaseRegistry";
import { SCREEN_REGISTRY } from "@/app/registry/screenRegistry";
import { getActiveFeatures } from "@/app/state/featureResolver";
import { resolveBankingScenario } from "@/app/platform/banking/bankingScenarioRegistry";
import { isPIProductScenarioId, resolveProductDataAuthority } from "@/app/platform/banking/productDataAuthority";
import type {
  BankingActionId,
  BankingHoldingType,
  DemoState,
  FeatureId,
  ScreenId,
} from "@/app/state/demoTypes";

export interface EffectiveDataSnapshot {
  source: "mock-repositories";
  authority: "reference";
  accounts: number;
  cards: number;
  deposits: number;
  investments: number;
  loans: number;
  savingsGoals: number;
}

export interface EffectiveAppContext {
  baseline: ReturnType<typeof getBaselineLedgerEntry>;
  releasePreview: ReturnType<typeof getReleaseBundle>;
  releaseDiff: ReturnType<typeof getReleaseDiff>;
  promotionReadiness: ReturnType<typeof getReleasePromotionReadiness>;
  activeFeatures: readonly FeatureId[];
  userScenario: ReturnType<typeof resolveBankingScenario>["scenario"];
  holdings: ReturnType<typeof resolveBankingScenario>["holdings"];
  entitlements: ReturnType<typeof resolveBankingScenario>["entitlements"];
  limits: ReturnType<typeof resolveBankingScenario>["limits"];
  visibleScreens: readonly ScreenId[];
  visibleProducts: readonly BankingHoldingType[];
  enabledActions: readonly BankingActionId[];
  disabledActions: ReturnType<typeof resolveBankingScenario>["disabledActions"];
  dataSnapshot: EffectiveDataSnapshot;
  projectPack: ReturnType<typeof getProjectPack>;
}

function countHoldings(
  holdings: EffectiveAppContext["holdings"],
  type: BankingHoldingType
): number {
  return holdings.filter((holding) => holding.type === type).length;
}

function resolveVisibleScreens(state: DemoState): readonly ScreenId[] {
  return (Object.keys(SCREEN_REGISTRY) as ScreenId[]).filter((screenId) => {
    const screen = SCREEN_REGISTRY[screenId];
    return (
      screen.products.includes(state.product) &&
      screen.countries.includes(state.country) &&
      screen.designSystems.includes(state.designSystem) &&
      !["missing", "blocked", "legacy"].includes(screen.status)
    );
  });
}

function resolveDataSnapshot(holdings: EffectiveAppContext["holdings"]): EffectiveDataSnapshot {
  return {
    source: "mock-repositories",
    authority: "reference",
    accounts: countHoldings(holdings, "account"),
    cards: countHoldings(holdings, "card"),
    deposits: countHoldings(holdings, "deposit"),
    investments: countHoldings(holdings, "investment"),
    loans: countHoldings(holdings, "loan"),
    savingsGoals: countHoldings(holdings, "savings-goal"),
  };
}

export function resolveEffectiveAppContext(state: DemoState): EffectiveAppContext {
  const bankingScenario = resolveEffectiveBankingScenario(state);
  const holdings = bankingScenario.holdings;

  return {
    baseline: getBaselineLedgerEntry(state.baseline),
    releasePreview: getReleaseBundle(state.release),
    releaseDiff: getReleaseDiff(state.release),
    promotionReadiness: getReleasePromotionReadiness(state.release),
    activeFeatures: getActiveFeatures(state),
    userScenario: bankingScenario.scenario,
    holdings,
    entitlements: bankingScenario.entitlements,
    limits: bankingScenario.limits,
    visibleScreens: resolveVisibleScreens(state),
    visibleProducts: bankingScenario.visibleProducts,
    enabledActions: bankingScenario.enabledActions,
    disabledActions: bankingScenario.disabledActions,
    dataSnapshot: resolveDataSnapshot(holdings),
    projectPack: getProjectPack(state.product, state.country),
  };
}

export function resolveEffectiveBankingScenario(state: DemoState) {
  const productAuthority = state.product === "PI" && isPIProductScenarioId(state.bankingScenario)
    ? resolveProductDataAuthority(state.bankingScenario, state.productCounts)
    : null;
  return resolveBankingScenario(state, productAuthority?.resolvedHoldings);
}
