import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from '../../../../../universal/Typography';
import type {
  ExpenseDonutSegment,
  ExpenseBar,
} from '@/features/analytics/chartTypes';
import type { Currency } from '@/data/products';
import { Money, textStyles as t } from '../home/Primitives';
import { evoTokens as tokens } from '../home/tokens';
import { CategoryMark, categoryColor } from './CategoryMark';

export function Donut({
  segments,
  selected,
  onToggle,
  amount,
  label,
  currency,
  hidden,
  markers = {},
}: {
  segments: readonly ExpenseDonutSegment[];
  selected: ReadonlySet<string>;
  onToggle: (key: string) => void;
  amount: number;
  label: string;
  currency: Currency;
  hidden: boolean;
  markers?: Readonly<Record<string, React.ReactNode>>;
}) {
  const total = segments.reduce((sum, item) => sum + item.total, 0);
  const circumference = Math.PI * 180;
  let cursor = 0;
  const arcs = segments.map(segment => {
    const span =
      total > 0
        ? (segment.total / total) * circumference
        : circumference / segments.length;
    const start = cursor;
    cursor += span;
    const angle =
      ((((start + span / 2) / circumference) * 360 - 90) * Math.PI) / 180;
    return {
      ...segment,
      dash: Math.max(1, span - 28),
      offset: -(start + 14),
      x: Math.cos(angle) * 118,
      y: Math.sin(angle) * 118,
      active: !selected.size || selected.has(segment.category),
    };
  });
  return (
    <View style={s.chart}>
      <View style={s.donut}>
        <Svg width={220} height={220} viewBox="0 0 220 220" style={s.ring}>
          {arcs.map(arc => (
            <Circle
              key={arc.category}
              cx={110}
              cy={110}
              r={90}
              fill="none"
              stroke={arc.active ? categoryColor(arc.colorVar) : '#cccccc'}
              strokeWidth={20}
              strokeLinecap="round"
              strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
              strokeDashoffset={arc.offset}
              rotation={-90}
              origin="110,110"
              onPress={() => onToggle(arc.category)}
            />
          ))}
        </Svg>
        <View pointerEvents="none" style={s.center}>
          <Text style={[t.body, s.centerLabel]}>{label}</Text>
          <Money amount={amount} currency={currency} hidden={hidden} />
        </View>
        {arcs.map(arc => (
          <Pressable
            key={arc.category}
            testID="cz-pfm-donut-marker"
            accessibilityRole="button"
            accessibilityLabel={`Show ${arc.label} transactions`}
            accessibilityState={{ selected: selected.has(arc.category) }}
            onPress={() => onToggle(arc.category)}
            style={[
              s.marker,
              { left: 118 + arc.x, top: 118 + arc.y },
              !arc.active && s.inhibited,
              selected.has(arc.category) && s.selectedMarker,
            ]}
          >
            {markers[arc.category] ??
              (arc.iconCategory ? (
                <CategoryMark category={arc.iconCategory} />
              ) : (
                <View
                  style={[
                    s.roundel,
                    { backgroundColor: categoryColor(arc.colorVar) },
                  ]}
                >
                  <Text style={[t.body, t.strong, s.markerLabel]}>
                    {arc.markerLabel ?? '…'}
                  </Text>
                </View>
              ))}
          </Pressable>
        ))}
      </View>
    </View>
  );
}
export function Bars({
  bars,
  selected,
  onToggle,
  hidden,
  currency,
}: {
  bars: readonly ExpenseBar[];
  selected: string | null;
  onToggle: (key: string) => void;
  hidden: boolean;
  currency: Currency;
}) {
  const max = Math.max(0, ...bars.map(bar => bar.total));
  const rough = max / 4;
  const magnitude = rough > 0 ? 10 ** Math.floor(Math.log10(rough)) : 1;
  const normalized = rough / magnitude;
  const step =
    (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) *
    magnitude;
  const axisMax = max > 0 ? step * 4 : 1;
  const barWidth = bars.length <= 6 ? 24 : bars.length <= 12 ? 18 : 14;
  const labelEvery = Math.max(1, Math.ceil(bars.length / 12));
  const tickLabel = (value: number) => {
    if (hidden) return '****';
    if (value >= 1000)
      return `${new Intl.NumberFormat('en-US', {
        maximumFractionDigits: value % 1000 === 0 ? 0 : 1,
      }).format(value / 1000)}K`;
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
      value,
    );
  };
  return (
    <View style={s.plot} accessibilityLabel="Expense bar chart">
      <View style={s.axis} accessibilityElementsHidden>
        {[4, 3, 2, 1, 0].map(index => (
          <Text key={index} testID="cz-pfm-axis-tick" style={s.axisLabel}>
            {tickLabel(step * index)}
            {index === 4 ? ` ${currency}` : ''}
          </Text>
        ))}
      </View>
      <View style={s.plotContent}>
        <View pointerEvents="none" style={s.grid}>
          {[0, 1, 2, 3, 4].map(index => (
            <View key={index} style={[s.gridLine, { top: `${index * 25}%` }]} />
          ))}
        </View>
        <View style={s.bars}>
          {bars.map((bar, index) => (
            <Pressable
              key={bar.key}
              accessibilityRole="button"
              accessibilityLabel={`Select ${
                bar.filterLabel ??
                `${bar.caption ? `${bar.caption} ` : ''}${bar.label}`
              }`}
              accessibilityState={{ selected: selected === bar.key }}
              onPress={() => onToggle(bar.key)}
              style={s.bar}
            >
              <View style={s.barPlot}>
                <View
                  style={[
                    s.barFill,
                    {
                      width: '100%',
                      maxWidth: barWidth * (bar.weight ?? 1),
                      height:
                        bar.total > 0
                          ? Math.max(
                              2,
                              Math.min(168, (bar.total / axisMax) * 168),
                            )
                          : 0,
                      backgroundColor:
                        !selected || selected === bar.key
                          ? tokens.accent
                          : tokens.border,
                    },
                  ]}
                />
              </View>
              {index % labelEvery === 0 && (
                <Text
                  style={[
                    t.body,
                    t.muted,
                    sourceStyles.fontSize12textAligncenter,
                  ]}
                >
                  {bar.caption}
                </Text>
              )}
              {index % labelEvery === 0 && (
                <Text style={[t.body, sourceStyles.fontSize12textAligncenter]}>
                  {bar.label}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  chart: { alignItems: 'center' },
  donut: { position: 'relative', width: 268, height: 268 },
  ring: { position: 'absolute', left: 24, top: 24 },
  marker: { position: 'absolute', width: 32, height: 32, borderRadius: 16 },
  markerLabel: { color: '#ffffff', fontSize: 13 },
  inhibited: { opacity: 0.55 },
  selectedMarker: { transform: [{ scale: 1.1 }] },
  centerLabel: { fontSize: 16, lineHeight: 20, textAlign: 'center' },
  center: {
    position: 'absolute',
    left: 54,
    right: 54,
    top: 94,
    gap: 4,
    alignItems: 'center',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 44,
  },
  roundel: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 2,
  },
  plot: { flexDirection: 'row', gap: 6, paddingTop: 12 },
  axis: {
    width: 32,
    height: 168,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  axisLabel: {
    fontFamily: tokens.font,
    color: tokens.muted,
    fontSize: 11,
    lineHeight: 14,
    transform: [{ translateY: -7 }],
  },
  plotContent: { flex: 1, minWidth: 0, position: 'relative' },
  grid: { position: 'absolute', top: 0, left: 0, right: 0, height: 168 },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dotted',
    borderColor: '#cccccc',
  },
  bar: { flex: 1, minWidth: 0, alignItems: 'center', gap: 4 },
  barFill: { borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barPlot: {
    height: 168,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

const sourceStyles = StyleSheet.create({
  textAligncenter: { textAlign: 'center' },
  opacity045: { opacity: 0.45 },
  colorfff: { color: '#fff' },
  fontSize12textAligncenter: { fontSize: 12, textAlign: 'center' },
});
