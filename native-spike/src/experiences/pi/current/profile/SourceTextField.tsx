import React, { useState } from 'react';
import { Pressable, StyleSheet, View, type TextInputProps } from 'react-native';
import { TextInput } from '../../../../universal/Typography';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { Copy, useCurrentTokens } from './Primitives';
import { sourceColor } from '../../../../universal/sourceColor';
/** Source TextField floating label,32px accessory slot,0.5px divider and6px helper spacing. */
export function SourceTextField({
  label,
  value,
  onChange,
  helperText,
  visualState,
  trailingIconName,
  onActivate,
  inputProps,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  visualState?:
    | 'empty'
    | 'on-focus'
    | 'filled'
    | 'disabled-empty'
    | 'disabled-filled';
  trailingIconName?: string;
  onActivate?: () => void;
  inputProps?: TextInputProps;
}) {
  const tokens = useCurrentTokens(),
    dark = tokens.text.toLowerCase() !== '#262626';
  const [focused, setFocused] = useState(false);
  const disabled =
    visualState === 'disabled-empty' || visualState === 'disabled-filled';
  const active = visualState === 'on-focus' || (!visualState && focused);
  const hasValue =
    value.trim().length > 0 ||
    visualState === 'filled' ||
    visualState === 'disabled-filled';
  const floating = active || hasValue;
  const color = (name: string) => sourceColor(`var(${name})`, dark);
  const field = (
    <View style={styles.field} pointerEvents={onActivate ? 'none' : 'auto'}>
      {floating ? (
        <Copy
          size={14}
          lineHeight={15.5}
          color={
            disabled
              ? color('--uc-neutral-650')
              : active
              ? tokens.accent
              : tokens.muted
          }
        >
          {label}
        </Copy>
      ) : null}
      <View style={[styles.row, floating ? styles.floatGap : undefined]}>
        <View
          style={[
            styles.divider,
            {
              borderBottomColor: disabled
                ? color('--uc-neutral-650')
                : active
                ? tokens.accent
                : color('--uc-text-subtle'),
            },
          ]}
        >
          <TextInput
            accessibilityLabel={label}
            value={hasValue ? value : ''}
            placeholder={floating ? '' : label}
            placeholderTextColor={
              disabled
                ? color('--uc-neutral-650')
                : floating
                ? color('--uc-text-subtle')
                : tokens.text
            }
            editable={!disabled}
            onChangeText={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...inputProps}
            style={[
              styles.input,
              {
                fontFamily: tokens.font,
                color: disabled ? color('--uc-neutral-650') : tokens.text,
              },
              inputProps?.style,
            ]}
          />
        </View>
        <View style={styles.trailing}>
          {trailingIconName ? (
            <SourceCustomIcon
              name={trailingIconName}
              color={tokens.text}
              size={24}
            />
          ) : null}
        </View>
      </View>
      {helperText ? (
        <View style={styles.helper}>
          <Copy
            size={14}
            lineHeight={15.5}
            color={disabled ? color('--uc-neutral-650') : tokens.muted}
          >
            {helperText}
          </Copy>
        </View>
      ) : null}
    </View>
  );
  return onActivate ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onActivate}
    >
      {field}
    </Pressable>
  ) : (
    field
  );
}
const styles = StyleSheet.create({
  field: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  floatGap: { marginTop: 4 },
  divider: { flex: 1, minWidth: 0, borderBottomWidth: 0.5, paddingBottom: 3 },
  input: {
    minHeight: 0,
    height: 20,
    fontSize: 18,
    lineHeight: 20,
    padding: 0,
    includeFontPadding: false,
  },
  trailing: {
    marginLeft: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helper: { marginTop: 6 },
});
