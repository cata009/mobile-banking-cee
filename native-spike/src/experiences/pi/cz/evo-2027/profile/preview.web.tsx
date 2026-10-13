import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { StyleSheet, View } from 'react-native';
import { CZECH_PROFILE_ADAPTER } from './adapter';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeRoute,
  type CzechNativeScreen,
} from '../contracts';
import { czechPreferences } from './features/preferences';
import '../../../../../../web.css';
const query = new URLSearchParams(location.search);
const initialScreen = (query.get('screen') ?? 'profile') as CzechNativeScreen;
function Preview() {
  const [routes, setRoutes] = useState<CzechNativeRoute[]>([
      {
        screen: initialScreen,
        params: { area: query.get('area') ?? 'advisor' },
      },
    ]),
    [, refresh] = useState(0);
  const current = routes.at(-1)!;
  const Screen = CZECH_PROFILE_ADAPTER.screens[current.screen];
  const preferences = czechPreferences.getSnapshot();
  return (
    <View style={fidelityStyles.s0}>
      {Screen ? (
        <Screen
          route={current}
          scenario="active"
          productCounts={DEFAULT_CZECH_COUNTS}
          amountsHidden={false}
          screenTopInset={54}
          language={preferences.language}
          mode={preferences.appearance}
          homeTheme={preferences.homeTheme}
          onBack={() =>
            setRoutes(stack => (stack.length > 1 ? stack.slice(0, -1) : stack))
          }
          onNavigate={route => setRoutes(stack => [...stack, route])}
          onSearch={() => {}}
          onProfile={() =>
            setRoutes(stack => [...stack, { screen: 'profile' }])
          }
          onAmountsToggle={() => {}}
          onChanged={() => refresh(value => value + 1)}
          onLanguageChange={() => refresh(value => value + 1)}
          onModeChange={() => refresh(value => value + 1)}
          onHomeThemeChange={() => refresh(value => value + 1)}
        />
      ) : (
        <View accessibilityLabel="Screen not owned by profile comparison" />
      )}
    </View>
  );
}
czechPreferences.hydrate();
createRoot(document.getElementById('root')!).render(<Preview />);

const fidelityStyles = StyleSheet.create({
  s0: { height: '100vh', width: '100%', backgroundColor: '#ffffff' },
});
