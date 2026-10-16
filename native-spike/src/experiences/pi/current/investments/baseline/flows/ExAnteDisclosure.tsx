import React, { type CSSProperties } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type TextStyle,
} from 'react-native';
import type { CurrentScreenProps } from '../../../contracts';
import { Text } from '../../../../../../universal/Typography';
import { investmentColor } from '../Frame';
export const InvestmentDocumentHost =
  React.createContext<CurrentScreenProps | null>(null);
export function DocumentCopy({
  strong = false,
  muted = false,
  style,
  children,
  ...props
}: React.ComponentProps<typeof Text> & {
  strong?: boolean;
  muted?: boolean;
}) {
  const host = React.useContext(InvestmentDocumentHost);
  if (!host)
    throw new Error('Baseline investment documents require their actual host');
  return (
    <Text
      {...props}
      style={[
        [
          {
            fontFamily: strong ? 'UniCredit-bold' : 'UniCredit-regular',
          },
          baselineStyles.inline1,
          {
            color: investmentColor(
              host,
              muted ? '--uc-text-muted' : '--uc-text',
            ),
          },
        ],
        style,
      ]}
    >
      {children}
    </Text>
  );
}
function Copy(props: React.ComponentProps<typeof DocumentCopy>) {
  return <DocumentCopy {...props} style={[s.copy, props.style]} />;
}
const scenarioLabelWebStyle = {
  whiteSpace: 'nowrap',
  overflowWrap: 'normal',
  overflow: 'visible',
} satisfies CSSProperties as unknown as TextStyle;
type ScenarioView = 'percent' | 'value';
const colors = ['#00A3E0', '#5BC199', '#074861', '#885BC1', '#535453'];
const bars = [
  {
    label: 'NEGATIVE',
    height: 112,
    segments: [0.3, 0.25, 0.2, 0.15, 0.1],
    opacity: 1,
  },
  {
    label: 'NEUTRAL',
    height: 56,
    segments: [0.4, 0.35, 0.25],
    opacity: 0.4,
  },
  {
    label: 'POSITIVE',
    height: 39,
    segments: [1],
    opacity: 1,
  },
];
const periods = ['0Y', '1Y', '3Y', '5Y', '7Y', '10Y'];
function CostSummary({
  label,
  currency,
  view = 'value',
}: {
  label: string;
  currency: string;
  view?: ScenarioView;
}) {
  const host = React.useContext(InvestmentDocumentHost)!;
  const greenStyle = { color: investmentColor(host, '--uc-green-olive') };
  return (
    <View style={s.summary}>
      <Copy strong>{label}</Copy>
      <View style={s.summaryValues}>
        <Copy strong style={[greenStyle, view === 'value' && s.small]}>
          9,30%
        </Copy>
        <Copy
          strong={view === 'value'}
          muted={view === 'percent'}
          style={[s.amount, view === 'percent' && s.small]}
        >
          1 000,00 {currency}
        </Copy>
      </View>
    </View>
  );
}
function Fee({ label, currency }: { label: string; currency: string }) {
  return (
    <View style={s.fee}>
      <View style={s.feeRow}>
        <Copy strong muted style={s.small}>
          {label}
        </Copy>
        <Copy strong style={s.small}>
          500,00 {currency}
        </Copy>
      </View>
      <View style={s.feeRow}>
        <Copy strong muted style={s.small}>
          (P)
        </Copy>
        <Copy strong style={s.small}>
          4,15%
        </Copy>
      </View>
    </View>
  );
}
function Breakdown({
  currency,
  view,
}: {
  currency: string;
  view?: ScenarioView;
}) {
  return (
    <View style={s.inset}>
      <CostSummary label="ON-GOING" currency={currency} view={view} />
      <Fee label="TRANSACTION FEE" currency={currency} />
      <Fee label="BANK FEE" currency={currency} />
      <CostSummary label="ENTRY" currency={currency} view={view} />
      <Fee label="TRANSACTION FEE" currency={currency} />
      <CostSummary label="TOTAL" currency={currency} view={view} />
    </View>
  );
}
/** Port of the Source illustrative disclosure, not a forecast or executable cost policy. */
export function BaselineInvestmentExAnteDisclosure({
  currency,
  view,
  onView,
  periodIndex,
  onPeriod,
}: {
  currency: string;
  view: ScenarioView;
  onView: (view: ScenarioView) => void;
  periodIndex: number;
  onPeriod: (index: number) => void;
}) {
  const host = React.useContext(InvestmentDocumentHost)!;
  const selectedTabStyle = {
    borderBottomColor: investmentColor(host, '--uc-text'),
  };
  const lineStyle = {
    backgroundColor: investmentColor(host, '--uc-border-muted'),
  };
  const periodStyle = { borderColor: investmentColor(host, '--uc-text') };
  const selectedPeriodStyle = {
    backgroundColor: investmentColor(host, '--uc-action-strong'),
    borderColor: 'transparent',
  };
  const axis = (ratio: number) => ((10000 * ratio) / 1000).toFixed(1);
  const labels =
    view === 'percent'
      ? ['113%', '56,50%', '0', '-56,50%']
      : [
          `${axis(1.13)}K ${currency}`,
          `${axis(0.565)}K ${currency}`,
          `0 ${currency}`,
          `-${axis(0.565)}K ${currency}`,
        ];
  return (
    <View>
      <Breakdown currency={currency} />
      <View style={s.toggle} accessibilityRole="tablist">
        {(['percent', 'value'] as const).map(option => {
          return (
            <Pressable
              key={option}
              accessibilityRole="tab"
              accessibilityLabel={option}
              accessibilityState={{
                selected: option === view,
              }}
              onPress={() => onView(option)}
              style={[s.tab, option === view && selectedTabStyle]}
            >
              <Copy strong muted={option !== view}>
                {option.toUpperCase()}
              </Copy>
            </Pressable>
          );
        })}
      </View>
      <View style={s.chart} testID="cz-ex-ante-scenarios">
        <View style={s.plot}>
          {labels.map((label, index) => {
            const renderStyle1 = {
              top: index * 56,
            } as const;
            return (
              <View key={label} style={[s.grid, renderStyle1]}>
                <Copy muted style={s.axis}>
                  {label}
                </Copy>
                <View style={[s.line, lineStyle]} />
              </View>
            );
          })}
          <View style={s.bars}>
            {bars.map(bar => {
              const renderStyle2 = {
                height: bar.height,
              } as const;
              return (
                <View key={bar.label} style={[s.bar, renderStyle2]}>
                  {bar.segments.map((fraction, index) => {
                    const renderStyle3 = {
                      height: `${fraction * 100}%`,
                      backgroundColor: colors[index],
                      opacity: bar.opacity,
                      ...(bar.label === 'POSITIVE' ? s.positiveBar : {}),
                    } as const;
                    return <View key={index} style={renderStyle3} />;
                  })}
                </View>
              );
            })}
          </View>
        </View>
        <View style={s.scenarioLabels}>
          {bars.map(bar => {
            return (
              <Copy
                key={bar.label}
                strong
                numberOfLines={Platform.OS === 'web' ? undefined : 1}
                ellipsizeMode={Platform.OS === 'web' ? undefined : 'clip'}
                style={[
                  s.scenarioLabel,
                  Platform.OS === 'web' ? scenarioLabelWebStyle : undefined,
                ]}
              >
                {bar.label}
              </Copy>
            );
          })}
        </View>
        <View style={s.periods}>
          {periods.map((period, index) => {
            return (
              <Pressable
                key={period}
                accessibilityRole="button"
                accessibilityLabel={period}
                accessibilityState={{
                  selected: index === periodIndex,
                }}
                onPress={() => onPeriod(index)}
                style={[
                  s.period,
                  periodStyle,
                  index === periodIndex && selectedPeriodStyle,
                ]}
              >
                <Copy
                  strong
                  style={[s.periodCopy, index === periodIndex && s.inverse]}
                >
                  {period}
                </Copy>
              </Pressable>
            );
          })}
        </View>
        <View style={s.legend}>
          {[
            'Stress scenario',
            'Unfavourable',
            'Moderate',
            'Favourable',
            'Optimistic',
          ].map((label, index) => {
            const renderStyle4 = {
              backgroundColor: colors[index],
            } as const;
            return (
              <View key={label} style={s.legendItem}>
                <View style={[s.dot, renderStyle4]} />
                <Copy style={s.small}>{label}</Copy>
              </View>
            );
          })}
        </View>
      </View>
      <View style={s.repeat}>
        <Breakdown currency={currency} view={view} />
        <View style={s.inset}>
          <CostSummary
            label="NET INVESTMENT AMOUNT"
            currency={currency}
            view={view}
          />
          <CostSummary label="NET RETURN" currency={currency} view={view} />
          <CostSummary label="TOTAL" currency={currency} view={view} />
        </View>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  copy: {
    lineHeight: 17,
  },
  positiveBar: {
    backgroundColor: '#D6579C',
  },
  inset: {
    paddingHorizontal: 24,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  summaryValues: {
    alignItems: 'flex-end',
  },
  small: {
    fontSize: 14,
    lineHeight: 15,
  },
  amount: {
    marginTop: 2,
  },
  fee: {
    paddingLeft: 16,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  toggle: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  tab: {
    height: 32,
    justifyContent: 'center',
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  chart: {
    marginTop: 20,
    paddingHorizontal: 24,
  },
  plot: {
    height: 168,
    position: 'relative',
  },
  grid: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  axis: {
    width: 72,
    fontSize: 14,
    lineHeight: 15,
  },
  line: {
    height: 1,
    flex: 1,
  },
  bars: {
    position: 'absolute',
    left: 80,
    right: 8,
    top: 0,
    height: 112,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  bar: {
    width: 56,
    overflow: 'hidden',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  scenarioLabels: {
    marginTop: 20,
    marginLeft: 80,
    marginRight: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scenarioLabel: {
    width: 56,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 15,
  },
  periods: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  period: {
    minWidth: 35,
    height: 21,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodCopy: {
    fontSize: 14,
    lineHeight: 15,
  },
  inverse: {
    color: '#FFFFFF',
  },
  legend: {
    marginTop: 32,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
    columnGap: 16,
  },
  legendItem: {
    width: '47.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  repeat: {
    marginTop: 20,
  },
});
const baselineStyles = StyleSheet.create({
  inline1: {
    fontSize: 16,
  },
});
