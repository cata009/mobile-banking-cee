import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { Text } from '../../../../../../universal/Typography';
import { sourceColor } from '../../../../../../universal/sourceColor';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting';
import { maskFormattedAmount } from '@/app/utils/amountPrivacy';
import { resolveAnalyticsIndicator } from '@/app/components/contracts/analyticsIndicator';
import { getCountryCurrency } from '@/data/exchangeRates';
import type { CurrentScreenProps } from '../../../contracts';
import type {
  SpendingAnalyticsSummary,
  SpendingSubcategorySummary,
} from '@/data/spendingAnalytics';

/** Browser font-normal line boxes differ from a rounded numeric 15px baseline. */
function ChartText({
  style,
  children,
}: {
  style: StyleProp<TextStyle>;
  children: React.ReactNode;
}) {
  if (Platform.OS === 'web') {
    return React.createElement(
      'p',
      {
        style: {
          margin: 0,
          ...StyleSheet.flatten(style),
          lineHeight: 'normal',
        } as React.CSSProperties,
      },
      children,
    );
  }
  return <Text style={style}>{children}</Text>;
}

export function BaselineCashFlowChart({
  host,
  summary,
}: {
  host: CurrentScreenProps;
  summary: SpendingAnalyticsSummary;
}) {
  const maxTotal = Math.max(summary.incomeTotal, summary.spendingTotal, 1);
  const incomeHeight = Math.max(
    18,
    Math.round((summary.incomeTotal / maxTotal) * 104),
  );
  const spendingHeight = Math.max(
    18,
    Math.round((summary.spendingTotal / maxTotal) * 104),
  );
  return (
    <View testID="baseline-pfm-cash-flow" style={s.chart}>
      <View style={[s.baseline, { borderColor: host.tokens.border }]} />
      <View
        testID="baseline-pfm-income-bar"
        style={[
          s.bar,
          s.incomeBar,
          {
            top: 120 - incomeHeight,
            height: incomeHeight,
            backgroundColor: host.tokens.accent,
          },
        ]}
      />
      <View
        testID="baseline-pfm-spending-bar"
        style={[
          s.bar,
          s.spendingBar,
          {
            top: 120 - spendingHeight,
            height: spendingHeight,
            backgroundColor: host.tokens.text,
          },
        ]}
      />
      <View style={[s.inflow, s.valueLabel]}>
        <ChartText style={[s.smallStrong, { color: host.tokens.muted }]}>
          {host.t('runtime.analytics.inflow', 'Inflow').toUpperCase()}
        </ChartText>
        <ChartText
          style={[s.smallStrong, s.value, { color: host.tokens.text }]}
        >
          {formatMoneyNumber(summary.incomeTotal, host.country)}{' '}
          {summary.currency}
        </ChartText>
      </View>
      <View style={[s.outflow, s.valueLabel]}>
        <ChartText style={[s.smallStrong, { color: host.tokens.muted }]}>
          {host.t('runtime.analytics.outflow', 'Outflow').toUpperCase()}
        </ChartText>
        <ChartText
          style={[s.smallStrong, s.value, { color: host.tokens.text }]}
        >
          {formatMoneyNumber(summary.spendingTotal, host.country)}{' '}
          {summary.currency}
        </ChartText>
      </View>
      <ChartText
        style={[s.incomes, s.smallStrong, { color: host.tokens.text }]}
      >
        {host.t('runtime.analytics.incomes', 'Incomes').toUpperCase()}
      </ChartText>
      <ChartText
        style={[s.spendings, s.smallStrong, { color: host.tokens.text }]}
      >
        {host.t('runtime.analytics.spendings', 'Spendings').toUpperCase()}
      </ChartText>
    </View>
  );
}

