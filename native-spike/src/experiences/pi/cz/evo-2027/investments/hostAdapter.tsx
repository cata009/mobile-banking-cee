import { useColorScheme } from 'react-native';
import {
  parseInvestmentOrderQuantity,
  type CoAppingInvestmentBuyDraft,
} from '@/features/investments/orders/buyOrder';
import {
  createCurrentTranslator,
  currentTokens,
} from '../../../current/context';
import type {
  CurrentRoute,
  CurrentScreenProps,
} from '../../../current/contracts';
import type {
  CzechNativeRoute,
  CzechNativeScreen,
  CzechNativeScreenProps,
} from '../contracts';

const currentToCzechScreen: Partial<
  Record<CurrentRoute['screen'], CzechNativeScreen>
> = {
  home: 'home',
  pfm: 'pfm',
  products: 'products',
  'product-detail': 'product-detail',
  accounts: 'accounts',
  account: 'account',
  'account-info': 'account-info',
  'account-options': 'account-options',
  transactions: 'transactions',
  transaction: 'transaction',
  cards: 'cards',
  card: 'card',
  'card-info': 'card-info',
  'card-options': 'card-options',
  payments: 'payments',
  'payment-create': 'payment-create',
  investments: 'investments',
  profile: 'profile',
  settings: 'settings',
  language: 'language',
  documents: 'documents',
  messages: 'messages',
  contacts: 'contacts',
  support: 'support',
  appointments: 'appointments',
  'call-request': 'call-request',
  prelogin: 'prelogin',
  login: 'login',
  search: 'search',
};

function currentRoute(route: CzechNativeRoute): CurrentRoute {
  const params: Record<string, string> = { ...(route.params ?? {}) };
  if (route.screen === 'investment-history') {
    params.entry ??= params.view === 'approvals' ? 'approvals' : 'history';
  } else if (route.screen === 'investment-detail') {
    params.entry ??= 'portfolio';
  }
  return {
    screen: 'investments',
    ...(Object.keys(params).length ? { params } : {}),
  };
}

export function useCurrentInvestmentHost(
  props: CzechNativeScreenProps,
  release: CurrentScreenProps['release'] = 'release-future-evo-2027',
): CurrentScreenProps {
  const systemScheme = useColorScheme();
  const language = props.language ?? 'en';
  const mode = props.mode ?? 'light';
  const dark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
  return {
    activeFeatures: props.activeFeatures,
    bankingScenario: props.bankingScenario,
    country: 'CZ',
    release,
    scenario: props.scenario,
    language,
    productCounts: props.productCounts,
    route: currentRoute(props.route),
    tokens: currentTokens(dark),
    t: createCurrentTranslator('CZ', language),
    amountsHidden: props.amountsHidden,
    screenTopInset: props.screenTopInset ?? 0,
    isActive: props.isActive ?? true,
    onNavigate: route => {
      const screen = currentToCzechScreen[route.screen];
      if (!screen) return;
      props.onNavigate({
        screen,
        ...(route.params ? { params: route.params } : {}),
      });
    },
    onBack: props.onBack,
    onProfile: props.onProfile,
    onSearch: props.onSearch,
    onAmountsToggle: props.onAmountsToggle,
    onChanged: props.onChanged,
    onLanguageChange: next => {
      if (next === 'en' || next === 'cs') props.onLanguageChange?.(next);
    },
    mode,
    onModeChange: next => props.onModeChange?.(next),
    onPrimaryNavigationChange: props.onPrimaryNavigationChange,
    onBackHandlerChange: props.onBackHandlerChange,
    investmentRequests: props.investmentRequests,
    onInvestmentBuyRequestConsumed: props.onInvestmentBuyRequestConsumed,
    onInvestmentSecuritySelected: props.onInvestmentSecuritySelected,
    onInvestmentReturnToSimulator: props.onInvestmentReturnToSimulator,
    onRoboResumeStateChange: props.onRoboResumeStateChange,
    investmentHistoryOverrides: props.investmentHistoryOverrides,
    onInvestmentHistoryTabChange: props.onInvestmentHistoryTabChange,
    onInvestmentHistoryToApprove: props.onInvestmentHistoryToApprove,
    investmentPresentation: props.investmentPresentation,
  };
}

function currentRouteFromCzech(route: CzechNativeRoute): CurrentRoute | null {
  if (
    route.screen === 'investments' ||
    route.screen === 'investment-history' ||
    route.screen === 'investment-detail' ||
    route.screen === 'robo'
  )
    return currentRoute(route);

  const screen = Object.entries(currentToCzechScreen).find(
    ([, czechScreen]) => czechScreen === route.screen,
  )?.[0] as CurrentRoute['screen'] | undefined;
  if (!screen) return null;
  return {
    screen,
    ...(route.params ? { params: route.params } : {}),
  };
}

/** Adapts a Current host to the Czech wrapper when Robo routes mount ClassicPortfolio. */
export function createCzechInvestmentHost(
  host: CurrentScreenProps,
  route: CzechNativeRoute,
): CzechNativeScreenProps {
  return {
    activeFeatures: host.activeFeatures,
    bankingScenario: host.bankingScenario,
    route,
    scenario: host.scenario,
    language: host.language === 'cs' ? 'cs' : 'en',
    onLanguageChange: host.onLanguageChange,
    mode: host.mode,
    onModeChange: host.onModeChange,
    productCounts: host.productCounts,
    amountsHidden: host.amountsHidden,
    onBack: host.onBack,
    onNavigate: next => {
      const nextCurrentRoute = currentRouteFromCzech(next);
      if (nextCurrentRoute) host.onNavigate(nextCurrentRoute);
    },
    onSearch: host.onSearch,
    onProfile: host.onProfile,
    onAmountsToggle: host.onAmountsToggle,
    onChanged: host.onChanged,
    screenTopInset: host.screenTopInset,
    isActive: host.isActive,
    onPrimaryNavigationChange: host.onPrimaryNavigationChange,
    onBackHandlerChange: host.onBackHandlerChange,
    investmentRequests: host.investmentRequests,
    onInvestmentBuyRequestConsumed: host.onInvestmentBuyRequestConsumed,
    onInvestmentSecuritySelected: host.onInvestmentSecuritySelected,
    onInvestmentReturnToSimulator: host.onInvestmentReturnToSimulator,
    onRoboResumeStateChange: host.onRoboResumeStateChange,
    investmentHistoryOverrides: host.investmentHistoryOverrides,
    onInvestmentHistoryTabChange: host.onInvestmentHistoryTabChange,
    onInvestmentHistoryToApprove: host.onInvestmentHistoryToApprove,
    investmentPresentation: host.investmentPresentation,
  };
}

export function readCzechInvestmentBuyDraft(
  params: CzechNativeRoute['params'],
): CoAppingInvestmentBuyDraft | null {
  const quantity = parseInvestmentOrderQuantity(params?.quantity ?? '');
  if (
    !quantity ||
    !params?.accountId ||
    params.frequency !== 'one-off' ||
    (params.executionTiming !== 'today' &&
      params.executionTiming !== 'next-business-day')
  )
    return null;
  return {
    quantity,
    accountId: params.accountId,
    frequency: 'one-off',
    executionTiming: params.executionTiming,
  };
}
