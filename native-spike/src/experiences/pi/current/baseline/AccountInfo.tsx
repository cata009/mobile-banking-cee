import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  getLoanDetails,
  getTermDepositDetails,
} from '@/data/accountProductDetails';
import {
  formatMoneyNumber,
  getCountryConfig,
} from '@/app/registry/countryConfig';
import { maskFormattedAmount } from '@/app/utils/amountPrivacy';
import { formatMaskedCardNumber } from '@/app/utils/cardNumber';
import type { CurrentScreenProps } from '../contracts';
import { bankingProducts, copy } from '../banking/model';
import { BankingCopyToast, useBankingCopy } from '../banking/CopyToast';
import { BaselinePageHeader } from '../../../../universal/BaselinePageHeader';
import { BaselineAccountInfoField } from '../../../../universal/BaselineAccountInfoField';
import { BaselineCardNavigationRow } from '../../../../universal/BaselineCardNavigationRow';
import { BaselineSectionDivider } from '../../../../universal/BaselineSectionDivider';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';

/** Source account information: identity stays visible; only financial values are private. */
export default function RoBaselineAccountInfo(host: CurrentScreenProps) {
  const data = bankingProducts(host);
  const product =
    data.accounts.find(
      item =>
        item.id ===
        (host.route.params?.productId ?? host.route.params?.accountId),
    ) ?? data.accounts[0];
  const [progress, setProgress] = useState(0);
  const { copy: copyAccount, toast } = useBankingCopy();
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const title = copy(
    host,
    'runtime.accounts.detailsInfo.title',
    'Account Details',
  );
  const currency = getCountryConfig(host.country).currency;
  const amount = (value: number) =>
    `${maskFormattedAmount(
      formatMoneyNumber(value, host.country),
      host.amountsHidden,
    )} ${currency}`;
  const currentAccountNumber =
    data.currentAccounts[0]?.accountNumber ?? product?.accountNumber ?? '';
  const deposit =
    product?.type === 'term_deposit'
      ? getTermDepositDetails(product, currentAccountNumber)
      : null;
  const loan =
    product?.type === 'loan' || product?.type === 'mortgage'
      ? getLoanDetails(product)
      : null;
  const productTitleKey =
    product?.type === 'saving_account'
      ? 'savingAccount'
      : product?.type === 'term_deposit'
      ? 'termDeposit'
      : product?.type === 'loan'
      ? 'loan'
      : product?.type === 'mortgage'
      ? 'mortgage'
      : 'currentAccount';
  const accountTitle = {
    key: 'accountTitle',
    fallback: 'Account title',
    value: copy(
      host,
      `runtime.accounts.productTitles.${productTitleKey}`,
      product?.type.replace(/_/g, ' ').toUpperCase() ?? '',
    ),
  };
  type Field = {
    key: string;
    fallback: string;
    value: string;
    copyLabel?: string;
  };
  const fields: Field[] = !product
    ? []
    : deposit
    ? [
        {
          key: 'termDeposit.maturityAmount',
          fallback: 'Maturity amount',
          value: amount(deposit.maturityAmount),
        },
        {
          key: 'termDeposit.interestAmountBeforeTax',
          fallback: 'Interest amount before tax',
          value: amount(deposit.interestAmountBeforeTax),
        },
        {
          key: 'termDeposit.maturityDate',
          fallback: 'Maturity date',
          value: deposit.maturityDate,
        },
        {
          key: 'termDeposit.rollover',
          fallback: 'Rollover',
          value: deposit.rollover,
        },
        accountTitle,
        {
          key: 'termDeposit.accountOwner',
          fallback: 'Account owner',
          value: deposit.accountOwner,
        },
        {
          key: 'termDeposit.depositAmount',
          fallback: 'Deposit Amount',
          value: amount(deposit.depositAmount),
        },
        {
          key: 'termDeposit.startValueDate',
          fallback: 'Start/Value Date',
          value: deposit.startValueDate,
        },
        {
          key: 'termDeposit.maturityPeriod',
          fallback: 'Maturity period',
          value: deposit.maturityPeriod,
        },
        {
          key: 'termDeposit.interestRatePerYear',
          fallback: 'Interest rate/year',
          value: deposit.interestRatePerYear,
        },
        {
          key: 'termDeposit.currentAccountNumber',
          fallback: 'Current account number',
          value: deposit.currentAccountNumber,
        },
        {
          key: 'termDeposit.decreaseAmountBy',
          fallback: 'Decrease amount by',
          value: amount(deposit.decreaseAmountBy),
        },
        {
          key: 'termDeposit.reinvestInterest',
          fallback: 'Reinvest the interest',
          value: deposit.reinvestInterest,
        },
      ]
    : loan
    ? [
        {
          key: 'loan.nextInstallment',
          fallback: 'Next installment',
          value: amount(loan.nextInstallment),
        },
        {
          key: 'loan.nextInstallmentDate',
          fallback: 'Next installment date',
          value: loan.nextInstallmentDate,
        },
        {
          key: 'loan.interestRate',
          fallback: 'Interest rate',
          value: loan.interestRate,
        },
        {
          key: 'loan.overdueAmount',
          fallback: 'Overdue amount',
          value: amount(loan.overdueAmount),
        },
        {
          key: 'loan.overdueInterestRate',
          fallback: 'Overdue interest rate',
          value: loan.overdueInterestRate,
        },
        {
          key: 'loan.ownedAmount',
          fallback: 'Owned amount',
          value: amount(loan.ownedAmount),
        },
        {
          key: 'loan.originalAmount',
          fallback: 'Original amount',
          value: amount(loan.originalAmount),
        },
        accountTitle,
        {
          key: 'loan.iban',
          fallback: 'IBAN',
          value: loan.iban,
          copyLabel: 'IBAN',
        },
        {
          key: 'loan.accountOwner',
          fallback: 'Account owner',
          value: loan.accountOwner,
        },
        {
          key: 'loan.startDate',
          fallback: 'Start date',
          value: loan.startDate,
        },
        {
          key: 'loan.finalPayment',
          fallback: 'Final payment',
          value: loan.finalPayment,
        },
      ]
    : [
        {
          key: 'accountNumber',
          fallback: 'Account number',
          value: product.accountNumber,
          copyLabel: 'Account number',
        },
        ...(product.type === 'saving_account'
          ? [accountTitle]
          : [
              {
                key: 'availableFunds',
                fallback: 'Available funds',
                value: amount(product.balance),
              },
            ]),
        {
          key: 'currentBalance',
          fallback: 'Current balance',
          value: amount(
            product.type === 'saving_account'
              ? product.balance
              : product.balance * 0.92,
          ),
        },
        ...(product.type === 'saving_account'
          ? []
          : [
              {
                key: 'blockedReservedAmount',
                fallback: 'Blocked/reserved amount',
                value: amount(0),
              },
              { key: 'overdraft', fallback: 'Overdraft', value: amount(0) },
              accountTitle,
              {
                key: 'offer',
                fallback: 'Offer',
                value: copy(
                  host,
                  'runtime.accounts.detailsInfo.offerValue',
                  'Account under favorable conditions',
                ),
              },
            ]),
      ];
  const connectedCard =
    product?.type === 'current_account'
      ? data.cards.find(
          card =>
            card.type === 'debit_card' && card.linkedAccountId === product.id,
        )
      : null;
  const surface = sourceColor('var(--uc-surface)', dark);
  return (
    <View style={[styles.root, { backgroundColor: surface }]}>
      <ScrollView
        testID="ro-account-info-page"
        stickyHeaderIndices={[0]}
        style={Platform.OS === 'web' ? styles.webScroll : undefined}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={event =>
          setProgress(
            Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 64)),
          )
        }
      >
        <BaselinePageHeader
          title={title}
          onBack={host.onBack}
          showHelp={false}
          renderLargeTitle={false}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          collapsedTitleProgress={progress}
          dark={dark}
          rightActionIcon={
            product ? (
              <SourceCustomIcon
                name="share-filled"
                size={20}
                color={host.tokens.text}
              />
            ) : undefined
          }
          rightActionLabel={copy(
            host,
            'runtime.actions.shareAccountDetails',
            'Share account details',
          )}
        />
        {product ? (
          <>
            <View style={[styles.titleFrame, { opacity: 1 - progress }]}>
              <Text
                accessibilityRole="header"
                style={[styles.title, { color: host.tokens.text }]}
              >
                {title}
              </Text>
            </View>
            <View style={styles.fields}>
              {fields.map(field => (
                <BaselineAccountInfoField
                  key={field.key}
                  title={copy(
                    host,
                    `runtime.accounts.detailsInfo.${field.key}`,
                    field.fallback,
                  )}
                  subtitle={field.value}
                  dark={dark}
                  trailingIcon={
                    field.copyLabel ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={
                          field.copyLabel === 'IBAN'
                            ? 'Copy IBAN'
                            : 'Copy account number'
                        }
                        onPress={() => {
                          copyAccount(field.value, field.copyLabel!);
                        }}
                        style={styles.copy}
                      >
                        <SourceCustomIcon
                          name="copy-documents"
                          size={20}
                          color={host.tokens.text}
                        />
                      </Pressable>
                    ) : undefined
                  }
                />
              ))}
              {product.type === 'current_account' ? (
                <>
                  <View style={styles.less}>
                    <Pressable accessibilityRole="button">
                      <Text
                        style={[
                          styles.lessLabel,
                          { color: host.tokens.accent },
                        ]}
                      >
                        {copy(
                          host,
                          'runtime.actions.showLess',
                          'Show less',
                        ).toUpperCase()}
                      </Text>
                    </Pressable>
                  </View>
                  <BaselineSectionDivider
                    title={copy(
                      host,
                      'runtime.accounts.detailsInfo.connectedCards',
                      'Connected cards',
                    )}
                    dark={dark}
                  />
                  <BaselineCardNavigationRow
                    card={connectedCard}
                    label={copy(
                      host,
                      'runtime.accounts.detailsInfo.mastercardStandardDebit',
                      'Mastercard Standard Debit',
                    )}
                    maskedNumber={
                      connectedCard
                        ? formatMaskedCardNumber(connectedCard.cardNumber)
                        : undefined
                    }
                    dark={dark}
                  />
                </>
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>
      <BankingCopyToast toast={toast} font={host.tokens.strongFont} />
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  webScroll: { transform: 'none' },
  titleFrame: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { fontFamily: 'UniCredit-bold', fontSize: 28, lineHeight: 31 },
  fields: { paddingHorizontal: 24, paddingTop: 46, paddingBottom: 40 },
  copy: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  less: { paddingVertical: 48, alignItems: 'center' },
  lessLabel: { fontFamily: 'UniCredit-bold', fontSize: 16, lineHeight: 17 },
});
