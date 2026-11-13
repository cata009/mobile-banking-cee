import React, { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  getCreatedRecurrentPayments,
  type RecurrentPayment,
} from '@/data/paymentsHub';
import { bankingProducts } from '../../../banking/model';
import type { CurrentScreenProps } from '../../../contracts';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import { maskFormattedAmount } from '@/app/utils/amountPrivacy';
import {
  calculateRoBaselineSweepTransfer,
  createRoBaselinePaymentDraft,
  getRoBaselineBillProviders,
  getRoBaselinePaymentReviewRows,
  isRoBaselinePaymentDraftValid,
  setRoBaselineAddressMode,
  toRoBaselineRecurrentPayment,
  type RoBaselineBillProvider,
  type RoBaselinePaymentAccount,
  type RoBaselinePaymentDraft,
  type RoBaselinePaymentKind,
} from '@/features/accounts-payments/currentPaymentPolicy';
import { BaselineAmountField } from '../../../../../../universal/BaselineAmountField';
import { BaselineBottomSheet } from '../../../../../../universal/BaselineBottomSheet';
import { BaselinePageHeader } from '../../../../../../universal/BaselinePageHeader';
import { BaselineSectionDivider } from '../../../../../../universal/BaselineSectionDivider';
import { BaselineTextField } from '../../../../../../universal/BaselineTextField';
import { DateField } from '../../../../../../universal/DateField';
import { ModalPortal } from '../../../../../../universal/ModalPortal';
import { PrimaryButton } from '../../../../../../universal/PrimaryButton';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../../universal/Typography';
import { ToggleButton } from '../../../../../../universal/ToggleButton';
import { useDemoViewport } from '../../../../../../universal/DemoViewport';
import { sourceColor } from '../../../../../../universal/sourceColor';
import { Fact } from '../../../banking/Primitives';
import { AccountSelectionSheet } from '../../AccountSelectionSheet';
import {
  RoBaselinePaymentSign,
  RoBaselinePaymentSuccess,
} from '../confirmation/RoBaselinePaymentConfirmation';

const PAYMENT_TITLES: Record<RoBaselinePaymentKind, string> = {
  'foreign-payment': 'Foreign payment',
  'currency-exchange': 'Currency exchange',
  'treasury-payment': 'Budget payment',
  'own-account-transfer': 'Transfer between your own accounts',
  'standing-order': 'New Standing Order',
  'direct-debit': 'Direct Debit',
};

type Step = 'create' | 'review' | 'sign' | 'success';

