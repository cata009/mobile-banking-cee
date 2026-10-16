import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  BackHandler,
  Keyboard,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import type {
  CountryId,
  ProductCounts,
  ReleaseId,
  Scenario,
  BankingScenarioId,
} from '@/app/state/demoTypes';
import {
  getAvailableLanguages,
  type AppLanguage,
} from '@/app/registry/languageByCountry';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';
import {
  SearchField,
  NavigationRow,
  ModalPanel,
} from '../../../universal/controls';
import { Text } from '../../../universal/Typography';
import { SourceCustomIcon } from '../../../universal/SourceCustomIcon';
import { sourceColor } from '../../../universal/sourceColor';
import { carrySourceProductSelection } from '../../../app/sourceNavigation';
import { nativeCreditLimits } from './banking/creditLimitStore';
import { currentInvestmentPresentation } from './investments/presentation';
import {
  createCurrentTranslator,
  currentFeature,
  currentTokens,
} from './context';
import { Body, Page } from './Primitives';
import { CoappingLayer } from './coapping/adapter';
import { BaselineBottomNavigation } from '../../../universal/BaselineBottomNavigation';
import { isPiClassicCompositionContext } from './baseline/policy';
import type { NativeDemoControl } from '@/features/demo-native/contracts';
import type {
  CurrentAdapter,
  CurrentContext,
  CurrentRoute,
  CurrentScreen,
  CurrentScreenProps,
  CurrentSearchEntry,
} from './contracts';

