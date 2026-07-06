/**
 * Demo Engine Store
 * Context provider and hook for demo configuration state
 */

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { getReleaseBundle } from "@/app/registry/releaseRegistry";
import type {
  BaselineId,
  BankingScenarioId,
  CountryId,
  DesignSystemId,
  FeatureId,
  ProductCountKey,
  ProductCounts,
  ProductId,
  ReleaseId,
  Scenario,
  ThemeMode,
  DemoState,
  DemoStore,
} from "./demoTypes";

export const DEFAULT_PRODUCT_COUNTS: ProductCounts = {
  accounts: 2,
  debitCards: 2,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 1,
  mortgages: 1,
  investments: 1,
};

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
  productCounts: DEFAULT_PRODUCT_COUNTS,
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

// --- Narrow sub-contexts for high-frequency consumers ---
// These exist so consumers that only need `country` or the data slice
// ({country, productCounts}) don't re-render when unrelated fields like
// themeMode or feature flags toggle. Each provider value is memoized so its
// identity is stable across renders where its slice didn't change.
const CountryContext = createContext<CountryId | null>(null);

interface ProductDataSlice {
  country: CountryId;
  productCounts: ProductCounts;
}
const ProductDataContext = createContext<ProductDataSlice | null>(null);

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
    productCounts: {
      ...DEFAULT_DEMO_STATE.productCounts,
      ...initialState?.productCounts,
    },
  });

  /**
   * Setters are wrapped in `useCallback` with stable deps so their identity is
   * preserved across renders. This (a) lets children safely list them in
   * `useEffect`/`useCallback` deps without re-running, and (b) keeps the
   * `value` object below stable whenever `state` itself hasn't changed.
   *
   * Note: `setFlag` / `resetFlags` read the context key from `prev` inside the
   * updater (not from `state` directly). This makes them stable AND more
   * correct — the flag now always targets the context that is active at the
   * moment the update is applied, not the one captured at render time.
   */
  const setProduct = useCallback((product: ProductId) => {
    setState(prev => ({
      ...prev,
      product,
      bankingScenario: DEFAULT_BANKING_SCENARIO_BY_PRODUCT[product],
    }));
  }, []);

  const setCountry = useCallback((country: CountryId) => {
    setState(prev => ({ ...prev, country }));
  }, []);

  const setScenario = useCallback((scenario: Scenario) => {
    setState(prev => ({ ...prev, scenario }));
  }, []);

  const setDesignSystem = useCallback((designSystem: DesignSystemId) => {
    setState(prev => ({ ...prev, designSystem }));
  }, []);

  const setBaseline = useCallback((baseline: BaselineId) => {
    setState(prev => ({ ...prev, baseline }));
  }, []);

  const setRelease = useCallback((release: ReleaseId) => {
    const releaseBundle = getReleaseBundle(release);
    setState(prev => ({
      ...prev,
      release,
      baseline: releaseBundle.baseline,
    }));
  }, []);

  const setBankingScenario = useCallback((bankingScenario: BankingScenarioId) => {
    setState(prev => ({ ...prev, bankingScenario }));
  }, []);

  const setProductCount = useCallback((key: ProductCountKey, value: number) => {
    const normalizedValue = Number.isFinite(value) ? Math.max(0, Math.min(9, Math.trunc(value))) : 0;
    setState(prev => ({
      ...prev,
      productCounts: {
        ...prev.productCounts,
        [key]: normalizedValue,
      },
    }));
  }, []);

  const setFlag = useCallback((featureId: FeatureId, enabled: boolean) => {
    setState(prev => {
      const contextKey = getContextKey(prev);
      return {
        ...prev,
        flagsByContext: {
          ...prev.flagsByContext,
          [contextKey]: {
            ...prev.flagsByContext[contextKey],
            [featureId]: enabled,
          },
        },
      };
    });
  }, []);

  const toggleAmountsHidden = useCallback(() => {
    setState(prev => ({ ...prev, amountsHidden: !prev.amountsHidden }));
  }, []);

  const setAmountsHidden = useCallback((hidden: boolean) => {
    setState(prev => ({ ...prev, amountsHidden: hidden }));
  }, []);

  const setThemeMode = useCallback((themeMode: ThemeMode) => {
    setState(prev => ({ ...prev, themeMode }));
  }, []);

  const toggleThemeMode = useCallback(() => {
    setState(prev => ({ ...prev, themeMode: prev.themeMode === "light" ? "dark" : "light" }));
  }, []);

  const resetFlags = useCallback(() => {
    setState(prev => {
      const contextKey = getContextKey(prev);
      return {
        ...prev,
        flagsByContext: {
          ...prev.flagsByContext,
          [contextKey]: {},
        },
      };
    });
  }, []);

  const resetAll = useCallback(() => {
    setState(DEFAULT_DEMO_STATE);
  }, []);

  // `value` is memoized so its identity stays stable across renders where
  // `state` did not change (e.g. when DemoProvider's parent re-renders for an
  // unrelated reason). The setters above are stable, so only `state` drives
  // identity here.
  const value = useMemo<DemoStore>(
    () => ({
      ...state,
      setProduct,
      setCountry,
      setScenario,
      setDesignSystem,
      setBaseline,
      setRelease,
      setBankingScenario,
      setProductCount,
      setFlag,
      toggleAmountsHidden,
      setAmountsHidden,
      setThemeMode,
      toggleThemeMode,
      resetFlags,
      resetAll,
    }),
    [
      state,
      setProduct,
      setCountry,
      setScenario,
      setDesignSystem,
      setBaseline,
      setRelease,
      setBankingScenario,
      setProductCount,
      setFlag,
      toggleAmountsHidden,
      setAmountsHidden,
      setThemeMode,
      toggleThemeMode,
      resetFlags,
      resetAll,
    ],
  );

  // Slice values for the narrow sub-contexts. Each is memoized on its own
  // slice so its identity is stable when unrelated fields change.
  const countryValue = state.country;
  const productDataValue = useMemo<ProductDataSlice>(
    () => ({ country: state.country, productCounts: state.productCounts }),
    [state.country, state.productCounts],
  );

  return (
    <DemoContext.Provider value={value}>
      <CountryContext.Provider value={countryValue}>
        <ProductDataContext.Provider value={productDataValue}>
          {children}
        </ProductDataContext.Provider>
      </CountryContext.Provider>
    </DemoContext.Provider>
  );
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
 * Subscribe ONLY to `country`. Consumers using this hook will NOT re-render
 * when themeMode, feature flags, product counts, or other unrelated state
 * changes. Prefer this over `useDemo()` in screens/components that read
 * nothing but the active country.
 *
 * @throws Error if used outside DemoProvider
 */
export function useCountry(): CountryId {
  const context = useContext(CountryContext);
  if (context === null) {
    throw new Error("useCountry must be used within a DemoProvider");
  }
  return context;
}

/**
 * Subscribe ONLY to `{ country, productCounts }` — the data slice that drives
 * product/IBAN/currency derivation in `useProducts`. Consumers using this hook
 * will NOT re-render when themeMode or feature flags toggle. This is the
 * single highest-value narrow selector: it stops the expensive product
 * re-derivation cascade that previously fired on every theme/flag change.
 *
 * @throws Error if used outside DemoProvider
 */
export function useProductData(): ProductDataSlice {
  const context = useContext(ProductDataContext);
  if (context === null) {
    throw new Error("useProductData must be used within a DemoProvider");
  }
  return context;
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
  ProductCountKey,
  ProductCounts,
  ProductId,
  ReleaseId,
  Scenario,
  ThemeMode,
  DemoState,
  DemoStore,
} from "./demoTypes";
