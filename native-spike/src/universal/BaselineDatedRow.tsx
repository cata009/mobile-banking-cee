import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SourceCustomIcon } from './SourceCustomIcon';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';

export interface DatedRowItem {
  day: string;
  month: string;
  title: string;
  description: string;
  badge?: string;
}

/**
 * The 80px dated list row: a day and month column, two lines of copy, an optional
 * badge and a trailing actions control. `document` switches to the uppercase title
 * and the horizontal-dots icon used by document lists.
 */
export function BaselineDatedRow({
  item,
  dark = false,
  document = false,
  label,
  actionsExpanded,
  onActions,
}: {
  item: DatedRowItem;
  dark?: boolean;
  document?: boolean;
  label: string;
  actionsExpanded?: boolean;
  onActions?: () => void;
}) {
  const ink = sourceColor('var(--uc-text)', dark),
    muted = sourceColor('var(--uc-text-muted)', dark);
  return (
    <View
      style={[
        styles.row,
        { backgroundColor: sourceColor('var(--uc-surface)', dark) },
      ]}
    >
      <View style={styles.date}>
        <Text style={[styles.day, { color: ink }]}>{item.day}</Text>
        <Text style={[styles.month, { color: muted }]}>{item.month}</Text>
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={[styles.title, { color: ink }]}>
          {document ? item.title.toUpperCase() : item.title}
        </Text>
        <Text numberOfLines={1} style={[styles.description, { color: muted }]}>
          {item.description}
        </Text>
      </View>
      <View style={styles.badgeSlot}>
        {item.badge ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: sourceColor('var(--uc-action-soft)', dark) },
            ]}
          >
            <Text
              style={[
                styles.badgeLabel,
                { color: sourceColor('var(--uc-action)', dark) },
              ]}
            >
              {item.badge}
            </Text>
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
        onPress={onActions}
        style={styles.more}
      >
        {document ? (
          <SourceCustomIcon name="more-horizontal" size={20} color={ink} />
        ) : (
          <View style={styles.dots}>
            {[0, 1, 2].map(id => (
              <View key={id} style={[styles.dot, { backgroundColor: ink }]} />
            ))}
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
  day: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  month: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    alignSelf: 'stretch',
    textAlign: 'center',
  },
  copy: { flex: 1, minWidth: 0, paddingLeft: 6 },
  title: { fontFamily: 'UniCredit-bold', fontSize: 16 },
  description: { fontFamily: 'UniCredit-regular', fontSize: 16 },
  badgeSlot: { width: 48, alignItems: 'center' },
  badge: { borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 },
  badgeLabel: { fontFamily: 'UniCredit-bold', fontSize: 11, lineHeight: 14 },
  more: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { gap: 3 },
  dot: { width: 4, height: 4, borderRadius: 2 },
});
