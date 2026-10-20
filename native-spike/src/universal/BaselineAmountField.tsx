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
    currencyIconSize?: number;
    onCurrencyClick?: () => void;
    currencyPresentation?: 'selector' | 'suffix';
  },
) {
  const state = resolveAmountField(props);
  const formStyle0 = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: state.gap,
    width: '100%',
    paddingRight: state.trailingInset,
  } as const;
  const formStyle1 = { flex: 1, minWidth: 0 } as const;
  const formStyle2 = {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 44,
  } as const;
  const formStyle3 = { minWidth: state.currencyMinimumWidth } as const;
  const formStyle4 = {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 15,
    color: sourceColor(state.currencyTitleColor, props.dark),
  } as const;
  const formStyle5 = {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 20,
    marginTop: state.currencyLabelGap,
    color: sourceColor(state.currencyColor, props.dark),
  } as const;
  const formStyle6 = {
    width: state.iconSlot,
    height: state.iconSlot,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
  if (props.currencyPresentation === 'suffix')
    return (
      <View style={suffixStyles.row}>
        <View style={formStyle1}>
          <BaselineTextField {...props} emptyValueAlignment="end" />
        </View>
        <Text style={[formStyle5, suffixStyles.value]}>{state.currency}</Text>
      </View>
    );
  return (
    <View style={formStyle0}>
      <View style={formStyle1}>
        <BaselineTextField {...props} emptyValueAlignment="end" />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          props.currencyAriaLabel ?? `${state.currencyLabel}: ${state.currency}`
        }
        accessibilityState={{ disabled: state.isDisabled }}
        aria-disabled={state.isDisabled}
        disabled={state.isDisabled}
        hitSlop={6}
        onPress={() => {
          if (!state.isDisabled) props.onCurrencyClick?.();
        }}
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
              size={props.currencyIconSize ?? 20}
              color={sourceColor(state.currencyIconColor, props.dark)}
            />
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
const suffixStyles = {
  row: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    gap: 8,
    width: '100%' as const,
  },
  value: {
    fontFamily: 'UniCredit-bold',
    marginTop: 0,
    lineHeight: 20,
    paddingBottom: 5,
  },
};
