import React from 'react';
import { View } from 'react-native';
import { resolveTransactionDivider } from '@/app/components/contracts/transactionDivider';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';
export function BaselineTransactionDivider({
  title,
  total,
  currency,
  dateSeparator = false,
  dark = false,
}: {
  title: string;
  total?: string;
  currency: string;
  dateSeparator?: boolean;
  dark?: boolean;
}) {
  const state = resolveTransactionDivider({ dateSeparator, total });
  const color = (token: string) => sourceColor(`var(${token})`, dark);
  const viewStyle1 = {
    paddingHorizontal: state.paddingHorizontal,
    paddingVertical: state.paddingVertical,
    gap: state.gap,
  } as const;
  const viewStyle2 = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as const;
  const textStyle3 = {
    fontFamily: 'UniCredit-bold',
    fontSize: state.fontSize,
    textTransform: 'uppercase',
    color: color(state.titleToken),
  } as const;
  const textStyle4 = {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    textTransform: 'uppercase',
    textAlign: 'right',
    color: color(state.totalToken),
  } as const;
  const viewStyle5 = {
    height: 1,
    backgroundColor: color(state.lineToken),
  } as const;
  return (
    <View style={viewStyle1}>
      <View style={viewStyle2}>
        <Text style={textStyle3}>{title}</Text>
        {state.hasTotal ? (
          <Text style={textStyle4}>
            {total} {currency}
          </Text>
        ) : null}
      </View>
      {state.hasLine ? <View style={viewStyle5} /> : null}
    </View>
  );
}
