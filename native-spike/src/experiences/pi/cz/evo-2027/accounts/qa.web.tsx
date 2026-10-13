/** QA entry only. Not imported by the native adapter, App, Metro entry, or APK. */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { View, StyleSheet } from 'react-native';
import '../../../../../platform/modelGlobals';
import { Text } from '../../../../../universal/Typography';
import NativeCzechApp from '../NativeCzechApp';
import type { CzechNativeScreen } from '../contracts';
import { CZECH_ACCOUNTS_ADAPTER } from './adapter';
import '../../../../../../web.css';
const query = new URLSearchParams(location.search),
  screen = (query.get('screen') ?? 'account') as CzechNativeScreen,
  params = Object.fromEntries(
    [...query]
      .filter(([key]) => key.startsWith('param_'))
      .map(([key, value]) => [key.slice(6), value]),
  );
const adapters = [CZECH_ACCOUNTS_ADAPTER] as const;
const proof = StyleSheet.create({
  root: {
    alignItems: 'flex-start',
    position: 'absolute',
    left: 0,
    top: 0,
    width: 393,
  },
  label: {
    fontFamily: 'sans-serif',
    fontSize: 16,
    lineHeight: 24,
    height: 24,
    width: 393,
  },
  frame: {
    width: 393,
    height: 852,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
});
createRoot(document.getElementById('root')!).render(
  <View style={proof.root}>
    <Text style={proof.label} numberOfLines={1}>
      RNWeb actual domain adapter + NativeCzechApp · 393×852 · reserve0
    </Text>
    <View testID="cz-domain-native-frame" style={proof.frame}>
      <NativeCzechApp
        adapters={adapters}
        initialRoute={{
          screen,
          params,
        }}
        screenTopInset={0}
      />
    </View>
  </View>,
);
