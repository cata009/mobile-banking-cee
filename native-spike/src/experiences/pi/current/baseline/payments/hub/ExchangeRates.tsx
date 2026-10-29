import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  EXCHANGE_CURRENCIES,
  EXCHANGE_RATE_DATE,
  getCountryCurrency,
  getExchangeRateRows,
} from '@/data/exchangeRates';
import type { Currency } from '@/data/products';
import type { CurrentScreenProps } from '../../../contracts';
import { BaselinePageHeader } from '../../../../../../universal/BaselinePageHeader';
import { BaselineSectionDivider } from '../../../../../../universal/BaselineSectionDivider';
import { PaymentIcon } from './Icon';
import { PrimaryButton } from '../../../../../../universal/PrimaryButton';
import { RadioButton } from '../../../../../../universal/RadioButton';
import { Text, TextInput } from '../../../../../../universal/Typography';
import { sourceColor } from '../../../../../../universal/sourceColor';
import { PaymentsSheet } from './Sheet';
import { DuoReadable } from '../../../../../../universal/DuoPreview';
import { CurrencyFlag } from './CurrencyFlag';

const rate = (value: number) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
    useGrouping: false,
  });
export function RoBaselineExchangeRates({
  host,
  onBack,
}: {
  host: CurrentScreenProps;
  onBack: () => void;
}) {
  const [value, setValue] = useState('1.00');
  const [currency, setCurrency] = useState<Currency>(
    getCountryCurrency(host.country),
  );
  const [draft, setDraft] = useState<Currency>(currency);
  const [chooser, setChooser] = useState(false);
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const color = (token: string) => sourceColor(`var(${token})`, dark);
  const t = host.t;
  const parsed = Number(value.trim().replace(/\s/g, '').replace(',', '.'));
  const amount = Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  const close = () => {
    setDraft(currency);
    setChooser(false);
  };
  const registerBack = host.onBackHandlerChange;
  useEffect(() => {
    registerBack?.(() => {
      if (chooser) {
        setDraft(currency);
        setChooser(false);
      } else onBack();
      return true;
    });
    return () => registerBack?.(null);
  }, [registerBack, chooser, currency, onBack]);
  const date = new Intl.DateTimeFormat(
    host.language === 'en' ? 'en-GB' : host.language,
    { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' },
  ).format(new Date(`${EXCHANGE_RATE_DATE}T00:00:00Z`));
  return (
    <DuoReadable>
      <View style={[s.page, { backgroundColor: color('--uc-surface') }]}>
        <ScrollView
          style={Platform.OS === 'web' ? s.webScroll : undefined}
          showsVerticalScrollIndicator={false}
        >
          <BaselinePageHeader
            title={t('runtime.payments.exchangeRates.title', 'Exchange rates')}
            onBack={onBack}
            includeSafeArea
            safeAreaReserve={host.screenTopInset}
            dark={dark}
          />
          <Text style={[s.date, { color: color('--uc-text-muted') }]}>
            {t('runtime.payments.exchangeRates.lastUpdated', 'Last updated on')}{' '}
            {date}
          </Text>
          <View style={s.section}>
            <View style={s.heading}>
              <BaselineSectionDivider
                title={t(
                  'runtime.payments.exchangeRates.chooseCurrencyAndAmount',
                  'CHOOSE CURRENCY AND AMOUNT',
                )}
                variant="light-title"
                dark={dark}
              />
            </View>
            <View style={s.fields}>
              <View style={[s.amount, { borderColor: color('--uc-border') }]}>
                <Text style={[s.label, { color: color('--uc-text-muted') }]}>
                  {t(
                    'runtime.payments.exchangeRates.amount',
                    'AMOUNT',
                  ).toUpperCase()}
                </Text>
                <TextInput
                  accessibilityLabel={t(
                    'runtime.payments.exchangeRates.amount',
                    'Amount',
                  )}
                  value={value}
                  onChangeText={setValue}
                  keyboardType="decimal-pad"
                  style={[s.input, { color: color('--uc-text') }]}
                />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t(
                  'runtime.payments.exchangeRates.chooseCurrency',
                  'Choose currency',
                )}, ${t(
                  'runtime.payments.exchangeRates.currentCurrency',
                  'current',
                )} ${currency}`}
                onPress={() => {
                  setDraft(currency);
                  setChooser(true);
                }}
                style={[s.currency, { borderColor: color('--uc-border') }]}
              >
                <View>
                  <Text style={[s.label, { color: color('--uc-text-muted') }]}>
                    {t(
                      'runtime.payments.exchangeRates.currency',
                      'CURRENCY',
                    ).toUpperCase()}
                  </Text>
                  <Text
                    style={[s.currencyValue, { color: color('--uc-text') }]}
                  >
                    {currency}
                  </Text>
                </View>
                <View style={s.chevron}>
                  <PaymentIcon
                    name="chevron-down-wide"
                    color={color('--uc-icon')}
                  />
                </View>
              </Pressable>
            </View>
          </View>
          <View style={s.section}>
            <View style={s.heading}>
              <BaselineSectionDivider
                title={t(
                  'runtime.payments.exchangeRates.tapForRates',
                  'TAP FOR BUY/SELL RATES',
                )}
                variant="light-title"
                dark={dark}
              />
            </View>
            <View style={s.rows}>
              {getExchangeRateRows(amount, currency).map(row => (
                <Pressable
                  key={row.currency}
                  accessibilityRole="button"
                  accessibilityLabel={`${amount} ${currency} ${t(
                    'runtime.payments.exchangeRates.equals',
                    'equals',
                  )} ${rate(row.convertedAmount)} ${row.currency}`}
                  onPress={() => setCurrency(row.currency)}
                  style={[s.row, { borderColor: color('--uc-border') }]}
                >
                  <View style={s.flag}>
                    <CurrencyFlag currency={row.currency} />
                  </View>
                  <View style={s.rowCopy}>
                    <Text style={[s.rowTitle, { color: color('--uc-text') }]}>
                      {row.currency}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        s.rowSubtitle,
                        { color: color('--uc-text-muted') },
                      ]}
                    >
                      1 {row.currency} = {rate(row.unitRate)} {currency}
                    </Text>
                  </View>
                  <Text style={[s.result, { color: color('--uc-text') }]}>
                    {rate(row.convertedAmount)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
        {chooser ? (
          <PaymentsSheet
            title={t(
              'runtime.payments.exchangeRates.chooseCurrency',
              'Choose currency',
            )}
            onClose={close}
            closeLabel={t(
              'runtime.payments.exchangeRates.closeChooser',
              'Close currency chooser',
            )}
            fillHeight
            dark={dark}
          >
            <View style={s.chooser}>
              <BaselineSectionDivider
                title={t(
                  'runtime.payments.exchangeRates.selectFromList',
                  'SELECT FROM THE LIST BELOW',
                )}
                variant="light-title"
                dark={dark}
              />
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={[
                  s.currencyList,
                  Platform.OS === 'web' ? s.webScroll : undefined,
                ]}
                contentContainerStyle={s.currencyListContent}
                accessibilityRole="radiogroup"
              >
                {EXCHANGE_CURRENCIES.map(code => (
                  <RadioButton
                    key={code}
                    label={code}
                    selected={draft === code}
                    onPress={() => setDraft(code)}
                    dark={dark}
                  />
                ))}
              </ScrollView>
              <View style={s.confirm}>
                <PrimaryButton
                  label={t('runtime.payments.exchangeRates.apply', 'OK')}
                  dark={dark}
                  onPress={() => {
                    setCurrency(draft);
                    setChooser(false);
                  }}
                />
              </View>
            </View>
          </PaymentsSheet>
        ) : null}
      </View>
    </DuoReadable>
  );
}
const s = StyleSheet.create({
  page: { flex: 1 },
  webScroll: { transform: 'none' },
  date: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingTop: 2,
  },
  section: { paddingTop: 32 },
  heading: { paddingHorizontal: 16 },
  fields: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  // Source's inline input leaves a 3px baseline gap before the 6px label padding.
  amount: { flex: 1, minWidth: 0, borderBottomWidth: 1, paddingBottom: 9 },
  label: { fontFamily: 'UniCredit-regular', fontSize: 14 },
  input: {
    fontFamily: 'UniCredit-regular',
    fontSize: 20,
    padding: 0,
    marginTop: 4,
    outlineWidth: 0,
  },
  currency: {
    width: 96,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 4,
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  currencyValue: {
    fontFamily: 'UniCredit-regular',
    fontSize: 20,
    marginTop: 4,
  },
  chevron: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rows: { paddingHorizontal: 16, paddingTop: 8 },
  row: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  flag: { width: 48, alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { fontFamily: 'UniCredit-bold', fontSize: 16 },
  rowSubtitle: { fontFamily: 'UniCredit-regular', fontSize: 14 },
  result: {
    // The Source result class has no typography rule and inherits the button's regular16px.
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    width: 88,
    textAlign: 'right',
  },
  chooser: { flex: 1 },
  currencyList: { flex: 1, minHeight: 0 },
  currencyListContent: { paddingVertical: 8 },
  confirm: { paddingTop: 12, alignItems: 'center' },
});
