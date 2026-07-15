/**
 * Banking Scenario Registry
 * Mock customer/product/rights profiles used by the stakeholder control panel.
 */

import { COUNTRIES, COUNTRY_META } from "@/app/registry/demoConfig";
import { PRODUCT_ORDER } from "@/app/registry/projectModel";
import { isFeatureActive } from "@/app/state/featureResolver";
import type {
  BankingActionId,
  BankingHoldingType,
  BankingScenarioId,
  CountryId,
  DataSourceAuthority,
  DemoState,
  FeatureId,
  ProductId,
} from "@/app/state/demoTypes";

type CurrencyTemplate = "LOCAL" | "RON" | "EUR" | "USD" | "CZK" | "HUF" | "RSD" | "BAM";

export interface BankingHoldingTemplate {
  id: string;
  type: BankingHoldingType;
  label: string;
  currency: CurrencyTemplate;
  status: "active" | "planned" | "restricted";
}

export interface BankingHolding {
  id: string;
  type: BankingHoldingType;
  label: string;
  currency: string;
  status: "active" | "planned" | "restricted";
}

export interface EntitlementProfile {
  id: string;
  label: string;
  permissions: Partial<Record<BankingActionId, boolean>>;
}

export interface LimitProfile {
  id: string;
  label: string;
  currency: CurrencyTemplate;
  perTransaction: number;
  daily: number;
  monthly?: number;
}

export interface ResolvedLimitProfile extends Omit<LimitProfile, "currency"> {
  currency: string;
}

export interface BankingScenarioDefinition {
  id: BankingScenarioId;
  label: string;
  segment: "prospect" | "retail" | "restricted" | "sme" | "kids";
  description: string;
  products: readonly ProductId[];
  countries: readonly CountryId[];
  authority: DataSourceAuthority;
  holdings: readonly BankingHoldingTemplate[];
  entitlements: EntitlementProfile;
  limits: LimitProfile;
  readiness: "implemented" | "prepared";
}

export interface BankingActionDefinition {
  id: BankingActionId;
  label: string;
  products: readonly ProductId[];
  countries: readonly CountryId[];
  requiredHoldings: readonly BankingHoldingType[];
  requiredEntitlement: BankingActionId;
  requiredFeature?: FeatureId;
  requiresPositiveLimit?: boolean;
}

export interface DisabledAction {
  action: BankingActionId;
  label: string;
  reason: string;
}

export interface ResolvedBankingScenario {
  scenario: BankingScenarioDefinition;
  holdings: readonly BankingHolding[];
  entitlements: EntitlementProfile;
  limits: ResolvedLimitProfile;
  enabledActions: readonly BankingActionId[];
  disabledActions: readonly DisabledAction[];
  visibleProducts: readonly BankingHoldingType[];
}

const ALL_COUNTRIES = COUNTRIES;
const ALL_PRODUCTS = PRODUCT_ORDER;

