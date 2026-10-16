import React, { useId, useRef } from 'react';
import { View } from 'react-native';
import {
  resolveCodeField,
  updateCodeSlot,
  backspaceCodeSlot,
  type CodeFieldVisualState,
} from '@/app/components/contracts/codeField';
import { Text, TextInput } from './Typography';
import { sourceColor } from './sourceColor';

/** DS OTP leaf, never substituted for baseline PIN/sign controllers. */
export function BaselineCodeField({
  value,
  onChange,
  length = 4,
  disabled = false,
  visualState,
  errorText,
  errorText2,
  ariaLabel = 'Verification code',
  dark = false,
}: {
  value: string;
  onChange?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  visualState?: CodeFieldVisualState;
  errorText?: string;
  errorText2?: string;
  ariaLabel?: string;
  dark?: boolean;
}) {
  const state = resolveCodeField({
    value,
    length,
    disabled,
    visualState,
    errorText,
    errorText2,
  });
  const refs = useRef<Array<React.ComponentRef<typeof TextInput> | null>>([]);
  const id = useId();
  const helperId = state.isError ? `${id}-message` : undefined;
  const apply = (update: ReturnType<typeof updateCodeSlot>) => {
    if (update.value !== undefined) onChange?.(update.value);
    if (update.focusIndex !== undefined)
      refs.current[update.focusIndex]?.focus();
  };
  const frameStyle = {
    width: '100%' as const,
    maxWidth: 327,
    alignItems: 'center' as const,
  };
  const railStyle = {
    flexDirection: 'row' as const,
    gap: state.gap,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };
  const slotStyle = {
    ...state.slotSize,
    borderWidth: 1,
    borderRadius: state.radius,
    borderColor: sourceColor(`var(${state.borderToken})`, dark),
    color: sourceColor(`var(${state.textToken})`, dark),
    backgroundColor: sourceColor(
      state.isDisabled ? 'var(--uc-surface-muted)' : 'var(--uc-surface)',
      dark,
    ),
    padding: 0,
    textAlign: 'center' as const,
    fontFamily: 'UniCredit-bold',
    fontSize: state.fontSize,
    opacity: 1,
  };
  const helperStyle = {
    width: state.helperWidth,
    gap: state.helperGap,
    marginTop: state.helperTop,
  };
  const errorStyle = {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    color: sourceColor('var(--uc-status-red)', dark),
  };
  return (
    <View
      role="group"
      accessibilityLabel={ariaLabel}
      aria-describedby={helperId}
      style={frameStyle}
    >
      <View style={railStyle}>
        {state.slots.map((slot, index) => (
          <TextInput
            key={index}
            ref={node => {
              refs.current[index] = node;
            }}
            accessibilityLabel={`${ariaLabel} digit ${index + 1} of ${length}`}
            accessibilityState={{ disabled: state.isDisabled }}
            aria-disabled={state.isDisabled}
            aria-invalid={state.isError}
            aria-describedby={helperId}
            editable={!state.isDisabled}
            value={slot}
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            onChangeText={next =>
              apply(
                updateCodeSlot(
                  state.slots,
                  index,
                  next,
                  length,
                  state.isDisabled,
                ),
              )
            }
            onKeyPress={event => {
              const key = event.nativeEvent.key;
              if (key === 'Backspace') {
                event.preventDefault();
                apply(backspaceCodeSlot(state.slots, index, state.isDisabled));
              }
              if (key === 'ArrowLeft' && index > 0) {
                event.preventDefault();
                refs.current[index - 1]?.focus();
              }
              if (key === 'ArrowRight' && index < length - 1) {
                event.preventDefault();
                refs.current[index + 1]?.focus();
              }
            }}
            style={slotStyle}
          />
        ))}
      </View>
      {state.isError && (errorText || errorText2) ? (
        <View nativeID={helperId} style={helperStyle}>
          {errorText ? <Text style={errorStyle}>{errorText}</Text> : null}
          {errorText2 ? <Text style={errorStyle}>{errorText2}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}
