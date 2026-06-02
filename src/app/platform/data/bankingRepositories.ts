/**
 * Contract-ready banking repositories.
 * Today these read governed mock scenario data; future adapters can replace the source.
 */

import {
  BANKING_SCENARIOS,
  resolveBankingScenario,
  type BankingHolding,
} from "@/app/platform/banking/bankingScenarioRegistry";
import { resolveEffectiveAppContext } from "@/app/platform/effectiveAppContext";
import type { BankingActionId, BankingHoldingType, BankingScenarioId, DemoState } from "@/app/state/demoTypes";

export interface RepositoryResult<T> {
  source: "mock";
  contract: "contract-ready";
  items: readonly T[];
}

export interface AccountsRepository {
  listAccounts: (state: DemoState) => RepositoryResult<BankingHolding>;
}

export interface CardsRepository {
  listCards: (state: DemoState) => RepositoryResult<BankingHolding>;
}

export interface PaymentsRepository {
  listEnabledPaymentActions: (state: DemoState) => RepositoryResult<BankingActionId>;
  listDisabledPaymentActions: (state: DemoState) => RepositoryResult<{ action: BankingActionId; reason: string }>;
}

export interface ProductsRepository {
  listVisibleHoldingTypes: (state: DemoState) => RepositoryResult<BankingHoldingType>;
}

export interface EntitlementsRepository {
  listEnabledActions: (state: DemoState) => RepositoryResult<BankingActionId>;
}

export interface ScenarioRepository {
  listScenarios: () => RepositoryResult<BankingScenarioId>;
  resolveScenario: (state: DemoState) => ReturnType<typeof resolveBankingScenario>;
}

function result<T>(items: readonly T[]): RepositoryResult<T> {
  return {
    source: "mock",
    contract: "contract-ready",
    items,
  };
}

function holdingsByType(state: DemoState, type: BankingHoldingType): readonly BankingHolding[] {
  return resolveEffectiveAppContext(state).holdings.filter((holding) => holding.type === type);
}

export const accountsRepository: AccountsRepository = {
  listAccounts: (state) => result(holdingsByType(state, "account")),
};

export const cardsRepository: CardsRepository = {
  listCards: (state) => result(holdingsByType(state, "card")),
};

export const paymentsRepository: PaymentsRepository = {
  listEnabledPaymentActions: (state) =>
    result(
      resolveEffectiveAppContext(state).enabledActions.filter((action) => action.startsWith("payments."))
    ),
  listDisabledPaymentActions: (state) =>
    result(
      resolveEffectiveAppContext(state).disabledActions
        .filter((action) => action.action.startsWith("payments."))
        .map((action) => ({ action: action.action, reason: action.reason }))
    ),
};

export const productsRepository: ProductsRepository = {
  listVisibleHoldingTypes: (state) => result(resolveEffectiveAppContext(state).visibleProducts),
};

export const entitlementsRepository: EntitlementsRepository = {
  listEnabledActions: (state) => result(resolveEffectiveAppContext(state).enabledActions),
};

export const scenarioRepository: ScenarioRepository = {
  listScenarios: () => result(Object.keys(BANKING_SCENARIOS) as BankingScenarioId[]),
  resolveScenario: (state) => resolveBankingScenario(state),
};

export const BANKING_REPOSITORIES = {
  accountsRepository,
  cardsRepository,
  paymentsRepository,
  productsRepository,
  entitlementsRepository,
  scenarioRepository,
} as const;
