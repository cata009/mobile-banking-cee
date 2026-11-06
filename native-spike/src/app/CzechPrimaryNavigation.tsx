import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
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
export interface CzechNavigationBarItem {
  id: string;
  label: string;
  icon: string;
  iconSize?: number;
}

export function CzechNavigationBar({
  items: navigationItems,
  value,
  language,
  dark = false,
  label,
  vertical = false,
  onSelect,
}: {
  items: readonly CzechNavigationBarItem[];
  value: string;
  language: 'en' | 'cs';
  dark?: boolean;
  label?: string;
  vertical?: boolean;
  onSelect: (id: string) => void;
}) {
  const accent = dark ? '#65d9d2' : '#007a91';
  const muted = dark ? '#b9b9b9' : '#666666';
  const glass = {
    backgroundColor: dark ? 'rgba(19,22,23,0.68)' : 'rgba(246,247,247,0.62)',
    borderColor: dark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.70)',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(26px) saturate(1.22)',
          WebkitBackdropFilter: 'blur(26px) saturate(1.22)',
          boxShadow: dark
            ? 'inset 0 1px 0 rgba(255,255,255,0.16), 0 18px 42px rgba(0,0,0,0.30)'
            : 'inset 0 1px 0 rgba(255,255,255,0.92), 0 18px 42px rgba(17,30,31,0.16)',
        }
      : {}),
  };
  return (
    <View
      accessibilityLabel={
        label ?? (language === 'cs' ? 'Hlavní navigace' : 'Primary navigation')
      }
      style={[vertical ? s.verticalBar : s.bar, glass]}
    >
      {navigationItems.map(item => {
        const selected = item.id === value;
        const color = selected ? accent : muted;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected }}
            aria-selected={selected}
            onPress={() => onSelect(item.id)}
            style={vertical ? s.verticalItem : s.item}
          >
            <SourceCustomIcon
              name={item.icon}
              size={item.iconSize ?? 22}
              color={color}
            />
            {!vertical && (
              <Text style={[s.label, { color }]}>{item.label}</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export function isCzechPrimaryScreen(screen: CzechNativeScreen): boolean {
  return items.some(item => item.screen === screen);
}
export default function CzechPrimaryNavigation({
  screen,
  language,
  mode,
  bottomInset,
  onSelect,
  vertical = false,
  verticalActionCount = 0,
  verticalTop = 110,
}: {
  screen: CzechNativeScreen;
  language: 'en' | 'cs';
  mode: 'light' | 'dark' | 'system';
  bottomInset: number;
  onSelect: (screen: CzechNativeScreen) => void;
  vertical?: boolean;
  verticalActionCount?: number;
  verticalTop?: number;
}) {
  const system = useColorScheme();
  const dark = mode === 'dark' || (mode === 'system' && system === 'dark');
  const labels = (language === 'cs' ? cs : en).navigation;
  return (
    <View
      style={[
        vertical ? s.verticalDock : s.dock,
        {
          ...(vertical ? { top: verticalTop + verticalActionCount * 60 } : {}),
          bottom: vertical ? 12 : bottomInset + 8,
        },
      ]}
    >
      <CzechNavigationBar
        items={items.map(item => ({
          id: item.screen,
          label: labels[item.key],
          icon: item.icon,
        }))}
        value={screen}
        language={language}
        dark={dark}
        vertical={vertical}
        onSelect={id => onSelect(id as CzechNativeScreen)}
      />
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
  verticalDock: {
    position: 'absolute',
    right: 0,
    top: 110,
    width: 84,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  verticalBar: {
    flexDirection: 'column',
    width: 64,
    borderRadius: 26,
    padding: 4,
    borderWidth: 1,
    borderColor: '#cccccc80',
    alignItems: 'center',
  },
  verticalItem: {
    width: 56,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
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
