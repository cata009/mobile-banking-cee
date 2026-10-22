import React, { forwardRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  View,
  type TextInputProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { Text, TextInput } from './Typography';
import type { Themed } from './types';

export const FormField = forwardRef<
  React.ElementRef<typeof TextInput>,
  Themed & {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    inputProps?: Omit<TextInputProps, 'value' | 'onChangeText'>;
    trailingAccessory?: React.ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
  }
>(function FormFieldControl(
  {
    tokens,
    label,
    value,
    onChange,
    error,
    inputProps,
    trailingAccessory,
    containerStyle,
    labelStyle,
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.field, containerStyle]}>
      <Text
        style={[
          styles.label,
          { fontFamily: tokens.font, color: tokens.muted },
          labelStyle,
        ]}
      >
        {label}
      </Text>
      <View style={trailingAccessory ? styles.inputRow : undefined}>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          value={value}
          onChangeText={onChange}
          placeholderTextColor={tokens.muted}
          {...inputProps}
          onFocus={event => {
            setFocused(true);
            inputProps?.onFocus?.(event);
          }}
          onBlur={event => {
            setFocused(false);
            inputProps?.onBlur?.(event);
          }}
          style={[
            styles.input,
            trailingAccessory ? styles.inputWithAccessory : undefined,
            {
              fontFamily: tokens.font,
              color: tokens.text,
              borderColor: tokens.border,
            },
            inputProps?.style,
            focused && styles.focusedInput,
            focused && { borderColor: tokens.accent },
            error && styles.errorInput,
            Platform.OS === 'web' && styles.webInput,
          ]}
        />
        {trailingAccessory ? (
          <View style={styles.inputAccessory}>{trailingAccessory}</View>
        ) : null}
      </View>
      {error && (
        <Text
          accessibilityRole="alert"
          style={[styles.error, { fontFamily: tokens.font }]}
        >
          {error}
        </Text>
      )}
    </View>
  );
});
const styles = StyleSheet.create({
  field: { gap: 8, marginBottom: 24 },
  label: { fontSize: 14, lineHeight: 20 },
  input: {
    minHeight: 48,
    borderBottomWidth: 1,
    fontSize: 18,
    lineHeight: 24,
    paddingVertical: 12,
    includeFontPadding: false,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputWithAccessory: { flex: 1 },
  inputAccessory: { minHeight: 48, justifyContent: 'center' },
  error: { color: '#e2001a', fontSize: 14, lineHeight: 20 },
  errorInput: { borderColor: '#e2001a' },
  focusedInput: { borderBottomWidth: 2 },
  webInput: { outlineWidth: 0 },
});
