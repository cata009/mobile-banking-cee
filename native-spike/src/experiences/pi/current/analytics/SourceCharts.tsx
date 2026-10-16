import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import type {
  SpendingAnalyticsSummary,
  SpendingSubcategorySummary,
} from '@/data/spendingAnalytics';
import type { CurrentScreenProps } from '../contracts';

export function CashFlow({
  host,
  summary,
}: {
  host: CurrentScreenProps;
  summary: SpendingAnalyticsSummary;
}) {
  const max = Math.max(summary.incomeTotal, summary.spendingTotal, 1);
  return (
    <View style={s.chart}>
      <View style={[s.base, { borderColor: host.tokens.border }]} />
      <View
        style={[
          s.bar,
          s.incomeBar,
          {
            height: Math.max(18, Math.round((summary.incomeTotal / max) * 104)),
            backgroundColor: host.tokens.accent,
          },
        ]}
      />
      <View
        style={[
          s.bar,
          s.spendingBar,
          {
            height: Math.max(
              18,
              Math.round((summary.spendingTotal / max) * 104),
            ),
            backgroundColor: host.tokens.text,
          },
        ]}
      />
      <View style={[s.incomeLabel, s.valueLabel]}>
        <Text style={[s.smallStrong, { color: host.tokens.muted }]}>
          {host.t('runtime.analytics.inflow', 'Inflow').toUpperCase()}
        </Text>
        <Text style={[s.smallStrong, s.value, { color: host.tokens.text }]}>
          {formatMoneyNumber(summary.incomeTotal, host.country)}{' '}
          {summary.currency}
        </Text>
      </View>
      <View style={[s.spendingLabel, s.valueLabel]}>
        <Text style={[s.smallStrong, { color: host.tokens.muted }]}>
          {host.t('runtime.analytics.outflow', 'Outflow').toUpperCase()}
        </Text>
        <Text style={[s.smallStrong, s.value, { color: host.tokens.text }]}>
          {formatMoneyNumber(summary.spendingTotal, host.country)}{' '}
          {summary.currency}
        </Text>
      </View>
      <Text style={[s.incomes, s.smallStrong, { color: host.tokens.text }]}>
        {host.t('runtime.analytics.incomes', 'Incomes').toUpperCase()}
      </Text>
      <Text style={[s.spendings, s.smallStrong, { color: host.tokens.text }]}>
        {host.t('runtime.analytics.spendings', 'Spendings').toUpperCase()}
      </Text>
    </View>
  );
}
export function SourceBubbles({
  host,
  subcategories,
  colorVar,
  inactive,
  onToggle,
}: {
  host: CurrentScreenProps;
  subcategories: readonly SpendingSubcategorySummary[];
  colorVar: string;
  inactive: ReadonlySet<string>;
  onToggle: (label: string) => void;
}) {
  const max = Math.max(...subcategories.map(sub => sub.total), 1),
    count = subcategories.length;
  const active = subcategories.filter(sub => !inactive.has(sub.label)).length;
  return (
    <View
      accessibilityRole="none"
      accessibilityLabel={host.t(
        'runtime.analytics.subcategoryBreakdown',
        'Subcategory breakdown',
      )}
      style={s.bubbles}
    >
      {subcategories.map(sub => {
        const ratio = Math.sqrt(sub.total / max),
          diameter =
            count === 1
              ? 150
              : count === 2
              ? Math.round(108 + ratio * 30)
              : count <= 4
              ? Math.round(82 + ratio * 26)
              : count <= 6
              ? Math.round(72 + ratio * 22)
              : Math.round(64 + ratio * 16);
        const disabled = inactive.has(sub.label),
          label =
            sub.label.length > 24
              ? `${sub.label.slice(0, 21).trim()}…`
              : sub.label;
        return (
          <Pressable
            key={sub.label}
            testID={`source-pfm-bubble-${sub.label}`}
            accessibilityRole="button"
            accessibilityLabel={`${host.t(
              disabled
                ? 'runtime.analytics.includeSubcategory'
                : 'runtime.analytics.filterOutSubcategory',
              disabled ? 'Include subcategory' : 'Filter out subcategory',
            )}: ${sub.label}`}
            accessibilityState={{
              selected: disabled,
              disabled: !disabled && active <= 1,
            }}
            disabled={!disabled && active <= 1}
            onPress={() => onToggle(sub.label)}
            style={[
              s.bubble,
              {
                width: diameter,
                height: diameter,
                borderRadius: diameter / 2,
                backgroundColor: sourceColor(
                  disabled ? 'var(--uc-neutral-400)' : `var(${colorVar})`,
                  host.tokens.background === '#121212',
                ),
              },
            ]}
          >
            <Text style={s.bubbleLabel}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
export function SourcePeriodIndicator({
  keys,
  active,
  accent,
}: {
  keys: readonly string[];
  active: string;
  accent: string;
}) {
  const index = Math.max(0, keys.indexOf(active));
  let start = Math.max(0, index - 2);
  const end = Math.min(keys.length, start + 5);
  if (end - start < 5) start = Math.max(0, end - 5);
  return (
    <View accessible={false} style={s.indicator}>
      <View style={s.dots}>
        {keys.slice(start, end).map(key => (
          <View
            key={key}
            style={[
              s.dot,
              {
                width: key === active ? 30 : 6,
                backgroundColor: key === active ? accent : '#999999',
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  chart: { width: 320, height: 172, alignSelf: 'center', position: 'relative' },
  base: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 120,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  bar: {
    position: 'absolute',
    width: 16,
    bottom: 52,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  incomeBar: { left: 137 },
  spendingBar: { left: 167 },
  valueLabel: { position: 'absolute' },
  incomeLabel: { left: 8, top: 58, width: 100, alignItems: 'flex-end' },
  spendingLabel: { left: 201, top: 74, width: 111 },
  smallStrong: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 15 },
  value: { marginTop: 4 },
  incomes: {
    position: 'absolute',
    left: 82,
    top: 136,
    width: 68,
    textAlign: 'right',
  },
  spendings: { position: 'absolute', left: 166, top: 136 },
  bubbles: {
    width: 327,
    height: 250,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 8,
    overflow: 'hidden',
  },
  bubble: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  bubbleLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 16,
    textTransform: 'uppercase',
    color: '#fff',
    textAlign: 'center',
  },
  indicator: { paddingTop: 7, paddingBottom: 14, alignItems: 'center' },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { height: 6, borderRadius: 3 },
});
