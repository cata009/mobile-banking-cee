import React from 'react';
import { Pressable, View } from 'react-native';
import type { Product } from '@/data/products';
import type { AccountTransactionMonthGroup } from '@/data/accountDetails';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import { getEvoMonthReport } from '@/features/accounts-payments/evoAccountActions';
import type { CurrentScreenProps } from '../contracts';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';

/** Source AccountMonthlyReport baseline branch and MonthlyCashFlowChart geometry. */
export function RoBaselineMonthlyReport({
  host,
  product,
  group,
}: {
  host: CurrentScreenProps;
  product: Product;
  group: AccountTransactionMonthGroup;
}) {
  const { incomeTotal, spendingTotal } = getEvoMonthReport(group),
    maximum = Math.max(incomeTotal, spendingTotal, 1);
  const incomeHeight = Math.max(18, Math.round((incomeTotal / maximum) * 104)),
    expenseHeight = Math.max(18, Math.round((spendingTotal / maximum) * 104));
  const surface = sourceColor(
    'var(--uc-surface)',
    host.tokens.background === sourceColor('var(--uc-app-bg)', true),
  );
  const open = (direction?: 'income' | 'expense') => {
    return host.onNavigate({
      screen: 'pfm',
      params: {
        scopeId: product.id,
        ...(direction ? { direction } : {}),
      },
    });
  };
  const strong = {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 15,
    color: host.tokens.text,
  } as const;
  const muted = {
    ...strong,
    color: host.tokens.muted,
    textTransform: 'uppercase' as const,
  };
  const sourceStyle0 = {
    paddingTop: 8,
    backgroundColor: surface,
  } as const;
  const sourceStyle1 = {
    height: 24,
    paddingTop: 1,
  } as const;
  const sourceStyle2 = {
    paddingHorizontal: 24,
  } as const;
  const sourceStyle3 = {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 20,
    color: host.tokens.text,
  } as const;
  const sourceStyle4 = {
    height: 172,
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    paddingTop: 18,
  } as const;
  const sourceStyle5 = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 120,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: host.tokens.border,
  } as const;
  const sourceStyle6 = {
    position: 'absolute',
    left: 8,
    top: 58,
    width: 100,
  } as const;
  const sourceStyle7 = {
    textAlign: 'right',
  } as const;
  const sourceStyle8 = {
    marginTop: 4,
    textAlign: 'right',
  } as const;
  const sourceStyle9 = {
    position: 'absolute',
    left: 137,
    top: 120 - incomeHeight,
    width: 16,
    height: incomeHeight,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: host.tokens.accent,
  } as const;
  const sourceStyle10 = {
    position: 'absolute',
    left: 167,
    top: 120 - expenseHeight,
    width: 16,
    height: expenseHeight,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: host.tokens.text,
  } as const;
  const sourceStyle11 = {
    position: 'absolute',
    left: 201,
    top: 74,
    width: 111,
  } as const;
  const sourceStyle12 = {
    marginTop: 4,
  } as const;
  const sourceStyle13 = {
    position: 'absolute',
    left: 82,
    top: 136,
    width: 68,
    textAlign: 'right',
    textTransform: 'uppercase',
  } as const;
  const sourceStyle14 = {
    position: 'absolute',
    left: 166,
    top: 136,
    textTransform: 'uppercase',
  } as const;
  return (
    <View
      testID={`monthly-report-${group.monthKey}`}
      accessibilityLabel={`Monthly report for ${group.monthTitle}`}
      style={sourceStyle0}
    >
      {/* Source's16px/24px inline strut places its20px heading1px below the line top. */}
      <View style={sourceStyle1}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${group.monthTitle} spending`}
          onPress={() => {
            return open();
          }}
          style={sourceStyle2}
        >
          <Text style={sourceStyle3}>Monthly report</Text>
        </Pressable>
      </View>
      <View style={sourceStyle4}>
        <View style={sourceStyle5} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open income analytics"
          onPress={() => {
            return open('income');
          }}
          style={sourceStyle6}
        >
          <Text style={[muted, sourceStyle7]}>
            {host.t('runtime.analytics.inflow', 'Inflow')}
          </Text>
          <Text style={[strong, sourceStyle8]}>
            {formatMoneyNumber(incomeTotal, host.country)} {product.currency}
          </Text>
        </Pressable>
        <View style={sourceStyle9} />
        <View style={sourceStyle10} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open expenses analytics"
          onPress={() => {
            return open('expense');
          }}
          style={sourceStyle11}
        >
          <Text style={muted}>
            {host.t('runtime.analytics.outflow', 'Outflow')}
          </Text>
          <Text style={[strong, sourceStyle12]}>
            {formatMoneyNumber(spendingTotal, host.country)} {product.currency}
          </Text>
        </Pressable>
        <Text style={[strong, sourceStyle13]}>
          {host.t('runtime.analytics.incomes', 'Incomes')}
        </Text>
        <Text style={[strong, sourceStyle14]}>
          {host.t('runtime.analytics.spendings', 'Spendings')}
        </Text>
      </View>
    </View>
  );
}
