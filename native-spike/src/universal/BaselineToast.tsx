import React from 'react';
import { View, type ViewStyle } from 'react-native';
import {
  resolveToast,
  type ToastMessageVariant,
} from '@/app/components/contracts/toast';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';

export { TOAST_MESSAGE_SOURCE } from '@/app/components/contracts/toast';

export function BaselineToast({
  variant = 'action-required',
  message,
  dark,
  themeDark = false,
}: {
  variant?: ToastMessageVariant;
  message?: string;
  dark?: boolean;
  themeDark?: boolean;
}) {
  const contract = resolveToast({ variant, message, dark });
  const rootStyle: ViewStyle = {
    width: contract.width,
    height: contract.height,
    borderRadius: contract.radius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: contract.googlePay ? 'center' : undefined,
    paddingVertical: 10,
    paddingHorizontal: contract.googlePay ? 27 : undefined,
    paddingRight: contract.googlePay ? 27 : 8,
    gap: contract.googlePay ? undefined : contract.gap,
    backgroundColor: contract.dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.06)',
  };
  const slotStyle: ViewStyle = {
    width: contract.slotSize,
    height: contract.slotSize,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const dotStyle = {
    width: contract.dotSize,
    height: contract.dotSize,
    borderRadius: 4,
    backgroundColor: sourceColor('var(--uc-status-red)', themeDark),
  };
  const textStyle = {
    fontFamily: 'UniCredit-bold',
    fontSize: contract.fontSize,
    color: sourceColor(
      contract.dark
        ? 'var(--uc-static-white)'
        : `var(--uc-primary-k0, ${sourceColor(
            'var(--uc-static-black)',
            themeDark,
          )})`,
      themeDark,
    ),
    flex: contract.googlePay ? undefined : 1,
    minWidth: 0,
  };
  return (
    <View role="status" accessibilityLiveRegion="polite" style={rootStyle}>
      {contract.showDot && (
        <View style={slotStyle}>
          <View style={dotStyle} />
        </View>
      )}
      <Text numberOfLines={1} style={textStyle}>
        {contract.label}
      </Text>
    </View>
  );
}