export function RoBaselineDirectDebitList({
  host,
  records = getCreatedRecurrentPayments('RO', 'direct-debit'),
  onBack,
  onCreate,
}: {
  host: CurrentScreenProps;
  records?: readonly RecurrentPayment[];
  onBack: () => void;
  onCreate: () => void;
}) {
  const dark = host.tokens.background === '#121212';
  const color = (token: string) => sourceColor(`var(${token})`, dark);
  return (
    <View
      style={[styles.root, { backgroundColor: color('--uc-surface') }]}
      testID="ro-direct-debit-list"
    >
      <BaselinePageHeader
        title="Direct Debit list"
        onBack={onBack}
        includeSafeArea
        safeAreaReserve={host.screenTopInset}
        dark={dark}
      />
      <ScrollView contentContainerStyle={styles.listBody}>
        <Text
          accessibilityRole="header"
          style={[styles.pageTitle, { color: color('--uc-text') }]}
        >
          Direct Debit list
        </Text>
        <Text style={[styles.subtitle, { color: color('--uc-text-muted') }]}>
          Your Direct Debits
        </Text>
        {records.map(record => (
          <View key={record.id} style={styles.record}>
            <Text style={[styles.recordTitle, { color: color('--uc-text') }]}>
              {record.name}
            </Text>
            <Text style={{ color: color('--uc-text-muted') }}>
              {record.isLimit
                ? `Limit ${record.amount} ${record.currency}`
                : 'No amount limit'}
            </Text>
            <Text style={{ color: color('--uc-text-muted') }}>
              Next debit {record.nextDate}
            </Text>
          </View>
        ))}
        {records.length === 0 ? (
          <Text style={[styles.empty, { color: color('--uc-text-muted') }]}>
            No Direct Debits yet
          </Text>
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label="Create Direct Debit"
          dark={dark}
          onPress={onCreate}
        />
      </View>
    </View>
  );
}

export function RoBaselineBillProviderPicker({
  host,
  onBack,
  onSelect,
}: {
  host: CurrentScreenProps;
  onBack: () => void;
  onSelect: (provider: RoBaselineBillProvider) => void;
}) {
  const [search, setSearch] = useState('');
  const dark = host.tokens.background === '#121212';
  const color = (token: string) => sourceColor(`var(${token})`, dark);
  const providers = getRoBaselineBillProviders().filter(provider =>
    `${provider.name} ${provider.category}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );
  const groups = [...new Set(providers.map(provider => provider.category))];
  return (
    <View
      style={[styles.root, { backgroundColor: color('--uc-surface') }]}
      testID="ro-direct-debit-providers"
    >
      <BaselinePageHeader
        title="Utility Payments & Donations"
        onBack={onBack}
        includeSafeArea
        safeAreaReserve={host.screenTopInset}
        dark={dark}
      />
      <ScrollView contentContainerStyle={styles.providerBody}>
        <Text
          accessibilityRole="header"
          style={[styles.pageTitle, { color: color('--uc-text') }]}
        >
          Utility Payments & Donations
        </Text>
        <BaselineTextField
          label="Search"
          value={search}
          onChange={setSearch}
          dark={dark}
        />
        {groups.map(group => (
          <View key={group}>
            <BaselineSectionDivider title={group} dark={dark} />
            {providers
              .filter(provider => provider.category === group)
              .map(provider => (
                <Pressable
                  key={provider.id}
                  accessibilityRole="button"
                  accessibilityLabel={provider.name}
                  onPress={() => onSelect(provider)}
                  style={styles.providerRow}
                >
                  <Text
                    style={[styles.providerName, { color: color('--uc-text') }]}
                  >
                    {provider.name}
                  </Text>
                </Pressable>
              ))}
          </View>
        ))}
        {providers.length === 0 ? (
          <Text style={{ color: color('--uc-text-muted') }}>
            No providers found
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

export function RoBaselinePaymentFormFlow({
  host,
  kind,
  provider,
  onBack,
  onComplete,
}: {
  host: CurrentScreenProps;
  kind: RoBaselinePaymentKind;
  provider?: RoBaselineBillProvider;
  onBack: () => void;
  onComplete: (payment: RecurrentPayment | null) => void;
}) {
  const accounts = useMemo<RoBaselinePaymentAccount[]>(
    () =>
      bankingProducts(host)
        .accounts.filter(
          account =>
            account.type === 'current_account' ||
            account.type === 'saving_account',
        )
        .map(account => ({
          id: account.id,
          type: account.type as RoBaselinePaymentAccount['type'],
          name: account.name,
          accountNumber: account.accountNumber,
          balance: account.balance,
          currency: account.currency,
        })),
    [host.country, host.release, host.productCounts],
  );
  const [draft, setDraft] = useState(() =>
    createRoBaselinePaymentDraft(kind, accounts, {
      today: new Date().toISOString().slice(0, 10),
      providerId: provider?.id,
    }),
  );
  const [step, setStep] = useState<Step>('create');
  const [progress, setProgress] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [accountPicker, setAccountPicker] = useState<
    'source' | 'destination' | null
  >(null);
  const [choicePicker, setChoicePicker] = useState<
    'address' | 'currency' | 'frequency' | null
  >(null);
  const dark = host.tokens.background === '#121212';
  const color = (token: string) => sourceColor(`var(${token})`, dark);
  const calendarIcon = () => (
    <SourceCustomIcon
      name="insurance-calendar"
      size={32}
      color={color('--uc-text')}
    />
  );
  const title = PAYMENT_TITLES[kind];
  const source = accounts.find(account => account.id === draft.sourceAccountId);
  const destination = accounts.find(
    account => account.id === draft.destinationAccountId,
  );
  const update = (patch: Partial<RoBaselinePaymentDraft>) =>
    setDraft(current => ({ ...current, ...patch }));
  const field = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    options: { helperText?: string; disabled?: boolean } = {},
  ) => (
    <View style={styles.field} key={label}>
      <BaselineTextField
        label={label}
        value={value}
        onChange={onChange}
        helperText={options.helperText}
        disabled={options.disabled}
        dark={dark}
      />
    </View>
  );
  const section = (label: string) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: color('--uc-text') }]}>
        {label}
      </Text>
    </View>
  );
  const accountField = (
    role: 'source' | 'destination',
    label: string,
    selected = role === 'source' ? source : destination,
  ) => (
    <View style={styles.accountPickerField}>
      <BaselineTextField
        label="ACCOUNT NUMBER"
        value={selected?.accountNumber ?? ''}
        onChange={() => undefined}
        ariaLabel={`${label}: ${selected?.accountNumber ?? 'Choose account'}`}
        helperText={selected?.name ?? label}
        helperText2={
          selected
            ? `${maskFormattedAmount(
                formatMoneyNumber(selected.balance, host.country),
                host.amountsHidden,
              )} ${selected.currency}`
            : undefined
        }
        trailingIconName="chevron-down-wide"
        trailingIconPlacement="floating"
        selectionControl={{
          expanded: accountPicker === role,
          onPress: () => setAccountPicker(role),
        }}
        onActivate={() => setAccountPicker(role)}
        dark={dark}
      />
    </View>
  );
  const toggleRow = (
    label: string,
    checked: boolean,
    onToggle: (value: boolean) => void,
    subtitle?: string,
  ) => (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={[styles.toggleLabel, { color: color('--uc-text') }]}>
          {label}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: color('--uc-text-muted') }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <ToggleButton
        checked={checked}
        onToggle={onToggle}
        ariaLabel={label}
        dark={dark}
      />
    </View>
  );
  const choose = (label: string, value: string, onPress: () => void) => (
    <View style={styles.field}>
      <BaselineTextField
        label={label}
        value={value}
        onChange={() => undefined}
        ariaLabel={`${label}: ${value}`}
        trailingIconName="chevron-down-wide"
        trailingIconPlacement="floating"
        selectionControl={{
          expanded: choicePicker !== null,
          onPress,
        }}
        onActivate={onPress}
        dark={dark}
      />
    </View>
  );
  const valid = isRoBaselinePaymentDraftValid(draft, accounts);
  const reviewRows = getRoBaselinePaymentReviewRows(draft, accounts);
  useEffect(() => {
    const registerBack = host.onBackHandlerChange;
    registerBack?.(() => {
      if (choicePicker) {
        setChoicePicker(null);
        return true;
      }
      if (accountPicker) {
        setAccountPicker(null);
        return true;
      }
      if (step === 'create') onBack();
      else if (step === 'review') setStep('create');
      else if (step === 'sign') setStep('review');
      return true;
    });
    return () => registerBack?.(null);
  }, [accountPicker, choicePicker, host.onBackHandlerChange, onBack, step]);
  if (step === 'sign')
    return (
      <RoBaselinePaymentSign
        host={host}
        onBack={() => setStep('review')}
        onSign={() => setStep('success')}
      />
    );
  if (step === 'success')
    return (
      <RoBaselinePaymentSuccess
        host={host}
        onDone={() => onComplete(toRoBaselineRecurrentPayment(draft, accounts))}
      />
    );
  return (
    <View
      style={[styles.root, { backgroundColor: color('--uc-surface') }]}
      testID={`ro-payment-form-${kind}`}
    >
      <BaselinePageHeader
        title={step === 'review' ? 'Review data' : title.toUpperCase()}
        onBack={step === 'create' ? onBack : () => setStep('create')}
        includeSafeArea
        safeAreaReserve={host.screenTopInset}
        showHelp={step === 'create'}
        renderLargeTitle={false}
        collapsedTitleProgress={progress}
        dark={dark}
      />
      <ScrollView
        style={Platform.OS === 'web' ? styles.webScroll : undefined}
        contentContainerStyle={styles.formBody}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={event =>
          setProgress(
            Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 48)),
          )
        }
      >
        <Text
          accessibilityRole="header"
          style={[styles.pageTitle, { color: color('--uc-text') }]}
        >
          {step === 'review' ? 'Review data' : title}
        </Text>
        {step === 'create' ? (
          <>
            {kind === 'direct-debit' ? (
              <View style={styles.providerIntro}>
                <Text style={{ color: color('--uc-text-muted') }}>To</Text>
                <Text
                  style={[styles.providerTitle, { color: color('--uc-text') }]}
                >
                  {provider?.name}
                </Text>
              </View>
            ) : null}
            {section('FROM ACCOUNT')}
            {accountField('source', 'From account')}
            {kind !== 'direct-debit' &&
            kind !== 'foreign-payment' &&
            kind !== 'treasury-payment' ? (
              <>
                {section(
                  kind === 'currency-exchange' ? 'TO' : 'TO BENEFICIARY',
                )}
                {accountField('destination', 'To account')}
              </>
            ) : null}
            {kind === 'foreign-payment' ||
            kind === 'treasury-payment' ||
            kind === 'standing-order' ? (
              <>
                {section('TO BENEFICIARY')}
                {field('Name', draft.beneficiaryName ?? '', value =>
                  update({ beneficiaryName: value }),
                )}
                {field(
                  'ACCOUNT NUMBER',
                  draft.beneficiaryAccountNumber ?? '',
                  value => update({ beneficiaryAccountNumber: value }),
                )}
              </>
            ) : null}
            {kind === 'foreign-payment' ? (
              <>
                {choose(
                  'ADDRESS TYPE',
                  (draft.addressMode ?? 'unstructured').toUpperCase(),
                  () => setChoicePicker('address'),
                )}
                {draft.addressMode === 'unstructured'
                  ? field(
                      'BENEFICIARY ADDRESS',
                      draft.beneficiaryAddress ?? '',
                      value => update({ beneficiaryAddress: value }),
                    )
                  : null}
                {draft.addressMode === 'hybrid' ? (
                  <>
                    {field('COUNTRY', draft.country ?? '', value =>
                      update({ country: value }),
                    )}
                    {field('CITY', draft.city ?? '', value =>
                      update({ city: value }),
                    )}
                    {field('STREET AND NUMBER', draft.street ?? '', value =>
                      update({ street: value }),
                    )}
                    {field(
                      'ADDITIONAL ADDRESS DETAILS',
                      draft.beneficiaryAddress ?? '',
                      value => update({ beneficiaryAddress: value }),
                    )}
                  </>
                ) : null}
                {draft.addressMode === 'structured' ? (
                  <>
                    {field('COUNTRY', draft.country ?? '', value =>
                      update({ country: value }),
                    )}
                    {field('CITY', draft.city ?? '', value =>
                      update({ city: value }),
                    )}
                    {field('STREET', draft.street ?? '', value =>
                      update({ street: value }),
                    )}
                    {field('POSTAL CODE', draft.postalCode ?? '', value =>
                      update({ postalCode: value }),
                    )}
                  </>
                ) : null}
              </>
            ) : null}
            {kind !== 'direct-debit' ? section('PAYMENT DETAILS') : null}
            {kind === 'direct-debit' ? (
              <>
                {section('TO BENEFICIARY')}
                {field(
                  'BENEFICIARY NAME',
                  draft.beneficiaryName ?? '',
                  value => update({ beneficiaryName: value }),
                  { disabled: true },
                )}
                {field(
                  'BENEFICIARY ACCOUNT NUMBER',
                  draft.beneficiaryAccountNumber ?? '',
                  value => update({ beneficiaryAccountNumber: value }),
                  { disabled: true },
                )}
                {field(
                  'BENEFICIARY ADDRESS',
                  draft.beneficiaryAddress ?? '',
                  value => update({ beneficiaryAddress: value }),
                  { disabled: true },
                )}
                {field(
                  'FISCAL CODE / CNP',
                  draft.fiscalCode ?? '',
                  value => update({ fiscalCode: value }),
                  { disabled: true },
                )}
                <View style={styles.section}>
                  <BaselineSectionDivider
                    title="DETAILS RECURRENT PAYMENT"
                    dark={dark}
                  />
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.limitChoices}
                >
                  {[
                    { label: 'NO LIMIT', value: '0', noLimit: true },
                    { label: '100 RON', value: '100', noLimit: false },
                    { label: '200 RON', value: '200', noLimit: false },
                    { label: '500 RON', value: '500', noLimit: false },
                    { label: '1,000 RON', value: '1000', noLimit: false },
                  ].map(option => {
                    const selected =
                      Boolean(draft.noLimit) === option.noLimit &&
                      (option.noLimit || draft.amountLimit === option.value);
                    return (
                      <Pressable
                        key={option.label}
                        accessibilityRole="radio"
                        accessibilityLabel={option.label}
                        accessibilityState={{ checked: selected }}
                        onPress={() =>
                          update({
                            noLimit: option.noLimit,
                            amountLimit: option.value,
                          })
                        }
                        style={styles.limitChoice}
                      >
                        <View
                          style={[
                            styles.limitCircle,
                            {
                              backgroundColor: selected
                                ? color('--uc-action')
                                : color('--uc-text-muted'),
                              opacity: selected ? 1 : 0.16,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.limitCheck,
                              {
                                color: selected
                                  ? color('--uc-text-inverse')
                                  : color('--uc-text-muted'),
                              },
                            ]}
                          >
                            {selected ? '✓' : '✓'}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.limitLabel,
                            { color: color('--uc-text') },
                          ]}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
                <View style={styles.field}>
                  <BaselineAmountField
                    label="LIMIT"
                    value={draft.noLimit ? '0' : draft.amountLimit ?? ''}
                    onChange={value => update({ amountLimit: value })}
                    currency={draft.currency}
                    hideCurrencySelector
                    disabled={Boolean(draft.noLimit)}
                    dark={dark}
                  />
                </View>
                <View style={styles.field}>
                  <DateField
                    tokens={host.tokens}
                    label="START DATE"
                    value={draft.startDate ?? ''}
                    onChange={value => update({ startDate: value })}
                    displayFormat="long-month"
                    locale="en-GB"
                    calendarIcon={calendarIcon()}
                    openCalendarOnFieldPress
                  />
                </View>
                {field('Subscriber name', draft.subscriberName ?? '', value =>
                  update({ subscriberName: value }),
                )}
                {field('Invoicing code', draft.invoicingCode ?? '', value =>
                  update({ invoicingCode: value }),
                )}
                {field('Phone number', draft.phoneNumber ?? '', value =>
                  update({ phoneNumber: value }),
                )}
                <Pressable
                  accessibilityRole="link"
                  onPress={() => setShowTerms(value => !value)}
                  style={styles.termsLink}
                >
                  <Text
                    style={[
                      styles.termsText,
                      { color: color('--uc-text-muted') },
                    ]}
                  >
                    Terms and Conditions
                  </Text>
                </Pressable>
                {showTerms ? (
                  <Text
                    style={[
                      styles.termsCopy,
                      { color: color('--uc-text-muted') },
                    ]}
                  >
                    You authorize {provider?.name ?? 'the selected provider'} to
                    request recurring debits from the selected account, subject
                    to the amount limit and start date shown above.
                  </Text>
                ) : null}
                {toggleRow(
                  'I AGREE WITH TERMS AND CONDITIONS',
                  Boolean(draft.termsAccepted),
                  value => update({ termsAccepted: value }),
                )}
              </>
            ) : null}
            {kind === 'standing-order' ? (
              <>
                {toggleRow(
                  'Sweeping mode',
                  Boolean(draft.sweepingMode),
                  value => update({ sweepingMode: value }),
                  'The amount inserted will remain in your account',
                )}
                <View style={styles.field}>
                  <BaselineAmountField
                    label={
                      draft.sweepingMode
                        ? 'Minimum balance to retain'
                        : 'Amount'
                    }
                    value={draft.amount}
                    onChange={value => update({ amount: value })}
                    currency={draft.currency}
                    hideCurrencySelector
                    dark={dark}
                  />
                </View>
                {draft.sweepingMode && source ? (
                  <Text
                    style={[styles.helper, { color: color('--uc-text-muted') }]}
                  >
                    Transferable surplus:{' '}
                    {calculateRoBaselineSweepTransfer(
                      source.balance,
                      Number(draft.amount.replace(',', '.')) || 0,
                    ).toFixed(2)}{' '}
                    {draft.currency}
                  </Text>
                ) : null}
                {choose(
                  'FREQUENCY',
                  (draft.frequency ?? 'monthly').toUpperCase(),
                  () => setChoicePicker('frequency'),
                )}
                <View style={styles.field}>
                  <DateField
                    tokens={host.tokens}
                    label="START DATE"
                    value={draft.startDate ?? ''}
                    onChange={value => update({ startDate: value })}
                    displayFormat="long-month"
                    locale="en-GB"
                    calendarIcon={calendarIcon()}
                    openCalendarOnFieldPress
                  />
                </View>
                <View style={styles.field}>
                  <DateField
                    tokens={host.tokens}
                    label="END DATE"
                    value={draft.endDate ?? ''}
                    onChange={value => update({ endDate: value || null })}
                    displayFormat="long-month"
                    locale="en-GB"
                    calendarIcon={calendarIcon()}
                    openCalendarOnFieldPress
                  />
                </View>
                {field('CNP', draft.fiscalCode ?? '', value =>
                  update({ fiscalCode: value }),
                )}
                {field(
                  'Details for beneficiary',
                  draft.paymentDetails ?? '',
                  value => update({ paymentDetails: value }),
                )}
                {field(
                  'Order no. / E2E reference',
                  draft.orderReference ?? '',
                  value => update({ orderReference: value }),
                )}
              </>
            ) : null}
            {kind !== 'direct-debit' && kind !== 'standing-order' ? (
              <>
                <View style={styles.field}>
                  <BaselineAmountField
                    label="Amount"
                    value={draft.amount}
                    onChange={value => update({ amount: value })}
                    currency={draft.currency}
                    currencyLabel="CURRENCY"
                    currencyPresentation="selector"
                    onCurrencyClick={() => setChoicePicker('currency')}
                    dark={dark}
                  />
                </View>
                {kind === 'currency-exchange' ? (
                  <View style={styles.exchange}>
                    <Text
                      style={[
                        styles.toggleLabel,
                        { color: color('--uc-text') },
                      ]}
                    >
                      EXCHANGE RATE
                    </Text>
                    <Text
                      style={[
                        styles.subtitle,
                        { color: color('--uc-text-muted') },
                      ]}
                    >
                      1 EUR = 5.4200 RON
                    </Text>
                  </View>
                ) : null}
                <View style={styles.field}>
                  <DateField
                    tokens={host.tokens}
                    label={
                      kind === 'foreign-payment' || kind === 'treasury-payment'
                        ? 'PAYMENT DATE'
                        : 'PAYMENT PROCESSING DATE'
                    }
                    value={draft.paymentDate}
                    onChange={value => update({ paymentDate: value })}
                    displayFormat="long-month"
                    locale="en-GB"
                    calendarIcon={calendarIcon()}
                    openCalendarOnFieldPress
                  />
                </View>
                {kind === 'treasury-payment'
                  ? toggleRow(
                      'PROCESSING METHOD URGENT',
                      Boolean(draft.urgent),
                      value => update({ urgent: value }),
                    )
                  : null}
                {kind === 'own-account-transfer'
                  ? toggleRow(
                      'INSTANT PAYMENT',
                      Boolean(draft.instantPayment),
                      value => update({ instantPayment: value }),
                    )
                  : null}
                {field('Payment details', draft.paymentDetails ?? '', value =>
                  update({ paymentDetails: value }),
                )}
                {kind === 'treasury-payment' ? (
                  <>
                    {field(
                      'Order no. / E2E reference',
                      draft.orderReference ?? '',
                      value => update({ orderReference: value }),
                    )}
                    {field('Fiscal code / CNP', draft.fiscalCode ?? '', value =>
                      update({ fiscalCode: value }),
                    )}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={
                        showMore ? 'HIDE DETAILS' : 'SHOW MORE DETAILS'
                      }
                      onPress={() => setShowMore(value => !value)}
                      style={styles.more}
                    >
                      <Text
                        style={[
                          styles.toggleLabel,
                          { color: color('--uc-text') },
                        ]}
                      >
                        {showMore ? 'HIDE DETAILS' : 'SHOW MORE DETAILS'}
                      </Text>
                    </Pressable>
                    {showMore
                      ? field(
                          'Payment reference no (ANAF code)',
                          draft.anafReference ?? '',
                          value => update({ anafReference: value }),
                        )
                      : null}
                  </>
                ) : null}
              </>
            ) : null}
            {kind === 'foreign-payment' ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  showMore ? 'HIDE DETAILS' : 'SHOW MORE DETAILS'
                }
                onPress={() => setShowMore(value => !value)}
                style={styles.more}
              >
                <Text
                  style={[styles.toggleLabel, { color: color('--uc-text') }]}
                >
                  {showMore ? 'HIDE DETAILS' : 'SHOW MORE DETAILS'}
                </Text>
              </Pressable>
            ) : null}
            {kind === 'foreign-payment' && showMore
              ? field('Payment details', draft.paymentDetails ?? '', value =>
                  update({ paymentDetails: value }),
                )
              : null}
          </>
        ) : (
          <>
            <View style={styles.reviewSection}>
              <BaselineSectionDivider title="PAYMENT ORDER" dark={dark} />
            </View>
            {reviewRows.map(([label, value]) => (
              <Fact
                key={label}
                host={host}
                label={label!}
                value={value}
              />
            ))}
          </>
        )}
      </ScrollView>
      {step === 'create' ? (
        <View style={styles.footer}>
          <Text style={[styles.hint, { color: color('--uc-text') }]}>
            You can review and sign your payment in the next step
          </Text>
          <PrimaryButton
            label="Next"
            disabled={!valid}
            dark={dark}
            onPress={() => setStep('review')}
          />
        </View>
      ) : (
        <View style={styles.footer}>
          <PrimaryButton
            label="Sign"
            dark={dark}
            onPress={() => setStep('sign')}
          />
        </View>
      )}
      {accountPicker ? (
        <AccountSelectionSheet
          host={host}
          title={accountPicker === 'source' ? 'From account' : 'To account'}
          options={accounts
            .filter(
              account =>
                accountPicker === 'source' ||
                (account.id !== source?.id &&
                  (kind === 'currency-exchange'
                    ? account.currency !== source?.currency
                    : account.currency === source?.currency)),
            )
            .map(account => ({
              id: account.id,
              name: account.name,
              detail: account.accountNumber,
              balance: account.balance,
              currency: account.currency,
            }))}
          selectedId={
            accountPicker === 'source'
              ? draft.sourceAccountId
              : draft.destinationAccountId ?? ''
          }
          onClose={() => setAccountPicker(null)}
          onConfirm={id => {
            if (accountPicker === 'source') {
              const selected = accounts.find(account => account.id === id);
              if (
                selected &&
                (kind === 'currency-exchange' ||
                  kind === 'own-account-transfer')
              ) {
                const matchingDestination = accounts.find(
                  account =>
                    account.id !== id &&
                    (kind === 'currency-exchange'
                      ? account.currency !== selected.currency
                      : account.currency === selected.currency),
                );
                update({
                  sourceAccountId: id,
                  currency: selected.currency,
                  destinationAccountId: matchingDestination?.id,
                });
              } else update({ sourceAccountId: id });
            } else update({ destinationAccountId: id });
            setAccountPicker(null);
          }}
        />
      ) : null}
      {choicePicker ? (
        <ChoiceSheet
          host={host}
          kind={choicePicker}
          selected={
            choicePicker === 'address'
              ? draft.addressMode ?? 'unstructured'
              : choicePicker === 'currency'
              ? draft.currency
              : draft.frequency ?? 'monthly'
          }
          onClose={() => setChoicePicker(null)}
          onSelect={value => {
            if (choicePicker === 'address')
              setDraft(current =>
                setRoBaselineAddressMode(
                  current,
                  value as NonNullable<RoBaselinePaymentDraft['addressMode']>,
                ),
              );
            if (choicePicker === 'currency')
              update({ currency: value as RoBaselinePaymentDraft['currency'] });
            if (choicePicker === 'frequency')
              update({
                frequency: value as NonNullable<
                  RoBaselinePaymentDraft['frequency']
                >,
              });
            setChoicePicker(null);
          }}
        />
      ) : null}
    </View>
  );
}

function ChoiceSheet({
  host,
  kind,
  selected,
  onClose,
  onSelect,
}: {
  host: CurrentScreenProps;
  kind: 'address' | 'currency' | 'frequency';
  selected: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  const [draftValue, setDraftValue] = useState(selected);
  const options: { value: string; label: string; description?: string }[] =
    kind === 'address'
      ? [
          {
            value: 'unstructured',
            label: 'UNSTRUCTURED',
            description:
              'The full address will be entered in a single field, exactly as it appears (e.g.: street, number, city, country).',
          },
          {
            value: 'hybrid',
            label: 'HYBRID',
            description:
              'Combines dedicated fields for country and city with a free field for additional details (e.g.: street, number).',
          },
          {
            value: 'structured',
            label: 'STRUCTURED',
            description:
              'Each part of the address (country, city, street, number, etc.) has a dedicated field.',
          },
        ]
      : kind === 'currency'
      ? ['RON', 'EUR', 'USD'].map(value => ({ value, label: value }))
      : ['weekly', 'biweekly', 'monthly', 'yearly'].map(value => ({
          value,
          label: value.toUpperCase(),
        }));
  const dark = host.tokens.background === '#121212';
  const color = (token: string) => sourceColor(`var(${token})`, dark);
  const { width, height } = useDemoViewport();
  const title =
    kind === 'address'
      ? 'Address type'
      : kind === 'currency'
      ? 'Currency'
      : 'Frequency';
  const iconVariables = {
    '--uc-surface': color('--uc-surface'),
    '--uc-action': color('--uc-action'),
  };
  return (
    <ModalPortal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <BaselineBottomSheet
        title={title}
        onClose={onClose}
        closeLabel={`Close ${title.toLowerCase()} options`}
        width={width}
        height={height}
        fillHeight={kind === 'address'}
        padding={16}
        dark={dark}
        footer={
          <View style={styles.sheetFooter}>
            <PrimaryButton
              label="Apply"
              dark={dark}
              onPress={() => onSelect(draftValue)}
            />
          </View>
        }
      >
        <View style={styles.choiceContent}>
          <View style={styles.choiceSectionHeading}>
            <Text
              style={[styles.choiceSectionTitle, { color: color('--uc-text') }]}
            >
              CHOOSE ONE OPTION
            </Text>
            <View
              style={[
                styles.choiceRule,
                { backgroundColor: host.tokens.border },
              ]}
            />
          </View>
          {options.map(option => {
            const isSelected = option.value === draftValue;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ checked: isSelected }}
                aria-checked={isSelected}
                onPress={() => setDraftValue(option.value)}
                style={styles.choiceOption}
              >
                <View style={styles.choiceRadio}>
                  <SourceCustomIcon
                    name={isSelected ? 'radio-selected' : 'radio-unselected'}
                    size={20}
                    color={color('--uc-text')}
                    variables={iconVariables}
                  />
                </View>
                <View style={styles.choiceOptionCopy}>
                  <Text
                    style={[
                      styles.choiceOptionLabel,
                      { color: color('--uc-text') },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {option.description ? (
                    <Text
                      style={[
                        styles.choiceOptionDescription,
                        { color: color('--uc-text') },
                      ]}
                    >
                      {option.description}
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </BaselineBottomSheet>
    </ModalPortal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, width: '100%', overflow: 'hidden' },
  webScroll: { transform: 'none' },
  listBody: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    flexGrow: 1,
  },
  providerBody: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 16,
  },
  formBody: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  pageTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 24,
  },
  subtitle: { fontFamily: 'UniCredit-regular', fontSize: 16, lineHeight: 22 },
  record: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#B8B8B8',
    paddingVertical: 18,
    gap: 6,
  },
  recordTitle: { fontFamily: 'UniCredit-bold', fontSize: 17 },
  empty: { marginTop: 16 },
  providerRow: {
    minHeight: 64,
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D0D0D0',
  },
  providerName: { fontFamily: 'UniCredit-bold', fontSize: 16, lineHeight: 22 },
  providerIntro: { gap: 4, marginBottom: 4 },
  providerTitle: { fontFamily: 'UniCredit-bold', fontSize: 22, lineHeight: 28 },
  section: { paddingTop: 30 },
  reviewSection: { marginTop: 8, marginBottom: 2 },
  sectionTitle: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 18 },
  field: { minHeight: 80, justifyContent: 'center' },
  accountPickerField: { minHeight: 96, justifyContent: 'center' },
  eyebrow: { fontFamily: 'UniCredit-regular', fontSize: 14, lineHeight: 18 },
  toggleRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  toggleCopy: { flex: 1, gap: 4 },
  toggleLabel: { fontFamily: 'UniCredit-bold', fontSize: 15, lineHeight: 20 },
  limitChoices: { gap: 18, paddingVertical: 8, paddingHorizontal: 2 },
  limitChoice: { width: 90, alignItems: 'center', gap: 8 },
  limitCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  limitCheck: { fontFamily: 'UniCredit-bold', fontSize: 27, lineHeight: 32 },
  limitLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 13,
    textAlign: 'center',
  },
  exchange: { gap: 2, marginTop: 4 },
  more: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  termsLink: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8C8C8C',
    paddingVertical: 12,
  },
  termsText: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  termsCopy: { fontFamily: 'UniCredit-regular', fontSize: 14, lineHeight: 20 },
  helper: { marginTop: -8, fontSize: 14 },
  hint: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 20,
  },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28, gap: 4 },
  choiceContent: { gap: 8, paddingBottom: 16 },
  choiceSectionHeading: { gap: 8, paddingHorizontal: 8 },
  choiceSectionTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 20,
  },
  choiceRule: { height: StyleSheet.hairlineWidth },
  choiceOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  choiceRadio: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceOptionCopy: { flex: 1, gap: 2 },
  choiceOptionLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 20,
  },
  choiceOptionDescription: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
  },
  sheetFooter: { paddingTop: 12, paddingBottom: 16 },
});
