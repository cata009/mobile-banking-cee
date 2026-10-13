import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import type { Security } from '@/features/investments/mobileFirstSecurities';
import graph from '@/assets/mobile-first/it/investments/securities/imgGraphLine.svg';
import { AssetGlyph, s } from './Primitives';
export default function SecuritiesChart({
  security,
  period,
  onPeriod,
  advanced,
  hidden,
}: {
  security: Security;
  period: string;
  onPeriod: (period: string) => void;
  advanced: boolean;
  hidden: boolean;
}) {
  const prices = [security.price, security.price / (1 + security.change / 100)];
  const format = (value: number) =>
    hidden
      ? '••••'
      : value.toLocaleString('it-IT', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        });
  return (
    <View style={[styles.chart, advanced && styles.advanced]}>
      <View style={styles.periods}>
        {['1G', '1M', '3M', 'YTD', '1A', '5A', 'MAX'].map(value => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityLabel={`Periodo ${value}`}
            accessibilityState={{ selected: period === value }}
            onPress={() => onPeriod(value)}
            style={[styles.period, period === value && styles.selected]}
          >
            <Text style={[s.small, period === value && styles.selectedText]}>
              {value}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.plot}>
        <View accessibilityLabel={`Andamento del prezzo, periodo ${period}`}>
          <AssetGlyph asset={graph} width={324} height={140} />
        </View>
        <View style={styles.axis}>
          {prices.map((value, index) => (
            <Text style={styles.axisText} key={index}>
              {format(value)}
            </Text>
          ))}
        </View>
      </View>
      <View style={styles.axisX}>
        {['9:00', '12:00', '15:00', '18:00', '21:00'].map(value => (
          <Text key={value} style={styles.axisText}>
            {value}
          </Text>
        ))}
      </View>
      <View style={styles.performance}>
        <View style={styles.labels}>
          <Text style={s.small}>Performance</Text>
          <Text style={[s.small, styles.positive]}>
            {security.change > 0 ? '+' : ''}
            {security.change.toLocaleString('it-IT')}%
          </Text>
        </View>
        <View style={styles.band} />
        <View style={styles.labels}>
          <Text style={styles.range}>Min. {format(Math.min(...prices))}</Text>
          <Text style={styles.range}>Max. {format(Math.max(...prices))}</Text>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  chart: { gap: 20, overflow: 'hidden' },
  advanced: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  periods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 120,
    padding: 4,
  },
  period: { paddingVertical: 6, paddingHorizontal: 8, borderRadius: 120 },
  selected: { backgroundColor: '#fff' },
  selectedText: { color: '#262626' },
  plot: {
    position: 'relative',
    paddingTop: 20,
    minHeight: 180,
    overflow: 'hidden',
  },
  axis: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'space-around',
  },
  axisText: {
    fontFamily: 'UniCredit-regular',
    fontSize: 10,
    lineHeight: 14,
    color: '#666',
  },
  axisX: { flexDirection: 'row', justifyContent: 'space-between' },
  performance: { gap: 8 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  positive: { color: '#2c8437', fontFamily: 'UniCredit-bold' },
  band: { height: 4, backgroundColor: '#2c8437' },
  range: {
    fontFamily: 'UniCredit-regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#262626',
  },
});
