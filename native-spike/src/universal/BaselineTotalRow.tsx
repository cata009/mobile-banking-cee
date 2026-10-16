import React from 'react';
import { View } from 'react-native';
import { resolveTotalRow } from '@/app/components/contracts/totalRow';
import type {
  ProductCardVariant,
  ProductCardStyle,
} from '@/app/components/contracts/productCard';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';
export function BaselineTotalRow({
  integer,
  decimals,
  currency,
  label = 'Total',
  variant,
  productStyle,
  dark = false,
}: {
  integer: string;
  decimals: string;
  currency: string;
  label?: string;
  variant?: ProductCardVariant;
  productStyle?: ProductCardStyle;
  dark?: boolean;
}) {
  const state = resolveTotalRow({ variant, productStyle }),
    color = sourceColor(`var(${state.textToken})`, dark);
  const shell = {
    width: state.width,
    alignSelf: 'stretch' as const,
    padding: state.padding,
    borderBottomLeftRadius: state.bottomRadius,
    borderBottomRightRadius: state.bottomRadius,
    backgroundColor: state.backgroundToken
      ? sourceColor(`var(${state.backgroundToken})`, dark)
      : undefined,
    flexDirection: state.evolution ? ('column' as const) : ('row' as const),
    alignItems: state.evolution ? ('stretch' as const) : ('baseline' as const),
    justifyContent: 'space-between' as const,
    gap: state.gap,
  };
  const labelStyle = {
    fontFamily: 'UniCredit-regular',
    fontSize: state.titleFontSize,
    lineHeight:
      typeof state.titleLineHeight === 'number'
        ? state.titleLineHeight
        : undefined,
    color,
  };
  const amountStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: state.amountFontSize,
    lineHeight:
      typeof state.amountLineHeight === 'number'
        ? state.amountLineHeight
        : undefined,
    color,
  };
  const decimalsStyle = {
    fontFamily: 'UniCredit-regular',
    fontSize: state.decimalsFontSize,
    lineHeight:
      typeof state.decimalsLineHeight === 'number'
        ? state.decimalsLineHeight
        : undefined,
    color,
  };
  const amountShell = {
    flexDirection: 'row' as const,
    alignItems: 'baseline' as const,
    justifyContent: 'flex-end' as const,
  };
  return (
    <View style={shell}>
      <Text style={labelStyle}>{label}</Text>
      <View style={amountShell}>
        <Text style={amountStyle}>{integer}</Text>
        <Text style={decimalsStyle}>
          {decimals} {currency}
        </Text>
      </View>
    </View>
  );
}
