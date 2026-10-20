import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { resolveTransactionDivider } from '@/app/components/contracts/transactionDivider';
import { DIVIDER_RULE_343 } from '@/app/components/contracts/dividerArtwork';
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
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 4,
  } as const;
  const textStyle3 = {
    fontFamily: 'UniCredit-bold',
    fontSize: state.fontSize,
    lineHeight: state.lineHeight,
    includeFontPadding: false,
    flex: 1,
    minWidth: 0,
    textTransform: 'uppercase',
    color: color(state.titleToken),
  } as const;
  const textStyle4 = {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: state.totalLineHeight,
    includeFontPadding: false,
    textTransform: 'uppercase',
    textAlign: 'right',
    flexShrink: 0,
    maxWidth: '100%',
    color: color(state.totalToken),
  } as const;
  const viewStyle5 = {
    height: 1,
    alignSelf: 'stretch',
  } as const;
  return (
    <View style={viewStyle1}>
      <View style={viewStyle2}>
        <Text
          accessibilityRole={state.titleRole}
          aria-level={state.titleRole === 'header' ? 2 : undefined}
          style={textStyle3}
        >
          {title}
        </Text>
        {state.hasTotal ? (
          <Text style={textStyle4}>
            {total} {currency}
          </Text>
        ) : null}
      </View>
      {state.hasLine ? (
        <View
          accessible={false}
          aria-hidden
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={viewStyle5}
        >
          <SvgXml xml={DIVIDER_RULE_343} width="100%" height={1} />
        </View>
      ) : null}
    </View>
  );
}
