import React from 'react';
import { View } from 'react-native';
import { resolveAccountInfoField } from '@/app/components/contracts/accountInfoField';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';
export function BaselineAccountInfoField({
  title,
  subtitle,
  trailingIcon,
  dark = false,
}: {
  title: string;
  subtitle: string;
  trailingIcon?: React.ReactNode;
  dark?: boolean;
}) {
  const state = resolveAccountInfoField({ hasTrailing: Boolean(trailingIcon) }),
    color = sourceColor(`var(${state.textToken})`, dark),
    shell = {
      height: state.height,
      width: '100%' as const,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: state.hasTrailing ? state.gap : undefined,
    };
  const text = {
      fontFamily: 'UniCredit-regular',
      fontSize: state.fontSize,
      color,
    },
    strong = { ...text, fontFamily: 'UniCredit-bold' };
  const viewStyle1 = { flex: 1, minWidth: 0, gap: state.textGap } as const;
  const textStyle2 = [text, { textTransform: 'uppercase' }] as const;
  const viewStyle3 = {
    width: state.trailingSlot,
    height: state.trailingSlot,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
  return (
    <View style={shell}>
      <View style={viewStyle1}>
        <Text style={textStyle2}>{title}</Text>
        <Text style={strong}>{subtitle}</Text>
      </View>
      {state.hasTrailing ? (
        <View style={viewStyle3}>{trailingIcon}</View>
      ) : null}
    </View>
  );
}
