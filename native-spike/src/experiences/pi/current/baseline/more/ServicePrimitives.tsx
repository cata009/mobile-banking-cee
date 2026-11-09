import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { CurrentScreenProps } from '../../contracts';
import { BaselineDatedRow } from '../../../../../universal/BaselineDatedRow';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
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
  stickyGap = 22,
}: {
  host: CurrentScreenProps;
  title: string;
  children: React.ReactNode;
  sticky?: React.ReactNode;
  overlay?: React.ReactNode;
  onHelpPress?: () => void;
  footer?: React.ReactNode;
  hideCollapsedTitleWhenHidden?: boolean;
  stickyGap?: number;
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
            sticky ? { marginBottom: stickyGap } : undefined,
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
  return (
    <BaselineDatedRow
      item={item}
      dark={dark}
      document={document}
      label={label}
      actionsExpanded={actionsExpanded}
      onActions={onActions}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  webScroll: { transform: 'none' },
  titleFrame: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { fontFamily: 'UniCredit-bold', fontSize: 28, flexShrink: 1 },
  year: { marginHorizontal: 24, borderBottomWidth: 1, paddingBottom: 5 },
  yearLabel: { fontFamily: 'UniCredit-bold', fontSize: 18 },
});
