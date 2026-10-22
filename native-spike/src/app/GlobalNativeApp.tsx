import React, { Suspense, lazy, useState } from 'react';
import { Platform, StyleSheet, View, Pressable } from 'react-native';
import {
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Text } from '../universal/Typography';
import { OverlayHost } from '../universal/ModalPortal';
import { DemoViewport } from '../universal/DemoViewport';
import { PiWebAccessibilityContext } from '../platform/webAccessibility';
import type { CurrentRoute } from '../experiences/pi/current/contracts';
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
import {
  loadItaly,
  loadCzech,
  loadKids,
  loadCurrent,
} from './loadNativeExperiences';
const NativeItalyApp = lazy(loadItaly);
const NativeCzechApp = lazy(loadCzech);
const NativeKidsApp = lazy(loadKids);
const NativeCurrentApp = lazy(loadCurrent);

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
  productCounts,
  initialAmountsHidden,
  bankingScenario,
}: GlobalNativeAppProps = {}) {
  const [selection, setSelection] =
    useState<NativeDemoSelection>(initialSelection);
  const [opened, setOpened] = useState(startInDemo);
  const [launchRoute, setLaunchRoute] =
    useState<GlobalNativeAppProps['initialRoute']>(initialRoute);
  const [searchRequest, requestSearch] = useState(0);
  const insets = useSafeAreaInsets();
  const [viewportScale, setViewportScale] = useState(1);
  const logicalInsets = {
    top: insets.top / viewportScale,
    bottom: insets.bottom / viewportScale,
    left: insets.left / viewportScale,
    right: insets.right / viewportScale,
  };
  const screenTopInset = previewInsetTop || (showSelectorControl ? 0 : Math.max(54,logicalInsets.top));
  const demo = resolveNativeDemo(selection);
  const entryAvailable = !!demo.implementation;
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
            onSearch={
              selection.scenario === 'active' &&
              (demo.implementation === 'cz-evo' ||
                demo.implementation === 'current')
                ? () => {
                    setLaunchRoute({ screen: 'search' });
                    setOpened(true);
                  }
                : undefined
            }
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
              <DemoViewport
                authoringWidth={demo.implementation === 'italy' ? 393 : 375}
                onScale={setViewportScale}
              >
                <SafeAreaInsetsContext.Provider
                  value={{
                    ...logicalInsets,
                    top: showSelectorControl ? 0 : logicalInsets.top,
                  }}
                >
                  <Suspense
                    fallback={
                      <View style={s.application}>
                        <Text style={s.link}>Se pregătește demo…</Text>
                      </View>
                    }
                  >
                    {selection.scenario === 'inactive' &&
                    selection.product === 'PI' ? (
                      <NativeCurrentApp
                        country={selection.country}
                        release={selection.release}
                        scenario="inactive"
                        onExit={exit}
                        screenTopInset={screenTopInset}
                        bottomInset={logicalInsets.bottom}
                        initialRoute={{ screen: 'prelogin' }}
                        initialLanguage={initialLanguage}
                        initialMode={initialMode}
                        productCounts={productCounts}
                        initialAmountsHidden={initialAmountsHidden}
                        bankingScenario={bankingScenario}
                        onActivated={() => {
                          setLaunchRoute(undefined);
                          setSelection(previous => ({
                            ...previous,
                            scenario: 'active',
                          }));
                        }}
                      />
                    ) : demo.implementation === 'current' ? (
                      <NativeCurrentApp
                        country={selection.country}
                        release={selection.release}
                        scenario={selection.scenario}
                        onExit={exit}
                        screenTopInset={screenTopInset}
                        bottomInset={logicalInsets.bottom}
                        initialRoute={launchRoute as CurrentRoute | undefined}
                        initialLanguage={initialLanguage}
                        initialMode={initialMode}
                        productCounts={productCounts}
                        initialAmountsHidden={initialAmountsHidden}
                        bankingScenario={bankingScenario}
                      />
                    ) : demo.implementation === 'kids' ? (
                      <PiWebAccessibilityContext.Provider value={Platform.OS === 'web'}>
                        <NativeKidsApp
                          country={selection.country as 'RO' | 'SK' | 'HU'}
                          scenario={selection.scenario}
                          onExit={exit}
                          screenTopInset={screenTopInset}
                          bottomInset={logicalInsets.bottom}
                          language={initialLanguage}
                        />
                      </PiWebAccessibilityContext.Provider>
                    ) : demo.implementation === 'italy' ? (
                      <NativeItalyApp
                        previewInsetTop={previewInsetTop}
                        productCounts={productCounts}
                        initialAmountsHidden={initialAmountsHidden}
                        onExit={exit}
                      />
                    ) : (
                      <NativeCzechApp
                        scenario={selection.scenario}
                        onExit={exit}
                        screenTopInset={screenTopInset}
                        bottomInset={logicalInsets.bottom}
                        searchRequest={searchRequest}
                        initialRoute={
                          launchRoute as CzechNativeRoute | undefined
                        }
                        initialLanguage={
                          initialLanguage === 'cs'
                            ? 'cs'
                            : initialLanguage === 'en'
                            ? 'en'
                            : undefined
                        }
                        initialMode={initialMode}
                        initialHomeTheme={initialHomeTheme}
                        bankingScenario={bankingScenario}
                        productCounts={productCounts}
                        initialAmountsHidden={initialAmountsHidden}
                      />
                    )}
                  </Suspense>
                </SafeAreaInsetsContext.Provider>
              </DemoViewport>
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
