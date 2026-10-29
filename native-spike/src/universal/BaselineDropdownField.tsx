import React from 'react';
import { Pressable, View } from 'react-native';
import type { TextFieldVisualState } from '@/app/components/contracts/textField';
import { BaselineTextField } from './BaselineTextField';
import { Select } from './Select';
import { SourceCustomIcon } from './SourceCustomIcon';
import { mobileFirstTokens } from './tokens';
import { sourceColor } from './sourceColor';

/** Selection field composing existing field presentation and Select choice/modal behaviour. */
export function BaselineDropdownField({
  label,
  value,
  options,
  onChange,
  visualState,
  helperText,
  errorText,
  multipleValues,
  onMultipleChange,
  onOpen,
  expanded: externalExpanded,
  fillWidth = false,
  dark = false,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string; disabled?: boolean }[];
  onChange: (value: string) => void;
  visualState?: TextFieldVisualState;
  helperText?: string;
  errorText?: string;
  multipleValues?: readonly string[];
  onMultipleChange?: (values: readonly string[]) => void;
  /** Optional host-owned sheet replaces the default selection panel. */
  onOpen?: () => void;
  expanded?: boolean;
  fillWidth?: boolean;
  dark?: boolean;
}) {
  const disabled =
    visualState === 'disabled-empty' || visualState === 'disabled-filled';
  const tokens = dark
    ? {
        ...mobileFirstTokens,
        background: sourceColor('var(--uc-surface)', true),
        surface: sourceColor('var(--uc-surface-muted)', true),
        text: sourceColor('var(--uc-text)', true),
        muted: sourceColor('var(--uc-text-muted)', true),
        border: sourceColor('var(--uc-border)', true),
        accent: sourceColor('var(--uc-action)', true),
      }
    : mobileFirstTokens;
  return (
    <Select
      tokens={tokens}
      label={label}
      value={value}
      items={options}
      onChange={onChange}
      multiple={
        multipleValues && onMultipleChange
          ? { values: multipleValues, onChange: onMultipleChange }
          : undefined
      }
      renderTrigger={({ open, expanded, label: selected, selectedLabels }) => (
        <View
          style={{
            width: fillWidth ? '100%' : 375,
            minHeight: 96,
            paddingTop: 8,
            paddingBottom: 5,
            paddingLeft: 24,
            paddingRight: 56,
          }}
        >
          <BaselineTextField
            label={label}
            value={selected}
            multipleValues={multipleValues ? [...selectedLabels] : undefined}
            multipleCount={multipleValues?.length}
            onChange={() => {}}
            helperText={helperText}
            errorText={errorText}
            visualState={
              disabled || errorText || visualState?.startsWith('error')
                ? visualState
                : multipleValues?.length
                  ? 'multiple-filled'
                  : (externalExpanded ?? expanded)
                    ? 'on-focus'
                    : visualState
            }
            dark={dark}
            selectionControl={{
              expanded: externalExpanded ?? expanded,
              onPress: () => {
                if (!disabled) (onOpen ?? open)();
              },
            }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={'Open ' + label}
            accessibilityState={{
              disabled,
              expanded: externalExpanded ?? expanded,
            }}
            disabled={disabled}
            onPress={onOpen ?? open}
            style={{
              position: 'absolute',
              right: 12,
              top: 14,
              width: 44,
              height: 44,
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SourceCustomIcon
                name="chevron-down-wide"
                size={20}
                color={sourceColor(
                  disabled ? 'var(--uc-text-subtle)' : 'var(--uc-text)',
                  dark,
                )}
              />
            </View>
          </Pressable>
        </View>
      )}
    />
  );
}
