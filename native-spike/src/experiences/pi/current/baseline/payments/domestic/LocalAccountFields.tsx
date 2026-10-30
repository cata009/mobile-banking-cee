import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import {
  getCzechPaymentBankName,
  isValidCzechPrefix,
  isValidCzechMainAccountNumber,
  isValidCzechBankCode,
  parseCzechDomesticAccountClipboard,
} from '@/data/czechDomesticAccount';
import type { DomesticPaymentDraft } from '@/data/paymentFlow';
import type { CurrentScreenProps } from '../../../contracts';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../../universal/Typography';
import {
  BaselineDomesticAccountFields,
  type BaselineDomesticAccountPart,
} from './BaselineDomesticAccountFields';

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
  const fields = (Object.keys(limits) as Part[]).map(
    (key): BaselineDomesticAccountPart => ({
      id: key,
      label: labels[key],
      value: draft[key],
      onChange: raw => {
        const value = raw.replace(/\D/g, '').slice(0, limits[key]);
        onChange({
          [key]: value,
          ...(key === 'bankCode'
            ? { bankName: getCzechPaymentBankName(value) ?? '' }
            : {}),
        });
      },
      inputMode: 'numeric',
      maxLength: limits[key],
      ariaInvalid: touched[key] && !valid[key],
      ariaDescribedBy: errors.length ? 'cz-account-validation' : undefined,
      visualState:
        touched[key] && !valid[key]
          ? key === 'prefix' || draft[key].trim()
            ? 'error-filled'
            : 'error-empty'
          : undefined,
      onFocus: checkClipboard,
      onBlur: () => setTouched({ ...touched, [key]: true }),
    }),
  );
  const errorMessage = errors.length
    ? `${host.t(
        'runtime.payments.domesticFlow.czechAccountValidation',
        'Check the highlighted account details',
      )}: ${errors.map(key => labels[key]).join(', ')}.`
    : undefined;
  return (
    <BaselineDomesticAccountFields
      fields={fields}
      dark={dark}
      bankName={bankName}
      errorMessage={errorMessage}
      errorId="cz-account-validation"
      footer={clipboard ? (
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
    />
  );
}
const s = StyleSheet.create({
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
