import React, { useState } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import {
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Text } from '../universal/Typography';
import { OverlayHost } from '../universal/ModalPortal';
import NativeItalyApp from '../experiences/pi/it/NativeItalyApp';
import NativeCzechApp from '../experiences/pi/cz/evo-2027/NativeCzechApp';
import GlobalDemoSelector from './GlobalDemoSelector';
import {
  DEFAULT_NATIVE_SELECTION,
  resolveNativeDemo,
  selectionKey,
  type NativeDemoSelection,
} from './registry';
import { selectorTokens as tokens } from './selectorTokens';
import type { GlobalNativeAppProps } from './types';
import type { CzechNativeRoute } from '../experiences/pi/cz/evo-2027/contracts';
import { CZECH_NATIVE_ADAPTERS } from './czechAdapters';

/** A single global native entry is used by RNWeb and Android. */
export default function GlobalNativeApp({
  initialSelection = DEFAULT_NATIVE_SELECTION,
  initialRoute,
  startInDemo = false,
  showSelectorControl = false,
  previewInsetTop = 0,
  initialLanguage,
  initialMode,
  initialHomeTheme,
}: GlobalNativeAppProps = {}) {
  const [selection, setSelection] =
    useState<NativeDemoSelection>(initialSelection);
  const [opened, setOpened] = useState(startInDemo);
  const [launchRoute, setLaunchRoute] = useState<CzechNativeRoute | undefined>(initialRoute);
  const [searchRequest, requestSearch] = useState(0);
  const insets = useSafeAreaInsets();
  const demo = resolveNativeDemo(selection);
  const entryAvailable =
    demo.implementation === 'italy' ||
    (demo.implementation === 'cz-evo' &&
      CZECH_NATIVE_ADAPTERS.some(
        adapter => adapter.screens[launchRoute?.screen === 'search' ? 'home' : launchRoute?.screen ?? 'home'],
      ));
  const exit = () => setOpened(false);
  const paddingTop = opened ? 0 : insets.top;
  const paddingBottom = opened ? 0 : insets.bottom;
  return (
    <OverlayHost>
      <View
        style={[
          s.root,
          {
            paddingTop,
            paddingBottom,
          },
        ]}
      >
        {!opened || !demo.implementation || !entryAvailable ? (
          <GlobalDemoSelector
            selection={selection}
            onChange={setSelection}
            onOpen={() => {
              setLaunchRoute(initialRoute);
              setOpened(true);
            }}
            onSearch={demo.implementation === 'cz-evo' ? () => {
              setLaunchRoute({ screen: 'search' });
              setOpened(true);
            } : undefined}
            entryAvailable={entryAvailable}
          />
        ) : (
          <>
            {showSelectorControl && (
              <View style={[s.toolbar, { paddingTop: insets.top }]}>
                <Text style={s.caption}>
                  {selection.product} · {selection.country} ·{' '}
                  {selection.designSystem}
                </Text>
                {demo.implementation === 'cz-evo' && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Global search"
                    onPress={() => requestSearch(value => value + 1)}
                    style={s.switch}
                  >
                    <Text style={s.link}>Search</Text>
                  </Pressable>
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Demo selector"
                  onPress={exit}
                  style={s.switch}
                >
                  <Text style={s.link}>Demo selector</Text>
                </Pressable>
              </View>
            )}
            <View style={s.application} key={selectionKey(selection)}>
              <SafeAreaInsetsContext.Provider
                value={{ ...insets, top: showSelectorControl ? 0 : insets.top }}
              >
                {demo.implementation === 'italy' ? (
                  <NativeItalyApp previewInsetTop={previewInsetTop} onExit={exit} />
                ) : (
                  <NativeCzechApp
                    scenario={selection.scenario}
                    onExit={exit}
                    screenTopInset={previewInsetTop || (showSelectorControl ? 0 : insets.top)}
                    bottomInset={insets.bottom}
                    searchRequest={searchRequest}
                    initialRoute={launchRoute}
                    initialLanguage={initialLanguage}
                    initialMode={initialMode}
                    initialHomeTheme={initialHomeTheme}
                  />
                )}
              </SafeAreaInsetsContext.Provider>
            </View>
          </>
        )}
      </View>
    </OverlayHost>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  application: { flex: 1 },
  toolbar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  caption: { fontFamily: tokens.font, fontSize: 12, color: tokens.muted },
  switch: { padding: 10, minHeight: 44, justifyContent: 'center' },
  link: { fontFamily: tokens.strongFont, color: tokens.accent, fontSize: 14 },
});
