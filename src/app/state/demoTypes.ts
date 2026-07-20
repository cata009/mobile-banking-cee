/**
 * Demo Engine Types
 * Type definitions for demo configuration system
 */

/**
 * Supported UniCredit countries in CEE region
 */
export type Country = "RO" | "RS" | "HU" | "BA" | "BA_BL" | "SK" | "SI" | "CZ";

/**
 * Official country identifier alias used by project registries.
 */
export type CountryId = Country;

/**
 * Supported application products.
 * PI = personal individual mobile banking.
 * SME = small and medium enterprise mobile banking.
 * KIDS_PI = kids-focused personal individual mobile banking.
 */
export type ProductId = "PI" | "SME" | "KIDS_PI";

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
export type BaselineId =
  | "baseline-current"
  | "baseline-r1"
  | "baseline-r2"
  | "baseline-r3"
  | "baseline-r4"
  | "uat-current";

/**
 * Release identifiers.
 */
export type ReleaseId =
  | "release-current"
  | "release-future-cz-coapping"
  | "release-v1"
  | "release-v2"
  | "release-v3"
  | "release-v4";

/**
 * Banking scenario identifiers used by the demo control panel.
 * These model mock customer/product/rights conditions, not auth sessions.
 */
export type BankingScenarioId =
  | "retail-prospect"
  | "retail-single-account"
  | "retail-multi-account-card"
  | "retail-deposits-investments"
  | "retail-payments-restricted"
  | "sme-owner-preview"
  | "kids-child-preview";

/**
 * Product holdings that can drive mock visibility and action availability.
 */
export type BankingHoldingType =
  | "account"
  | "card"
  | "deposit"
  | "investment"
  | "loan"
  | "savings-goal";

/**
 * Editable product mix dimensions controlled from the demo Control Panel.
 * These counts drive the mock product list rendered in the mobile demo.
 */
export type ProductCountKey =
  | "accounts"
  | "debitCards"
  | "creditCards"
  | "mealCards"
  | "deposits"
  | "savingsAccounts"
  | "loans"
  | "mortgages"
  | "investments";

export type ProductCounts = Record<ProductCountKey, number>;

/**
 * Action identifiers resolved by the banking context engine.
 */
export type BankingActionId =
  | "accounts.view"
  | "cards.view"
  | "cards.manage"
  | "payments.domestic.create"
  | "payments.foreign.create"
  | "payments.templates.manage"
  | "payments.ebills.manage"
  | "payments.exchange.create"
  | "deposits.view"
  | "investments.view"
  | "loans.view"
  | "messages.view"
  | "documents.view"
  | "sme.payroll.preview"
  | "kids.parent-approval.preview";

export type DataSourceAuthority = "authority" | "reference" | "inspiration" | "deprecated";

/**
 * Addressable screen identifiers for AI catalog and flow composition.
 */
export type ScreenId =
  | "pi.prelogin.inactive"
  | "pi.prelogin.active"
  | "pi.co-apping.session"
  | "pi.language.selector"
  | "pi.home.overview"
  | "pi.analytics.overview"
  | "pi.messages.overview"
  | "pi.account.detail"
  | "pi.account.details-info"
  | "pi.account.options"
  | "pi.transaction.detail"
  | "pi.payments.overview"
  | "pi.payment.domestic-create"
  | "pi.payment.review"
  | "pi.payment.sign"
  | "pi.payment.success"
  | "pi.investments.portfolio"
  | "pi.investments.history"
  | "pi.card.detail"
  | "pi.card.details-info"
  | "pi.card.options"
  | "pi.products.overview"
  | "pi.products.detail"
  | "pi.prime.overview"
  | "pi.more.overview"
  | "pi.documents.overview"
  | "pi.settings.overview"
  | "pi.contacts.overview"
  | "kids.sk.home-concept"
  | "kids.hu.home-concept"
  | "platform.design-system"
  | "platform.flow-library"
  | "platform.tools";

/**
 * Addressable component identifiers for AI catalog and reuse mapping.
 */
