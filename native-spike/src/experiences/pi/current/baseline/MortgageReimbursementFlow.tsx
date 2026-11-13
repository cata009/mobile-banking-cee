import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import {
  isMortgageReimbursementValid,
  type MortgageReimbursementType,
  type PartialMortgageReimbursementOption,
} from '@/features/accounts-payments/mortgageReimbursement';
import type { Mortgage, Product } from '@/data/products';
import { getLoanDetails } from '@/data/accountProductDetails';
import { maskFormattedAmount } from '@/app/utils/amountPrivacy';
import type { CurrentScreenProps } from '../contracts';
import { bankingProducts } from '../banking/model';
import { BaselineBottomSheet } from '../../../../universal/BaselineBottomSheet';
import { BaselineNavigationRow } from '../../../../universal/BaselineNavigationRow';
import { BaselineStandardSuccess } from '../../../../universal/BaselineStandardSuccess';
import { BaselineTextField } from '../../../../universal/BaselineTextField';
import { ModalPortal } from '../../../../universal/ModalPortal';
import { PrimaryButton } from '../../../../universal/PrimaryButton';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { Text } from '../../../../universal/Typography';
import { useDemoViewport } from '../../../../universal/DemoViewport';
import { sourceColor } from '../../../../universal/sourceColor';
import { AccountSelectionSheet } from './AccountSelectionSheet';
import { RoBaselinePaymentSign } from './payments/confirmation/RoBaselinePaymentConfirmation';
import reimbursementIntro from '@/assets/pi/ro/contract-withdrawal/intro.png';

type FlowStep = 'intro' | 'form' | 'sign' | 'success';

function accountName(account: Product) {
  return account.name;
}

