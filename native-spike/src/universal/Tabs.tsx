import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from './Typography';
import type { Choice } from './types';
import type { Themed } from './types';
import { styles } from './styles';

export function Tabs<T extends string>({
  tokens,
  value,
  items,
  onChange,
  label = 'Tabs',
  variant = 'pill',
}: Themed & {
  value: T;
  items: readonly Choice<T>[];
  onChange: (value: T) => void;
  label?: string;
  variant?: 'pill' | 'current' | 'mailbox' | 'evo';
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={variant === 'mailbox' && s.mailbox}
      contentContainerStyle={[
        styles.tabs,
        variant !== 'pill' && s.currentTabs,
        variant === 'evo' && s.evoTabs,
        variant === 'mailbox' && [
          s.mailboxTabs,
          { borderBottomColor: tokens.border },
        ],
      ]}
      accessibilityLabel={label}
    >
      {items.map(item => {
        const selected = item.value === value;
        const backgroundColor =
          variant === 'pill' || variant === 'evo'
            ? selected
              ? tokens.accent
              : variant === 'evo'
              ? tokens.surface
              : tokens.background
            : 'transparent';
        const borderColor =
          variant === 'pill'
            ? selected
              ? tokens.accent
              : tokens.border
            : 'transparent';
        return (
          <Pressable
            key={item.value}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected, disabled: !!item.disabled }}
            aria-selected={selected}
            disabled={!!item.disabled}
            onPress={() => onChange(item.value)}
            style={[
              styles.tab,
              item.disabled && styles.dimmed,
              {
                backgroundColor,
                borderColor,
              },
              (variant === 'current' || variant === 'mailbox') && s.currentTab,
              variant === 'evo' && s.evoTab,
              variant === 'mailbox' && s.mailboxTab,
              variant === 'mailbox' &&
                selected && [
                  s.mailboxIndicator,
                  { borderBottomColor: tokens.text },
                ],
            ]}
          >
            <Text
              style={[
                styles.tabLabel,
                {
                  fontFamily:
                    variant === 'evo'
                      ? tokens.font
                      : selected
                      ? tokens.strongFont
                      : tokens.font,
                  color:
                    variant === 'pill' || variant === 'evo'
                      ? selected
                        ? tokens.inverse
                        : tokens.muted
                      : selected
                      ? tokens.text
                      : tokens.muted,
                },
                variant !== 'pill' && s.currentLabel,
                variant === 'mailbox' && s.mailboxLabel,
                variant === 'evo' &&
                  (selected ? s.evoSelectedLabel : s.evoLabel),
              ]}
            >
              {item.label}
            </Text>
            {item.count === undefined ? null : (
              <Text
                style={[
                  styles.tabCount,
                  {
                    fontFamily: selected ? tokens.strongFont : tokens.font,
                    color:
                      variant === 'pill'
                        ? selected
                          ? tokens.inverse
                          : tokens.muted
                        : tokens.muted,
                  },
                ]}
              >
                {item.count}
              </Text>
            )}
            {variant === 'current' && selected && (
              <View style={[s.dot, { backgroundColor: tokens.accent }]} />
            )}
            {variant === 'evo' && selected && (
              <View style={[s.evoDot, { backgroundColor: tokens.inverse }]} />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  currentTabs: { gap: 5 },
  mailbox: { marginTop: 22, height: 48, flexGrow: 0 },
  mailboxTabs: {
    width: '100%',
    gap: 0,
    paddingBottom: 0,
    borderBottomWidth: 1,
  },
  mailboxTab: { flex: 1, height: 47, minHeight: 47, paddingHorizontal: 16 },
  mailboxLabel: { fontWeight: '700' },
  evoTabs: { paddingBottom: 0 },
  currentTab: {
    height: 44,
    minHeight: 44,
    paddingHorizontal: 13,
    borderRadius: 0,
    borderBottomWidth: 0,
  },
  mailboxIndicator: { borderBottomWidth: 2 },
  currentLabel: { fontSize: 16, lineHeight: 19 },
  evoTab: {
    minHeight: 44,
    paddingHorizontal: 13,
    paddingVertical: 7,
    flexDirection: 'column',
    gap: 2,
    borderRadius: 22,
  },
  evoSelectedLabel: { fontWeight: '500' },
  evoLabel: { fontWeight: '400' },
  evoDot: { width: 4, height: 4, borderRadius: 2 },
  dot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
