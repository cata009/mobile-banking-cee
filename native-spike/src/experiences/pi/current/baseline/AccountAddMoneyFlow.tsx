import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  getCountryConfig,
  formatMoneyNumber,
} from '@/app/registry/countryConfig';
import {
  formatAddMoneyAmount,
  isValidAddMoneyAmount,
  isValidAddMoneyCardPayment,
  isValidMonthlyRecurrenceDay,
  ADD_MONEY_PRESET_AMOUNTS,
  type AddMoneyCardDetails,
} from '@/features/accounts-payments/addMoney';
import { getAccountNameOverride } from '@/features/accounts-payments/accountNameOverrides';
import type { Product } from '@/data/products';
import type { CurrentScreenProps } from '../contracts';
import { copy } from '../banking/model';
import { BaselineCheckbox } from '../../../../universal/BaselineCheckbox';
import { BaselineDropdownField } from '../../../../universal/BaselineDropdownField';
import { BaselineNavigationRow } from '../../../../universal/BaselineNavigationRow';
import { BaselinePageHeader } from '../../../../universal/BaselinePageHeader';
import { BaselineSectionDivider } from '../../../../universal/BaselineSectionDivider';
import { BaselineTextField } from '../../../../universal/BaselineTextField';
import { PrimaryButton } from '../../../../universal/PrimaryButton';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { Text } from '../../../../universal/Typography';
import { ToggleButton } from '../../../../universal/ToggleButton';
import { sourceColor } from '../../../../universal/sourceColor';

type AddMoneyStep = 'form' | 'review' | 'card' | 'success';

function accountTypeTitleKey(account: Product) {
  return account.type === 'saving_account'
    ? 'savingAccount'
    : account.type === 'term_deposit'
      ? 'termDeposit'
      : account.type === 'loan'
        ? 'loan'
        : account.type === 'mortgage'
          ? 'mortgage'
          : 'currentAccount';
}

