import type { ComponentType } from 'react';
import type { ProductCounts, Scenario } from '@/app/state/demoTypes';

/** CZ Evo is a release of current, never an alias for mobile-first. */
export const CZECH_NATIVE_CONTEXT = {
  product: 'PI',
  country: 'CZ',
  designSystem: 'current',
  baseline: 'baseline-current',
  release: 'release-future-evo-2027',
} as const;

export type CzechNativeScreen =
  | 'home'
  | 'pfm'
  | 'products'
  | 'product-detail'
  | 'accounts'
  | 'account'
  | 'account-info'
  | 'account-options'
  | 'transactions'
  | 'transaction'
  | 'cards'
  | 'card'
  | 'card-info'
  | 'card-options'
  | 'payments'
  | 'payment-create'
  | 'payment-review'
  | 'payment-sign'
  | 'payment-success'
  | 'investments'
  | 'investment-history'
  | 'investment-detail'
  | 'robo'
  | 'profile'
  | 'settings'
  | 'documents'
  | 'messages'
  | 'contacts'
  | 'support'
  | 'appointments'
  | 'call-request'
  | 'prelogin'
  | 'login'
  | 'language'
  | 'search';

/** Screen-local subviews and Source entity IDs travel as params without changing Source IDs. */
export interface CzechNativeRoute {
  screen: CzechNativeScreen;
  params?: Readonly<Record<string, string>>;
}
export interface CzechNativeChrome {
  backgroundColor: string;
  navigationBackgroundColor?: string;
  barStyle: 'light-content' | 'dark-content';
}
export interface CzechNativeScreenProps {
  route: CzechNativeRoute;
  scenario: Scenario;
  language?: 'en' | 'cs';
  onLanguageChange?: (language: 'en' | 'cs') => void;
  mode?: 'light' | 'dark' | 'system';
  onModeChange?: (mode: 'light' | 'dark' | 'system') => void;
  homeTheme?: string;
  onHomeThemeChange?: (theme: string) => void;
  productCounts: ProductCounts;
  amountsHidden: boolean;
  onBack: () => void;
  onNavigate: (route: CzechNativeRoute) => void;
  onSearch: () => void;
  onProfile: () => void;
  onAmountsToggle: () => void;
  onChanged: () => void;
  screenTopInset?: number;
  isActive?: boolean;
  onChromeChange?: (chrome?: CzechNativeChrome) => void;
}
export interface CzechNativeSearchEntry {
  id: string;
  label: string;
  subtitle?: string;
  keywords: readonly string[];
  target: CzechNativeRoute;
}
/** One adapter per ownership group. Only implemented screens are registered. */
export interface CzechNativeAdapter {
  id: string;
  screens: Partial<
    Record<CzechNativeScreen, ComponentType<CzechNativeScreenProps>>
  >;
  searchEntries?: (
    props: Pick<CzechNativeScreenProps, 'scenario' | 'productCounts'>,
  ) => readonly CzechNativeSearchEntry[];
}
export const DEFAULT_CZECH_COUNTS: ProductCounts = {
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
