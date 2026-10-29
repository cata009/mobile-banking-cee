import React, { useId, useRef, useState } from 'react';
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
  selectionControl?: { onPress: () => void; expanded: boolean };
  maxLength?: number;
  inputMode?: TextInputProps['inputMode'];
  secureTextEntry?: boolean;
  inputRef?: React.RefObject<React.ComponentRef<typeof TextInput> | null>;
  ariaLabel?: string;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  suffix?: string;
  suffixOutsideDivider?: boolean;
  trailingIconColor?: string;
  /** Existing Source artwork may be composed in the standard trailing slot. */
  trailingIcon?: React.ReactNode;
  trailingIconSize?: number;
  /** Calendar fields use a 24px icon with an 8px gap; other fields retain 32px + 12px. */
  trailingIconLayout?: 'standard' | 'compact';
  trailingIconAction?: { ariaLabel: string; onClick: () => void };
  dark?: boolean;
  /** Amount placeholders sit on the baseline; default empty labels are centered. */
  emptyValueAlignment?: 'center' | 'end';
}

/** Isolated leaf renderer. Owner formatting, validation and navigation stay outside. */
export function BaselineTextField(props: BaselineTextFieldProps) {
  const [focused, setFocused] = useState(false);
  const helperId = `field-help-${useId().replace(/:/g, '')}`;
  const input = useRef<React.ComponentRef<typeof TextInput>>(null);
  const state = resolveTextField({ ...props, isFocused: focused });
  const hasTrailingIcon = Boolean(props.trailingIcon || props.trailingIconName);
  const iconSlotSize =
    props.trailingIconLayout === 'compact' ? 24 : state.iconSlot;
  const trailingInset = props.trailingIconLayout === 'compact' ? 32 : 44;
  const activate = () => {
    if (!state.isDisabled) props.onActivate?.();
  };
  const color = (value: string) => sourceColor(value, props.dark);
  const formStyle0 = {
    fontFamily: 'UniCredit-regular',
    fontSize: state.valueFontSize,
    color: color(state.valueColor),
    marginLeft: props.suffixOutsideDivider ? 12 : 8,
  } as const;
  const formStyle1 = {
    width: iconSlotSize,
    height: iconSlotSize,
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
  const formStyle2 = { width: '100%' } as const;
  const formStyle3 = { position: 'relative' } as const;
  const formStyle4 = {
    fontFamily: 'UniCredit-regular',
    fontSize: state.labelFontSize,
    lineHeight: state.labelLineHeight,
    color: color(state.labelColor),
  } as const;
  const formStyle5 = {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: state.shouldFloatLabel ? state.labelGap : 0,
    paddingRight: hasTrailingIcon ? trailingInset : 0,
  } as const;
  const formStyle6 = {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems:
      state.shouldFloatLabel || props.emptyValueAlignment === 'end'
        ? 'flex-end'
        : 'center',
    borderBottomWidth: focused && !state.isDisabled ? 1 : state.dividerWidth,
    borderBottomColor: color(
      focused && !state.isDisabled && !state.isError
        ? 'var(--uc-action)'
        : state.dividerColor,
    ),
    paddingBottom: state.shouldFloatLabel ? 4 : 6,
    minHeight: state.shouldFloatLabel ? undefined : 44 + state.dividerWidth,
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
    lineHeight: state.valueLineHeight,
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
  const formStyle12 = {
    position: 'absolute',
    right: 0,
    top: 6,
    width: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  } as const;
  const formStyle13 = {
    marginTop: state.helperGap,
    gap: state.helperLineGap,
    marginRight:
      hasTrailingIcon && props.trailingIconPlacement !== 'floating'
        ? trailingInset
        : 0,
  } as const;
  const formStyle14 = {
    fontFamily: 'UniCredit-regular',
    fontSize: state.helperFontSize,
    lineHeight: state.helperLineHeight,
    color: color(state.helperColor),
  } as const;
  const formStyle15 = {
    fontFamily: 'UniCredit-regular',
    fontSize: state.helperFontSize,
    lineHeight: state.helperLineHeight,
    color: color(state.helperColor),
  } as const;
  const iconActionStyle = {
    width: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  } as const;
  const selectionStyle = {
    flex: 1,
    minHeight: state.shouldFloatLabel ? 20 : 44,
    justifyContent: 'center',
  } as const;
  const suffix = props.suffix ? (
    <Text style={formStyle0}>{props.suffix}</Text>
  ) : null;
  const icon =
    props.trailingIcon ??
    (props.trailingIconName ? (
      <SourceCustomIcon
        name={props.trailingIconName}
        size={props.trailingIconSize ?? 20}
        color={color(
          state.isDisabled
            ? state.iconColor
            : props.trailingIconColor ?? state.iconColor,
        )}
      />
    ) : null);
  const iconSlot = <View style={formStyle1}>{icon}</View>;
  const accessory =
    props.trailingIconAction && hasTrailingIcon ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={props.trailingIconAction.ariaLabel}
        accessibilityState={{ disabled: state.isDisabled }}
        disabled={state.isDisabled}
        style={iconActionStyle}
        onPress={event => {
          event.stopPropagation();
          if (!state.isDisabled) props.trailingIconAction?.onClick();
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
      disabled={state.isDisabled}
      onPress={activate}
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
            {state.isMultiple && !props.selectionControl ? (
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
            ) : props.selectionControl ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  props.ariaLabel ??
                  `${props.label}: ${props.value || 'Choose an option'}`
                }
                accessibilityState={{
                  disabled: state.isDisabled,
                  expanded: props.selectionControl.expanded,
                }}
                disabled={state.isDisabled}
                onPress={props.selectionControl.onPress}
                onFocus={() => {
                  if (!state.isDisabled) {
                    setFocused(true);
                    props.onFocus?.();
                  }
                }}
                onBlur={() => {
                  setFocused(false);
                  props.onBlur?.();
                }}
                aria-invalid={props.ariaInvalid ?? (state.isError || undefined)}
                aria-describedby={
                  props.ariaDescribedBy ??
                  (state.descriptionText1 || state.descriptionText2
                    ? helperId
                    : undefined)
                }
                style={selectionStyle}
              >
                {state.isMultiple ? (
                  <View style={formStyle7}>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={formStyle8}
                    >
                      {state.displayedMultipleValues}
                    </Text>
                    <Text style={formStyle9}>
                      ({state.effectiveMultipleCount})
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      formStyle8,
                      {
                        color: color(
                          state.hasValue
                            ? state.valueColor
                            : state.placeholderColor,
                        ),
                      },
                    ]}
                  >
                    {props.value || state.inputPlaceholder}
                  </Text>
                )}
              </Pressable>
            ) : (
              <TextInput
                ref={node => {
                  input.current = node;
                  if (props.inputRef) props.inputRef.current = node;
                }}
                value={state.hasValue ? props.value : ''}
                placeholder={state.inputPlaceholder}
                placeholderTextColor={color(state.placeholderColor)}
                editable={!state.isDisabled && !props.readOnly}
                accessibilityLabel={props.ariaLabel ?? props.label}
                accessibilityState={{ disabled: state.isDisabled }}
                aria-disabled={state.isDisabled}
                aria-invalid={props.ariaInvalid ?? (state.isError || undefined)}
                aria-describedby={
                  props.ariaDescribedBy ??
                  (state.descriptionText1 || state.descriptionText2
                    ? helperId
                    : undefined)
                }
                inputMode={props.inputMode}
                secureTextEntry={props.secureTextEntry}
                maxLength={props.maxLength}
                onChangeText={next => {
                  if (!state.isDisabled) props.onChange(next);
                }}
                onFocus={() => {
                  if (state.isDisabled) return;
                  setFocused(true);
                  props.onFocus?.();
                }}
                onBlur={() => {
                  setFocused(false);
                  props.onBlur?.();
                }}
                onSubmitEditing={activate}
                onKeyPress={event => {
                  if (event.nativeEvent.key === ' ' && props.onActivate)
                    activate();
                }}
                style={formStyle10}
              />
            )}
            {!props.suffixOutsideDivider ? suffix : null}
          </Pressable>
          {props.suffixOutsideDivider ? suffix : null}
        </View>
        {hasTrailingIcon ? <View style={formStyle12}>{accessory}</View> : null}
        {state.descriptionText1 || state.descriptionText2 ? (
          <View
            nativeID={helperId}
            accessibilityLiveRegion={state.isError ? 'polite' : undefined}
            style={formStyle13}
          >
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