export type ComponentId =
  | "shell.mobile-frame"
  | "shell.phone-screenshot-control"
  | "shell.page-header"
  | "shell.bottom-navigation"
  | "shell.bottom-sheet"
  | "icons.app-icon"
  | "brand.unicredit-logo"
  | "ui.primary-button"
  | "ui.link-button"
  | "ui.pill"
  | "ui.wallet-button"
  | "ui.bar"
  | "ui.date-filter"
  | "ui.pill-sorting"
  | "ui.code-field"
  | "ui.toast-message"
  | "ui.text-field"
  | "ui.amount-field"
  | "ui.profile-avatar"
  | "ui.navigation-row"
  | "ui.toggle-button"
  | "ui.radio-button"
  | "ui.section-heading-divider"
  | "prelogin.inactive"
  | "prelogin.active"
  | "prelogin.language-selector"
  | "prelogin.other-panel"
  | "co-apping.floating-button"
  | "co-apping.session-entry"
  | "home.amount-visibility-toggle"
  | "home.account-summary"
  | "home.account-balance-card"
  | "home.unplanned-banner"
  | "analytics.spendings"
  | "analytics.category-details"
  | "pfm.category-icon"
  | "pfm.category-change-sheet"
  | "messages.mailbox-tabs"
  | "messages.inbox-list"
  | "accounts.action-bar"
  | "accounts.details-info"
  | "accounts.details-info-field"
  | "accounts.transaction-search"
  | "accounts.transaction-row"
  | "transactions.detail"
  | "payments.menu"
  | "payments.hero-card"
  | "payments.other-shortcut"
  | "payments.other-shortcut-icon-bubble"
  | "payments.new-payment-sheet"
  | "payments.new-payment-action"
  | "payments.new-payment-discover-banner"
  | "payments.domestic-flow"
  | "investments.portfolio-tabs"
  | "investments.portfolio-chart"
  | "investments.distribution-chart"
  | "investments.period-chips"
  | "investments.action-bar"
  | "investments.filter-chips"
  | "investments.products-accordion"
  | "investments.product-card"
  | "investments.fund-banner"
  | "templates.reconstructed-code"
  | "products.menu"
  | "products.offer-card"
  | "products.shopsmart-offer-card"
  | "products.product-card"
  | "products.product-card-list-total"
  | "cards.card"
  | "cards.ghost-banner"
  | "cards.info-banner"
  | "cards.user-event-card"
  | "cards.helper-card"
  | "cards.pending-action-card"
  | "cards.card-component"
  | "more.card-grid"
  | "contacts.navigation-card"
  | "prime.advisor-tab"
  | "prime.benefits-tab"
  | "dialogs.logout-confirmation"
  | "kids.market-home-concepts";

/**
 * Addressable flow identifiers.
 */
export type FlowId =
  | "pi.prelogin-to-home.active"
  | "pi.co-apping.activation"
  | "pi.home-to-account-detail"
  | "pi.home-to-analytics"
  | "pi.header-to-messages"
  | "pi.home-to-payments-menu"
  | "pi.transaction-redo-payment"
  | "pi.new-domestic-payment"
  | "pi.home-to-products-menu"
  | "pi.home-to-investments-portfolio"
  | "pi.home-to-more-to-contacts"
  | "pi.home-to-more-to-documents"
  | "pi.home-to-more-to-settings"
  | "kids.market-home-bottom-nav";

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
  | "fx_czCoAppingSmartAssistant"
  | "fx_unplannedBanner"
  | "fx_transactionsFilters"
  | "fx_enhancedAnalytics"
  | "fx_quickActionsRedesign";

/** Runtime-sparse manual feature overrides for one demo context. */
export type FeatureFlagOverrides = Partial<Record<FeatureId, boolean>>;

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

  /** Selected mock banking customer/product/rights profile */
  bankingScenario: BankingScenarioId;
  
  /**
   * Feature flags by context (product:country:designSystem:baseline:release:bankingScenario)
   * Each context maintains its own set of unplanned feature toggles
   * 
   * @example
   * {
   *   "PI:RO:current:baseline-current:release-current:retail-single-account": { fx_transactionsFilters: true },
   *   "PI:CZ:current:baseline-current:release-v1:retail-multi-account-card": { fx_unplannedBanner: false },
   * }
   */
  flagsByContext: Record<string, FeatureFlagOverrides>;

  /** Whether account/card/product amounts are hidden across the mobile app. */
  amountsHidden: boolean;

  /** Current light/dark rendering mode. */
  themeMode: ThemeMode;

  /** Editable mock product counts used to build the visible demo portfolio. */
  productCounts: ProductCounts;
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

  /** Update selected mock banking scenario */
  setBankingScenario: (bankingScenario: BankingScenarioId) => void;

  /** Update one editable product count in the mock portfolio. */
  setProductCount: (key: ProductCountKey, value: number) => void;

  /** Replace edited product counts with the selected banking scenario baseline. */
  resetProductCountsToScenario: () => void;
  
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
