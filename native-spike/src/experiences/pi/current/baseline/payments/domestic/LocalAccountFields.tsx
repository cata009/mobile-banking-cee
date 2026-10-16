import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import {
  getCzechPaymentBankName,
  isValidCzechPrefix,
  isValidCzechMainAccountNumber,
  isValidCzechBankCode,
  parseCzechDomesticAccountClipboard,
} from '@/data/czechDomesticAccount';
import type { DomesticPaymentDraft } from '@/data/paymentFlow';
import type { CurrentScreenProps } from '../../../contracts';
import { BaselineTextField } from '../../../../../../universal/BaselineTextField';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../../universal/Typography';
import { sourceColor } from '../../../../../../universal/sourceColor';

const limits = { prefix: 6, accountNumber: 10, bankCode: 4 } as const;
type Part = keyof typeof limits;
export type BaselineLocalAccountTouched = Record<Part, boolean>;

/** Source CZ account-part composition; its checksum and bank directory stay canonical. */
export function BaselineLocalAccountFields({
  host,
  draft,
  onChange,
  dark,
  touched: controlledTouched,
  onTouchedChange,
}: {
  host: CurrentScreenProps;
  draft: DomesticPaymentDraft;
  onChange: (patch: Partial<DomesticPaymentDraft>) => void;
  dark: boolean;
  touched?: BaselineLocalAccountTouched;
  onTouchedChange?: (next: BaselineLocalAccountTouched) => void;
}) {
  const [localTouched, setLocalTouched] = useState({
    prefix: false,
    accountNumber: false,
    bankCode: false,
  });
  const touched = controlledTouched ?? localTouched;
  const setTouched = onTouchedChange ?? setLocalTouched;
  const [clipboard, setClipboard] =
    useState<ReturnType<typeof parseCzechDomesticAccountClipboard>>(null);
  const color = (token: string) => sourceColor(`var(${token})`, dark);
  const labels = {
    prefix: host.t('runtime.payments.domesticFlow.prefix', 'Prefix'),
    accountNumber: host.t(
      'runtime.accounts.detailsInfo.accountNumber',
      'Account number',
    ),
    bankCode: host.t('runtime.payments.domesticFlow.bankCode', 'Bank code'),
  };
  const valid = {
    prefix: isValidCzechPrefix(draft.prefix.trim()),
    accountNumber: isValidCzechMainAccountNumber(draft.accountNumber.trim()),
    bankCode: isValidCzechBankCode(draft.bankCode.trim()),
  };
  const errors = (Object.keys(limits) as Part[]).filter(
    key => touched[key] && !valid[key],
  );
  const checkClipboard = async () => {
    // Source also treats unavailable/denied clipboard access as an optional enhancement.
    const browser = globalThis as typeof globalThis & {
      navigator?: { clipboard?: { readText?: () => Promise<string> } };
    };
    if (Platform.OS !== 'web' || !browser.navigator?.clipboard?.readText) {
      setClipboard(null);
      return;
    }
    try {
      setClipboard(
        parseCzechDomesticAccountClipboard(
          await browser.navigator.clipboard.readText(),
        ),
      );
    } catch {
      setClipboard(null);
    }
  };
  const bankName = getCzechPaymentBankName(draft.bankCode.trim());
  return (
    <View style={s.group}>
      <View style={s.parts}>
        {(Object.keys(limits) as Part[]).map(key => (
          <View key={key} style={partStyles[key]}>
            <BaselineTextField
              label={labels[key]}
              value={draft[key]}
              onChange={raw => {
                const value = raw.replace(/\D/g, '').slice(0, limits[key]);
                onChange({
                  [key]: value,
                  ...(key === 'bankCode'
                    ? { bankName: getCzechPaymentBankName(value) ?? '' }
                    : {}),
                });
              }}
              inputMode="numeric"
              maxLength={limits[key]}
              forceFloatLabel
              suffixOutsideDivider
              ariaInvalid={touched[key] && !valid[key]}
              ariaDescribedBy={
                errors.length ? 'cz-account-validation' : undefined
              }
              visualState={
                touched[key] && !valid[key]
                  ? key === 'prefix' || draft[key].trim()
                    ? 'error-filled'
                    : 'error-empty'
                  : undefined
              }
              onFocus={checkClipboard}
              onBlur={() => setTouched({ ...touched, [key]: true })}
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
      {errors.length ? (
        <Text
          nativeID="cz-account-validation"
          accessibilityRole="alert"
          style={[
            s.helper,
            bankName ? s.errorAfterBank : s.errorWithoutBank,
            { color: color('--uc-status-red') },
          ]}
        >
          {host.t(
            'runtime.payments.domesticFlow.czechAccountValidation',
            'Check the highlighted account details',
          )}
          : {errors.map(key => labels[key]).join(', ')}.
        </Text>
      ) : null}
      {clipboard ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Use account from clipboard: ${
            clipboard.prefix ? `${clipboard.prefix}-` : ''
          }${clipboard.accountNumber} / ${clipboard.bankCode}`}
          style={s.clipboard}
          onPress={() => {
            onChange({
              ...clipboard,
              bankName: getCzechPaymentBankName(clipboard.bankCode) ?? '',
            });
            setTouched({ prefix: true, accountNumber: true, bankCode: true });
            setClipboard(null);
          }}
        >
          <SourceCustomIcon
            name="payment-use-account"
            size={16}
            color="#262626"
          />
          <Text style={s.clipboardCopy}>
            Use account:{' '}
            <Text style={s.bold}>
              {clipboard.prefix ? `${clipboard.prefix}-` : ''}
              {clipboard.accountNumber} / {clipboard.bankCode}
            </Text>
          </Text>
        </Pressable>
      ) : null}
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
  // Source explicitly places errors on grid row 3, retaining the empty bank row gap.
  errorWithoutBank: { marginTop: 10 },
  clipboard: {
    minHeight: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(38,38,38,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  clipboardCopy: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    color: '#000',
  },
  bold: { fontFamily: 'UniCredit-bold' },
});
const partStyles = StyleSheet.create({
  prefix: { flex: 6, minWidth: 56 },
  accountNumber: { flex: 10, minWidth: 100 },
  bankCode: { flex: 4, minWidth: 66 },
});
