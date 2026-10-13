/** Isolated RNWeb proof harness, not imported by the Android application. */
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { View, StyleSheet } from 'react-native';
import { OverlayHost } from '../../../../../universal/ModalPortal';
import { ActionButton } from '../../../../../universal/ActionButton';
import { Text } from '../../../../../universal/Typography';
import { CZECH_HOME_ADAPTER } from './adapter';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeRoute,
  type CzechNativeScreenProps,
} from '../contracts';
import { evoTokens } from './tokens';

function Preview() {
  const params = new URLSearchParams(location.search);
  const [route, setRoute] = useState<CzechNativeRoute>({
    screen: (params.get('screen') ?? 'home') as CzechNativeRoute['screen'],
    params: {
      tab: params.get('tab') ?? 'accounts',
      itemId: params.get('itemId') ?? 'current-account',
    },
  });
  const [hidden, setHidden] = useState(false);
  const [history, setHistory] = useState<CzechNativeRoute[]>([]);
  const navigate = (target: CzechNativeRoute) => {
    setHistory(previous => [...previous, route]);
    setRoute(target);
  };
  const back = () => {
    const prior = history[history.length - 1];
    setHistory(previous => previous.slice(0, -1));
    setRoute(prior ?? { screen: 'home' });
  };
  const input: CzechNativeScreenProps = {
    route,
    scenario: 'active',
    language: params.get('lang') === 'cs' ? 'cs' : 'en',
    productCounts: DEFAULT_CZECH_COUNTS,
    amountsHidden: hidden,
    onBack: back,
    onNavigate: navigate,
    onAmountsToggle: () => setHidden(value => !value),
    onChanged: () => {},
    onSearch: () => {},
    onProfile: () => {},
    screenTopInset: Number(params.get('inset') ?? '54'),
    isActive: true,
  };
  const Screen = CZECH_HOME_ADAPTER.screens[route.screen];
  return (
    <OverlayHost>
      <View style={s.root}>
        {Screen ? (
          <Screen {...input} />
        ) : (
          <View style={s.missing}>
            <Text>{route.screen} belongs to Core/another ownership group.</Text>
            <ActionButton tokens={evoTokens} label="Back" onPress={back} />
          </View>
        )}
      </View>
    </OverlayHost>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, height: '100%' },
  missing: { padding: 24, gap: 16 },
});
createRoot(document.getElementById('root')!).render(<Preview />);