export function MortgageReimbursementFlow({
  host,
  mortgage,
  onClose,
}: {
  host: CurrentScreenProps;
  mortgage: Mortgage;
  onClose: () => void;
}) {
  const { currentAccounts } = bankingProducts(host);
  const accounts = useMemo(
    () => currentAccounts.filter(account => account.type === 'current_account'),
    [currentAccounts],
  );
  const [step, setStep] = useState<FlowStep>('intro');
  const [type, setType] = useState<MortgageReimbursementType>('total');
  const [partialOption, setPartialOption] =
    useState<PartialMortgageReimbursementOption>('decrease-credit-period');
  const [debitAccountId, setDebitAccountId] = useState(accounts[0]?.id ?? '');
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [learnMore, setLearnMore] = useState(false);
  const viewport = useDemoViewport();
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const details = getLoanDetails(mortgage);
  const currency = mortgage.currency;
  const source = accounts.find(account => account.id === debitAccountId);
  const displayAmount = formatMoneyNumber(
    type === 'total'
      ? details.ownedAmount
      : Number(amount.replace(',', '.')) || 0,
    host.country,
  );
  const valid = isMortgageReimbursementValid({
    type,
    amount,
    outstandingBalance: details.ownedAmount,
    debitAccountId,
    acceptedTerms: termsAccepted,
  });
  const textColor = sourceColor('var(--uc-text)', dark);
  const mutedColor = sourceColor('var(--uc-text-muted)', dark);

  const renderSheet = (
    title: string,
    children: React.ReactNode,
    footer: React.ReactNode,
  ) => (
    <ModalPortal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <BaselineBottomSheet
        title={title}
        onClose={onClose}
        footer={<View style={styles.footer}>{footer}</View>}
        width={viewport.width}
        height={viewport.height}
        fixedHeight
        padding={24}
        dark={dark}
      >
        {children}
      </BaselineBottomSheet>
    </ModalPortal>
  );

  if (step === 'intro')
    return renderSheet(
      'Early reimbursement',
      <View
        style={styles.introContent}
        testID="ro-mortgage-reimbursement-intro"
      >
        <Image
          accessibilityLabel="Documents prepared for an early mortgage reimbursement"
          source={{ uri: reimbursementIntro }}
          resizeMode="cover"
          style={styles.introImage}
        />
        <Text style={[styles.introCopy, { color: textColor }]}>
          <Text style={styles.strong}>
            Through Mobile Banking you can request an early loan reimbursement,
            either total or partial.{' '}
          </Text>
          <Text style={styles.strong}>
            Make sure you have sufficient funds in your account before you start
            the process.{' '}
          </Text>
        </Text>
        <Text style={[styles.introCopy, { color: textColor }]}>
          If you want to do a partial loan reimbursement, you can choose between two options in Mobile Banking:
        </Text>
        <Text style={[styles.introCopy, { color: textColor }]}>
          {'\u2022  '}Maintain monthly installment and reduce the credit period{'\n'}
          {'\u2022  '}Reduce monthly installment and maintain the credit period
        </Text>
      </View>,
      <PrimaryButton label="OK" dark={dark} onPress={() => setStep('form')} />,
    );

  if (step === 'sign')
    return <RoBaselinePaymentSign host={host} onBack={() => setStep('form')} onSign={() => setStep('success')} />;

  if (step === 'success')
    return <BaselineStandardSuccess testID="ro-mortgage-reimbursement-success" title="Request submitted" message="Your early reimbursement request has been submitted." actionLabel="Ok, got it" onDone={onClose} dark={dark} />;

  return (
    <>
      {renderSheet(
        'Early reimbursement',
        <View
          testID="ro-mortgage-reimbursement-form"
          style={styles.formContent}
        >
          <Text style={[styles.subtitle, { color: mutedColor }]}>
            You can choose among different reimbursement types
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setLearnMore(value => !value)}
            style={styles.linkRow}
          >
            <Text style={[styles.link, { color: host.tokens.accent }]}>
              Find out more
            </Text>
          </Pressable>
          {learnMore ? (
            <Text style={[styles.explainer, { color: mutedColor }]}>
              A total reimbursement closes the outstanding mortgage balance. A
              partial reimbursement reduces the balance and can reduce either
              the remaining period or monthly installment.
            </Text>
          ) : null}

          <Text style={[styles.sectionTitle, { color: textColor }]}>
            REIMBURSEMENT TYPE
          </Text>
          <View
            style={styles.choiceRow}
            accessibilityRole="radiogroup"
            accessibilityLabel="Reimbursement type"
          >
            {(
              [
                ['total', 'TOTAL'],
                ['partial', 'PARTIAL'],
              ] as const
            ).map(([value, label]) => {
              const selected = type === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityLabel={label}
                  accessibilityState={{ checked: selected }}
                  onPress={() => setType(value)}
                  style={styles.choice}
                >
                  <View style={[styles.choiceCircle, { backgroundColor: sourceColor(selected ? 'var(--uc-action)' : 'var(--uc-neutral-100)', dark) }]}>
                    <SourceCustomIcon name="prime-check" size={22} color={selected ? sourceColor('var(--uc-static-white)') : host.tokens.text} />
                  </View>
                  <Text style={[styles.choiceLabel, { color: textColor }]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {type === 'partial' ? (
            <>
              <Text style={[styles.subsectionTitle, { color: textColor }]}>
                Partial reimbursement type
              </Text>
              <View
                style={styles.choiceRow}
                accessibilityRole="radiogroup"
                accessibilityLabel="Partial reimbursement type"
              >
                {(
                  [
                    ['decrease-credit-period', 'DECREASE CREDIT PERIOD'],
                    [
                      'decrease-monthly-installment',
                      'DECREASE MONTHLY INSTALLMENT',
                    ],
                  ] as const
                ).map(([value, label]) => {
                  const selected = partialOption === value;
                  return (
                    <Pressable
                      key={value}
                      accessibilityRole="radio"
                      accessibilityLabel={label}
                      accessibilityState={{ checked: selected }}
                      onPress={() => setPartialOption(value)}
                      style={styles.choice}
                    >
                      <View style={[styles.choiceCircle, { backgroundColor: sourceColor(selected ? 'var(--uc-action)' : 'var(--uc-neutral-100)', dark) }]}>
                        <SourceCustomIcon name="prime-check" size={22} color={selected ? sourceColor('var(--uc-static-white)') : host.tokens.text} />
                      </View>
                      <Text style={[styles.choiceLabel, { color: textColor }]}>
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          <BaselineTextField
            label="DEBIT ACCOUNT"
            value={source?.accountNumber ?? ''}
            onChange={() => undefined}
            readOnly
            trailingIconName="chevron-down-wide"
            trailingIconPlacement="floating"
            selectionControl={{
              expanded: accountPickerOpen,
              onPress: () => setAccountPickerOpen(true),
            }}
            onActivate={() => setAccountPickerOpen(true)}
            dark={dark}
          />
          <View style={styles.readOnlyField}>
            <Text style={[styles.fieldLabel, { color: mutedColor }]}>
              CREDIT ACCOUNT
            </Text>
            <Text style={[styles.fieldValue, { color: textColor }]}>
              {mortgage.accountNumber}
            </Text>
          </View>
          {type === 'partial' ? (
            <View style={styles.amountRow}>
              <View style={styles.amountField}>
                <BaselineTextField
                  label="Amount"
                  value={amount}
                  onChange={setAmount}
                  inputMode="decimal"
                  dark={dark}
                />
              </View>
              <View style={styles.currencyField}>
                <Text style={[styles.fieldLabel, { color: mutedColor }]}>
                  CURRENCY
                </Text>
                <Text style={[styles.fieldValue, { color: textColor }]}>
                  {currency}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.totalAmount}>
              <Text style={[styles.fieldLabel, { color: mutedColor }]}>
                TOTAL AMOUNT
              </Text>
              <Text style={[styles.fieldValue, { color: textColor }]}>
                {maskFormattedAmount(displayAmount, host.amountsHidden)}{' '}
                {currency}
              </Text>
            </View>
          )}
          <View style={styles.disclaimer}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              DISCLAIMER
            </Text>
            <Text style={[styles.explainer, { color: mutedColor }]}>
              Please read and accept Terms &amp; Conditions in order to
              continue. You can also find important information about data
              protection by following the link below.
            </Text>
            <View style={styles.linkRow}>
              <Text style={[styles.explainer, { color: textColor }]}>
                How will your data be used?
              </Text>
              <Pressable onPress={() => setLearnMore(value => !value)}>
                <Text style={[styles.link, { color: host.tokens.accent }]}>
                  Find out more
                </Text>
              </Pressable>
            </View>
          </View>
          <BaselineNavigationRow
            title="TERMS & CONDITIONS"
            description="I HAVE READ AND I AGREE WITH TERMS & CONDITIONS"
            trailingAccessory="toggle"
            toggleChecked={termsAccepted}
            onToggle={setTermsAccepted}
            style={styles.termsRow}
            dark={dark}
          />
        </View>,
        <PrimaryButton
          label="Confirm"
          disabled={!valid}
          dark={dark}
          onPress={() => setStep('sign')}
        />,
      )}
      {accountPickerOpen ? (
        <AccountSelectionSheet
          host={host}
          title="Debit account"
          options={accounts.map(account => ({
            id: account.id,
            name: accountName(account),
            detail: account.accountNumber,
            balance: account.balance,
            currency: account.currency,
          }))}
          selectedId={debitAccountId}
          onClose={() => setAccountPickerOpen(false)}
          onConfirm={id => {
            setDebitAccountId(id);
            setAccountPickerOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  footer: { paddingTop: 8, paddingBottom: 16 },
  introContent: { gap: 16, paddingBottom: 24 },
  introImage: { width: '100%', height: 150, borderRadius: 8 },
  introCopy: { fontFamily: 'UniCredit-regular', fontSize: 16, lineHeight: 22 },
  strong: { fontFamily: 'UniCredit-bold' },
  formContent: { gap: 18, paddingBottom: 16 },
  subtitle: { fontFamily: 'UniCredit-regular', fontSize: 16, lineHeight: 22 },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  link: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 20 },
  explainer: { fontFamily: 'UniCredit-regular', fontSize: 15, lineHeight: 21 },
  sectionTitle: { fontFamily: 'UniCredit-bold', fontSize: 16, lineHeight: 21 },
  subsectionTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 22,
    marginTop: 12,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
    paddingBottom: 10,
  },
  choice: { width: 92, alignItems: 'flex-start', gap: 8 },
  choiceCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 12,
    lineHeight: 15,
    textAlign: 'left',
  },
  readOnlyField: { gap: 4, paddingVertical: 10 },
  fieldLabel: { fontFamily: 'UniCredit-regular', fontSize: 13, lineHeight: 18 },
  fieldValue: { fontFamily: 'UniCredit-regular', fontSize: 18, lineHeight: 23 },
  amountRow: { flexDirection: 'row', gap: 20, alignItems: 'flex-end' },
  amountField: { flex: 1 },
  currencyField: { minWidth: 78, paddingBottom: 8, gap: 4 },
  totalAmount: { paddingVertical: 8, gap: 4 },
  disclaimer: { gap: 12, paddingTop: 18 },
  termsRow: { paddingLeft: 0, paddingRight: 0 },
});
