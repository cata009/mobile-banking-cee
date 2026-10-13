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
  const max = Math.max(1, ...bars.map(bar => bar.total));
  return (
    <View style={s.bars}>
      {bars.map(bar => (
        <Pressable
          key={bar.key}
          accessibilityRole="button"
          accessibilityLabel={`Select ${bar.filterLabel ?? bar.label}`}
          accessibilityState={{ selected: selected === bar.key }}
          onPress={() => onToggle(bar.key)}
          style={[s.bar, { flex: bar.weight ?? 1 }]}
        >
          <View style={s.barPlot}>
            <View
              style={[
                sourceStyles.borderRadius4width85,
                {
                  height: Math.max(2, (bar.total / max) * 160),
                  backgroundColor:
                    !selected || selected === bar.key
                      ? tokens.accent
                      : tokens.border,
                },
              ]}
            />
          </View>
          <Text
            style={[t.body, t.muted, sourceStyles.fontSize12textAligncenter]}
          >
            {bar.caption}
          </Text>
          <Text style={[t.body, sourceStyles.fontSize12textAligncenter]}>
            {bar.label}
          </Text>
          {selected === bar.key && (
            <Money
              amount={bar.total}
              currency={currency}
              hidden={hidden}
              role="support"
            />
          )}
        </Pressable>
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  chart: { alignItems: 'center', paddingVertical: 16 },
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
    alignItems: 'flex-end',
    gap: 6,
    paddingVertical: 16,
  },
  bar: { minWidth: 0, alignItems: 'center', gap: 4 },
  barPlot: {
    height: 164,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

const sourceStyles = StyleSheet.create({
  textAligncenter: { textAlign: 'center' },
  opacity045: { opacity: 0.45 },
  colorfff: { color: '#fff' },
  borderRadius4width85: { borderRadius: 4, width: '85%' },
  fontSize12textAligncenter: { fontSize: 12, textAlign: 'center' },
});
