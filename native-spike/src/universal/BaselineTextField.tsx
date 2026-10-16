import React, { useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  View,
  type TextInputProps,
  type TextStyle,
} from 'react-native';
import {
  resolveTextField,
  type TextFieldOptions,
} from '@/app/components/contracts/textField';
import { Text, TextInput } from './Typography';
import { SourceCustomIcon } from './SourceCustomIcon';
import { sourceColor } from './sourceColor';

export interface BaselineTextFieldProps extends TextFieldOptions {
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onActivate?: () => void;
  readOnly?: boolean;
  maxLength?: number;
  inputMode?: TextInputProps['inputMode'];
  ariaLabel?: string;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  suffix?: string;
  suffixOutsideDivider?: boolean;
  trailingIconColor?: string;
  trailingIconAction?: { ariaLabel: string; onClick: () => void };
  dark?: boolean;
}

/** Isolated leaf renderer. Owner formatting, validation and navigation stay outside. */
export function BaselineTextField(props: BaselineTextFieldProps) {
  const [focused, setFocused] = useState(false);
  const input = useRef<React.ComponentRef<typeof TextInput>>(null);
  const state = resolveTextField({ ...props, isFocused: focused });
  const color = (value: string) => sourceColor(value, props.dark);
  const formStyle0 = {
    fontFamily: 'UniCredit-regular',
    fontSize: state.valueFontSize,
    color: color(state.valueColor),
    marginLeft: props.suffixOutsideDivider ? 12 : 8,
  } as const;
  const formStyle1 = {
    width: state.iconSlot,
    height: state.iconSlot,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
  const formStyle2 = { width: '100%' } as const;
  const formStyle3 = { position: 'relative' } as const;
  const formStyle4 = {
    fontFamily: 'UniCredit-regular',
    fontSize: state.labelFontSize,
    color: color(state.labelColor),
  } as const;
  const formStyle5 = {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: state.shouldFloatLabel ? state.labelGap : 0,
    paddingRight: state.hasFloatingTrailingIcon ? 44 : 0,
  } as const;
  const formStyle6 = {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderBottomWidth: state.dividerWidth,
    borderBottomColor: color(state.dividerColor),
    paddingBottom: 3,
  } as const;
  const formStyle7 = {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  } as const;
  const formStyle8 = {
    flex: 1,
    fontFamily: 'UniCredit-regular',
    fontSize: state.valueFontSize,
    color: color(state.valueColor),
  } as const;
  const formStyle9 = {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    color: color(state.valueColor),
  } as const;
  const formStyle10 = {
    flex: 1,
    minWidth: 0,
    padding: 0,
    fontFamily: 'UniCredit-regular',
    fontSize: state.valueFontSize,
    color: color(state.valueColor),
    ...(Platform.OS === 'web' ? { outlineWidth: 0, outlineStyle: 'none' } : {}),
  } as TextStyle;
  const formStyle11 = { marginLeft: state.iconGap } as const;
  const formStyle12 = {
    position: 'absolute',
    right: 0,
    top: state.shouldFloatLabel ? 12 : 0,
  } as const;
  const formStyle13 = {
    marginTop: state.helperGap,
    marginRight:
      props.trailingIconName && props.trailingIconPlacement !== 'floating'
        ? 44
        : 0,
  } as const;
  const formStyle14 = {
    fontFamily: 'UniCredit-regular',
    fontSize: state.helperFontSize,
    color: color(state.helperColor),
  } as const;
  const formStyle15 = {
    fontFamily: 'UniCredit-regular',
    fontSize: state.helperFontSize,
    color: color(state.helperColor),
  } as const;
  const suffix = props.suffix ? (
    <Text style={formStyle0}>{props.suffix}</Text>
  ) : null;
  const icon = props.trailingIconName ? (
    <SourceCustomIcon
      name={props.trailingIconName}
      size={20}
      color={color(props.trailingIconColor ?? state.valueColor)}
    />
  ) : null;
  const iconSlot = <View style={formStyle1}>{icon}</View>;
  const accessory =
    props.trailingIconAction && props.trailingIconName ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={props.trailingIconAction.ariaLabel}
        onPress={event => {
          event.stopPropagation();
          props.trailingIconAction?.onClick();
        }}
      >
        {iconSlot}
      </Pressable>
    ) : (
      iconSlot
    );
  return (
    <Pressable
      {...(Platform.OS === 'web'
        ? { tabIndex: -1, role: 'presentation' as const }
        : {})}
      onPress={props.onActivate}
      style={formStyle2}
    >
      <View style={formStyle3}>
        {state.shouldFloatLabel ? (
          <Text style={formStyle4} numberOfLines={2}>
            {props.label}
          </Text>
        ) : null}
        <View style={formStyle5}>
          <Pressable
            {...(Platform.OS === 'web'
              ? { tabIndex: -1, role: 'presentation' as const }
              : {})}
            onPress={() => {
              if (!state.isDisabled && !state.isMultiple)
                input.current?.focus();
            }}
            style={formStyle6}
          >
            {state.isMultiple ? (
              <View style={formStyle7}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={formStyle8}>
                  {state.displayedMultipleValues}
                </Text>
                {state.effectiveMultipleCount > 0 ? (
                  <Text style={formStyle9}>
                    ({state.effectiveMultipleCount})
                  </Text>
                ) : null}
              </View>
            ) : (
              <TextInput
                ref={input}
                value={state.hasValue ? props.value : ''}
                placeholder={state.inputPlaceholder}
                placeholderTextColor={color(
                  state.shouldFloatLabel
                    ? 'var(--uc-text-subtle)'
                    : state.isDisabled
                    ? 'var(--uc-neutral-650)'
                    : 'var(--uc-text)',
                )}
                editable={!state.isDisabled && !props.readOnly}
                accessibilityLabel={props.ariaLabel ?? props.label}
                accessibilityState={{ disabled: state.isDisabled }}
                aria-disabled={state.isDisabled}
                aria-invalid={props.ariaInvalid || undefined}
                aria-describedby={props.ariaDescribedBy}
                inputMode={props.inputMode}
                maxLength={props.maxLength}
                onChangeText={props.onChange}
                onFocus={() => {
                  setFocused(true);
                  props.onFocus?.();
                }}
                onBlur={() => {
                  setFocused(false);
                  props.onBlur?.();
                }}
                onSubmitEditing={props.onActivate}
                onKeyPress={event => {
                  if (event.nativeEvent.key === ' ' && props.onActivate)
                    props.onActivate();
                }}
                style={formStyle10}
              />
            )}
            {!props.suffixOutsideDivider ? suffix : null}
          </Pressable>
          {props.suffixOutsideDivider ? suffix : null}
          {!state.hasFloatingTrailingIcon &&
          (props.trailingIconName || !props.suffixOutsideDivider) ? (
            <View style={formStyle11}>{accessory}</View>
          ) : null}
        </View>
        {state.hasFloatingTrailingIcon ? (
          <View style={formStyle12}>{accessory}</View>
        ) : null}
        {state.descriptionText1 || state.descriptionText2 ? (
          <View style={formStyle13}>
            {state.descriptionText1 ? (
              <Text style={formStyle14}>{state.descriptionText1}</Text>
            ) : null}
            {state.descriptionText2 ? (
              <Text style={formStyle15}>{state.descriptionText2}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