export const BANKING_ACTION_CATALOG: Record<BankingActionId, BankingActionDefinition> = {
  "accounts.view": {
    id: "accounts.view",
    label: "View accounts",
    products: ALL_PRODUCTS,
    countries: ALL_COUNTRIES,
    requiredHoldings: ["account"],
    requiredEntitlement: "accounts.view",
  },
  "cards.view": {
    id: "cards.view",
    label: "View cards",
    products: ALL_PRODUCTS,
    countries: ALL_COUNTRIES,
    requiredHoldings: ["card"],
    requiredEntitlement: "cards.view",
  },
  "cards.manage": {
    id: "cards.manage",
    label: "Manage cards",
    products: ["PI", "SME"],
    countries: ALL_COUNTRIES,
    requiredHoldings: ["card"],
    requiredEntitlement: "cards.manage",
  },
  "payments.domestic.create": {
    id: "payments.domestic.create",
    label: "Create domestic payment",
    products: ["PI", "SME"],
    countries: ALL_COUNTRIES,
    requiredHoldings: ["account"],
    requiredEntitlement: "payments.domestic.create",
    requiresPositiveLimit: true,
  },
  "payments.foreign.create": {
    id: "payments.foreign.create",
    label: "Create foreign payment",
    products: ["PI", "SME"],
    countries: ALL_COUNTRIES,
    requiredHoldings: ["account"],
    requiredEntitlement: "payments.foreign.create",
    requiresPositiveLimit: true,
  },
  "payments.templates.manage": {
    id: "payments.templates.manage",
    label: "Manage payment templates",
    products: ["PI", "SME"],
    countries: ALL_COUNTRIES,
    requiredHoldings: ["account"],
    requiredEntitlement: "payments.templates.manage",
  },
  "payments.ebills.manage": {
    id: "payments.ebills.manage",
    label: "Manage e-bills",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    requiredHoldings: ["account"],
    requiredEntitlement: "payments.ebills.manage",
  },
  "payments.exchange.create": {
    id: "payments.exchange.create",
    label: "Create currency exchange",
    products: ["PI", "SME"],
    countries: ALL_COUNTRIES,
    requiredHoldings: ["account"],
    requiredEntitlement: "payments.exchange.create",
    requiresPositiveLimit: true,
  },
  "deposits.view": {
    id: "deposits.view",
    label: "View deposits",
    products: ["PI", "SME"],
    countries: ALL_COUNTRIES,
    requiredHoldings: ["deposit"],
    requiredEntitlement: "deposits.view",
  },
  "investments.view": {
    id: "investments.view",
    label: "View investments",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    requiredHoldings: ["investment"],
    requiredEntitlement: "investments.view",
  },
  "loans.view": {
    id: "loans.view",
    label: "View loans",
    products: ["PI", "SME"],
    countries: ALL_COUNTRIES,
    requiredHoldings: ["loan"],
    requiredEntitlement: "loans.view",
  },
  "messages.view": {
    id: "messages.view",
    label: "View messages",
    products: ALL_PRODUCTS,
    countries: ALL_COUNTRIES,
    requiredHoldings: [],
    requiredEntitlement: "messages.view",
  },
  "documents.view": {
    id: "documents.view",
    label: "View documents",
    products: ALL_PRODUCTS,
    countries: ALL_COUNTRIES,
    requiredHoldings: [],
    requiredEntitlement: "documents.view",
  },
  "sme.payroll.preview": {
    id: "sme.payroll.preview",
    label: "SME payroll preview",
    products: ["SME"],
    countries: ALL_COUNTRIES,
    requiredHoldings: ["account"],
    requiredEntitlement: "sme.payroll.preview",
  },
  "kids.parent-approval.preview": {
    id: "kids.parent-approval.preview",
    label: "Kids parent approval preview",
    products: ["KIDS_PI"],
    countries: ALL_COUNTRIES,
    requiredHoldings: ["savings-goal"],
    requiredEntitlement: "kids.parent-approval.preview",
  },
};

const VIEW_ONLY_ENTITLEMENTS: Partial<Record<BankingActionId, boolean>> = {
  "messages.view": true,
  "documents.view": true,
};

const RETAIL_PAYMENT_ENTITLEMENTS: Partial<Record<BankingActionId, boolean>> = {
  ...VIEW_ONLY_ENTITLEMENTS,
  "accounts.view": true,
  "payments.domestic.create": true,
  "payments.foreign.create": true,
  "payments.templates.manage": true,
  "payments.ebills.manage": true,
  "payments.exchange.create": true,
};

