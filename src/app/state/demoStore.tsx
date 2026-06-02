/**
 * Demo Engine Store
 * Context provider and hook for demo configuration state
 */

import { createContext, useContext, useState, ReactNode } from "react";
import { getReleaseBundle } from "@/app/registry/releaseRegistry";
import type {
  BaselineId,
  BankingScenarioId,
  CountryId,
  DesignSystemId,
  FeatureId,
  ProductId,
  ReleaseId,
  Scenario,
  ThemeMode,
  DemoState,
  DemoStore,
} from "./demoTypes";

/**
 * Get context key for current demo configuration.
 * 
 * @param state - Demo state dimensions that isolate manual flags
 * @returns Context key in format "product:country:designSystem:baseline:release:bankingScenario"
 * 
 * @example
 * ```ts
 * getContextKey({ product: "PI", country: "RO", designSystem: "current", baseline: "baseline-current", release: "release-current", bankingScenario: "retail-single-account" })
 * // "PI:RO:current:baseline-current:release-current:retail-single-account"
 * ```
 */
export function getContextKey(
  state: Pick<DemoState, "product" | "country" | "designSystem" | "baseline" | "release" | "bankingScenario">
): string {
  return `${state.product}:${state.country}:${state.designSystem}:${state.baseline}:${state.release}:${state.bankingScenario}`;
}

/**
 * Get current flags for active context
 * 
 * @param state - Full demo state
 * @returns Feature flags for current context
 * 
 * @example
 * ```ts
 * const state = { product: "PI", country: "RO", designSystem: "current", baseline: "baseline-current", release: "release-current", bankingScenario: "retail-single-account", flagsByContext: { "PI:RO:current:baseline-current:release-current:retail-single-account": { fx_transactionsFilters: true } } };
 * getCurrentFlags(state)
 * // { fx_transactionsFilters: true }
 * ```
 */
export function getCurrentFlags(state: DemoState): Record<FeatureId, boolean> {
  const contextKey = getContextKey(state);
  return state.flagsByContext[contextKey] || {};
}

/**
 * Default demo state with empty flags by context
 */
const DEFAULT_DEMO_STATE: DemoState = {
  product: "PI",
  country: "RO",
  scenario: "active",
  designSystem: "current",
  baseline: "baseline-current",
  release: "release-current",
  bankingScenario: "retail-single-account",
  flagsByContext: {
    // Initialize with empty context for default PI/RO/current baseline.
    "PI:RO:current:baseline-current:release-current:retail-single-account": {},
  },
  amountsHidden: false,
  themeMode: "light",
};

const DEFAULT_BANKING_SCENARIO_BY_PRODUCT: Record<ProductId, BankingScenarioId> = {
  PI: "retail-single-account",
  SME: "sme-owner-preview",
  KIDS_PI: "kids-child-preview",
};

/**
 * Demo context
 */
const DemoContext = createContext<DemoStore | null>(null);

/**
 * Demo Provider Props
 */
interface DemoProviderProps {
  children: ReactNode;
  /** Optional initial state override */
  initialState?: Partial<DemoState>;
}

/**
 * Demo Provider Component
 * Wraps the application to provide demo configuration state
 * 
 * @example
 * ```tsx
 * <DemoProvider>
 *   <App />
 * </DemoProvider>
 * ```
 */
