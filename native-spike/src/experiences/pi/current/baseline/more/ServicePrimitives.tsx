import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { CurrentScreenProps } from '../../contracts';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';

export function serviceDark(host: CurrentScreenProps) {
  return host.tokens.background === sourceColor('var(--uc-app-bg)', true);
}

/** The Source toolbar stays anchored while its separate large title scrolls away. */
export function MoreServicePage({
  host,
  title,
  children,
  sticky,
  overlay,
  onHelpPress,
  footer,
  hideCollapsedTitleWhenHidden = false,
}: {
  host: CurrentScreenProps;
  title: string;
  children: React.ReactNode;
  sticky?: React.ReactNode;
  overlay?: React.ReactNode;
  onHelpPress?: () => void;
  footer?: React.ReactNode;
  hideCollapsedTitleWhenHidden?: boolean;
}) {
  const [progress, setProgress] = useState(0);
  const dark = serviceDark(host),
    surface = sourceColor('var(--uc-surface)', dark);
  return (
    <View style={[styles.root, { backgroundColor: surface }]}>
      <BaselinePageHeader
        title={title}
        onBack={host.onBack}
        onHelpPress={onHelpPress ?? host.onHelpRequest}
        includeSafeArea
        safeAreaReserve={host.screenTopInset}
        collapsedTitleProgress={progress}
        hideCollapsedTitleWhenHidden={hideCollapsedTitleWhenHidden}
        renderLargeTitle={false}
        dark={dark}
      />
      <ScrollView
        role="main"
        testID={`ro-more-${host.route.screen}-page`}
        stickyHeaderIndices={sticky ? [1] : undefined}
        style={Platform.OS === 'web' ? styles.webScroll : undefined}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={event =>
          setProgress(
            Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 64)),
          )
        }
      >
        <View
          style={[
            styles.titleFrame,
            sticky ? styles.stickyGap : undefined,
            { opacity: 1 - progress, backgroundColor: surface },
          ]}
        >
          <Text
            accessibilityRole="header"
            numberOfLines={2}
            style={[styles.title, { color: host.tokens.text }]}
          >
            {title}
          </Text>
        </View>
        {sticky ? (
          <View style={{ backgroundColor: surface }}>{sticky}</View>
        ) : null}
        {children}
      </ScrollView>
      {footer}
      {overlay}
    </View>
  );
}

export function ServiceYear({ title, dark }: { title: string; dark: boolean }) {
  return (
    <View
      style={[
        styles.year,
        { borderBottomColor: sourceColor('var(--uc-border-muted)', dark) },
      ]}
    >
      <Text
        accessibilityRole="header"
        style={[
          styles.yearLabel,
          { color: sourceColor('var(--uc-text)', dark) },
        ]}
      >
        {title}
      </Text>
    </View>
  );
}

/** Shared Source grid: 32px date, flexible copy, 48px badge, 32px actions. */
export function ServiceDatedRow({
  item,
  dark,
  document = false,
  label,
  actionsExpanded,
  onActions,
}: {
  item: {
    day: string;
    month: string;
    title: string;
    description: string;
    badge?: string;
  };
  dark: boolean;
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
        styles.datedRow,
        { backgroundColor: sourceColor('var(--uc-surface)', dark) },
      ]}
    >
      <View style={styles.date}>
        <Text style={[styles.day, { color: ink }]}>{item.day}</Text>
        <Text style={[styles.month, { color: muted }]}>{item.month}</Text>
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={[styles.rowTitle, { color: ink }]}>
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
  root: { flex: 1 },
  webScroll: { transform: 'none' },
  stickyGap: { marginBottom: 22 },
  titleFrame: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { fontFamily: 'UniCredit-bold', fontSize: 28, flexShrink: 1 },
  year: { marginHorizontal: 24, borderBottomWidth: 1, paddingBottom: 5 },
  yearLabel: { fontFamily: 'UniCredit-bold', fontSize: 18 },
  datedRow: {
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
  rowTitle: { fontFamily: 'UniCredit-bold', fontSize: 16 },
  description: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
  },
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