export function AccountAddMoneyFlow({
  host,
  accounts,
  initialAccountId,
  onClose,
}: {
  host: CurrentScreenProps;
  accounts: readonly Product[];
  initialAccountId: string;
  onClose: () => void;
}) {
  const eligibleAccounts = accounts.filter(
    account =>
      account.type === 'current_account' || account.type === 'saving_account',
  );
  const [step, setStep] = useState<AddMoneyStep>('form');
  const [targetAccountNumber, setTargetAccountNumber] = useState(
    eligibleAccounts.find(account => account.id === initialAccountId)
      ?.accountNumber ??
      eligibleAccounts[0]?.accountNumber ??
      '',
  );
  const [amount, setAmount] = useState('50.00');
  const [transactionInfo, setTransactionInfo] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurrenceDay, setRecurrenceDay] = useState('1');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cardConsent, setCardConsent] = useState(false);
  const [card, setCard] = useState<AddMoneyCardDetails>({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    securityCode: '',
  });
  const onBackHandlerChange = host.onBackHandlerChange;
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const currency = getCountryConfig(host.country).currency;
  const selectedAccount = eligibleAccounts.find(
    account => account.accountNumber === targetAccountNumber,
  );
  const accountName = selectedAccount
    ? (getAccountNameOverride(selectedAccount.id) ??
      copy(
        host,
        `runtime.accounts.productTitles.${accountTypeTitleKey(selectedAccount)}`,
        selectedAccount.type.replace(/_/g, ' ').toUpperCase(),
      ))
    : '';
  const parsedAmount = isValidAddMoneyAmount(amount)
    ? formatAddMoneyAmount(amount)
    : amount;
  const canReview =
    Boolean(selectedAccount) &&
    isValidAddMoneyAmount(amount) &&
    (!recurring || isValidMonthlyRecurrenceDay(Number(recurrenceDay)));
  const canPay = isValidAddMoneyCardPayment(card, cardConsent);
  const beneficiaryAccountNumber = selectedAccount
    ? selectedAccount.accountNumber.replace(/\D/g, '').slice(-10)
    : '';
  const amountDisplay = `${parsedAmount} ${currency}`;

  useEffect(() => {
    const back = () => {
      if (step === 'form' || step === 'success') onClose();
      else if (step === 'review') setStep('form');
      else setStep('review');
      return true;
    };
    onBackHandlerChange?.(back);
    return () => onBackHandlerChange?.(null);
  }, [onBackHandlerChange, onClose, step]);

  const updateCard = (change: Partial<AddMoneyCardDetails>) =>
    setCard(current => ({ ...current, ...change }));
  const titleText = (label: string, value: string) => (
    <View style={styles.reviewField}>
      <Text style={[styles.reviewLabel, { color: host.tokens.text }]}>
        {label}
      </Text>
      <Text style={[styles.reviewValue, { color: host.tokens.muted }]}>
        {value}
      </Text>
    </View>
  );
  const pageTitle =
    step === 'form'
      ? 'Add money'
      : step === 'review'
        ? 'Review data'
        : step === 'card'
          ? ''
          : 'Success!';

  if (step === 'success') {
    return (
      <View
        style={[
          styles.successRoot,
          { backgroundColor: host.tokens.background },
        ]}
      >
        <BaselinePageHeader
          title="Success!"
          onBack={onClose}
          showHelp={false}
          renderLargeTitle={false}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          dark={dark}
        />
        <View style={styles.successBody}>
          <Text style={[styles.successTitle, { color: host.tokens.text }]}>
            Success!
          </Text>
          <SourceCustomIcon
            name="check-circle"
            size={100}
            color={sourceColor('var(--uc-green-success)', dark)}
          />
          <Text style={[styles.successMessage, { color: host.tokens.text }]}>
            {amountDisplay} will be added to {accountName}.
          </Text>
        </View>
        <View style={styles.footer}>
          <PrimaryButton
            label="OK, GOT IT"
            labelSize="18"
            onPress={onClose}
            dark={dark}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: host.tokens.background }]}>
      <ScrollView
        testID={`ro-add-money-${step}`}
        stickyHeaderIndices={[0]}
        style={Platform.OS === 'web' ? styles.webScroll : undefined}
        showsVerticalScrollIndicator={false}
      >
        <BaselinePageHeader
          title={pageTitle}
          onBack={() => {
            if (step === 'form') onClose();
            else if (step === 'review') setStep('form');
            else setStep('review');
          }}
          showHelp={step !== 'card'}
          renderLargeTitle={false}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          dark={dark}
        />
        {step === 'form' ? (
          <View style={styles.formContent}>
            <Text
              accessibilityRole="header"
              style={[styles.title, { color: host.tokens.text }]}
            >
              Add money
            </Text>
            <Text style={[styles.toLabel, { color: host.tokens.text }]}>
              TO
            </Text>
            <BaselineDropdownField
              label="ACCOUNT NUMBER"
              value={targetAccountNumber}
              options={eligibleAccounts.map(account => ({
                value: account.accountNumber,
                label: account.accountNumber,
              }))}
              onChange={setTargetAccountNumber}
              fillWidth
              dark={dark}
            />
            {selectedAccount ? (
              <View style={styles.accountBalance}>
                <Text style={[styles.accountName, { color: host.tokens.text }]}>
                  {accountName.toUpperCase()}
                </Text>
                <Text
                  style={[
                    styles.accountBalanceValue,
                    { color: host.tokens.muted },
                  ]}
                >
                  {formatMoneyNumber(selectedAccount.balance, host.country)}{' '}
                  {currency}
                </Text>
              </View>
            ) : null}
            <View style={styles.paymentDetails}>
              <BaselineSectionDivider title="PAYMENT DETAILS" dark={dark} />
              <View style={styles.amountPresets}>
                {ADD_MONEY_PRESET_AMOUNTS.map(preset => {
                  const selected =
                    Number(amount.replace(',', '.')) === Number(preset);
                  return (
                    <Pressable
                      key={preset}
                      accessibilityRole="radio"
                      accessibilityLabel={`${Number(preset).toLocaleString('en-US')} ${currency}`}
                      accessibilityState={{ checked: selected }}
                      onPress={() => setAmount(preset)}
                      style={styles.preset}
                    >
                      <View
                        style={[
                          styles.presetCircle,
                          {
                            backgroundColor: sourceColor(
                              selected
                                ? 'var(--uc-action)'
                                : 'var(--uc-neutral-100)',
                              dark,
                            ),
                          },
                        ]}
                      >
                        <SourceCustomIcon
                          name="check"
                          size={24}
                          color="#FFFFFF"
                        />
                      </View>
                      <Text
                        style={[
                          styles.presetLabel,
                          { color: host.tokens.text },
                        ]}
                      >
                        {Number(preset).toLocaleString('en-US')} {currency}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.amountRow}>
                <View style={styles.amountInput}>
                  <BaselineTextField
                    label="AMOUNT"
                    ariaLabel="Amount"
                    value={amount}
                    onChange={setAmount}
                    inputMode="decimal"
                    dark={dark}
                  />
                </View>
                <View style={styles.currency}>
                  <Text
                    style={[styles.currencyLabel, { color: host.tokens.muted }]}
                  >
                    CURRENCY
                  </Text>
                  <Text
                    style={[styles.currencyValue, { color: host.tokens.text }]}
                  >
                    {currency}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.transactionInfo}>
              <BaselineTextField
                label="Transaction info"
                ariaLabel="Transaction info"
                value={transactionInfo}
                onChange={setTransactionInfo}
                maxLength={140}
                dark={dark}
              />
            </View>
            <BaselineNavigationRow
              title="RECURRENT PAYMENT"
              trailing={
                <ToggleButton
                  ariaLabel="RECURRENT PAYMENT"
                  checked={recurring}
                  onToggle={setRecurring}
                  dark={dark}
                />
              }
              rowHeight={80}
              style={styles.rowInset}
              dark={dark}
            />
            {recurring ? (
              <BaselineDropdownField
                label="MONTHLY RECURRENCE DAY"
                value={recurrenceDay}
                options={Array.from({ length: 31 }, (_, index) => ({
                  value: String(index + 1),
                  label: String(index + 1),
                }))}
                onChange={setRecurrenceDay}
                fillWidth
                dark={dark}
              />
            ) : null}
          </View>
        ) : null}
        {step === 'review' ? (
          <View style={styles.reviewContent}>
            <Text
              accessibilityRole="header"
              style={[styles.title, { color: host.tokens.text }]}
            >
              Review data
            </Text>
            <BaselineSectionDivider
              title="CHECK YOUR DATA AND CONFIRM"
              dark={dark}
            />
            {titleText('BENEFICIARY ACCOUNT NAME', accountName.toUpperCase())}
            {titleText('BENEFICIARY ACCOUNT NUMBER', beneficiaryAccountNumber)}
            {titleText('AMOUNT', amountDisplay)}
            {transactionInfo.trim()
              ? titleText('TRANSACTION INFO', transactionInfo.trim())
              : null}
            {titleText('RECURRENT PAYMENT', recurring ? 'Yes' : 'No')}
            {recurring
              ? titleText('MONTHLY RECURRENCE DAY', recurrenceDay)
              : null}
            <BaselineNavigationRow
              title="I AGREE WITH TERMS AND CONDITIONS"
              trailing={
                <ToggleButton
                  ariaLabel="I AGREE WITH TERMS AND CONDITIONS"
                  checked={termsAccepted}
                  onToggle={setTermsAccepted}
                  dark={dark}
                />
              }
              rowHeight={80}
              style={styles.rowInset}
              dark={dark}
            />
            {!termsAccepted ? (
              <Text style={[styles.termsHint, { color: host.tokens.muted }]}>
                To proceed you must accept the terms and conditions of service
              </Text>
            ) : null}
          </View>
        ) : null}
        {step === 'card' ? (
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text
                style={[styles.cardHeaderTitle, { color: host.tokens.text }]}
              >
                Credit or Debit card
              </Text>
              <View style={styles.cardBrands}>
                <Text style={styles.mastercard}>●</Text>
                <Text style={[styles.visa, { color: host.tokens.text }]}>
                  VISA
                </Text>
              </View>
            </View>
            <View style={styles.cardFields}>
              <BaselineTextField
                label="Cardholder name (exactly as shown on card) *"
                ariaLabel="Cardholder name"
                value={card.cardholderName}
                onChange={value => updateCard({ cardholderName: value })}
                maxLength={50}
                dark={dark}
              />
              <BaselineTextField
                label="Card number *"
                ariaLabel="Card number"
                value={card.cardNumber}
                onChange={value => updateCard({ cardNumber: value })}
                inputMode="numeric"
                maxLength={19}
                dark={dark}
              />
              <BaselineTextField
                label="Expiry date *"
                ariaLabel="Expiry date"
                value={card.expiryDate}
                onChange={value => updateCard({ expiryDate: value })}
                inputMode="numeric"
                maxLength={7}
                dark={dark}
              />
              <BaselineTextField
                label="Security code *"
                ariaLabel="Security code"
                value={card.securityCode}
                onChange={value => updateCard({ securityCode: value })}
                inputMode="numeric"
                maxLength={4}
                dark={dark}
              />
            </View>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel="CARD DETAILS CONSENT"
              accessibilityState={{ checked: cardConsent }}
              aria-checked={cardConsent}
              onPress={() => setCardConsent(value => !value)}
              style={styles.cardConsent}
            >
              <View
                pointerEvents="none"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                <BaselineCheckbox
                  checked={cardConsent}
                  presentation="canonical"
                  dark={dark}
                />
              </View>
              <Text
                style={[styles.cardConsentText, { color: host.tokens.text }]}
              >
                I acknowledge the need to provide my card details in accordance
                with the terms of the agreement and I hereby authorize the
                merchant to securely save my card details to process future
                payments.
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        {step === 'form' ? (
          <PrimaryButton
            label="NEXT"
            labelSize="18"
            disabled={!canReview}
            onPress={() => setStep('review')}
            dark={dark}
          />
        ) : null}
        {step === 'review' ? (
          <PrimaryButton
            label="Confirm"
            labelSize="18"
            disabled={!termsAccepted}
            onPress={() => setStep('card')}
            dark={dark}
          />
        ) : null}
        {step === 'card' ? (
          <PrimaryButton
            label={`Pay ${amountDisplay}`}
            labelSize="18"
            disabled={!canPay}
            onPress={() => setStep('success')}
            dark={dark}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  webScroll: { transform: 'none' },
  formContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  title: { fontFamily: 'UniCredit-bold', fontSize: 28, lineHeight: 32 },
  toLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  accountBalance: { paddingHorizontal: 8, marginTop: -4 },
  accountName: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 18,
  },
  accountBalanceValue: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 18,
  },
  paymentDetails: { marginTop: 30 },
  amountPresets: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 8,
  },
  preset: { alignItems: 'center', gap: 6 },
  presetCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetLabel: { fontFamily: 'UniCredit-bold', fontSize: 13, lineHeight: 16 },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 20,
    paddingTop: 30,
  },
  amountInput: { flex: 1, minWidth: 0 },
  currency: { width: 56, paddingBottom: 7 },
  currencyLabel: { fontFamily: 'UniCredit-regular', fontSize: 14 },
  currencyValue: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    marginTop: 2,
  },
  transactionInfo: { paddingTop: 48, paddingBottom: 24 },
  rowInset: { paddingLeft: 0, paddingRight: 0 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  reviewContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  reviewField: { paddingTop: 24, paddingBottom: 10, gap: 2 },
  reviewLabel: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 18 },
  reviewValue: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 21,
  },
  termsHint: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 20,
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 80,
    paddingBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
  },
  cardHeaderTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 20,
  },
  cardBrands: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mastercard: { color: '#EB001B', fontSize: 22 },
  visa: { fontFamily: 'UniCredit-bold', fontSize: 18, fontStyle: 'italic' },
  cardFields: { gap: 18 },
  cardConsent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingTop: 24,
  },
  cardConsentText: {
    flex: 1,
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 20,
  },
  successRoot: { flex: 1, paddingTop: 24, paddingHorizontal: 20 },
  successBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  successTitle: { fontFamily: 'UniCredit-bold', fontSize: 28, lineHeight: 34 },
  successMessage: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
});