export function DemoProvider({ children, initialState }: DemoProviderProps) {
  const [state, setState] = useState<DemoState>({
    ...DEFAULT_DEMO_STATE,
    ...initialState,
    flagsByContext: {
      ...DEFAULT_DEMO_STATE.flagsByContext,
      ...initialState?.flagsByContext,
    },
  });

  /**
   * Update selected product
   */
  const setProduct = (product: ProductId) => {
    setState(prev => ({
      ...prev,
      product,
      bankingScenario: DEFAULT_BANKING_SCENARIO_BY_PRODUCT[product],
    }));
  };

  /**
   * Update selected country
   */
  const setCountry = (country: CountryId) => {
    setState(prev => ({ ...prev, country }));
  };

  /**
   * Update co-apping scenario
   */
  const setScenario = (scenario: Scenario) => {
    setState(prev => ({ ...prev, scenario }));
  };

  /**
   * Update selected design system
   */
  const setDesignSystem = (designSystem: DesignSystemId) => {
    setState(prev => ({ ...prev, designSystem }));
  };

  /**
   * Update selected baseline
   */
  const setBaseline = (baseline: BaselineId) => {
    setState(prev => ({ ...prev, baseline }));
  };

  /**
   * Update selected release preview and keep baseline synchronized.
   */
  const setRelease = (release: ReleaseId) => {
    const releaseBundle = getReleaseBundle(release);
    setState(prev => ({
      ...prev,
      release,
      baseline: releaseBundle.baseline,
    }));
  };

  /**
   * Update selected mock banking scenario
   */
  const setBankingScenario = (bankingScenario: BankingScenarioId) => {
    setState(prev => ({ ...prev, bankingScenario }));
  };

  /**
   * Toggle or set a feature flag
   */
  const setFlag = (featureId: FeatureId, enabled: boolean) => {
    const contextKey = getContextKey(state);
    setState(prev => ({
      ...prev,
      flagsByContext: {
        ...prev.flagsByContext,
        [contextKey]: {
          ...prev.flagsByContext[contextKey],
          [featureId]: enabled,
        },
      },
    }));
  };

  /**
   * Toggle account/card/product amount visibility across the mobile app
   */
  const toggleAmountsHidden = () => {
    setState(prev => ({ ...prev, amountsHidden: !prev.amountsHidden }));
  };

  /**
   * Set account/card/product amount visibility across the mobile app
   */
  const setAmountsHidden = (hidden: boolean) => {
    setState(prev => ({ ...prev, amountsHidden: hidden }));
  };

  /**
   * Set runtime light/dark theme across the demo
   */
  const setThemeMode = (themeMode: ThemeMode) => {
    setState(prev => ({ ...prev, themeMode }));
  };

  /**
   * Toggle runtime light/dark theme across the demo
   */
  const toggleThemeMode = () => {
    setState(prev => ({ ...prev, themeMode: prev.themeMode === "light" ? "dark" : "light" }));
  };

  /**
   * Reset all feature flags to default (false)
   */
  const resetFlags = () => {
    const contextKey = getContextKey(state);
    setState(prev => ({
      ...prev,
      flagsByContext: {
        ...prev.flagsByContext,
        [contextKey]: {},
      },
    }));
  };

  /**
   * Reset entire demo state to defaults
   */
  const resetAll = () => {
    setState(DEFAULT_DEMO_STATE);
  };

  const value: DemoStore = {
    ...state,
    setProduct,
    setCountry,
    setScenario,
    setDesignSystem,
    setBaseline,
    setRelease,
    setBankingScenario,
    setFlag,
    toggleAmountsHidden,
    setAmountsHidden,
    setThemeMode,
    toggleThemeMode,
    resetFlags,
    resetAll,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

/**
 * Hook to access demo configuration state
 * 
 * @throws Error if used outside DemoProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { country, scenario, setCountry, setFlag } = useDemo();
 *   
 *   return (
 *     <div>
 *       <p>Current country: {country}</p>
 *       <button onClick={() => setCountry("HU")}>Switch to Hungary</button>
 *       <button onClick={() => setFlag("fx_newPaymentsHub", true)}>
 *         Enable Payments Hub
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useDemo(): DemoStore {
  const context = useContext(DemoContext);
  
  if (!context) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  
  return context;
}

/**
 * Optional: Hook to check if a specific feature flag is enabled
 * Uses the current context to retrieve flag state
 * 
 * @param featureId - The feature flag to check
 * @returns boolean indicating if feature is enabled
 * 
 * @example
 * ```tsx
 * function PaymentsHub() {
 *   const isNewHubEnabled = useFeatureFlag("fx_newPaymentsHub");
 *   
 *   if (isNewHubEnabled) {
 *     return <NewPaymentsHub />;
 *   }
 *   
 *   return <LegacyPaymentsHub />;
 * }
 * ```
 */
export function useFeatureFlag(featureId: FeatureId): boolean {
  const demoState = useDemo();
  const currentFlags = getCurrentFlags(demoState);
  return currentFlags[featureId] ?? false;
}

/**
 * Re-export types for convenience
 */
export type {
  BaselineId,
  BankingScenarioId,
  CountryId,
  DesignSystemId,
  FeatureId,
  ProductId,
  ReleaseId,
  Scenario,
  ThemeMode,
  DemoState,
  DemoStore,
} from "./demoTypes";
