import React from 'react';
import { StyleSheet, View } from 'react-native';
import { formatInvestmentAmountParts } from '@/app/utils/investmentAmountFormatting';
import { Copy } from './Primitives';

type Scale =
  | 'hero'
  | 'portfolio'
  | 'summary'
  | 'card'
  | 'field'
  | 'list'
  | 'transaction'
  | 'compact';
const sizes: Record<Scale, readonly [number, number, number, number]> = {
  hero: [30, 30, 20, 20],
  portfolio: [26, 30, 16, 20],
  summary: [20, 24, 14, 15.5],
  card: [20, 22, 14, 15.5],
  field: [18, 20, 14, 18],
  list: [20, 24, 14, 17],
  transaction: [14, 15.5, 14, 15.5],
  compact: [14, 18, 14, 18],
};
export function Amount({
  value,
  currency,
  hidden = false,
  scale = 'summary',
  signed = false,
}: {
  value: number;
  currency: string;
  hidden?: boolean;
  scale?: Scale;
  signed?: boolean;
}) {
  const parts = formatInvestmentAmountParts(
      value,
      'CZ',
      currency,
      hidden,
      signed,
    ),
    size = sizes[scale];
  return (
    <View style={s.row}>
      <Copy
        strong={scale !== 'compact'}
        style={{ fontSize: size[0], lineHeight: size[1] }}
      >
        {parts.integer}
      </Copy>
      <Copy
        strong={scale === 'transaction'}
        style={{ fontSize: size[2], lineHeight: size[3] }}
      >
        {parts.decimal}
      </Copy>
      {parts.currency ? (
        <Copy
          strong={scale === 'transaction'}
          style={[s.currency, { fontSize: size[2], lineHeight: size[3] }]}
        >
          {parts.currency}
        </Copy>
      ) : null}
    </View>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', flexShrink: 1 },
  currency: { marginLeft: 4 },
});