export const BANKING_SCENARIOS: Record<BankingScenarioId, BankingScenarioDefinition> = {
  "retail-prospect": {
    id: "retail-prospect",
    label: "Prospect / no products",
    segment: "prospect",
    description: "No account, card, deposit, or investment holdings. Useful for empty-state checks.",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    authority: "reference",
    holdings: [],
    entitlements: {
      id: "prospect-view-only",
      label: "View only",
      permissions: VIEW_ONLY_ENTITLEMENTS,
    },
    limits: {
      id: "no-transaction-limit",
      label: "No transactional limit",
      currency: "LOCAL",
      perTransaction: 0,
      daily: 0,
    },
    readiness: "implemented",
  },
  "retail-single-account": {
    id: "retail-single-account",
    label: "Retail / one local account",
    segment: "retail",
    description: "One active current account in the selected country's local currency.",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    authority: "authority",
    holdings: [
      { id: "local-current-account", type: "account", label: "Current account", currency: "LOCAL", status: "active" },
    ],
    entitlements: {
      id: "retail-standard-payments",
      label: "Standard retail payments",
      permissions: RETAIL_PAYMENT_ENTITLEMENTS,
    },
    limits: {
      id: "retail-standard-limit",
      label: "Standard retail limit",
      currency: "LOCAL",
      perTransaction: 5000,
      daily: 12000,
      monthly: 60000,
    },
    readiness: "implemented",
  },
  "retail-multi-account-card": {
    id: "retail-multi-account-card",
    label: "Retail / accounts + cards",
    segment: "retail",
    description: "Multiple accounts, debit/credit cards, payment rights, e-bills, and FX readiness.",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    authority: "authority",
    holdings: [
      { id: "local-current-account", type: "account", label: "Current account", currency: "LOCAL", status: "active" },
      { id: "eur-current-account", type: "account", label: "EUR current account", currency: "EUR", status: "active" },
      { id: "usd-current-account", type: "account", label: "USD current account", currency: "USD", status: "active" },
      { id: "debit-card", type: "card", label: "Debit card", currency: "LOCAL", status: "active" },
      { id: "credit-card", type: "card", label: "Credit card", currency: "LOCAL", status: "active" },
    ],
    entitlements: {
      id: "retail-full-payments-cards",
      label: "Payments and cards",
      permissions: {
        ...RETAIL_PAYMENT_ENTITLEMENTS,
        "cards.view": true,
        "cards.manage": true,
      },
    },
    limits: {
      id: "retail-premium-limit",
      label: "Premium retail limit",
      currency: "LOCAL",
      perTransaction: 25000,
      daily: 75000,
      monthly: 250000,
    },
    readiness: "implemented",
  },
  "retail-deposits-investments": {
    id: "retail-deposits-investments",
    label: "Retail / savings + investments",
    segment: "retail",
    description: "Current account plus deposits, investment products, and a loan for product visibility checks.",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    authority: "authority",
    holdings: [
      { id: "local-current-account", type: "account", label: "Current account", currency: "LOCAL", status: "active" },
      { id: "term-deposit", type: "deposit", label: "Term deposit", currency: "LOCAL", status: "active" },
      { id: "mutual-fund", type: "investment", label: "Mutual fund portfolio", currency: "EUR", status: "active" },
      { id: "consumer-loan", type: "loan", label: "Consumer loan", currency: "LOCAL", status: "active" },
    ],
    entitlements: {
      id: "retail-investment-view",
      label: "Savings and investment view",
      permissions: {
        ...RETAIL_PAYMENT_ENTITLEMENTS,
        "deposits.view": true,
        "investments.view": true,
        "loans.view": true,
      },
    },
    limits: {
      id: "retail-investor-limit",
      label: "Investor payment limit",
      currency: "LOCAL",
      perTransaction: 15000,
      daily: 50000,
      monthly: 150000,
    },
    readiness: "implemented",
  },
  "retail-payments-restricted": {
    id: "retail-payments-restricted",
    label: "Retail / payments restricted",
    segment: "restricted",
    description: "Account and card are visible, but transactional rights and limits are blocked.",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    authority: "authority",
    holdings: [
      { id: "local-current-account", type: "account", label: "Current account", currency: "LOCAL", status: "restricted" },
      { id: "debit-card", type: "card", label: "Debit card", currency: "LOCAL", status: "active" },
    ],
    entitlements: {
      id: "retail-restricted-rights",
      label: "Payments disabled",
      permissions: {
        ...VIEW_ONLY_ENTITLEMENTS,
        "accounts.view": true,
        "cards.view": true,
        "payments.domestic.create": false,
        "payments.foreign.create": false,
        "payments.templates.manage": false,
        "payments.ebills.manage": false,
        "payments.exchange.create": false,
      },
    },
    limits: {
      id: "retail-zero-limit",
      label: "Zero transaction limit",
      currency: "LOCAL",
      perTransaction: 0,
      daily: 0,
    },
    readiness: "implemented",
  },
  "sme-owner-preview": {
    id: "sme-owner-preview",
    label: "SME / owner preview",
    segment: "sme",
    description: "Prepared SME owner scenario for every country; screens remain planned placeholders for now.",
    products: ["SME"],
    countries: ALL_COUNTRIES,
    authority: "reference",
    holdings: [
      { id: "business-current-account", type: "account", label: "Business current account", currency: "LOCAL", status: "planned" },
      { id: "business-card", type: "card", label: "Business card", currency: "LOCAL", status: "planned" },
      { id: "working-capital-loan", type: "loan", label: "Working capital loan", currency: "LOCAL", status: "planned" },
    ],
    entitlements: {
      id: "sme-owner-prepared-rights",
      label: "Prepared SME rights",
      permissions: {
        ...RETAIL_PAYMENT_ENTITLEMENTS,
        "cards.view": true,
        "cards.manage": true,
        "loans.view": true,
        "sme.payroll.preview": true,
      },
    },
    limits: {
      id: "sme-preview-limit",
      label: "Prepared SME limit",
      currency: "LOCAL",
      perTransaction: 100000,
      daily: 300000,
      monthly: 1500000,
    },
    readiness: "prepared",
  },
  "kids-child-preview": {
    id: "kids-child-preview",
    label: "Kids / child preview",
    segment: "kids",
    description: "Prepared child scenario for every country; RO has the current mock runtime, other countries are ready for future concepts.",
    products: ["KIDS_PI"],
    countries: ALL_COUNTRIES,
    authority: "reference",
    holdings: [
      { id: "kids-savings-goal", type: "savings-goal", label: "Savings goal", currency: "LOCAL", status: "planned" },
      { id: "kids-card", type: "card", label: "Kids card", currency: "LOCAL", status: "planned" },
    ],
    entitlements: {
      id: "kids-parent-approved-rights",
      label: "Parent-approved rights",
      permissions: {
        ...VIEW_ONLY_ENTITLEMENTS,
        "cards.view": true,
        "kids.parent-approval.preview": true,
      },
    },
    limits: {
      id: "kids-low-limit",
      label: "Kids low limit",
      currency: "LOCAL",
      perTransaction: 100,
      daily: 300,
      monthly: 1000,
    },
    readiness: "prepared",
  },
};

