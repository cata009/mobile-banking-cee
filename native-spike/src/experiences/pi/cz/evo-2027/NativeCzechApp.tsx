import React, {
  useCallback,
  useEffect,
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
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '../../../../universal/Typography';
import { SearchField } from '../../../../universal/SearchField';
import { ActionButton } from '../../../../universal/ActionButton';
import { NavigationRow } from '../../../../universal/NavigationRow';
import { OverlayHost } from '../../../../universal/ModalPortal';
import {
  DuoLocalViewportProvider,
  useDuoPreview,
} from '../../../../universal/DuoPreview';
import { ModalPanel } from '../../../../universal/ModalPanel';
import { nativeModalVisibility } from '../../../../platform/nativeModalVisibility';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import {
  EvoDuoNavigationProvider,
  EvoDuoNavigationScope,
  useEvoDuoBackAction,
} from '../../../../universal/EvoDuoNavigation';
import { selectorTokens as tokens } from '../../../../app/selectorTokens';
import { carrySourceProductSelection } from '../../../../app/sourceNavigation';
import {
  backCzech,
  composeCzechAdapters,
  createCzechRoute,
  navigateCzech,
  searchCzechEntries,
  type CzechNavigation,
} from '../../../../app/czechNavigation';
import { CZECH_NATIVE_ADAPTERS } from '../../../../app/czechAdapters';
import CzechPrimaryNavigation, {
  isCzechPrimaryScreen,
} from '../../../../app/CzechPrimaryNavigation';
import { czechBankingHost } from '../../current/banking/czechHost';
import { CoappingLayer } from '../../current/coapping/adapter';
import { currentInvestmentPresentation } from '../../current/investments/presentation';
import {
  type CzechNativeAdapter,
  type CzechNativeRoute,
  type CzechNativeScreenProps,
} from './contracts';
import type {
  NativeDemoControl,
  NativeDemoRoute,
} from '@/features/demo-native/contracts';
import type { NativePaymentFlow } from '@/features/demo-native/paymentIntents';
import { reduceNativePaymentIntent } from '@/features/demo-native/paymentIntents';
import type { BankingScenarioId, ProductCounts } from '@/app/state/demoTypes';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';
import {
  czechRouteFromNativeDemoRoute,
  nativeDemoRouteFromCzechRoute,
  nativePaymentIntentFromCzechRoute,
} from './controlledRoutes';

function stored(key: string, fallback: string): string {
  try {
    return globalThis.localStorage?.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
function AdaptiveBackButton({
  onBack,
  label,
}: {
  onBack: () => void;
  label: string;
}) {
  const inRail = useEvoDuoBackAction(onBack);
  return inRail ? null : (
    <ActionButton tokens={tokens} label={label} secondary onPress={onBack} />
  );
}
function persist(key: string, value: string) {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    /* Session state remains usable when storage is unavailable. */
  }
}

interface RememberedSourceSelection {
  accountId?: string;
  cardId?: string;
  transactionId?: string;
}

function rememberSourceRoute(
  remembered: RememberedSourceSelection,
  sourceRoute: NativeDemoRoute | null,
) {
  if (!sourceRoute) return;
  const params = sourceRoute.params ?? {};
  if (params.accountId) remembered.accountId = params.accountId;
  else if (
    ['account', 'account-info', 'account-options'].includes(
      sourceRoute.screen,
    ) ||
    (sourceRoute.screen === 'transaction' && params.source !== 'card')
  ) {
    if (params.productId) remembered.accountId = params.productId;
  }
  if (params.cardId) remembered.cardId = params.cardId;
  else if (
    ['card', 'card-info', 'card-options'].includes(sourceRoute.screen) ||
    (sourceRoute.screen === 'transaction' && params.source === 'card')
  ) {
    if (params.productId) remembered.cardId = params.productId;
  }
  if (sourceRoute.screen === 'transaction' && params.transactionId)
    remembered.transactionId = params.transactionId;
}

function rememberSourceTransaction(
  remembered: RememberedSourceSelection,
  selection: NativeDemoControl['transactionSelection'],
) {
  if (!selection) return;
  remembered.transactionId = selection.transaction.id;
  if (selection.source === 'account')
    remembered.accountId = selection.productId;
  else remembered.cardId = selection.productId;
}

function activeSourceAccountId(sourceRoute: NativeDemoRoute | null) {
  if (!sourceRoute) return undefined;
  const params = sourceRoute.params ?? {};
  if (params.accountId) return params.accountId;
  if (
    ['account', 'account-info', 'account-options'].includes(
      sourceRoute.screen,
    ) ||
    (sourceRoute.screen === 'transaction' && params.source !== 'card')
  )
    return params.productId;
  return undefined;
}

function canonicalPaymentEntryTarget(
  target: CzechNativeRoute,
  sourceRoute: NativeDemoRoute | null,
  rememberedAccountId?: string,
): CzechNativeRoute {
  if (target.screen !== 'payment-create') return target;
  const params = { ...target.params };
  // Redo payment carries the selected transaction and its payer as a canonical entry.
  if (params.transactionId || params.entry === 'redo') return target;
  const payerId = activeSourceAccountId(sourceRoute) ?? rememberedAccountId;
  if (payerId) {
    params.productId = payerId;
    params.accountId = payerId;
  } else {
    // A product tile is a local card selection, not the Source coordinator's payer.
    delete params.productId;
    delete params.accountId;
  }
  return Object.keys(params).length
    ? { screen: 'payment-create', params }
    : { screen: 'payment-create' };
}

export interface NativeCzechAppProps {
  scenario?: CzechNativeScreenProps['scenario'];
  adapters?: readonly CzechNativeAdapter[];
  onExit?: () => void;
  screenTopInset?: number;
  bottomInset?: number;
  searchRequest?: number;
  initialRoute?: CzechNativeRoute;
  initialLanguage?: 'en' | 'cs';
  initialMode?: 'light' | 'dark' | 'system';
  initialHomeTheme?: string;
  productCounts?: ProductCounts;
  initialAmountsHidden?: boolean;
  bankingScenario?: BankingScenarioId;
  /** Optional Source host control; omitted for standalone Native/Android use. */
  control?: NativeDemoControl;
}
export default function NativeCzechApp({
  scenario = 'active',
  adapters = CZECH_NATIVE_ADAPTERS,
  onExit,
  screenTopInset = 0,
  bottomInset = 0,
  searchRequest = 0,
  initialRoute,
  initialLanguage,
  initialMode,
  initialHomeTheme,
  productCounts = DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
  initialAmountsHidden = false,
  bankingScenario = 'retail-single-account',
  control,
}: NativeCzechAppProps) {
  const duo = useDuoPreview();
  const verticalNavigation = !!duo && duo.rightInset > 0;
  const modalVisible = useSyncExternalStore(
    nativeModalVisibility.subscribe,
    nativeModalVisibility.getSnapshot,
    nativeModalVisibility.getSnapshot,
  );
  const [duoBackAction, setDuoBackAction] = useState<(() => void) | null>(null);
  const [duoCloseAction, setDuoCloseAction] = useState<(() => void) | null>(
    null,
  );
  const onDuoActionChange = useCallback((action: (() => void) | null) => {
    setDuoBackAction(() => action);
  }, []);
  const onDuoCloseChange = useCallback((action: (() => void) | null) => {
    setDuoCloseAction(() => action);
  }, []);
  const duoContent = duo
    ? { width: duo.width - duo.rightInset, height: duo.height, left: 0, top: 0 }
    : undefined;
  const composition = useMemo(() => composeCzechAdapters(adapters), [adapters]);
  const [navigation, setNavigation] = useState<CzechNavigation>(() => ({
    current: createCzechRoute(
      initialRoute ?? {
        screen: scenario === 'inactive' ? 'prelogin' : 'home',
      },
    ),
    backStack: [],
  }));
  const rememberedSourceSelection = useRef<RememberedSourceSelection>({});
  const [amountsHidden, hideAmounts] = useState(initialAmountsHidden);
  const [suppressedPrimary, suppressPrimary] =
    useState<CzechNativeRoute | null>(null);
  const controlledRouteKey = control
    ? JSON.stringify({
        route: control.route,
        paymentStep: control.paymentFlow?.step ?? null,
      })
    : null;
  const controlledRoute = useMemo(() => {
    if (!controlledRouteKey) return null;
    const source = JSON.parse(controlledRouteKey) as {
      route: NativeDemoRoute;
      paymentStep?: NativePaymentFlow['step'] | null;
    };
    return czechRouteFromNativeDemoRoute(source.route, source.paymentStep);
  }, [controlledRouteKey]);
  const currentRoute = control ? controlledRoute : navigation.current;
  const routeForProps = currentRoute ?? navigation.current;
  const sourceRouteForSelection =
    control?.route ??
    (currentRoute ? nativeDemoRouteFromCzechRoute(currentRoute) : null);
  rememberSourceRoute(
    rememberedSourceSelection.current,
    sourceRouteForSelection,
  );
  rememberSourceTransaction(
    rememberedSourceSelection.current,
    control?.transactionSelection,
  );
  const activeRoute = useRef<CzechNativeRoute | null>(currentRoute);
  activeRoute.current = currentRoute;
  const pageBackHandler = useRef<{
    route: CzechNativeRoute;
    handler: () => boolean;
  } | null>(null);
  const [query, setQuery] = useState('');
  const [unavailable, setUnavailable] = useState<CzechNativeRoute | null>(null);
  const [language, setLanguage] = useState<'en' | 'cs'>(
    () =>
      initialLanguage ??
      (stored('native-cz-language-v1', 'en') === 'cs' ? 'cs' : 'en'),
  );
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>(() => {
    if (initialMode) return initialMode;
    const saved = stored('app-2027-appearance-mode', 'light');
    return saved === 'dark' || saved === 'system' ? saved : 'light';
  });
  const [homeTheme, setHomeTheme] = useState(
    () => initialHomeTheme ?? stored('app-2027-home-theme', 'standard'),
  );
  const routeIds = useRef({
    map: new WeakMap<CzechNativeRoute, number>(),
    sequence: 0,
  });
  const [, refresh] = useState(0);
  const onBack = useCallback(() => {
    Keyboard.dismiss();
    if (unavailable) setUnavailable(null);
    else if (control) {
      const flowScreens = [
        'payment-create',
        'payment-review',
        'payment-sign',
        'payment-success',
      ] as const;
      if (
        currentRoute &&
        flowScreens.includes(
          currentRoute.screen as (typeof flowScreens)[number],
        ) &&
        control.paymentFlow
      ) {
        const nextFlow = reduceNativePaymentIntent(control.paymentFlow, {
          type: 'back',
        });
        if (nextFlow !== control.paymentFlow) {
          control.events.onPaymentFlowChange?.(nextFlow);
          if (nextFlow) return;
        }
      }
      control.events.onRouteChange(control.route, 'back');
    } else if (!navigation.backStack.length) onExit?.();
    else setNavigation(backCzech);
  }, [control, currentRoute, navigation.backStack.length, onExit, unavailable]);
  const handleHostBack = useCallback(() => {
    const local = pageBackHandler.current;
    if (
      control &&
      currentRoute &&
      local?.route === currentRoute &&
      local.handler()
    )
      return;
    onBack();
  }, [control, currentRoute, onBack]);
  const backHandler = useRef(handleHostBack);
  backHandler.current = handleHostBack;
  // Install the shell before page passive handlers; their local Back action has priority.
  useLayoutEffect(() => {
    if (Platform.OS === 'web') return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      backHandler.current();
      return true;
    });
    return () => listener.remove();
  }, []);
  const registerBack = control?.registerBack;
  useEffect(() => {
    if (!registerBack) return;
    registerBack(handleHostBack);
    return () => registerBack(null);
  }, [registerBack, handleHostBack]);
  const onNavigate = useCallback(
    (target: CzechNativeRoute) => {
      Keyboard.dismiss();
      const routeTarget = canonicalPaymentEntryTarget(
        target,
        sourceRouteForSelection,
        rememberedSourceSelection.current.accountId,
      );
      if (
        routeTarget.screen !== 'search' &&
        !composition.screens[routeTarget.screen]
      ) {
        setUnavailable(routeTarget);
        return;
      }
      if (control) {
        const paymentIntent = nativePaymentIntentFromCzechRoute(routeTarget);
        if (paymentIntent) {
          if (!control.paymentFlow) {
            setUnavailable(routeTarget);
            return;
          }
          const nextFlow = reduceNativePaymentIntent(
            control.paymentFlow,
            paymentIntent,
          );
          if (nextFlow === control.paymentFlow) {
            setUnavailable(routeTarget);
            return;
          }
          control.events.onPaymentFlowChange?.(nextFlow);
          return;
        }
        const sourceRoute = nativeDemoRouteFromCzechRoute(routeTarget);
        if (!sourceRoute) {
          setUnavailable(routeTarget);
          return;
        }
        control.events.onRouteChange(sourceRoute, 'push');
        return;
      }
      setNavigation(previous =>
        navigateCzech(
          {
            ...previous,
            current: carrySourceProductSelection(previous.current, routeTarget),
          },
          routeTarget,
        ),
      );
    },
    [composition.screens, control, sourceRouteForSelection],
  );
  const displayLanguage: 'en' | 'cs' = control
    ? control.language === 'cs'
      ? 'cs'
      : 'en'
    : language;
  const displayMode = control?.mode ?? mode;
  const displayHomeTheme = control?.homeTheme ?? homeTheme;
  const displayAmountsHidden = control?.amountsHidden ?? amountsHidden;
  const onBackHandlerChange =
    control && currentRoute
      ? (handler: (() => boolean) | null) => {
          if (activeRoute.current !== currentRoute) return;
          if (handler) {
            pageBackHandler.current = { route: currentRoute, handler };
          } else if (pageBackHandler.current?.route === currentRoute) {
            pageBackHandler.current = null;
          }
        }
      : undefined;
  const props: CzechNativeScreenProps = {
    bankingScenario,
    route: routeForProps,
    scenario,
    productCounts,
    amountsHidden: displayAmountsHidden,
    language: displayLanguage,
    mode: displayMode,
    homeTheme: displayHomeTheme,
    onLanguageChange: value => {
      if (control) control.events.onLanguageChange(value);
      else {
        setLanguage(value);
        persist('native-cz-language-v1', value);
      }
    },
    onModeChange: value => {
      if (control) control.events.onModeChange(value);
      else {
        setMode(value);
        persist('app-2027-appearance-mode', value);
      }
    },
    onHomeThemeChange: value => {
      if (control) control.events.onHomeThemeChange?.(value);
      else {
        setHomeTheme(value);
        persist('app-2027-home-theme', value);
      }
    },
    onBack,
    onNavigate,
    onSearch: () => {
      setQuery('');
      onNavigate({ screen: 'search' });
    },
    onProfile: () => onNavigate({ screen: 'profile' }),
    onAmountsToggle: () => {
      if (control) control.events.onAmountsHiddenChange(!displayAmountsHidden);
      else hideAmounts(value => !value);
    },
    onChanged: () => refresh(value => value + 1),
    isActive: true,
    screenTopInset,
    onBackHandlerChange,
    investmentRequests: control?.investmentRequests,
    onInvestmentBuyRequestConsumed:
      control?.events.onInvestmentBuyRequestConsumed,
    onInvestmentSecuritySelected: control?.events.onInvestmentSecuritySelected,
    onInvestmentReturnToSimulator:
      control?.events.onInvestmentReturnToSimulator,
    paymentFlow: control?.paymentFlow,
    onPaymentFlowChange: control?.events.onPaymentFlowChange,
    transactionSelection: control?.transactionSelection,
    transactionPresentation: control?.transactionPresentation,
    onTransactionSelected: control?.events.onTransactionSelected,
    onAddTransaction: control?.events.onAddTransaction,
    onAnalyticsPeriodChange: control?.events.onAnalyticsPeriodChange,
    onRoboResumeStateChange: control?.events.onRoboResumeStateChange,
    onTransactionCategoryChange: control?.events.onTransactionCategoryChange,
    coAppingContext: control?.coAppingContext,
    onContinueCoapping: control?.events.onContinueCoapping,
    onCoAppingSessionEnd: control?.events.onCoAppingSessionEnd,
    investmentHistoryOverrides: control?.investmentHistoryOverrides,
    onInvestmentHistoryTabChange: control?.events.onInvestmentHistoryTabChange,
    onInvestmentHistoryToApprove: control?.events.onInvestmentHistoryToApprove,
    investmentPresentation: currentInvestmentPresentation(
      {
        country: 'CZ',
        release: 'release-future-evo-2027',
        scenario,
        activeFeatures: control?.activeFeatures,
      },
      control?.investmentPresentation,
    ),
    productsShelfFocusRequest: control?.productsShelfFocusRequest,
    productDetailPresentation: control?.productDetailPresentation,
    activeFeatures: control?.activeFeatures,
    onProductsShelfFocusHandled: control?.events.onProductsShelfFocusHandled,
    onProductsShelfHeroCollapsedChange:
      control?.events.onProductsShelfHeroCollapsedChange,
    onProductDetailAction: control?.events.onProductDetailAction,
    bankingPresentation: control?.bankingPresentation,
    onActiveCardChange: control?.events.onActiveCardChange,
    onShowCardDetailsRequest: control?.events.onShowCardDetailsRequest,
    onShowCardDetails: control?.events.onShowCardDetails,
    onAiOpportunityClick: control?.events.onAiOpportunityClick,
    onHelpRequest: control?.events.onHelpRequest,
  };
  const handledSearchRequest = useRef(searchRequest);
  useEffect(() => {
    if (handledSearchRequest.current === searchRequest) return;
    handledSearchRequest.current = searchRequest;
    setQuery('');
    setUnavailable(null);
    if (activeRoute.current?.screen !== 'search')
      onNavigate({ screen: 'search' });
  }, [searchRequest, onNavigate]);
  const search = searchCzechEntries(composition.searchEntries(props), query);
  const primaryVisible =
    !!currentRoute &&
    control?.primaryNavigationVisible !== false &&
    suppressedPrimary !== currentRoute &&
    scenario === 'active' &&
    isCzechPrimaryScreen(currentRoute.screen);
  const coAppingHostRoute = currentRoute
    ? (nativeDemoRouteFromCzechRoute(currentRoute) ?? control?.route)
    : control?.route;
  const coAppingHost = czechBankingHost(
    props,
    coAppingHostRoute ?? { screen: 'home' },
  );
  const coAppingLayerHost = {
    ...coAppingHost,
    activeFeatures: [],
    coAppingContext: control?.coAppingContext
      ? { ...control.coAppingContext, assistantAvailable: false }
      : control?.coAppingContext,
  };
  return (
    <DuoLocalViewportProvider value={duoContent}>
      <EvoDuoNavigationProvider
        enabled={verticalNavigation}
        onActionChange={onDuoActionChange}
        onCloseChange={onDuoCloseChange}
      >
        <OverlayHost>
          <View style={s.root}>
            {control && !controlledRoute ? (
              <View
                testID="native-controlled-route-unavailable"
                style={s.content}
              >
                <Text style={s.title}>CZ Evo 2027</Text>
                <Text style={s.body}>
                  Source route is not mapped to the Evo host:{' '}
                  {control.route.screen}.
                </Text>
                <Pressable
                  testID="controlled-unavailable-back"
                  accessibilityRole="button"
                  accessibilityLabel={
                    displayLanguage === 'cs' ? 'Zpět' : 'Back'
                  }
                  onPress={onBack}
                >
                  <Text style={s.body}>
                    {displayLanguage === 'cs' ? 'Zpět' : 'Back'}
                  </Text>
                </Pressable>
              </View>
            ) : currentRoute ? (
              [currentRoute].map(route => {
                if (!routeIds.current.map.has(route))
                  routeIds.current.map.set(route, ++routeIds.current.sequence);
                const active = route === currentRoute;
                function guard<T extends unknown[]>(
                  callback: (...args: T) => void,
                ) {
                  return (...args: T) => {
                    if (activeRoute.current === route) callback(...args);
                  };
                }
                const routeProps: CzechNativeScreenProps = {
                  ...props,
                  route,
                  isActive: active,
                  onBack: guard(props.onBack),
                  onNavigate: guard(props.onNavigate),
                  onSearch: guard(props.onSearch),
                  onProfile: guard(props.onProfile),
                  onPrimaryNavigationChange: guard(visible =>
                    suppressPrimary(visible ? null : route),
                  ),
                  onAmountsToggle: guard(props.onAmountsToggle),
                  onChanged: guard(props.onChanged),
                  onBackHandlerChange:
                    props.onBackHandlerChange &&
                    guard(props.onBackHandlerChange),
                  onLanguageChange:
                    props.onLanguageChange && guard(props.onLanguageChange),
                  onModeChange: props.onModeChange && guard(props.onModeChange),
                  onHomeThemeChange:
                    props.onHomeThemeChange && guard(props.onHomeThemeChange),
                  onInvestmentBuyRequestConsumed:
                    props.onInvestmentBuyRequestConsumed &&
                    guard(props.onInvestmentBuyRequestConsumed),
                  onInvestmentSecuritySelected:
                    props.onInvestmentSecuritySelected &&
                    guard(props.onInvestmentSecuritySelected),
                  onInvestmentReturnToSimulator:
                    props.onInvestmentReturnToSimulator &&
                    guard(props.onInvestmentReturnToSimulator),
                  onPaymentFlowChange:
                    props.onPaymentFlowChange &&
                    guard(props.onPaymentFlowChange),
                  onTransactionSelected:
                    props.onTransactionSelected &&
                    guard(props.onTransactionSelected),
                  onAddTransaction:
                    props.onAddTransaction && guard(props.onAddTransaction),
                  onAnalyticsPeriodChange:
                    props.onAnalyticsPeriodChange &&
                    guard(props.onAnalyticsPeriodChange),
                  onRoboResumeStateChange:
                    props.onRoboResumeStateChange &&
                    guard(props.onRoboResumeStateChange),
                  onTransactionCategoryChange:
                    props.onTransactionCategoryChange &&
                    guard(props.onTransactionCategoryChange),
                  onContinueCoapping:
                    props.onContinueCoapping && guard(props.onContinueCoapping),
                  onCoAppingSessionEnd:
                    props.onCoAppingSessionEnd &&
                    guard(props.onCoAppingSessionEnd),
                  onInvestmentHistoryTabChange:
                    props.onInvestmentHistoryTabChange &&
                    guard(props.onInvestmentHistoryTabChange),
                  onInvestmentHistoryToApprove:
                    props.onInvestmentHistoryToApprove &&
                    guard(props.onInvestmentHistoryToApprove),
                  onProductsShelfFocusHandled:
                    props.onProductsShelfFocusHandled &&
                    guard(props.onProductsShelfFocusHandled),
                  onProductsShelfHeroCollapsedChange:
                    props.onProductsShelfHeroCollapsedChange &&
                    guard(props.onProductsShelfHeroCollapsedChange),
                  onProductDetailAction:
                    props.onProductDetailAction &&
                    guard(props.onProductDetailAction),
                  onActiveCardChange:
                    props.onActiveCardChange && guard(props.onActiveCardChange),
                  onShowCardDetailsRequest:
                    props.onShowCardDetailsRequest &&
                    guard(props.onShowCardDetailsRequest),
                  onShowCardDetails:
                    props.onShowCardDetails && guard(props.onShowCardDetails),
                  onAiOpportunityClick:
                    props.onAiOpportunityClick &&
                    guard(props.onAiOpportunityClick),
                  onHelpRequest:
                    props.onHelpRequest && guard(props.onHelpRequest),
                };
                const Screen = composition.screens[route.screen];
                // These domain renderers reserve their header space in their outer composition.
                // Home/profile/accounts consume screenTopInset themselves through the host contract.
                const paddingTop = [
                  'investments',
                  'investment-history',
                  'investment-detail',
                  'robo',
                ].includes(route.screen)
                  ? screenTopInset
                  : 0;
                return (
                  <View
                    key={routeIds.current.map.get(route)}
                    testID={duo ? 'evo-duo-screen' : undefined}
                    pointerEvents={active ? 'auto' : 'none'}
                    accessibilityElementsHidden={!active}
                    importantForAccessibility={
                      active ? 'auto' : 'no-hide-descendants'
                    }
                    style={[
                      s.page,
                      { paddingTop },
                      verticalNavigation &&
                        !['prelogin', 'login'].includes(route.screen) && {
                          right: duo?.rightInset,
                        },
                      isCzechPrimaryScreen(route.screen) &&
                        suppressedPrimary !== route &&
                        !verticalNavigation && {
                          bottom: 84 + bottomInset,
                        },
                      !active && s.hidden,
                    ]}
                  >
                    <EvoDuoNavigationScope active={active}>
                      {route.screen === 'search' ? (
                        <ScrollView
                          contentContainerStyle={[
                            s.content,
                            { paddingTop: 16 + screenTopInset },
                          ]}
                          keyboardShouldPersistTaps="handled"
                        >
                          <AdaptiveBackButton
                            label={displayLanguage === 'cs' ? 'Zpět' : 'Back'}
                            onBack={routeProps.onBack}
                          />
                          <Text style={s.title}>
                            {displayLanguage === 'cs' ? 'Hledat' : 'Search'}
                          </Text>
                          <SearchField
                            tokens={tokens}
                            autoFocus={active}
                            value={query}
                            onChange={guard(setQuery)}
                            onSubmit={() => {}}
                            onClear={guard(() => setQuery(''))}
                            placeholder={
                              displayLanguage === 'cs'
                                ? 'Hledat produkty a služby'
                                : 'Search products and services'
                            }
                            label={
                              displayLanguage === 'cs' ? 'Hledat' : 'Search'
                            }
                            clearLabel={
                              displayLanguage === 'cs'
                                ? 'Vymazat'
                                : 'Clear search'
                            }
                          />
                          {search.map(entry => (
                            <NavigationRow
                              key={entry.id}
                              tokens={tokens}
                              title={entry.label}
                              subtitle={entry.subtitle}
                              payload={entry.target}
                              onSelect={routeProps.onNavigate}
                            />
                          ))}
                          {!search.length && (
                            <Text style={s.body}>
                              {displayLanguage === 'cs'
                                ? 'Žádné dostupné výsledky.'
                                : 'No available results.'}
                            </Text>
                          )}
                        </ScrollView>
                      ) : Screen ? (
                        <Screen {...routeProps} />
                      ) : (
                        <View style={s.content}>
                          <Text style={s.title}>CZ Evo 2027</Text>
                          <Text style={s.body}>
                            Tato obrazovka ještě není dostupná v nativní
                            migraci: {route.screen}.
                          </Text>
                          <ActionButton
                            tokens={tokens}
                            label="Zpět"
                            secondary
                            onPress={onBack}
                          />
                        </View>
                      )}
                    </EvoDuoNavigationScope>
                  </View>
                );
              })
            ) : null}
            {primaryVisible && currentRoute && (
              <CzechPrimaryNavigation
                screen={currentRoute.screen}
                language={displayLanguage}
                mode={displayMode}
                bottomInset={bottomInset}
                vertical={verticalNavigation}
                verticalTop={duo?.systemRailTop ?? 110}
                verticalActionCount={
                  Number(!!duoBackAction) + Number(!!duoCloseAction)
                }
                onSelect={screen => {
                  if (screen === currentRoute.screen) return;
                  if (control) {
                    onNavigate({ screen });
                    return;
                  }
                  if (!composition.screens[screen]) {
                    onNavigate({ screen });
                    return;
                  }
                  Keyboard.dismiss();
                  setNavigation(previous => {
                    const index = previous.backStack.findIndex(
                      route => route.screen === screen && !route.params,
                    );
                    return index < 0
                      ? navigateCzech(previous, { screen })
                      : {
                          current: previous.backStack[index],
                          backStack: previous.backStack.slice(0, index),
                        };
                  });
                }}
              />
            )}
            {verticalNavigation &&
              (duoBackAction || duoCloseAction) &&
              !modalVisible && (
                <View
                  style={[s.duoBackDock, { top: duo?.systemRailTop ?? 110 }]}
                >
                  {duoBackAction && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={
                        displayLanguage === 'cs' ? 'Zpět' : 'Back'
                      }
                      onPress={duoBackAction}
                      style={[
                        s.duoBackButton,
                        displayMode === 'dark' && {
                          backgroundColor: '#262d31',
                        },
                      ]}
                      testID="evo-duo-back"
                    >
                      <SourceCustomIcon
                        name="back-heavy"
                        size={22}
                        color={displayMode === 'dark' ? '#ffffff' : '#262626'}
                      />
                    </Pressable>
                  )}
                  {duoCloseAction && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={
                        displayLanguage === 'cs' ? 'Zavřít' : 'Close'
                      }
                      onPress={duoCloseAction}
                      style={[
                        s.duoBackButton,
                        displayMode === 'dark' && {
                          backgroundColor: '#262d31',
                        },
                      ]}
                      testID="evo-duo-close"
                    >
                      <Text
                        style={{
                          fontSize: 28,
                          lineHeight: 32,
                          color: displayMode === 'dark' ? '#ffffff' : '#262626',
                        }}
                      >
                        ×
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
            <ModalPanel
              tokens={tokens}
              title="Nativní migrace"
              visible={!!unavailable}
              onClose={() => setUnavailable(null)}
              closeLabel="Zavřít"
            >
              <Text style={s.body}>
                Tato obrazovka zatím není dostupná: {unavailable?.screen}.
              </Text>
            </ModalPanel>
            <CoappingLayer host={coAppingLayerHost} />
          </View>
        </OverlayHost>
      </EvoDuoNavigationProvider>
    </DuoLocalViewportProvider>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  duoBackDock: {
    position: 'absolute',
    right: 0,
    top: 110,
    width: 84,
    alignItems: 'center',
  },
  duoBackButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: '#ffffff',
  },
  page: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  hidden: { display: 'none' },
  content: { padding: 16, gap: 16 },
  title: { fontFamily: tokens.strongFont, fontSize: 28, color: tokens.text },
  body: {
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 22,
    color: tokens.muted,
  },
});
