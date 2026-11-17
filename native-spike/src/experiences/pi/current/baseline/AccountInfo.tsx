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
import { AccountDetailsShareSheet } from './AccountDetailsShareSheet';
import { getAccountNameOverride } from '@/features/accounts-payments/accountNameOverrides';
import { accountConvention } from '@/features/accounts-payments/roAccountConvention';
import {
  DEMO_ACCOUNT_OWNER,
  canShareAccountDetails,
  formatIbanGroups,
  getAccountCapabilities,
  getAccountFacts,
  getAccountIdentifiers,
  getLinkedAccountIds,
  getLoanFacts,
  type InterestTier,
} from '@/features/products/productFacts';

/** Source account information: identity stays visible; only financial values are private. */
export default function RoBaselineAccountInfo(host: CurrentScreenProps) {
  const data = bankingProducts(host);
  const product =
    data.accounts.find(
      item =>
        item.id ===
        (host.route.params?.productId ?? host.route.params?.accountId),
    ) ?? data.accounts[0];
  const [progress, setProgress] = useState(0),
    [expanded, setExpanded] = useState(false),
    [shareOpen, setShareOpen] = useState(false);
  const { copy: copyAccount, toast } = useBankingCopy();
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const title = copy(
    host,
    'runtime.accounts.detailsInfo.title',
    'Account Details',
  );
  const currency = product?.currency ?? getCountryConfig(host.country).currency;
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
  const capabilities = getAccountCapabilities(host.country);
  const blocked = Boolean(
    product &&
    host.bankingPresentation?.blockedAccountIds?.includes(product.id),
  );
  const facts =
    product && !deposit && !loan
      ? getAccountFacts(product, host.country, { blocked })
      : null;
  const identifiers = product
    ? getAccountIdentifiers(host.country, product.accountNumber)
    : [];
  const tiersText = (tiers: readonly InterestTier[]) =>
    tiers
      .map((tier, index) =>
        tiers.length === 1
          ? tier.rate
          : tier.upTo !== undefined
            ? `Up to ${amount(tier.upTo)}: ${tier.rate}`
            : `Above ${amount(tiers[index - 1]?.upTo ?? 0)}: ${tier.rate}`,
      )
      .join('\n');
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
    value:
      (product ? getAccountNameOverride(product.id) : undefined) ??
      copy(
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
    /** Clipboard value when it differs from the displayed one (IBAN without spaces). */
    copyValue?: string;
  };
  const allFields: Field[] = !product
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
            ...(() => {
              const extra = getLoanFacts(
                product,
                host.country,
                formatIbanGroups(currentAccountNumber),
              );
              return [
                {
                  key: 'loan.contractNumber',
                  fallback: 'Contract number',
                  value: extra.contractNumber,
                },
                {
                  key: 'loan.repaymentAccount',
                  fallback: 'Repayment account number',
                  value: extra.repaymentAccount,
                },
                {
                  key: 'loan.referenceRate',
                  fallback: 'Margin + reference index',
                  value: `${extra.margin} + ${extra.referenceIndex}`,
                },
              ];
            })(),
          ]
        : [
            ...identifiers.map(identifier => {
              // The audited RO page labels the IBAN "Account number".
              const roLabel =
                host.country === 'RO' && identifier.key === 'iban';
              return {
                key: roLabel ? 'accountNumber' : identifier.key,
                fallback: roLabel ? 'Account number' : identifier.label,
                value: identifier.value,
                copyLabel:
                  identifier.key === 'iban' && !roLabel
                    ? 'IBAN'
                    : 'Account number',
                copyValue: identifier.copyValue,
              };
            }),
            {
              key: 'accountOwner',
              fallback: 'Account owner',
              value: DEMO_ACCOUNT_OWNER,
            },
            ...(product.type === 'saving_account' ? [accountTitle] : []),
            {
              key: 'availableFunds',
              fallback: 'Available funds',
              value: amount(facts!.availableFunds),
            },
            {
              key: 'currentBalance',
              fallback: 'Current balance',
              value: amount(facts!.ledgerBalance),
            },
            ...(product.type === 'saving_account'
              ? []
              : [
                  {
                    key: 'blockedReservedAmount',
                    fallback: 'Blocked/reserved amount',
                    value: amount(facts!.blockedAmount),
                  },
                  {
                    key: 'overdraft',
                    fallback: 'Overdraft',
                    value: amount(facts!.overdraftLimit),
                  },
                  {
                    key: 'outstandingTransactions',
                    fallback: 'Outstanding domestic and foreign transactions',
                    value: amount(facts!.outstandingAmount),
                  },
                  {
                    key: 'creditEvidenceIncrease',
                    fallback: 'Credit evidence increase availability',
                    value: amount(facts!.creditEvidenceIncrease),
                  },
                  accountTitle,
                  ...(accountConvention(host.country, product.type)
                    ? [
                        {
                          key: 'offer',
                          fallback: 'Offer',
                          value: accountConvention(host.country, product.type)!,
                        },
                      ]
                    : []),
                  {
                    key: 'feeChargeDay',
                    fallback: 'Charge day',
                    value: facts!.fees.chargeDay,
                  },
                  {
                    key: 'feeFrequency',
                    fallback: 'Charge frequency',
                    value: facts!.fees.frequency,
                  },
                  {
                    key: 'feeNextChargeDate',
                    fallback: 'Next charge date',
                    value: facts!.fees.nextChargeDate,
                  },
                  ...(facts!.fees.transferAccount
                    ? [
                        {
                          key: 'feeTransferAccount',
                          fallback: 'Charges transfer account',
                          value: facts!.fees.transferAccount,
                        },
                      ]
                    : []),
                ]),
            {
              key: 'creditInterest',
              fallback: 'Credit interest',
              value: tiersText(facts!.interest.credit),
            },
            ...(facts!.interest.debit
              ? [
                  {
                    key: 'debitInterest',
                    fallback: 'Debit interest',
                    value: tiersText(facts!.interest.debit),
                  },
                ]
              : []),
          ];
  /**
   * Owner, outstanding transactions, fees, interest and the extended loan block come from the
   * all-country specification; the audited RO source page keeps its original field set.
   */
  const specificationOnly = new Set([
    'accountOwner',
    'outstandingTransactions',
    'creditEvidenceIncrease',
    'feeChargeDay',
    'feeFrequency',
    'feeNextChargeDate',
    'feeTransferAccount',
    'creditInterest',
    'debitInterest',
    'loan.contractNumber',
    'loan.repaymentAccount',
    'loan.referenceRate',
  ]);
  const fields =
    host.country === 'RO'
      ? allFields.filter(
          field =>
            !specificationOnly.has(field.key) &&
            !(
              product?.type === 'saving_account' &&
              field.key === 'availableFunds'
            ),
        )
      : allFields;
  const showAllDetails = Boolean(deposit || product?.type === 'mortgage');
  const visibleFields =
      showAllDetails || expanded ? fields : fields.slice(0, 3),
    canExpand = !showAllDetails && fields.length > 3,
    expansionLabel = copy(
      host,
      expanded ? 'runtime.actions.showLess' : 'runtime.actions.showMore',
      expanded ? 'Show less' : 'Show more',
    );
  const connectedCards =
    product?.type === 'current_account'
      ? data.cards.filter(
          card =>
            card.type === 'debit_card' &&
            getLinkedAccountIds(
              card,
              data.currentAccounts.map(account => account.id),
              host.country,
            ).includes(product.id),
        )
      : [];
  const accountOwner = DEMO_ACCOUNT_OWNER;
  const bic = host.country === 'RO' ? 'BACXROBU' : undefined;
  const surface = sourceColor('var(--uc-surface)', dark);
  const canShare = Boolean(
    product && canShareAccountDetails(host.country, product.type),
  );
  const accountNumberIdentifier = identifiers.find(item => item.key !== 'iban');
  const ibanIdentifier = identifiers.find(item => item.key === 'iban');
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
          onRightActionPress={canShare ? () => setShareOpen(true) : undefined}
          rightActionIcon={
            canShare ? (
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
            {facts?.status === 'BLOCKED' ? (
              <Text
                accessibilityRole="text"
                style={[styles.blocked, { color: host.tokens.accent }]}
              >
                BLOCKED
              </Text>
            ) : null}
            <View style={styles.fields}>
              {visibleFields.map(field => (
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
                          copyAccount(
                            field.copyValue ?? field.value,
                            field.copyLabel!,
                          );
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
              {canExpand ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={expansionLabel}
                  accessibilityState={{ expanded }}
                  onPress={() => setExpanded(value => !value)}
                  style={styles.expansionAction}
                >
                  <Text
                    style={[
                      styles.expansionActionLabel,
                      { color: host.tokens.accent },
                    ]}
                  >
                    {expansionLabel}
                  </Text>
                </Pressable>
              ) : null}
              {product.type === 'current_account' ? (
                <>
                  <BaselineSectionDivider
                    title={copy(
                      host,
                      'runtime.accounts.detailsInfo.connectedCards',
                      'Connected cards',
                    )}
                    dark={dark}
                  />
                  {connectedCards.length === 0 ? (
                    <BaselineCardNavigationRow
                      card={null}
                      label={copy(
                        host,
                        'runtime.accounts.detailsInfo.mastercardStandardDebit',
                        'Mastercard Standard Debit',
                      )}
                      dark={dark}
                    />
                  ) : connectedCards.length >
                    capabilities.connectedCardsListLimit ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="View all cards"
                      onPress={() => host.onNavigate({ screen: 'cards' })}
                      style={styles.viewAll}
                    >
                      <Text
                        style={[
                          styles.expansionActionLabel,
                          { color: host.tokens.accent },
                        ]}
                      >
                        View all cards
                      </Text>
                    </Pressable>
                  ) : (
                    connectedCards.map(connectedCard => (
                      <BaselineCardNavigationRow
                        key={connectedCard.id}
                        card={connectedCard}
                        label={copy(
                          host,
                          'runtime.accounts.detailsInfo.mastercardStandardDebit',
                          'Mastercard Standard Debit',
                        )}
                        maskedNumber={formatMaskedCardNumber(
                          connectedCard.cardNumber,
                        )}
                        dark={dark}
                      />
                    ))
                  )}
                </>
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>
      {product && canShare && shareOpen ? (
        <AccountDetailsShareSheet
          host={host}
          accountTitle={accountTitle.value}
          accountOwner={accountOwner}
          iban={ibanIdentifier?.copyValue ?? ''}
          accountNumber={accountNumberIdentifier?.copyValue}
          bic={bic}
          onClose={() => setShareOpen(false)}
        />
      ) : null}
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
  fields: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  blocked: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  viewAll: { alignSelf: 'center', paddingVertical: 18 },
  copy: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expansionAction: {
    marginTop: 18,
    paddingBottom: 18,
    alignSelf: 'center',
  },
  expansionActionLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 21,
  },
});
