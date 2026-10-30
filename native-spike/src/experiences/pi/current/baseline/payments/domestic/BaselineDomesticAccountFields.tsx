import React, { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BaselineTextField,
  type BaselineTextFieldProps,
} from '../../../../../../universal/BaselineTextField';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../../universal/Typography';
import { sourceColor } from '../../../../../../universal/sourceColor';

export type DomesticAccountPartId = 'prefix' | 'accountNumber' | 'bankCode';

export interface BaselineDomesticAccountPart {
  id: DomesticAccountPartId;
  label: string;
  ariaLabel?: BaselineTextFieldProps['ariaLabel'];
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  inputMode?: BaselineTextFieldProps['inputMode'];
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
  visualState?: BaselineTextFieldProps['visualState'];
  onFocus?: () => void;
  onBlur?: () => void;
}

/** Shared domestic beneficiary account layout; country policies stay with its caller. */
export function BaselineDomesticAccountFields({
  fields,
  dark,
  bankName,
  errorMessage,
  errorId = 'domestic-account-validation',
  footer,
}: {
  fields: readonly BaselineDomesticAccountPart[];
  dark: boolean;
  bankName?: string;
  errorMessage?: string;
  errorId?: string;
  footer?: ReactNode;
}) {
  const color = (token: string) => sourceColor(`var(${token})`, dark);
  return (
    <View style={s.group}>
      <View style={s.parts}>
        {fields.map(field => (
          <View key={field.id} style={partStyles[field.id]}>
            <BaselineTextField
              label={field.label}
              ariaLabel={field.ariaLabel}
              value={field.value}
              onChange={field.onChange}
              maxLength={field.maxLength}
              inputMode={field.inputMode}
              forceFloatLabel
              suffixOutsideDivider
              ariaInvalid={field.ariaInvalid}
              ariaDescribedBy={field.ariaDescribedBy}
              visualState={field.visualState}
              onFocus={field.onFocus}
              onBlur={field.onBlur}
              dark={dark}
            />
          </View>
        ))}
        <View style={s.icon}>
          <SourceCustomIcon
            name="payment-photo-camera"
            size={32}
            color={color('--uc-text')}
          />
        </View>
      </View>
      {bankName ? (
        <Text style={[s.helper, s.bank, { color: color('--uc-text-muted') }]}>
          {bankName}
        </Text>
      ) : null}
      {errorMessage ? (
        <Text
          nativeID={errorId}
          accessibilityRole="alert"
          style={[
            s.helper,
            bankName ? s.errorAfterBank : s.errorWithoutBank,
            { color: color('--uc-status-red') },
          ]}
        >
          {errorMessage}
        </Text>
      ) : null}
      {footer}
    </View>
  );
}

const s = StyleSheet.create({
  group: { minHeight: 80, justifyContent: 'center', gap: 6 },
  parts: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  icon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helper: { fontFamily: 'UniCredit-regular', fontSize: 14 },
  bank: { marginTop: 6 },
  errorAfterBank: { marginTop: 4 },
  // Keep the empty bank row gap when the account has no bank-name helper.
  errorWithoutBank: { marginTop: 10 },
});

const partStyles = StyleSheet.create({
  prefix: { flex: 6, minWidth: 56 },
  accountNumber: { flex: 10, minWidth: 100 },
  bankCode: { flex: 4, minWidth: 66 },
});
