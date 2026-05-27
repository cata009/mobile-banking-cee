/**
 * Demo Engine Types
 * Type definitions for demo configuration system
 */

/**
 * Supported UniCredit countries in CEE region
 */
export type Country = "RO" | "RS" | "HU" | "BA" | "SK" | "SI" | "CZ";

/**
 * Official country identifier alias used by project registries.
 */
export type CountryId = Country;

/**
 * Supported application products.
 * PI = personal individual mobile banking.
 * SME = small and medium enterprise mobile banking.
 */
export type ProductId = "PI" | "SME";

/**
 * Supported design systems.
 * current = current CEE light restyle.
 * next = future design-system deviation.
 */
export type DesignSystemId = "current" | "next";

/**
 * Runtime visual theme for the stakeholder demo.
 */
export type ThemeMode = "light" | "dark";

/**
 * Stable baseline identifiers.
 */
export type BaselineId = "baseline-current" | "uat-current";

/**
 * Release identifiers.
 */
export type ReleaseId =
  | "release-current"
  | "release-v1"
  | "release-v2"
  | "release-v3"
  | "release-v4";

/**
 * Addressable screen identifiers for AI catalog and flow composition.
 */
export type ScreenId =
  | "pi.prelogin.inactive"
  | "pi.prelogin.active"
  | "pi.co-apping.session"
  | "pi.home.overview"
  | "pi.analytics.overview"
  | "pi.account.detail"
  | "pi.account.details-info"
  | "pi.account.options"
  | "pi.transaction.detail"
  | "pi.payments.overview"
  | "pi.payment.domestic-create"
  | "pi.payment.review"
  | "pi.payment.sign"
  | "pi.payment.success"
  | "pi.products.overview"
  | "pi.prime.overview"
  | "pi.more.overview"
  | "pi.contacts.overview"
  | "platform.design-system";

/**
 * Addressable component identifiers for AI catalog and reuse mapping.
 */
export type ComponentId =
  | "shell.mobile-frame"
  | "shell.bottom-navigation"
  | "shell.bottom-sheet"
  | "prelogin.inactive"
  | "prelogin.active"
  | "co-apping.floating-button"
  | "co-apping.session-entry"
  | "home.amount-visibility-toggle"
  | "home.account-summary"
  | "home.account-balance-card"
  | "home.unplanned-banner"
  | "analytics.spendings"
  | "accounts.details-info"
  | "accounts.transaction-search"
  | "accounts.transaction-row"
  | "transactions.detail"
  | "payments.menu"
  | "payments.other-shortcut"
  | "payments.new-payment-sheet"
  | "payments.new-payment-action"
  | "payments.new-payment-discover-banner"
  | "payments.domestic-flow"
  | "products.menu"
  | "products.offer-card"
  | "products.product-card"
  | "more.card-grid"
  | "contacts.navigation-card"
  | "prime.advisor-tab"
  | "prime.benefits-tab";

/**
 * Addressable flow identifiers.
 */
export type FlowId =
  | "pi.prelogin-to-home.active"
  | "pi.co-apping.activation"
  | "pi.home-to-account-detail"
  | "pi.home-to-analytics"
  | "pi.home-to-payments-menu"
  | "pi.transaction-redo-payment"
  | "pi.new-domestic-payment"
  | "pi.home-to-products-menu"
  | "pi.home-to-more-to-contacts";

/**
 * Shared implementation status for registries and feature coverage.
 */
export type CapabilityStatus =
  | "planned"
  | "in_design"
  | "configured"
  | "implemented"
  | "partial"
  | "mock-driven"
  | "legacy"
  | "uat_ready"
  | "released"
  | "baseline"
  | "blocked"
  | "missing";

/**
 * Co-apping session scenarios
 */
export type Scenario = "inactive" | "active";

/**
 * Feature flag identifiers
 * Prefix: fx_ (feature experiment)
 */
export type FeatureId =
  | "fx_newPaymentsHub"
  | "fx_cardsRedesign"
  | "fx_unplannedBanner"
  | "fx_transactionsFilters"
  | "fx_enhancedAnalytics"
  | "fx_quickActionsRedesign";

/**
 * Feature scope types
 * - global: Feature applies to all countries
 * - countries: Feature applies only to specific countries
 */
