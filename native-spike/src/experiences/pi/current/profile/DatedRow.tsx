import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Copy, useCurrentTokens, useSourceColors } from './Primitives';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';

/** Source 80px dated-list composition; metadata/data remains in Source configs. */
export function DatedRow({
  item,
  actions,
  actionsExpanded,
  label,
  uppercase = false,
}: {
  item: {
    day: string;
    month: string;
    title: string;
    description: string;
    badge?: string;
  };
  actions?: () => void;
  actionsExpanded?: boolean;
  label: string;
  uppercase?: boolean;
}) {
  const tokens = useCurrentTokens();
  const color = useSourceColors();
  return (
    <View style={[styles.row, { backgroundColor: color('--uc-surface') }]}>
      <View style={styles.date}>
        <Copy strong size={18} lineHeight={20}>
          {item.day}
        </Copy>
        <Copy strong size={14} color={tokens.muted} lineHeight={16}>
          {item.month}
        </Copy>
      </View>
      <View style={styles.copy}>
        <Copy strong numberOfLines={1} lineHeight={20}>
          {uppercase ? item.title.toUpperCase() : item.title}
        </Copy>
        <Copy color={tokens.muted} numberOfLines={1} lineHeight={22}>
          {item.description}
        </Copy>
      </View>
      <View style={styles.badgeSlot}>
        {item.badge ? (
          <View style={styles.badge}>
            <Copy strong size={11} color={tokens.accent} lineHeight={14}>
              {item.badge}
            </Copy>
          </View>
        ) : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={
          actionsExpanded === undefined
            ? undefined
            : { expanded: actionsExpanded }
        }
        onPress={actions ?? (() => {})}
        style={styles.more}
      >
        {uppercase ? (
          <SourceCustomIcon
            name="more-horizontal"
            size={24}
            color={tokens.text}
          />
        ) : (
          <View style={styles.dots}>
            <View
              style={[fidelityStyles.s0, { backgroundColor: tokens.text }]}
            />
            <View
              style={[fidelityStyles.s1, { backgroundColor: tokens.text }]}
            />
            <View
              style={[fidelityStyles.s2, { backgroundColor: tokens.text }]}
            />
          </View>
        )}
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    height: 80,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  date: { width: 32, alignItems: 'center' },
  copy: { flex: 1, minWidth: 0, paddingLeft: 6 },
  badgeSlot: { width: 48, alignItems: 'center' },
  badge: {
    backgroundColor: '#ccecea',
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  more: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { gap: 3 },
});

const fidelityStyles = StyleSheet.create({
  s0: { width: 4, height: 4, borderRadius: 2 },
  s1: { width: 4, height: 4, borderRadius: 2 },
  s2: { width: 4, height: 4, borderRadius: 2 },
});
