import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Text } from '../../../../../universal/Typography';
import type { AccountTransactionMonthGroup } from '@/data/accountDetails';
import { getEvoMonthReport } from '@/features/accounts-payments/evoAccountActions';
import { tokens, money, Copy, Glyph } from './Primitives';
export default function MonthlyReport({
  group,
  currency,
  hidden,
  onOpen,
}: {
  group: AccountTransactionMonthGroup;
  currency: string;
  hidden: boolean;
  onOpen?: (direction?: 'income' | 'expense') => void;
}) {
  const report = getEvoMonthReport(group),
    absolute = money(Math.abs(report.netTotal), currency, hidden),
    net = `${report.netTotal >= 0 ? '+' : '−'}${absolute}`,
    income = report.incomeTotal,
    expense = report.spendingTotal,
    scale = Math.max(income, expense, 1),
    title = `Total ${group.monthTitle}`;
  const caption =
    income > 0 && report.netTotal > 0
      ? `${absolute} more came in than went out`
      : income > 0 && report.netTotal < 0
      ? `${absolute} more went out than came in`
      : 'Nothing came in this period';
  return (
    <View style={m.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${title} spending`}
        onPress={() => onOpen?.()}
      >
        <Text style={m.title}>{title.toUpperCase()}</Text>
      </Pressable>
      <View style={m.body}>
        <View style={m.label}>
          <Glyph
            name={report.netTotal >= 0 ? 'portfolio-up' : 'portfolio-down'}
            size={16}
          />
          <Copy strong size={16}>
            Net cashflow
          </Copy>
        </View>
        <Text style={m.net}>{net}</Text>
        <Text style={m.caption}>{caption}</Text>
        <View style={m.bars}>
          {[
            {
              value: income,
              color: '#2fa358',
            },
            {
              value: expense,
              color: tokens.text,
            },
          ].map((flow, index) => (
            <View key={index} style={m.track}>
              <View
                style={[
                  m.fill,
                  {
                    width: `${Math.max(
                      (flow.value / scale) * 100,
                      flow.value > 0 ? 2 : 0,
                    )}%`,
                    backgroundColor: flow.color,
                  },
                ]}
              />
            </View>
          ))}
        </View>
        <View style={m.flows}>
          {[
            {
              direction: 'income' as const,
              label: 'Money in',
              value: income,
            },
            {
              direction: 'expense' as const,
              label: 'Money out',
              value: expense,
            },
          ].map(flow => (
            <Pressable
              key={flow.direction}
              accessibilityRole="button"
              accessibilityLabel={flow.label}
              onPress={() => onOpen?.(flow.direction)}
            >
              <Copy muted size={14}>
                {flow.label}
              </Copy>
              <Copy strong size={16}>
                {money(flow.value, currency, hidden)}
              </Copy>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
const m = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    padding: 8,
    backgroundColor: tokens.surface,
    borderRadius: 8,
  },
  title: {
    paddingHorizontal: 8,
    paddingTop: 4,
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 0.9,
    color: tokens.accent,
  },
  body: {
    padding: 8,
    paddingTop: 16,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  net: {
    marginTop: 2,
    fontFamily: tokens.strongFont,
    fontSize: 20,
    lineHeight: 24,
    color: tokens.text,
  },
  caption: {
    marginTop: 4,
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 18,
    color: '#676767',
  },
  bars: {
    marginTop: 16,
    gap: 8,
  },
  track: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e9e9e9',
    overflow: 'hidden',
  },
  fill: {
    height: 12,
    borderRadius: 6,
  },
  flows: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