export type FeatureScope = "global" | "countries";

/**
 * Feature kind (lifecycle stage)
 * - release: Controlled by release preview
 * - unplanned: Manually togglable (experimental/debugging)
 */
export type FeatureKind = "release" | "unplanned";

/**
 * Feature metadata with scope and restrictions
 */
export interface FeatureMeta {
  /** Feature identifier */
  id: FeatureId;
  
  /** Display label */
  label: string;
  
  /** Optional description */
  description?: string;
  
  /** Feature lifecycle kind */
  kind: FeatureKind;
  
  /** Geographic scope */
  scope: FeatureScope;
  
  /** Countries where this feature applies (required if scope="countries") */
  countries?: CountryId[];

  /** Optional release restriction (feature only available in specific releases) */
  releases?: ReleaseId[];

  /** Products where this feature is relevant */
  products?: ProductId[];

  /** Design systems where this feature is relevant */
  designSystems?: DesignSystemId[];

  /** Lifecycle status for release/baseline governance */
  lifecycleStatus?: CapabilityStatus;

  /** Implementation/coverage status in the current demo */
  coverageStatus?: CapabilityStatus;

  /** Release where this feature is introduced or previewed */
  introducedIn?: ReleaseId | null;

  /** Baseline where this feature becomes official */
  baselineFrom?: BaselineId | null;

  /** Screens affected by this feature */
  affectedScreens?: ScreenId[];
}

/**
 * Demo state configuration
 */
export interface DemoState {
  /** Selected product/application */
  product: ProductId;

  /** Selected country */
  country: CountryId;
  
  /** Co-apping session scenario */
  scenario: Scenario;

  /** Selected design system */
  designSystem: DesignSystemId;

  /** Selected stable baseline */
  baseline: BaselineId;

  /** Selected release preview */
  release: ReleaseId;
  
  /**
   * Feature flags by context (product:country:designSystem:baseline:release)
   * Each context maintains its own set of unplanned feature toggles
   * 
   * @example
   * {
   *   "PI:RO:current:baseline-current:release-current": { fx_transactionsFilters: true },
   *   "PI:CZ:current:baseline-current:release-v1": { fx_unplannedBanner: false },
   * }
   */
  flagsByContext: Record<string, Record<FeatureId, boolean>>;

  /** Whether account/card/product amounts are hidden across the mobile app. */
  amountsHidden: boolean;

  /** Current light/dark rendering mode. */
  themeMode: ThemeMode;
}

/**
 * Demo store API methods
 */
export interface DemoStore extends DemoState {
  /** Update selected product */
  setProduct: (product: ProductId) => void;

  /** Update selected country */
  setCountry: (country: CountryId) => void;
  
  /** Update co-apping scenario */
  setScenario: (scenario: Scenario) => void;

  /** Update selected design system */
  setDesignSystem: (designSystem: DesignSystemId) => void;

  /** Update selected baseline */
  setBaseline: (baseline: BaselineId) => void;

  /** Update selected release preview */
  setRelease: (release: ReleaseId) => void;
  
  /** Toggle or set a feature flag */
  setFlag: (featureId: FeatureId, enabled: boolean) => void;

  /** Toggle account/card/product amount visibility across the mobile app. */
  toggleAmountsHidden: () => void;

  /** Set account/card/product amount visibility across the mobile app. */
  setAmountsHidden: (hidden: boolean) => void;

  /** Update runtime light/dark theme. */
  setThemeMode: (themeMode: ThemeMode) => void;

  /** Toggle runtime light/dark theme. */
  toggleThemeMode: () => void;
  
  /** Reset all flags to default (false) */
  resetFlags: () => void;
  
  /** Reset entire demo state to defaults */
  resetAll: () => void;
}

/**
 * Country metadata for UI display
 */
export interface CountryMetadata {
  code: CountryId;
  name: string;
  flag: string; // emoji flag
  currency: string;
}

/**
 * Scenario metadata for UI display
 */
export interface ScenarioMetadata {
  id: Scenario;
  label: string;
  description: string;
}

/**
 * Feature flag metadata for UI display
 */
export interface FeatureFlagMetadata {
  id: FeatureId;
  label: string;
  description: string;
  category: "ui" | "backend" | "experimental";
}
