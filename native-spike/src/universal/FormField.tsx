import React, { forwardRef } from 'react';
import {
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
    containerStyle,
    labelStyle,
  },
  ref,
) {
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
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        placeholderTextColor={tokens.muted}
        {...inputProps}
        style={[
          styles.input,
          {
            fontFamily: tokens.font,
            color: tokens.text,
            borderColor: tokens.border,
          },
          error && styles.errorInput,
          inputProps?.style,
        ]}
      />
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
  error: { color: '#e2001a', fontSize: 14, lineHeight: 20 },
  errorInput: { borderColor: '#e2001a' },
});
