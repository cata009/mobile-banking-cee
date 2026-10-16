import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './Typography';
import type { Choice, Themed } from './types';

/** One primary app navigation primitive; markets supply brand/actions/items and theme. */
export function MainNavigationHeader<T extends string>({
  tokens,
  brand,
  actions,
  items,
  value,
  onChange,
  label,
  activeIndicator,
  tabsGap = 16,
  actionsRowHeight = 40,
  actionsPaddingHorizontal = 16,
  actionsAlignItems = 'center',
  tabJustifyContent = 'flex-start',
}: Themed & {
  brand: React.ReactNode;
  actions: React.ReactNode;
  items: readonly Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  activeIndicator?: React.ReactNode;
  tabsGap?: number;
  actionsRowHeight?: number;
  actionsPaddingHorizontal?: number;
  actionsAlignItems?: import('react-native').ViewStyle['alignItems'];
  tabJustifyContent?: import('react-native').ViewStyle['justifyContent'];
}) {
  return (
    <View style={[s.root, { backgroundColor: tokens.background }]}>
      <View
        style={[
          s.actionsRow,
          {
            height: actionsRowHeight,
            paddingHorizontal: actionsPaddingHorizontal,
            alignItems: actionsAlignItems,
          },
        ]}
      >
        {brand}
        <View style={s.actions}>{actions}</View>
      </View>
      {items.length > 0 && (
        <View
          style={[s.tabs, { marginTop: tabsGap }]}
          accessibilityRole="tablist"
          accessibilityLabel={label}
        >
          {items.map(item => (
            <Pressable
              key={item.value}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: item.value === value }}
              aria-selected={item.value === value}
              onPress={() => onChange(item.value)}
              style={[s.tab, { justifyContent: tabJustifyContent }]}
            >
              <Text
                style={[
                  s.label,
                  {
                    fontFamily: tokens.strongFont,
                    color: item.value === value ? tokens.accent : tokens.muted,
                  },
                ]}
              >
                {item.label}
              </Text>
              {item.value === value && (
                <View
                  style={[
                    s.dot,
                    !activeIndicator && { backgroundColor: tokens.accent },
                  ]}
                >
                  {activeIndicator}
                </View>
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  root: {},
  actionsRow: {
    height: 40,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: { flexDirection: 'row', gap: 8 },
  tabs: { flexDirection: 'row', gap: 16, marginTop: 16, padding: 16 },
  tab: {
    minHeight: 48,
    paddingBottom: 4,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  label: { fontSize: 32, lineHeight: 36, includeFontPadding: false },
  dot: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
