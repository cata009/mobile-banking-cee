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
  AppState,
  Platform,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { profileSettingsStore } from '@/features/profile/mobileFirstProfileSettings';
import { TypographyProvider } from '../../../universal/Typography';
import { setNativeScreenshotsAllowed } from '../../../platform/screenPrivacy';
import { nativeModalVisibility } from '../../../platform/nativeModalVisibility';
import {
  nativeUpdates,
  nativeUpdateIdentity,
} from '../../../platform/nativeUpdates';
import {
  getItalyFinancialSnapshot,
  subscribeItalyFinancialChanges,
} from '@/features/finance/italyFinancials';
import { getItalySearchSnapshot } from '@/universal/experiences/pi/it/searchSnapshot';
import type {
  SearchEntry,
  SearchTarget,
} from '@/features/search/mobileFirstSearch';
import Home from './Home';
import Search from './Search';
import AccountScreen from './accounts/AccountScreen';
import CardScreen from './cards/CardScreen';
import LoanScreen from './loans/LoanScreen';
import InsuranceScreen from './insurance/InsuranceScreen';
import PfmScreen from './pfm/PfmScreen';
import InvestmentsScreen from './investments/InvestmentsScreen';
import ProfileScreen from './profile/ProfileScreen';
import OperationsScreen from './operations/OperationsScreen';
import TransferScreen from './operations/TransferScreen';
import {
  DEFAULT_ITALY_COUNTS,
  type ItalyNativeIntent,
  type ItalyNativeScreenProps,
  type ItalyNativeChrome,
} from './contracts';
import {
  getNativeItalyCardSession,
  subscribeNativeItalyCardSession,
} from './cards/cardSession';
import {
  backItalyNavigation,
  initialItalyNavigation,
  navigateItalyIntent,
  navigateItalyTarget,
  openItalySearch,
  selectNativeItalySearchResult,
  type NativeItalyRoute,
} from './navigation';
import { OverlayHost } from '../../../universal/ModalPortal';
import { mobileFirstTokens as tokens } from '../../../universal/tokens';

export { NATIVE_ITALY_REGISTERED_KINDS } from './registeredKinds';

