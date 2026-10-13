import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  BackHandler,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '../../../../universal/Typography';
import { SearchField } from '../../../../universal/SearchField';
import { ActionButton } from '../../../../universal/ActionButton';
import { NavigationRow } from '../../../../universal/NavigationRow';
import { OverlayHost } from '../../../../universal/ModalPortal';
import { ModalPanel } from '../../../../universal/ModalPanel';
import { selectorTokens as tokens } from '../../../../app/selectorTokens';
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
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeAdapter,
  type CzechNativeRoute,
  type CzechNativeScreenProps,
} from './contracts';

function stored(key: string, fallback: string): string {
  try {
    return globalThis.localStorage?.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
function persist(key: string, value: string) {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    /* Session state remains usable when storage is unavailable. */
  }
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
}: {
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
}) {
  const composition = useMemo(() => composeCzechAdapters(adapters), [adapters]);
  const [navigation, setNavigation] = useState<CzechNavigation>(() => ({
    current: createCzechRoute(
      initialRoute ?? {
        screen: scenario === 'inactive' ? 'prelogin' : 'home',
      },
    ),
    backStack: [],
  }));
  const [amountsHidden, hideAmounts] = useState(false);
  const activeRoute = useRef(navigation.current);
  activeRoute.current = navigation.current;
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
    else if (!navigation.backStack.length) onExit?.();
    else setNavigation(backCzech);
  }, [navigation.backStack.length, onExit, unavailable]);
  const backHandler = useRef(onBack);
  backHandler.current = onBack;
  // Install the shell before page passive handlers; their local Back action has priority.
  useLayoutEffect(() => {
    if (Platform.OS === 'web') return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      backHandler.current();
      return true;
    });
    return () => listener.remove();
  }, []);
  const onNavigate = useCallback(
    (target: CzechNativeRoute) => {
      Keyboard.dismiss();
      if (target.screen !== 'search' && !composition.screens[target.screen]) {
        setUnavailable(target);
        return;
      }
      setNavigation(previous => navigateCzech(previous, target));
    },
    [composition.screens],
  );
  const props: CzechNativeScreenProps = {
    route: navigation.current,
    scenario,
    productCounts: DEFAULT_CZECH_COUNTS,
    amountsHidden,
    language,
    mode,
    homeTheme,
    onLanguageChange: value => {
      setLanguage(value);
      persist('native-cz-language-v1', value);
    },
    onModeChange: value => {
      setMode(value);
      persist('app-2027-appearance-mode', value);
    },
    onHomeThemeChange: value => {
      setHomeTheme(value);
      persist('app-2027-home-theme', value);
    },
    onBack,
    onNavigate,
    onSearch: () => {
      setQuery('');
      onNavigate({ screen: 'search' });
    },
    onProfile: () => onNavigate({ screen: 'profile' }),
    onAmountsToggle: () => hideAmounts(value => !value),
    onChanged: () => refresh(value => value + 1),
    isActive: true,
    screenTopInset,
  };
  const handledSearchRequest = useRef(searchRequest);
  useEffect(() => {
    if (handledSearchRequest.current === searchRequest) return;
    handledSearchRequest.current = searchRequest;
    setQuery('');
    setUnavailable(null);
    if (activeRoute.current.screen !== 'search')
      onNavigate({ screen: 'search' });
  }, [searchRequest, onNavigate]);
  const search = searchCzechEntries(composition.searchEntries(props), query);
  const primaryVisible =
    scenario === 'active' && isCzechPrimaryScreen(navigation.current.screen);
  return (
    <OverlayHost>
      <View style={s.root}>
        {[...navigation.backStack, navigation.current].map(route => {
          if (!routeIds.current.map.has(route))
            routeIds.current.map.set(route, ++routeIds.current.sequence);
          const active = route === navigation.current;
          function guard<T extends unknown[]>(callback: (...args: T) => void) {
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
            onAmountsToggle: guard(props.onAmountsToggle),
            onChanged: guard(props.onChanged),
            onLanguageChange:
              props.onLanguageChange && guard(props.onLanguageChange),
            onModeChange: props.onModeChange && guard(props.onModeChange),
            onHomeThemeChange:
              props.onHomeThemeChange && guard(props.onHomeThemeChange),
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
              pointerEvents={active ? 'auto' : 'none'}
              accessibilityElementsHidden={!active}
              importantForAccessibility={
                active ? 'auto' : 'no-hide-descendants'
              }
              style={[
                s.page,
                { paddingTop },
                isCzechPrimaryScreen(route.screen) && {
                  bottom: 84 + bottomInset,
                },
                !active && s.hidden,
              ]}
            >
              {route.screen === 'search' ? (
                <ScrollView
                  contentContainerStyle={[s.content, { paddingTop: 16 + screenTopInset }]}
                  keyboardShouldPersistTaps="handled"
                >
                  <ActionButton
                    tokens={tokens}
                    label={language === 'cs' ? 'Zpět' : 'Back'}
                    secondary
                    onPress={routeProps.onBack}
                  />
                  <Text style={s.title}>
                    {language === 'cs' ? 'Hledat' : 'Search'}
                  </Text>
                  <SearchField
                    tokens={tokens}
                    autoFocus={active}
                    value={query}
                    onChange={guard(setQuery)}
                    onSubmit={() => {}}
                    onClear={guard(() => setQuery(''))}
                    placeholder={
                      language === 'cs'
                        ? 'Hledat produkty a služby'
                        : 'Search products and services'
                    }
                    label={language === 'cs' ? 'Hledat' : 'Search'}
                    clearLabel={language === 'cs' ? 'Vymazat' : 'Clear search'}
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
                      {language === 'cs'
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
                    Tato obrazovka ještě není dostupná v nativní migraci:{' '}
                    {route.screen}.
                  </Text>
                  <ActionButton
                    tokens={tokens}
                    label="Zpět"
                    secondary
                    onPress={onBack}
                  />
                </View>
              )}
            </View>
          );
        })}
        {primaryVisible && (
          <CzechPrimaryNavigation
            screen={navigation.current.screen}
            language={language}
            mode={mode}
            bottomInset={bottomInset}
            onSelect={screen => {
              if (screen === navigation.current.screen) return;
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
      </View>
    </OverlayHost>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
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