const normalize = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim();
const defaultPrimary = [
  { screen: 'home', key: 'home', icon: 'nav-home' },
  { screen: 'pfm', key: 'analytics', icon: 'nav-analytics' },
  { screen: 'payments', key: 'payments', icon: 'nav-payments' },
  { screen: 'products', key: 'products', icon: 'nav-products' },
  { screen: 'profile', key: 'more', icon: 'nav-more' },
] as const;
function stored(key: string, fallback: string) {
  try {
    return globalThis.localStorage?.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: string) {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    /* In-memory state remains usable. */
  }
}
export function composeCurrent(adapters: readonly CurrentAdapter[]) {
  const screens: CurrentAdapter['screens'] = {};
  const owners = new Set<string>();
  for (const adapter of adapters) {
    if (owners.has(adapter.id))
      throw new Error(`Duplicate native adapter ${adapter.id}`);
    owners.add(adapter.id);
    for (const [screen, component] of Object.entries(adapter.screens)) {
      if (screens[screen as CurrentScreen])
        throw new Error(`Duplicate native screen ${screen}`);
      screens[screen as CurrentScreen] = component;
    }
  }
  return {
    screens,
    searchEntries(context: CurrentContext) {
      const seen = new Set<string>();
      const result: CurrentSearchEntry[] = [];
      for (const adapter of adapters)
        for (const entry of adapter.searchEntries?.(context) ?? []) {
          if (!screens[entry.target.screen] || seen.has(entry.id)) continue;
          seen.add(entry.id);
          result.push(entry);
        }
      return result;
    },
  };
}
export default function NativeCurrentApp({
  country,
  release,
  scenario = 'active',
  adapters,
  onExit,
  onActivated,
  screenTopInset = 0,
  bottomInset = 0,
  initialRoute,
  initialLanguage,
  initialMode,
  productCounts = DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
  initialAmountsHidden = false,
  bankingScenario = 'retail-single-account',
  control,
}: {
  country: CountryId;
  release: ReleaseId;
  scenario?: Scenario;
  adapters: readonly CurrentAdapter[];
  onExit?: () => void;
  onActivated?: () => void;
  screenTopInset?: number;
  bottomInset?: number;
  initialRoute?: CurrentRoute;
  initialLanguage?: AppLanguage;
  initialMode?: 'light' | 'dark' | 'system';
  productCounts?: ProductCounts;
  initialAmountsHidden?: boolean;
  bankingScenario?: BankingScenarioId;
  control?: NativeDemoControl;
}) {
  const composition = useMemo(() => composeCurrent(adapters), [adapters]);
  const [stack, setStack] = useState<CurrentRoute[]>(() => [
    control?.route ??
      initialRoute ?? { screen: scenario === 'inactive' ? 'prelogin' : 'home' },
  ]);
  const [hidden, hide] = useState(initialAmountsHidden);
  const [effectiveScenario, setEffectiveScenario] = useState(scenario);
  const investmentPresentation = useMemo(
    () =>
      currentInvestmentPresentation(
        {
          country,
          release,
          scenario: effectiveScenario,
          activeFeatures: control?.activeFeatures,
        },
        control?.investmentPresentation,
      ),
    [
      country,
      release,
      effectiveScenario,
      control?.activeFeatures,
      control?.investmentPresentation,
    ],
  );
  const primary = currentFeature(
    {
      country,
      release,
      scenario: effectiveScenario,
      activeFeatures: control?.activeFeatures,
    },
    'fx_rsMyBanker',
  )
    ? [
        defaultPrimary[0],
        {
          screen: 'investments' as const,
          key: 'runtime.myBanker.nav.investments',
          icon: 'investment-trend-up',
        },
        ...defaultPrimary.slice(2),
      ]
    : defaultPrimary;
  const [query, setQuery] = useState('');
  const [missing, setMissing] = useState<CurrentRoute | null>(null);
  const [language, setLanguage] = useState<AppLanguage>(() => {
    const value =
      initialLanguage ??
      (stored(`native-pi-${country}-language`, 'en') as AppLanguage);
    return getAvailableLanguages(country).includes(value) ? value : 'en';
  });
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>(() => {
    const value = initialMode ?? stored(`native-pi-${country}-mode`, 'light');
    return value === 'dark' || value === 'system' ? value : 'light';
  });
  const system = useColorScheme();
  const tokens = currentTokens(
    mode === 'dark' || (mode === 'system' && system === 'dark'),
  );
  const [, refresh] = useState(0);
  const current = stack[stack.length - 1];
  const controlRef = useRef(control);
  controlRef.current = control;
  const localCreditLimits = useSyncExternalStore(
    nativeCreditLimits.subscribe,
    () => nativeCreditLimits.read({ country, bankingScenario }),
  );
  useLayoutEffect(() => {
    if (current.screen !== 'investments') return;
    // Source clears the coordinator selection when the portfolio route exits.
    // Route-level cleanup cannot use a retired screen's guarded callbacks.
    return () =>
      controlRef.current?.events.onInvestmentSecuritySelected?.(null);
  }, [current]);
  const requestedRoute = control ? JSON.stringify(control.route) : undefined;
  useLayoutEffect(() => {
    const desired = controlRef.current;
    if (!desired) return;
    if (getAvailableLanguages(country).includes(desired.language))
      setLanguage(desired.language);
    setMode(desired.mode);
    hide(desired.amountsHidden);
    setStack(old => {
      if (JSON.stringify(old[old.length - 1]) === requestedRoute) return old;
      const existing = old.findIndex(
        route => JSON.stringify(route) === requestedRoute,
      );
      return existing >= 0
        ? old.slice(0, existing + 1)
        : [...old, desired.route];
    });
    // Only primitive host values trigger synchronization; events are read through controlRef.
  }, [
    country,
    requestedRoute,
    control?.language,
    control?.mode,
    control?.amountsHidden,
  ]);
  const [suppressedPrimary, suppressPrimary] = useState<CurrentRoute | null>(
    null,
  );
  const activeRoute = useRef(current);
  activeRoute.current = current;
  const backActivation = useRef({ route: current, token: 0 });
  if (backActivation.current.route !== current) {
    backActivation.current = {
      route: current,
      token: backActivation.current.token + 1,
    };
  }
  const localBack = useRef<{
    route: CurrentRoute;
    activation: number;
    handler: () => boolean;
  } | null>(null);
  const onBack = useCallback(() => {
    Keyboard.dismiss();
    if (missing) setMissing(null);
    else if (
      localBack.current?.route === current &&
      localBack.current.activation === backActivation.current.token &&
      localBack.current.handler()
    )
      return;
    else if (stack.length > 1) {
      setStack(old => old.slice(0, -1));
      controlRef.current?.events.onRouteChange(stack[stack.length - 2], 'back');
    } else onExit?.();
  }, [missing, current, stack, onExit]);
  const back = useRef(onBack);
  back.current = onBack;
  const registerExternalBack = control?.registerBack;
  useLayoutEffect(() => {
    registerExternalBack?.(() => back.current());
    return () => registerExternalBack?.(null);
  }, [registerExternalBack]);
  useLayoutEffect(() => {
    if (Platform.OS === 'web') return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      back.current();
      return true;
    });
    return () => listener.remove();
  }, []);
  const navigate = (route: CurrentRoute) => {
    Keyboard.dismiss();
    const routeChanged = JSON.stringify(current) !== JSON.stringify(route);
    if (
      routeChanged &&
      controlRef.current?.events.onRouteChange(route, 'push') === true
    )
      return;
    if (
      current.screen === 'login' &&
      route.screen === 'home' &&
      effectiveScenario === 'inactive'
    ) {
      setEffectiveScenario('active');
      if (onActivated) {
        onActivated();
        return;
      }
    }
    if (route.screen !== 'search' && !composition.screens[route.screen]) {
      setMissing(route);
      return;
    }
    setStack(old => {
      if (
        primary.some(item => item.screen === route.screen) &&
        primary.some(item => item.screen === old[old.length - 1].screen)
      ) {
        const index = old.findIndex(
          item => item.screen === route.screen && !item.params,
        );
        if (index >= 0)
          return [...old.slice(0, index), ...old.slice(index + 1), old[index]];
      }
      if (
        old[old.length - 1].screen === route.screen &&
        JSON.stringify(old[old.length - 1].params) ===
          JSON.stringify(route.params)
      )
        return old;
      // Source's common baseline carousel does not replace the parent route.
      // Details carry the selected product; Back restores the original entry.
      const previous = isPiClassicCompositionContext({
        country,
        release,
        scenario: effectiveScenario,
      })
        ? old[old.length - 1]
        : carrySourceProductSelection(old[old.length - 1], route);
      return [...old.slice(0, -1), previous, route];
    });
  };
  const host: CurrentScreenProps = {
    creditLimitOffer: control?.creditLimitOffer,
    creditLimitOverrides: control?.creditLimitOverrides ?? localCreditLimits,
    investmentHistoryOverrides: control?.investmentHistoryOverrides,
    investmentPresentation,
    bankingPresentation: control?.bankingPresentation,
    productsPreview: control?.productsPreview,
    componentPreview: control?.componentPreview,
    productsShelfFocusRequest: control?.productsShelfFocusRequest,
    productDetailPresentation: control?.productDetailPresentation,
    onProductsPreviewAction: control?.events.onProductsPreviewAction
      ? action => controlRef.current?.events.onProductsPreviewAction?.(action)
      : undefined,
    onProductsShelfFocusHandled: control?.events.onProductsShelfFocusHandled
      ? () => controlRef.current?.events.onProductsShelfFocusHandled?.()
      : undefined,
    onProductsShelfHeroCollapsedChange: control?.events
      .onProductsShelfHeroCollapsedChange
      ? collapsed =>
          controlRef.current?.events.onProductsShelfHeroCollapsedChange?.(
            collapsed,
          )
      : undefined,
    onProductDetailAction: control?.events.onProductDetailAction
      ? () => controlRef.current?.events.onProductDetailAction?.()
      : undefined,
    onActiveCardChange: control?.events.onActiveCardChange
      ? productId => controlRef.current?.events.onActiveCardChange?.(productId)
      : undefined,
    onShowCardDetailsRequest: control?.events.onShowCardDetailsRequest
      ? productId =>
          controlRef.current?.events.onShowCardDetailsRequest?.(productId)
      : undefined,
    onShowCardDetails: control?.events.onShowCardDetails
      ? productId => controlRef.current?.events.onShowCardDetails?.(productId)
      : undefined,
    onAiOpportunityClick: control?.events.onAiOpportunityClick
      ? () => controlRef.current?.events.onAiOpportunityClick?.()
      : undefined,
    onHelpRequest: control?.events.onHelpRequest
      ? () => controlRef.current?.events.onHelpRequest?.()
      : undefined,
    onInvestmentHistoryTabChange: control?.events.onInvestmentHistoryTabChange
      ? tab => controlRef.current?.events.onInvestmentHistoryTabChange?.(tab)
      : undefined,
    onInvestmentHistoryToApprove: control?.events.onInvestmentHistoryToApprove
      ? () => controlRef.current?.events.onInvestmentHistoryToApprove?.()
      : undefined,
    onCreditLimitOfferCancel: control?.events.onCreditLimitOfferCancel
      ? () => controlRef.current?.events.onCreditLimitOfferCancel?.()
      : undefined,
    onCreditLimitOfferComplete: (cardId, limit) => {
      if (controlRef.current?.events.onCreditLimitOfferComplete)
        controlRef.current.events.onCreditLimitOfferComplete(cardId, limit);
      else
        nativeCreditLimits.record({ country, bankingScenario }, cardId, limit);
    },
    activeFeatures: control?.activeFeatures,
    coAppingContext: control?.coAppingContext,
    futureGainSimulatorResumeState: control?.futureGainSimulatorResumeState,
    onFutureGainInvestmentFunds: control?.events.onFutureGainInvestmentFunds
      ? resume =>
          controlRef.current?.events.onFutureGainInvestmentFunds?.(resume)
      : undefined,
    onSmartInvestmentBack: control?.events.onSmartInvestmentBack
      ? () => controlRef.current?.events.onSmartInvestmentBack?.()
      : undefined,
    onRoboResumeStateChange: control?.events.onRoboResumeStateChange
      ? resume => controlRef.current?.events.onRoboResumeStateChange?.(resume)
      : undefined,
    onTransactionCategoryChange: control?.events.onTransactionCategoryChange
      ? (transaction, selection) =>
          controlRef.current?.events.onTransactionCategoryChange?.(
            transaction,
            selection,
          )
      : undefined,
    investmentRequests: control?.investmentRequests,
    transactionSelection: control?.transactionSelection,
    transactionPresentation: control?.transactionPresentation,
    paymentFlow: control?.paymentFlow,
    onContinueCoapping: control?.events.onContinueCoapping
      ? () => controlRef.current?.events.onContinueCoapping?.()
      : undefined,
    onCoAppingChatAction: control?.events.onCoAppingChatAction
      ? action => controlRef.current?.events.onCoAppingChatAction?.(action)
      : undefined,
    onCoAppingChatRequest: control?.events.onCoAppingChatRequest
      ? request => controlRef.current?.events.onCoAppingChatRequest?.(request)
      : undefined,
    onCoAppingChatOpenChange: control?.events.onCoAppingChatOpenChange
      ? open => controlRef.current?.events.onCoAppingChatOpenChange?.(open)
      : undefined,
    onCoAppingSessionEnd: control?.events.onCoAppingSessionEnd
      ? () => controlRef.current?.events.onCoAppingSessionEnd?.()
      : undefined,
    onResolveCoAppingReply: control?.events.onResolveCoAppingReply
      ? (input, history) =>
          controlRef.current?.events.onResolveCoAppingReply?.(input, history) ??
          ''
      : undefined,
    onTransactionSelected: control?.events.onTransactionSelected
      ? selection =>
          controlRef.current?.events.onTransactionSelected?.(selection)
      : undefined,
    onAddTransaction: control?.events.onAddTransaction
      ? () => controlRef.current?.events.onAddTransaction?.()
      : undefined,
    onAnalyticsPeriodChange: control?.events.onAnalyticsPeriodChange
      ? periodKey =>
          controlRef.current?.events.onAnalyticsPeriodChange?.(periodKey)
      : undefined,
    onPaymentFlowChange: control?.events.onPaymentFlowChange
      ? flow => controlRef.current?.events.onPaymentFlowChange?.(flow)
      : undefined,
    onInternalTransferEvent: control?.events.onInternalTransferEvent
      ? event => controlRef.current?.events.onInternalTransferEvent?.(event)
      : undefined,
    onInvestmentBuyRequestConsumed: requestId =>
      controlRef.current?.events.onInvestmentBuyRequestConsumed?.(requestId),
    onInvestmentSecuritySelected: security =>
      controlRef.current?.events.onInvestmentSecuritySelected?.(security),
    onInvestmentReturnToSimulator: state =>
      controlRef.current?.events.onInvestmentReturnToSimulator?.(state),
    bankingScenario,
    country,
    release,
    scenario: effectiveScenario,
    productCounts,
    language,
    route: current,
    tokens,
    t: useMemo(
      () => createCurrentTranslator(country, language),
      [country, language],
    ),
    amountsHidden: hidden,
    screenTopInset,
    isActive: true,
    onBack,
    onNavigate: navigate,
    onProfile: () => navigate({ screen: 'profile' }),
    onSearch: () => {
      setQuery('');
      navigate({ screen: 'search' });
    },
    onAmountsToggle: () => {
      hide(!hidden);
      controlRef.current?.events.onAmountsHiddenChange(!hidden);
    },
    onChanged: () => refresh(value => value + 1),
    onLanguageChange: value => {
      if (!getAvailableLanguages(country).includes(value)) return;
      setLanguage(value);
      save(`native-pi-${country}-language`, value);
      controlRef.current?.events.onLanguageChange(value);
    },
    mode,
    onModeChange: value => {
      setMode(value);
      save(`native-pi-${country}-mode`, value);
      controlRef.current?.events.onModeChange(value);
    },
  };
  const entries = composition.searchEntries(host);
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const results = entries.filter(entry =>
    terms.every(term =>
      normalize(
        [entry.label, entry.subtitle, ...entry.keywords].join(' '),
      ).includes(term),
    ),
  );
  const ids = useRef({ map: new WeakMap<CurrentRoute, number>(), next: 0 });
  const isFullscreenComponentPreview =
    control?.componentPreview?.kind === 'internal-transfer';
  const isComponentPreview = !!(
    control?.productsPreview || control?.componentPreview
  );
  const primaryVisible =
    !isComponentPreview &&
    suppressedPrimary !== current &&
    effectiveScenario === 'active' &&
    primary.some(item => item.screen === current.screen);
  return (
    <View
      style={
        isComponentPreview && !isFullscreenComponentPreview
          ? s.preview
          : [s.page, { backgroundColor: tokens.background }]
      }
    >
      {!isComponentPreview && (
        <StatusBar
          barStyle={
            tokens.text === '#262626' ? 'dark-content' : 'light-content'
          }
        />
      )}
      {[current].map(route => {
        const active = route === current;
        if (!ids.current.map.has(route))
          ids.current.map.set(route, ++ids.current.next);
        const Screen = composition.screens[route.screen];
        const canAct = () => activeRoute.current === route;
        const activation = backActivation.current.token;
        const props: CurrentScreenProps = {
          ...host,
          scenario: effectiveScenario,
          route,
          isActive: active,
          onNavigate: target => {
            if (canAct()) navigate(target);
          },
          onPrimaryNavigationChange: visible => {
            if (canAct()) suppressPrimary(visible ? null : route);
          },
          onBackHandlerChange: handler => {
            if (canAct() && backActivation.current.token === activation)
              localBack.current = handler
                ? { route, activation, handler }
                : null;
          },
          onBack: () => {
            if (canAct()) onBack();
          },
          onProfile: () => {
            if (canAct()) host.onProfile();
          },
          onSearch: () => {
            if (canAct()) host.onSearch();
          },
          onAmountsToggle: () => {
            if (canAct()) host.onAmountsToggle();
          },
          onChanged: () => {
            if (canAct()) host.onChanged();
          },
          onInvestmentBuyRequestConsumed: requestId => {
            if (canAct()) host.onInvestmentBuyRequestConsumed?.(requestId);
          },
          onInvestmentSecuritySelected: security => {
            if (canAct()) host.onInvestmentSecuritySelected?.(security);
          },
          onInvestmentReturnToSimulator: state => {
            if (canAct()) host.onInvestmentReturnToSimulator?.(state);
          },
          onTransactionSelected: host.onTransactionSelected
            ? selection => {
                if (canAct()) host.onTransactionSelected?.(selection);
              }
            : undefined,
          onAddTransaction: host.onAddTransaction
            ? () => {
                if (canAct()) host.onAddTransaction?.();
              }
            : undefined,
          onAnalyticsPeriodChange: host.onAnalyticsPeriodChange
            ? periodKey => {
                if (canAct()) host.onAnalyticsPeriodChange?.(periodKey);
              }
            : undefined,
          onPaymentFlowChange: host.onPaymentFlowChange
            ? flow => {
                if (canAct()) host.onPaymentFlowChange?.(flow);
              }
            : undefined,
          onInternalTransferEvent: host.onInternalTransferEvent
            ? event => {
                if (canAct()) host.onInternalTransferEvent?.(event);
              }
            : undefined,
          onContinueCoapping: host.onContinueCoapping
            ? () => {
                if (canAct()) host.onContinueCoapping?.();
              }
            : undefined,
          onCoAppingChatAction: host.onCoAppingChatAction
            ? action => {
                if (canAct()) host.onCoAppingChatAction?.(action);
              }
            : undefined,
          onCoAppingChatRequest: host.onCoAppingChatRequest
            ? request => {
                if (canAct()) host.onCoAppingChatRequest?.(request);
              }
            : undefined,
          onCoAppingChatOpenChange: host.onCoAppingChatOpenChange
            ? open => {
                if (canAct()) host.onCoAppingChatOpenChange?.(open);
              }
            : undefined,
          onCoAppingSessionEnd: host.onCoAppingSessionEnd
            ? () => {
                if (canAct()) host.onCoAppingSessionEnd?.();
              }
            : undefined,
          onResolveCoAppingReply: host.onResolveCoAppingReply
            ? (input, history) =>
                canAct()
                  ? (host.onResolveCoAppingReply?.(input, history) ?? '')
                  : ''
            : undefined,
          onFutureGainInvestmentFunds: host.onFutureGainInvestmentFunds
            ? resume => {
                if (canAct()) host.onFutureGainInvestmentFunds?.(resume);
              }
            : undefined,
          onSmartInvestmentBack: host.onSmartInvestmentBack
            ? () => {
                if (canAct()) host.onSmartInvestmentBack?.();
              }
            : undefined,
          onRoboResumeStateChange: host.onRoboResumeStateChange
            ? resume => {
                if (canAct()) host.onRoboResumeStateChange?.(resume);
              }
            : undefined,
          onTransactionCategoryChange: host.onTransactionCategoryChange
            ? (transaction, selection) => {
                if (canAct())
                  host.onTransactionCategoryChange?.(transaction, selection);
              }
            : undefined,
          onCreditLimitOfferCancel: host.onCreditLimitOfferCancel
            ? () => {
                if (canAct()) host.onCreditLimitOfferCancel?.();
              }
            : undefined,
          onCreditLimitOfferComplete: (cardId, limit) => {
            if (canAct()) host.onCreditLimitOfferComplete?.(cardId, limit);
          },
          onInvestmentHistoryTabChange: host.onInvestmentHistoryTabChange
            ? tab => {
                if (canAct()) host.onInvestmentHistoryTabChange?.(tab);
              }
            : undefined,
          onInvestmentHistoryToApprove: host.onInvestmentHistoryToApprove
            ? () => {
                if (canAct()) host.onInvestmentHistoryToApprove?.();
              }
            : undefined,
          onActiveCardChange: host.onActiveCardChange
            ? id => {
                if (canAct()) host.onActiveCardChange?.(id);
              }
            : undefined,
          onShowCardDetailsRequest: host.onShowCardDetailsRequest
            ? id => {
                if (canAct()) host.onShowCardDetailsRequest?.(id);
              }
            : undefined,
          onShowCardDetails: host.onShowCardDetails
            ? id => {
                if (canAct()) host.onShowCardDetails?.(id);
              }
            : undefined,
          onAiOpportunityClick: host.onAiOpportunityClick
            ? () => {
                if (canAct()) host.onAiOpportunityClick?.();
              }
            : undefined,
          onHelpRequest: host.onHelpRequest
            ? () => {
                if (canAct()) host.onHelpRequest?.();
              }
            : undefined,
          onProductsPreviewAction: host.onProductsPreviewAction
            ? action => {
                if (canAct()) host.onProductsPreviewAction?.(action);
              }
            : undefined,
          onProductsShelfFocusHandled: host.onProductsShelfFocusHandled
            ? () => {
                if (canAct()) host.onProductsShelfFocusHandled?.();
              }
            : undefined,
          onProductsShelfHeroCollapsedChange:
            host.onProductsShelfHeroCollapsedChange
              ? collapsed => {
                  if (canAct())
                    host.onProductsShelfHeroCollapsedChange?.(collapsed);
                }
              : undefined,
          onProductDetailAction: host.onProductDetailAction
            ? () => {
                if (canAct()) host.onProductDetailAction?.();
              }
            : undefined,
          onLanguageChange: value => {
            if (canAct()) host.onLanguageChange(value);
          },
          onModeChange: value => {
            if (canAct()) host.onModeChange(value);
          },
        };
        return (
          <View
            key={ids.current.map.get(route)}
            pointerEvents={active ? 'auto' : 'none'}
            aria-hidden={!active}
            accessibilityElementsHidden={!active}
            importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}
            style={[
              isComponentPreview && !isFullscreenComponentPreview
                ? s.preview
                : s.layer,
              !active && s.inactive,
            ]}
          >
            {route.screen === 'search' ? (
              <Page host={props} title="Search">
                <SearchField
                  tokens={tokens}
                  label="Search all sections"
                  placeholder="Search accounts, cards, payments and products"
                  value={query}
                  onChange={setQuery}
                  onClear={() => setQuery('')}
                  onSubmit={Keyboard.dismiss}
                  autoFocus
                  icon={
                    <SourceCustomIcon
                      name="search"
                      size={24}
                      color={tokens.text}
                    />
                  }
                />
                {results.length ? (
                  results.map(entry => (
                    <NavigationRow
                      key={entry.id}
                      tokens={tokens}
                      title={entry.label}
                      subtitle={entry.subtitle}
                      payload={entry.target}
                      onSelect={navigate}
                      trailing={
                        <SourceCustomIcon
                          name="chevron-right"
                          color={tokens.text}
                          size={16}
                        />
                      }
                    />
                  ))
                ) : (
                  <Body host={props}>No results. Try another word.</Body>
                )}
              </Page>
            ) : Screen ? (
              <Screen {...props} />
            ) : (
              <Page host={props} title="Demo">
                <Body host={props}>This screen is not migrated.</Body>
              </Page>
            )}
          </View>
        );
      })}
      {primaryVisible &&
      control?.primaryNavigationVisible !== false &&
      isPiClassicCompositionContext(host) ? (
        <View
          style={[
            s.baselineDock,
            {
              backgroundColor: sourceColor(
                'var(--uc-bottom-bar-bg)',
                tokens.background === '#121212',
              ),
              borderTopColor: sourceColor(
                'var(--uc-border-muted)',
                tokens.background === '#121212',
              ),
              paddingBottom: bottomInset,
            },
          ]}
        >
          <BaselineBottomNavigation
            activeTab={
              current.screen === 'pfm'
                ? 'analytics'
                : current.screen === 'profile'
                  ? 'more'
                  : current.screen === 'payments'
                    ? 'payments'
                    : current.screen === 'products'
                      ? 'products'
                      : 'home'
            }
            labels={{
              home: host.t('navigation.home'),
              analytics: host.t('navigation.analytics'),
              payments: host.t('navigation.payments'),
              products: host.t('navigation.products'),
              more: host.t('navigation.more'),
            }}
            dark={tokens.background === '#121212'}
            onTabChange={tab =>
              navigate({
                screen:
                  tab === 'analytics'
                    ? 'pfm'
                    : tab === 'more'
                      ? 'profile'
                      : tab === 'investments'
                        ? 'investments'
                        : tab,
              })
            }
          />
        </View>
      ) : (
        primaryVisible &&
        control?.primaryNavigationVisible !== false && (
          <View
            style={[
              s.dock,
              {
                backgroundColor: sourceColor(
                  'var(--uc-bottom-bar-bg)',
                  tokens.background === '#121212',
                ),
                borderTopColor: sourceColor(
                  'var(--uc-border-muted)',
                  tokens.background === '#121212',
                ),
                paddingBottom: bottomInset,
              },
            ]}
            accessibilityRole="tablist"
          >
            {primary.map(item => (
              <Pressable
                key={item.screen}
                accessibilityRole="tab"
                accessibilityLabel={host.t(
                  item.key.startsWith('runtime.')
                    ? item.key
                    : `navigation.${item.key}`,
                )}
                accessibilityState={{
                  selected: item.screen === current.screen,
                }}
                onPress={() => navigate({ screen: item.screen })}
                style={s.tab}
              >
                <View
                  style={[
                    s.selectionLine,
                    item.screen === current.screen && {
                      backgroundColor: tokens.accent,
                    },
                  ]}
                />
                <View style={s.navIcon}>
                  <SourceCustomIcon
                    name={item.icon}
                    size={20}
                    color={
                      item.screen === current.screen
                        ? tokens.accent
                        : tokens.muted
                    }
                  />
                </View>
                <Text
                  numberOfLines={1}
                  style={[
                    s.navLabel,
                    {
                      color:
                        item.screen === current.screen
                          ? tokens.accent
                          : tokens.muted,
                      fontFamily: tokens.font,
                    },
                  ]}
                >
                  {host.t(
                    item.key.startsWith('runtime.')
                      ? item.key
                      : `navigation.${item.key}`,
                  )}
                </Text>
              </Pressable>
            ))}
          </View>
        )
      )}
      {missing && (
        <ModalPanel
          tokens={tokens}
          visible
          title="Not available"
          onClose={() => setMissing(null)}
        >
          <Body host={host}>
            This Source section has not been migrated yet.
          </Body>
        </ModalPanel>
      )}
      {!isComponentPreview && (
        <CoappingLayer host={{ ...host, scenario: effectiveScenario }} />
      )}
    </View>
  );
}
const s = StyleSheet.create({
  preview: { width: '100%', flexShrink: 0 },
  baselineDock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  navLabel: { fontSize: 14, lineHeight: 15 },
  selectionLine: {
    width: 24,
    height: 2,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  navIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  page: { flex: 1 },
  layer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  inactive: { opacity: 0 },
  dock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
  },
  tab: {
    flex: 1,
    height: 54,
    paddingBottom: 5,
    gap: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});
