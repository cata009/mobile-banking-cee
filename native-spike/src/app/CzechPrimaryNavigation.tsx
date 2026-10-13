import React from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import cs from '@/translations/CZ/cs';
import en from '@/translations/CZ/en';
import { SourceCustomIcon } from '../universal/SourceCustomIcon';
import { Text } from '../universal/Typography';
import type { CzechNativeScreen } from '../experiences/pi/cz/evo-2027/contracts';

// Source App2027PrimaryNavigation order, glyphs and labels; native composition owns destinations.
const items = [
  { screen: 'home', key: 'home', icon: 'nav-home' },
  { screen: 'pfm', key: 'analytics', icon: 'nav-analytics' },
  { screen: 'payments', key: 'payments', icon: 'nav-payments' },
  { screen: 'products', key: 'products', icon: 'nav-products' },
  { screen: 'profile', key: 'more', icon: 'nav-more' },
] as const;
export function isCzechPrimaryScreen(screen: CzechNativeScreen): boolean {
  return items.some(item => item.screen === screen);
}
export default function CzechPrimaryNavigation({
  screen,
  language,
  mode,
  bottomInset,
  onSelect,
}: {
  screen: CzechNativeScreen;
  language: 'en' | 'cs';
  mode: 'light' | 'dark' | 'system';
  bottomInset: number;
  onSelect: (screen: CzechNativeScreen) => void;
}) {
  const system = useColorScheme();
  const dark = mode === 'dark' || (mode === 'system' && system === 'dark');
  const accent = dark ? '#65d9d2' : '#007a91';
  const muted = dark ? '#b9b9b9' : '#666666';
  const backgroundColor = dark ? '#262d31' : '#ffffff';
  const labels = (language === 'cs' ? cs : en).navigation;
  return (
    <View
      style={[
        s.dock,
        {
          bottom: bottomInset + (screen === 'home' || screen === 'pfm' ? 8 : 0),
        },
      ]}
    >
      <View
        accessibilityLabel={
          language === 'cs' ? 'Hlavní navigace' : 'Primary navigation'
        }
        style={[s.bar, { backgroundColor }]}
      >
        {items.map(item => {
          const selected = item.screen === screen;
          const color = selected ? accent : muted;
          return (
            <Pressable
              key={item.screen}
              accessibilityRole="tab"
              accessibilityLabel={labels[item.key]}
              accessibilityState={{ selected }}
              aria-selected={selected}
              onPress={() => onSelect(item.screen)}
              style={s.item}
            >
              <SourceCustomIcon name={item.icon} size={22} color={color} />
              <Text style={[s.label, { color }]}>{labels[item.key]}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  dock: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 540,
    height: 68,
    borderRadius: 26,
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 5,
    borderWidth: 1,
    borderColor: '#cccccc80',
  },
  item: {
    flex: 1,
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    borderRadius: 12,
    paddingHorizontal: 1,
  },
  label: {
    fontFamily: 'UniCredit-regular',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: -0.168,
  },
});
