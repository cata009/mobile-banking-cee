import React from 'react';
import { Pressable, View } from 'react-native';
import { resolveAmountField } from '@/app/components/contracts/amountField';
import {
  BaselineTextField,
  type BaselineTextFieldProps,
} from './BaselineTextField';
import { Text } from './Typography';
import { SourceCustomIcon } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';

export function BaselineAmountField(
  props: BaselineTextFieldProps & {
    currency?: string;
    currencyLabel?: string;
    hideCurrencySelector?: boolean;
    currencyIconName?: string;
    currencyAriaLabel?: string;
    onCurrencyClick?: () => void;
  },
) {
  const state = resolveAmountField(props);
  const formStyle0 = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: state.gap,
    width: '100%',
  } as const;
  const formStyle1 = { flex: 1, minWidth: 0 } as const;
  const formStyle2 = { flexDirection: 'row', alignItems: 'center' } as const;
  const formStyle3 = { minWidth: state.currencyMinimumWidth } as const;
  const formStyle4 = {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    color: sourceColor(state.currencyTitleColor, props.dark),
  } as const;
  const formStyle5 = {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    marginTop: 4,
    color: sourceColor(state.currencyColor, props.dark),
  } as const;
  const formStyle6 = {
    width: state.iconSlot,
    height: state.iconSlot,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
  return (
    <View style={formStyle0}>
      <View style={formStyle1}>
        <BaselineTextField {...props} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          props.currencyAriaLabel ?? `${state.currencyLabel}: ${state.currency}`
        }
        accessibilityState={{ disabled: state.isDisabled }}
        aria-disabled={state.isDisabled}
        disabled={state.isDisabled}
        onPress={props.onCurrencyClick}
        style={formStyle2}
      >
        <View style={formStyle3}>
          <Text style={formStyle4}>{state.currencyLabel}</Text>
          <Text style={formStyle5}>{state.currency}</Text>
        </View>
        {!state.hideCurrencySelector ? (
          <View style={formStyle6}>
            <SourceCustomIcon
              name={props.currencyIconName ?? 'chevron-down-wide'}
              size={20}
              color={sourceColor(state.currencyColor, props.dark)}
            />
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
