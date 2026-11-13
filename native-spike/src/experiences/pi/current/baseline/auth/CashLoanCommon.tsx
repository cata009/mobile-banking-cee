import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { BaselineDropdownField } from '../../../../../universal/BaselineDropdownField';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { BaselineNavigationRow } from '../../../../../universal/BaselineNavigationRow';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { BaselineCheckbox } from '../../../../../universal/BaselineCheckbox';
import { ToggleButton } from '../../../../../universal/ToggleButton';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import { OnboardingSheet } from './OnboardingSheet';

export interface CashLoanPageProps {
  step: string;
  values: Record<string, string>;
  checks: Record<string, boolean>;
  onChange: (key: string, value: string) => void;
  onCheck: (key: string, value: boolean) => void;
  onDocument: (title: string, agreement?: string) => void;
  onGo: (step: string) => void;
  onClose: () => void;
}
export function LoanCopy({
  children,
  small = false,
}: {
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <Text style={small ? loanStyles.small : loanStyles.body}>{children}</Text>
  );
}
export function LoanLink({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <BaselineNavigationRow
      title={title}
      titleTone="action"
      titleStyle={loanStyles.link}
      trailingAccessory="chevron"
      rowHeight={64}
      style={{ marginHorizontal: -24 }}
      onPress={onPress}
    />
  );
}
export function LoanAgreement({
  title,
  children,
  checked,
  onToggle,
  onOpen,
  hideTitle = false,
}: {
  title: string;
  children?: React.ReactNode;
  checked: boolean;
  onToggle: () => void;
  onOpen?: () => void;
  hideTitle?: boolean;
}) {
  return (
    <View style={loanStyles.group}>
      {!hideTitle && (
        <Pressable
          accessibilityRole={onOpen ? 'button' : undefined}
          accessibilityLabel={onOpen ? `Deschide ${title}` : undefined}
          disabled={!onOpen}
          onPress={onOpen}
        >
          <Text style={loanStyles.label}>{title}</Text>
        </Pressable>
      )}
      <View style={loanStyles.row}>
        <View style={loanStyles.grow}>
          <LoanCopy small>{children}</LoanCopy>
        </View>
        <ToggleButton ariaLabel={title} checked={checked} onToggle={onToggle} />
      </View>
    </View>
  );
}
export function LoanField({
  label,
  name,
  values,
  onChange,
  numeric = false,
  password = false,
  maxLength = 100,
  helperText,
  suffix,
}: {
  label: string;
  name: string;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  numeric?: boolean;
  password?: boolean;
  maxLength?: number;
  helperText?: string;
  suffix?: string;
}) {
  return (
    <BaselineTextField
      forceFloatLabel
      label={label}
      value={values[name] || ''}
      onChange={value =>
        onChange(name, numeric ? value.replace(/[^0-9.,]/g, '') : value)
      }
      inputMode={numeric ? 'numeric' : 'text'}
      secureTextEntry={password}
      maxLength={maxLength}
      helperText={helperText}
      suffix={suffix}
    />
  );
}
export function LoanSelect({
  label,
  name,
  options,
  values,
  onChange,
  initialOpen = false,
  helperText,
  optionDescriptions,
  uppercaseOptions = false,
}: {
  label: string;
  name: string;
  options: readonly string[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  initialOpen?: boolean;
  helperText?: string;
  optionDescriptions?: Readonly<Record<string, string>>;
  uppercaseOptions?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const [selected, setSelected] = useState(values[name] || '');
  return (
    <>
      <View style={{ marginHorizontal: -24 }}>
        <BaselineDropdownField
          presentation="compact"
          label={label}
          value={values[name] || ''}
          options={options.map(value => ({ value, label: value }))}
          onChange={value => onChange(name, value)}
          fillWidth
          helperText={helperText}
          onOpen={() => {
            setSelected(values[name] || '');
            setOpen(true);
          }}
          expanded={open}
        />
      </View>
      {open && (
        <OnboardingSheet
          title={label}
          onClose={() => setOpen(false)}
          footer={
            <PrimaryButton
              label="Continuǎ"
              disabled={!selected}
              onPress={() => {
                onChange(name, selected);
                setOpen(false);
              }}
            />
          }
        >
          {options.map(value => (
            <View key={value} style={{ gap: 8, paddingVertical: 8 }}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <BaselineCheckbox
                  presentation="canonical"
                  checked={selected === value}
                  onCheckedChange={() => setSelected(value)}
                  ariaLabel={value}
                />
                <Text
                  onPress={() => setSelected(value)}
                  style={[
                    loanStyles.label,
                    {
                      flex: 1,
                      fontSize: 16,
                      lineHeight: 20,
                      textTransform: uppercaseOptions ? 'uppercase' : undefined,
                    },
                  ]}
                >
                  {value}
                </Text>
              </View>
              {!!optionDescriptions?.[value] && (
                <LoanCopy>{optionDescriptions[value]}</LoanCopy>
              )}
            </View>
          ))}
        </OnboardingSheet>
      )}
    </>
  );
}
export const loanStyles = StyleSheet.create({
  content: { gap: 24 },
  group: { gap: 8 },
  grow: { flex: 1 },
  row: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    color: sourceColor('var(--uc-text)'),
  },
  small: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 20,
    color: sourceColor('var(--uc-text)'),
  },
  label: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 18,
    color: sourceColor('var(--uc-text)'),
  },
  title: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    color: sourceColor('var(--uc-text)'),
  },
  link: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    color: sourceColor('var(--uc-action)'),
  },
  mutedBox: {
    padding: 16,
    gap: 4,
    borderRadius: 4,
    backgroundColor: sourceColor('var(--uc-surface-muted)'),
  },
});