export function getBankingScenario(scenarioId: BankingScenarioId): BankingScenarioDefinition {
  return BANKING_SCENARIOS[scenarioId];
}

export function getDefaultBankingScenarioForProduct(product: ProductId): BankingScenarioId {
  switch (product) {
    case "SME":
      return "sme-owner-preview";
    case "KIDS_PI":
      return "kids-child-preview";
    default:
      return "retail-single-account";
  }
}

function resolveCurrency(currency: CurrencyTemplate, country: CountryId): string {
  return currency === "LOCAL" ? COUNTRY_META[country].currency : currency;
}

function materializeHoldings(
  scenario: BankingScenarioDefinition,
  country: CountryId
): readonly BankingHolding[] {
  return scenario.holdings.map((holding) => ({
    ...holding,
    currency: resolveCurrency(holding.currency, country),
  }));
}

function resolveLimits(limits: LimitProfile, country: CountryId): ResolvedLimitProfile {
  return {
    ...limits,
    currency: resolveCurrency(limits.currency, country),
  };
}

function resolveAction(
  action: BankingActionDefinition,
  state: DemoState,
  scenario: BankingScenarioDefinition,
  holdings: readonly BankingHolding[],
  limits: ResolvedLimitProfile
): DisabledAction | null {
  if (!action.products.includes(state.product)) {
    return { action: action.id, label: action.label, reason: `Product ${state.product} is not in scope.` };
  }

  if (!action.countries.includes(state.country)) {
    return { action: action.id, label: action.label, reason: `Country ${state.country} is not in scope.` };
  }

  if (!scenario.products.includes(state.product)) {
    return { action: action.id, label: action.label, reason: `Scenario is prepared for ${scenario.products.join(", ")}.` };
  }

  const missingHolding = action.requiredHoldings.find(
    (requiredType) => !holdings.some((holding) => holding.type === requiredType)
  );
  if (missingHolding) {
    return { action: action.id, label: action.label, reason: `Missing ${missingHolding} holding.` };
  }

  if (!scenario.entitlements.permissions[action.requiredEntitlement]) {
    return { action: action.id, label: action.label, reason: `Entitlement ${action.requiredEntitlement} is disabled.` };
  }

  if (action.requiresPositiveLimit && (limits.perTransaction <= 0 || limits.daily <= 0)) {
    return { action: action.id, label: action.label, reason: "Transaction limits are zero or unavailable." };
  }

  if (action.requiredFeature && !isFeatureActive(state, action.requiredFeature)) {
    return { action: action.id, label: action.label, reason: `Release feature ${action.requiredFeature} is not active.` };
  }

  return null;
}

export function resolveBankingScenario(
  state: DemoState,
  holdingOverrides?: readonly BankingHoldingTemplate[],
): ResolvedBankingScenario {
  const scenario = getBankingScenario(state.bankingScenario);
  const holdings = materializeHoldings(
    holdingOverrides ? { ...scenario, holdings: holdingOverrides } : scenario,
    state.country,
  );
  const limits = resolveLimits(scenario.limits, state.country);
  const disabledActions = Object.values(BANKING_ACTION_CATALOG)
    .map((action) => resolveAction(action, state, scenario, holdings, limits))
    .filter((action): action is DisabledAction => action !== null);
  const disabledActionIds = new Set(disabledActions.map((action) => action.action));
  const enabledActions = Object.keys(BANKING_ACTION_CATALOG).filter(
    (actionId) => !disabledActionIds.has(actionId as BankingActionId)
  ) as BankingActionId[];
  const visibleProducts = Array.from(new Set(holdings.map((holding) => holding.type)));

  return {
    scenario,
    holdings,
    entitlements: scenario.entitlements,
    limits,
    enabledActions,
    disabledActions,
    visibleProducts,
  };
}