export function BaselineSubcategoryBubbles({
  host,
  subcategories,
  colorVar,
  inactiveSubcategories,
  onToggle,
}: {
  host: CurrentScreenProps;
  subcategories: readonly SpendingSubcategorySummary[];
  colorVar: string;
  inactiveSubcategories: ReadonlySet<string>;
  onToggle: (label: string) => void;
}) {
  const maxTotal = Math.max(...subcategories.map(sub => sub.total), 1);
  const count = subcategories.length;
  const activeCount = subcategories.filter(
    sub => !inactiveSubcategories.has(sub.label),
  ).length;
  const dark = host.tokens.background === '#121212';
  return (
    <View
      testID="baseline-pfm-bubbles"
      role="group"
      accessibilityLabel={host.t(
        'runtime.analytics.subcategoryBreakdown',
        'Subcategory breakdown',
      )}
      {...{ dataSet: { pfmBubbleCount: String(count) } }}
      style={s.bubbles}
    >
      {subcategories.map(sub => {
        const ratio = Math.sqrt(sub.total / Math.max(maxTotal, 1));
        const diameter =
          count === 1
            ? 150
            : count === 2
            ? Math.round(108 + ratio * 30)
            : count <= 4
            ? Math.round(82 + ratio * 26)
            : count <= 6
            ? Math.round(72 + ratio * 22)
            : Math.round(64 + ratio * 16);
        const inactive = inactiveSubcategories.has(sub.label);
        const disabled = !inactive && activeCount <= 1;
        const visibleLabel =
          sub.label.length > 24
            ? `${sub.label.slice(0, 21).trim()}…`
            : sub.label;
        const displayedTotal = maskFormattedAmount(
          formatEvo2027Number(sub.total),
          host.amountsHidden,
        );
        const actionLabel = `${host.t(
          inactive
            ? 'runtime.analytics.includeSubcategory'
            : 'runtime.analytics.filterOutSubcategory',
          inactive ? 'Include subcategory' : 'Filter out subcategory',
        )}: ${sub.label}`;
        const title = `${sub.label}: ${displayedTotal} ${getCountryCurrency(
          host.country,
        )}`;
        const backgroundColor = sourceColor(
          inactive ? 'var(--uc-neutral-400)' : `var(${colorVar})`,
          dark,
        );
        if (Platform.OS === 'web') {
          return React.createElement(
            'button',
            {
              key: sub.label,
              type: 'button',
              title,
              disabled,
              'data-testid': `baseline-pfm-bubble-${sub.label}`,
              'data-pfm-subcategory-bubble': sub.label,
              'data-pfm-subcategory-total': host.amountsHidden
                ? undefined
                : sub.total,
              'data-pfm-subcategory-active': inactive ? 'false' : 'true',
              'aria-label': actionLabel,
              'aria-pressed': inactive,
              onClick: () => onToggle(sub.label),
              style: {
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                width: diameter,
                height: diameter,
                borderRadius: 'calc(infinity * 1px)',
                borderWidth: 0,
                borderStyle: 'solid',
                borderColor: host.tokens.border,
                appearance: 'button',
                WebkitFontSmoothing: 'antialiased',
                margin: 0,
                padding: '0 8px',
                textAlign: 'center',
                color: '#FFFFFF',
                backgroundColor,
                cursor: disabled ? 'default' : 'pointer',
                transition: 'transform 150ms',
              },
              onMouseEnter: event => {
                event.currentTarget.style.transform = 'scale(1.03)';
              },
              onMouseLeave: event => {
                event.currentTarget.style.transform = '';
              },
            },
            React.createElement(
              'span',
              { style: { display: 'grid', maxWidth: '100%', gap: 2 } },
              React.createElement(
                'span',
                {
                  style: {
                    maxWidth: '100%',
                    fontFamily: 'UniCredit-bold',
                    fontSize: 14,
                    lineHeight: 'normal',
                    letterSpacing: 0,
                    textTransform: 'uppercase',
                  },
                },
                visibleLabel,
              ),
            ),
          );
        }
        return (
          <Pressable
            key={sub.label}
            testID={`baseline-pfm-bubble-${sub.label}`}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
            accessibilityState={{ selected: inactive, disabled }}
            aria-pressed={inactive}
            {...{
              title,
              dataSet: {
                pfmSubcategoryBubble: sub.label,
                pfmSubcategoryTotal: host.amountsHidden
                  ? undefined
                  : String(sub.total),
                pfmSubcategoryActive: inactive ? 'false' : 'true',
              },
            }}
            disabled={disabled}
            onPress={() => onToggle(sub.label)}
            style={[
              s.bubble,
              {
                width: diameter,
                height: diameter,
                borderRadius: diameter / 2,
                backgroundColor,
              },
            ]}
          >
            <Text style={s.bubbleLabel}>{visibleLabel}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function BaselinePeriodIndicator({
  host,
  periodKeys,
  activePeriodKey,
}: {
  host: CurrentScreenProps;
  periodKeys: readonly string[];
  activePeriodKey: string;
}) {
  const contract = resolveAnalyticsIndicator({ periodKeys, activePeriodKey });
  const dark = host.tokens.background === '#121212';
  return (
    <View
      testID="baseline-pfm-period-indicator"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      style={[
        s.indicator,
        {
          paddingTop: contract.paddingTop,
          paddingBottom: contract.paddingBottom,
        },
      ]}
    >
      <View style={[s.dots, { gap: contract.gap }]}>
        {contract.periodKeys.map(key => (
          <View
            key={key}
            testID={`baseline-pfm-period-dot-${key}`}
            style={[
              s.dot,
              {
                height: contract.dotSize,
                width:
                  key === activePeriodKey
                    ? contract.activeWidth
                    : contract.dotSize,
                backgroundColor: sourceColor(
                  key === activePeriodKey
                    ? 'var(--uc-action)'
                    : 'var(--uc-text-subtle)',
                  dark,
                ),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export function categoryPillWidth(total: number, maxTotal: number) {
  return Math.round(104 + Math.max(0.24, total / Math.max(maxTotal, 1)) * 178);
}

export function categoryPillColor(colorVar: string, dark = false) {
  const rgb = (hex: string) =>
    [0, 2, 4].map(offset =>
      parseInt(hex.replace('#', '').slice(offset, offset + 2), 16),
    );
  const foreground = rgb(sourceColor(`var(${colorVar})`, dark));
  const background = rgb(sourceColor('var(--uc-surface)', dark));
  // Source color-mix retains fractional sRGB channels; round only at rasterization.
  const tint = `rgb(${foreground
    .map((channel, index) =>
      Number((channel * 0.16 + background[index] * 0.84).toFixed(6)),
    )
    .join(',')})`;
  // RN Web normalizes bare rgb() through an integer native color. A CSS-variable
  // fallback passes the Source fractional channels directly to the browser.
  return Platform.OS === 'web'
    ? `var(--ro-pfm-category-pill-tint, color-mix(in srgb, ${sourceColor(
        `var(${colorVar})`,
        dark,
      )} 16%, ${sourceColor('var(--uc-surface)', dark)}))`
    : tint;
}

const s = StyleSheet.create({
  chart: {
    width: '100%',
    maxWidth: 320,
    height: 172,
    alignSelf: 'center',
    position: 'relative',
  },
  baseline: {
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
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  incomeBar: { left: 137 },
  spendingBar: { left: 167 },
  valueLabel: { position: 'absolute' },
  inflow: { left: 8, top: 58, width: 100, alignItems: 'flex-end' },
  outflow: { left: 201, top: 74, width: 111 },
  smallStrong: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 15,
    letterSpacing: 0,
  },
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
    position: 'static',
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
    lineHeight: 15,
    letterSpacing: 0,
    textTransform: 'uppercase',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  indicator: { alignItems: 'center' },
  dots: { flexDirection: 'row', alignItems: 'center' },
  dot: { borderRadius: 999 },
});