export default function NativeItalyApp({
  previewInsetTop = 0,
  bankAdvisorKind,
  onScreenChromeChange,
  onExit,
}: {
  previewInsetTop?: number;
  bankAdvisorKind?: ItalyNativeScreenProps['bankAdvisorKind'];
  onScreenChromeChange?: (chrome: ItalyNativeChrome) => void;
  onExit?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const settings = useSyncExternalStore(
    profileSettingsStore.subscribe,
    profileSettingsStore.getSnapshot,
    profileSettingsStore.getSnapshot,
  );
  useEffect(() => {
    setNativeScreenshotsAllowed(settings.screenshots).catch(error =>
      console.warn('Native screen privacy could not be applied', error),
    );
  }, [settings.screenshots]);
  const [navigation, setNavigation] = useState(initialItalyNavigation),
    [hidden, setHidden] = useState(false),
    [revision, refresh] = useState(0);
  const [foreground, setForeground] = useState(
    () => Platform.OS === 'web' || AppState.currentState === 'active',
  );
  const changeNavigation = useCallback(
    (change: (previous: typeof navigation) => typeof navigation) => {
      // A queued callback can run before pointerEvents commits its restart lock.
      if (nativeUpdates.getSnapshot().phase !== 'applying')
        setNavigation(change);
    },
    [],
  );
  const [routeChrome, setRouteChrome] = useState<
    Record<number, ItalyNativeChrome>
  >({});
  const chromeHandlers = useRef(
    new Map<number, (chrome?: ItalyNativeChrome) => void>(),
  );
  const chromeColor =
    routeChrome[navigation.current.id]?.backgroundColor ?? '#fff';
  const navigationColor =
    routeChrome[navigation.current.id]?.navigationBackgroundColor ??
    chromeColor;
  const chromeStyle =
    routeChrome[navigation.current.id]?.barStyle ?? 'dark-content';
  useEffect(() => {
    onScreenChromeChange?.({
      backgroundColor: chromeColor,
      navigationBackgroundColor: navigationColor,
      barStyle: chromeStyle,
    });
  }, [chromeColor, navigationColor, chromeStyle, onScreenChromeChange]);
  const visibleModals = useSyncExternalStore(
    nativeModalVisibility.subscribe,
    nativeModalVisibility.getSnapshot,
    nativeModalVisibility.getSnapshot,
  );
  const safeForUpdate =
    foreground &&
    navigation.current.screen === 'home' &&
    navigation.backStack.length === 0 &&
    visibleModals === 0;
  const safeForUpdateRef = useRef(safeForUpdate);
  safeForUpdateRef.current = safeForUpdate;
  const updateLifecycle = useRef({ mounted: false, generation: 0 });
  const foregroundRef = useRef(
    Platform.OS === 'web' || AppState.currentState === 'active',
  );
  useLayoutEffect(() => {
    const lifecycle = updateLifecycle.current;
    lifecycle.mounted = true;
    lifecycle.generation++;
    safeForUpdateRef.current = safeForUpdate;
    return () => {
      lifecycle.mounted = false;
      lifecycle.generation++;
      safeForUpdateRef.current = false;
    };
  }, [safeForUpdate]);
  const update = useSyncExternalStore(
    nativeUpdates.subscribe,
    nativeUpdates.getSnapshot,
    nativeUpdates.getSnapshot,
  );
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const identity = nativeUpdateIdentity();
    if (identity) console.info('Native demo release', identity);
    let lastCheck = Date.now();
    nativeUpdates.check();
    const listener = AppState.addEventListener('change', state => {
      foregroundRef.current = state === 'active';
      setForeground(state === 'active');
      if (state === 'active' && Date.now() - lastCheck > 300000) {
        lastCheck = Date.now();
        nativeUpdates.check();
      }
    });
    return () => listener.remove();
  }, []);
  useEffect(() => {
    if (update.phase !== 'ready' || !safeForUpdate) return;
    const generation = updateLifecycle.current.generation;
    nativeUpdates.applyIfSafe(
      () =>
        updateLifecycle.current.mounted &&
        updateLifecycle.current.generation === generation &&
        foregroundRef.current &&
        (Platform.OS === 'web' || AppState.currentState === 'active') &&
        safeForUpdateRef.current &&
        nativeModalVisibility.getSnapshot() === 0,
    );
  }, [update.phase, safeForUpdate]);
  const financial = useSyncExternalStore(
    subscribeItalyFinancialChanges,
    getItalyFinancialSnapshot,
    getItalyFinancialSnapshot,
  );
  const cards = useSyncExternalStore(
    subscribeNativeItalyCardSession,
    getNativeItalyCardSession,
    getNativeItalyCardSession,
  );
  const snapshot = useMemo(
    () => ({
      ...getItalySearchSnapshot(DEFAULT_ITALY_COUNTS, {
        cards: [...cards],
        movements: {},
      }),
      financialRevision: financial.revision,
      compositionRevision: revision,
    }),
    [financial.revision, cards, revision],
  );
  const back = useCallback(
    () => changeNavigation(previous => backItalyNavigation(previous)),
    [changeNavigation],
  );
  const navigate = useCallback(
    (target: SearchTarget) =>
      changeNavigation(previous =>
        navigateItalyTarget(
          previous,
          target,
          (previous.current.screen === 'destination' &&
            ['profile', 'payment'].includes(previous.current.target.kind)) ||
            previous.current.screen === 'operations',
        ),
      ),
    [changeNavigation],
  );
  const intent = useCallback(
    (value: ItalyNativeIntent) =>
      changeNavigation(previous => navigateItalyIntent(previous, value)),
    [changeNavigation],
  );
  const openProfile = useCallback(
    () =>
      changeNavigation(previous =>
        navigateItalyTarget(previous, { kind: 'profile', area: 'hub' }),
      ),
    [changeNavigation],
  );
  const entries = snapshot.entries;
  const select = useCallback(
    (entry: SearchEntry) =>
      changeNavigation(previous =>
        selectNativeItalySearchResult(previous, entry, entries),
      ),
    [entries, changeNavigation],
  );
  const currentScreen = navigation.current.screen;
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (currentScreen === 'home' && onExit) {
          if (nativeUpdates.getSnapshot().phase === 'applying') return true;
          if (nativeModalVisibility.getSnapshot() !== 0) return false;
          onExit();
          return true;
        }
        if (currentScreen !== 'search') return false;
        back();
        return true;
      },
    );
    return () => subscription.remove();
  }, [currentScreen, back, onExit]);
  const render = (route: NativeItalyRoute) => {
    if (!chromeHandlers.current.has(route.id))
      chromeHandlers.current.set(route.id, chrome => {
        const next = chrome ?? {
          backgroundColor: '#fff',
          barStyle: 'dark-content',
        };
        setRouteChrome(previous =>
          previous[route.id]?.backgroundColor === next.backgroundColor &&
          previous[route.id]?.barStyle === next.barStyle
            ? previous
            : { ...previous, [route.id]: next },
        );
      });
    const active = route.id === navigation.current.id;
    const common: ItalyNativeScreenProps = {
      bankAdvisorKind,
      onChromeChange: chromeHandlers.current.get(route.id),
      screenTopInset: previewInsetTop || insets.top,
      target:
        route.screen === 'destination'
          ? route.target
          : { kind: 'category', category: 'Conti' },
      productCounts: DEFAULT_ITALY_COUNTS,
      amountsHidden: hidden,
      onBack: back,
      onNavigate: navigate,
      onProfile: openProfile,
      onChanged: () => refresh(previous => previous + 1),
      onAmountsToggle: () => setHidden(value => !value),
      onIntent: intent,
      isActive: active,
      intent: route.screen === 'destination' ? route.intent : undefined,
      searchEntry: route.screen === 'destination' ? route.entry : undefined,
      onSearch: () => changeNavigation(previous => openItalySearch(previous)),
    };
    if (route.screen === 'home')
      return (
        <Home
          productCounts={DEFAULT_ITALY_COUNTS}
          amountsHidden={hidden}
          onAmountsToggle={common.onAmountsToggle!}
          onNavigate={navigate}
          onSearch={() =>
            changeNavigation(previous => openItalySearch(previous))
          }
          onProfile={openProfile}
          onIntent={intent}
          initialCategory={route.category}
        />
      );
    if (route.screen === 'search')
      return (
        <Search
          entries={snapshot.entries}
          onClose={back}
          onSelect={select}
          initialQuery={navigation.query}
          onQueryChange={query =>
            changeNavigation(previous => ({ ...previous, query }))
          }
          amountsHidden={hidden}
        />
      );
    if (route.screen === 'operations')
      return <OperationsScreen {...common} menu />;
    if (route.screen === 'transfer')
      return <TransferScreen {...common} accountNumber={route.accountNumber} />;
    const target = route.target;
    if (
      target.kind === 'account' ||
      (target.kind === 'category' && target.category === 'Conti')
    )
      return <AccountScreen {...common} />;
    if (
      target.kind === 'card' ||
      (target.kind === 'category' && target.category === 'Carte')
    )
      return <CardScreen {...common} />;
    if (
      target.kind === 'loan' ||
      (target.kind === 'category' && target.category === 'Mutui e Prestiti')
    )
      return <LoanScreen {...common} />;
    if (
      target.kind === 'insurance' ||
      (target.kind === 'category' && target.category === 'Polizze assicurative')
    )
      return <InsuranceScreen {...common} />;
    if (target.kind === 'pfm') return <PfmScreen {...common} />;
    if (target.kind === 'profile') return <ProfileScreen {...common} />;
    if (target.kind === 'investments') return <InvestmentsScreen {...common} />;
    if (target.kind === 'payment') return <OperationsScreen {...common} />;
    return null;
  };
  const overlay =
    navigation.current.screen === 'operations' ||
    (navigation.current.screen === 'destination' &&
      navigation.current.target.kind === 'payment');
  const routes = [...navigation.backStack, navigation.current];
  return (
    <TypographyProvider scale={settings.textSize ? 1.125 : 1}>
      <View
        pointerEvents={update.phase === 'applying' ? 'none' : 'auto'}
        style={[
          s.root,
          {
            paddingTop: previewInsetTop || insets.top,
            paddingBottom: insets.bottom,
            backgroundColor: navigationColor,
          },
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            s.statusBackdrop,
            {
              height: previewInsetTop || insets.top,
              backgroundColor:
                routeChrome[navigation.current.id]?.backgroundColor ?? '#fff',
            },
          ]}
        />
        <StatusBar
          barStyle={
            routeChrome[navigation.current.id]?.barStyle ?? 'dark-content'
          }
        />
        <OverlayHost>
          <View style={s.stack}>
            {routes.map((route, index) => {
              const visible =
                route.id === navigation.current.id ||
                (overlay && index === routes.length - 2);
              return (
                <View
                  key={route.id}
                  pointerEvents={
                    route.id === navigation.current.id ? 'auto' : 'none'
                  }
                  style={[s.page, !visible && s.inactive]}
                >
                  {render(route)}
                </View>
              );
            })}
          </View>
        </OverlayHost>
      </View>
    </TypographyProvider>
  );
}
const s = StyleSheet.create({
  statusBackdrop: { position: 'absolute', top: 0, left: 0, right: 0 },
  root: { flex: 1, backgroundColor: '#fff' },
  stack: { flex: 1, position: 'relative' },
  page: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  inactive: { display: 'none' },
  gap: { flex: 1, padding: 24, gap: 24, justifyContent: 'center' },
  title: {
    fontFamily: tokens.strongFont,
    fontSize: 28,
    lineHeight: 32,
    color: tokens.text,
  },
  body: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
  },
});
