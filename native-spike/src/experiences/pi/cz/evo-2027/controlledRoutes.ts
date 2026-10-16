import type { NativeDemoRoute } from '@/features/demo-native/contracts';
import type {
  NativePaymentFlow,
  NativePaymentIntent,
} from '@/features/demo-native/paymentIntents';
import type { CzechNativeRoute, CzechNativeScreen } from './contracts';

const directScreens: Partial<
  Record<NativeDemoRoute['screen'], CzechNativeScreen>
> = {
  home: 'home',
  prime: 'prime',
  coapping: 'coapping',
  accounts: 'accounts',
  account: 'account',
  'account-info': 'account-info',
  'account-options': 'account-options',
  cards: 'cards',
  card: 'card',
  'card-info': 'card-info',
  'card-options': 'card-options',
  transactions: 'transactions',
  transaction: 'transaction',
  payments: 'payments',
  products: 'products',
  'product-detail': 'product-detail',
  pfm: 'pfm',
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

const paymentScreens: Record<NativePaymentFlow['step'], CzechNativeScreen> = {
  create: 'payment-create',
  review: 'payment-review',
  sign: 'payment-sign',
  success: 'payment-success',
};

const copyParams = (
  params: Readonly<Record<string, string>> | undefined,
): Readonly<Record<string, string>> | undefined =>
  params && Object.keys(params).length ? { ...params } : undefined;

function route(
  screen: CzechNativeScreen,
  params?: Readonly<Record<string, string>>,
): CzechNativeRoute {
  const copied = copyParams(params);
  return copied ? { screen, params: copied } : { screen };
}

/** Map the Source host route DTO into the Evo router's distinct screen IDs. */
export function czechRouteFromNativeDemoRoute(
  source: NativeDemoRoute,
  paymentStep?: NativePaymentFlow['step'] | null,
): CzechNativeRoute | null {
  if (source.screen === 'investments') {
    const params = source.params ?? {},
      entry = params.entry ?? 'portfolio';
    if (entry === 'history') {
      return route('investment-history', {
        view: params.view ?? 'history',
        ...(params.filterByTitle ? { filterByTitle: params.filterByTitle } : {}),
        ...(params.securityId ?? params.filterBySecurityId
          ? { securityId: params.securityId ?? params.filterBySecurityId }
          : {}),
      });
    }
    if (entry === 'approvals') {
      return route('investment-history', {
        view: params.view ?? 'approvals',
        ...(params.filterByTitle ? { filterByTitle: params.filterByTitle } : {}),
      });
    }
    if (entry === 'detail') {
      const securityId = params.securityId ?? params.productId;
      return securityId
        ? route('investment-detail', { securityId })
        : null;
    }
    if (
      entry === 'robo' ||
      params.initialView === 'goals' ||
      params.initialView === 'create' ||
      params.view === 'goals' ||
      params.view === 'create' ||
      params.view === 'goal' ||
      Boolean(params.goalId)
    ) {
      return route('robo', {
        view:
          params.view ??
          params.initialView ??
          (params.goalId ? 'goal' : 'goals'),
        ...(params.goalId ? { goalId: params.goalId } : {}),
      });
    }
    if (entry === 'portfolio') {
      return route(
        'investments',
        params.initialView ? { view: params.initialView } : undefined,
      );
    }
    return null;
  }

  if (source.screen === 'payment-create') {
    return route(paymentScreens[paymentStep ?? 'create'], source.params);
  }
  if (source.screen === 'products' && source.params?.view === 'prime') {
    return route('prime');
  }
  const screen = directScreens[source.screen];
  return screen ? route(screen, source.params) : null;
}

/** Map Evo screen IDs back into the Source NativeDemoRoute envelope. */
export function nativeDemoRouteFromCzechRoute(
  czech: CzechNativeRoute,
): NativeDemoRoute | null {
  const params = czech.params ?? {};
  if (czech.screen === 'investment-history') {
    return {
      screen: 'investments',
      params: {
        entry:
          params.view === 'approvals' || params.view === 'bulk-approval'
            ? 'approvals'
            : 'history',
        ...(params.view ? { view: params.view } : {}),
        ...(params.filterByTitle ? { filterByTitle: params.filterByTitle } : {}),
        ...(params.securityId ? { securityId: params.securityId } : {}),
      },
    };
  }
  if (czech.screen === 'investment-detail') {
    return params.securityId
      ? { screen: 'investments', params: { entry: 'detail', securityId: params.securityId } }
      : null;
  }
  if (czech.screen === 'robo') {
    return {
      screen: 'investments',
      params: {
        entry: 'robo',
        view: params.view ?? 'goals',
        ...(params.goalId ? { goalId: params.goalId } : {}),
      },
    };
  }
  if (czech.screen === 'investments') {
    return {
      screen: 'investments',
      params: { entry: 'portfolio', ...(params.view ? { initialView: params.view } : {}) },
    };
  }
  if (czech.screen === 'products' && params.view === 'prime') {
    return { screen: 'prime' };
  }
  if (
    czech.screen === 'payment-create' ||
    czech.screen === 'payment-review' ||
    czech.screen === 'payment-sign' ||
    czech.screen === 'payment-success'
  ) {
    return {
      screen: 'payment-create',
      ...(copyParams(czech.params) ? { params: copyParams(czech.params) } : {}),
    };
  }
  return directScreens[czech.screen as NativeDemoRoute['screen']]
    ? {
        screen: czech.screen as NativeDemoRoute['screen'],
        ...(copyParams(czech.params) ? { params: copyParams(czech.params) } : {}),
      }
    : null;
}

/** Route-local payment steps are sidecar intents, not new NativeDemo routes. */
export function nativePaymentIntentFromCzechRoute(
  route: CzechNativeRoute,
): NativePaymentIntent | null {
  if (route.screen === 'payment-review') return { type: 'review' };
  if (route.screen === 'payment-sign') return { type: 'sign' };
  if (route.screen === 'payment-success') return { type: 'success' };
  return null;
}
