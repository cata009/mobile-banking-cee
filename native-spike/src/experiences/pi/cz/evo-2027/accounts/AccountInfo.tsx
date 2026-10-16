import {
  BankingCopyToast,
  useBankingCopy,
} from '../../../current/banking/CopyToast';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  getLoanDetails,
  getTermDepositDetails,
} from '@/data/accountProductDetails';
import type { Product } from '@/data/products';
import {
  Page,
  s,
  FieldValue,
  Copy,
  infoMoney,
  tokens,
  IconButton,
  Glyph,
} from './Primitives';
import { formatMaskedCardNumber } from '@/app/utils/cardNumber';
import { CardArt } from '../../../current/banking/CardArt';
export default function AccountInfo({
  product,
  products,
  hidden,
  onBack,
  active,
  topInset,
}: {
  product: Product;
  products: Product[];
  hidden: boolean;
  onBack: () => void;
  active?: boolean;
  topInset?: number;
}) {
  const { copy: copyBanking, toast } = useBankingCopy();
  const format = (amount: number) => infoMoney(amount, 'CZK', hidden),
    title = product.type.replace(/_/g, ' ').toUpperCase(),
    fields: [string, string][] = [];
  const accountTitle: [string, string] = ['Account title', title];
  if (product.type === 'term_deposit') {
    const detail = getTermDepositDetails(
      product,
      products.find(p => p.type === 'current_account')?.accountNumber ??
        product.accountNumber,
    );
    fields.push(
      ['Maturity amount', format(detail.maturityAmount)],
      ['Interest amount before tax', format(detail.interestAmountBeforeTax)],
      ['Maturity date', detail.maturityDate],
      ['Rollover', detail.rollover],
      accountTitle,
      ['Account owner', detail.accountOwner],
      ['Deposit Amount', format(detail.depositAmount)],
      ['Start/Value Date', detail.startValueDate],
      ['Maturity period', detail.maturityPeriod],
      ['Interest rate/year', detail.interestRatePerYear],
      ['Current account number', detail.currentAccountNumber],
      ['Decrease amount by', format(detail.decreaseAmountBy)],
      ['Reinvest the interest', detail.reinvestInterest],
    );
  } else if (product.type === 'loan' || product.type === 'mortgage') {
    const detail = getLoanDetails(product);
    fields.push(
      ['Next installment', format(detail.nextInstallment)],
      ['Next installment date', detail.nextInstallmentDate],
      ['Interest rate', detail.interestRate],
      ['Overdue amount', format(detail.overdueAmount)],
      ['Overdue interest rate', detail.overdueInterestRate],
      ['Owned amount', format(detail.ownedAmount)],
      ['Original amount', format(detail.originalAmount)],
      accountTitle,
      ['IBAN', detail.iban],
      ['Account owner', detail.accountOwner],
      ['Start date', detail.startDate],
      ['Final payment', detail.finalPayment],
    );
  } else {
    fields.push(['Account number', product.accountNumber]);
    fields.push(
      product.type === 'saving_account'
        ? accountTitle
        : ['Available funds', format(product.balance)],
    );
    fields.push([
      'Current balance',
      format(
        product.type === 'saving_account'
          ? product.balance
          : product.balance * 0.92,
      ),
    ]);
    if (product.type !== 'saving_account')
      fields.push(
        ['Blocked/reserved amount', format(0)],
        ['Overdraft', format(0)],
        accountTitle,
        ['Offer', 'Account under favorable conditions'],
      );
  }
  const connected =
    product.type === 'current_account'
      ? products.find(
          p => p.type === 'debit_card' && p.linkedAccountId === product.id,
        )
      : undefined;
  return (
    <View style={copyStyles.root}>
      <Page
        title="Account Details"
        onBack={onBack}
        active={active}
        topInset={topInset}
        style={{
          backgroundColor: tokens.surface,
        }}
        trailing={
          <IconButton
            label="Share account details"
            name="share-filled"
            onPress={() => {}}
          />
        }
      >
        <View style={[s.inset, parityStyles.item0]}>
          {fields.map(([label, value]) => (
            <FieldValue
              information
              key={label}
              label={label}
              value={value}
              trailing={
                label === 'Account number' || label === 'IBAN' ? (
                  <IconButton
                    label={
                      label === 'IBAN' ? 'Copy IBAN' : 'Copy account number'
                    }
                    name="copy-documents"
                    onPress={() => {
                      copyBanking(
                        value,
                        label === 'IBAN' ? 'IBAN' : 'Account number',
                      );
                    }}
                  />
                ) : undefined
              }
            />
          ))}
          {null}
          {connected && (
            <>
              <View style={parityStyles.item1}>
                <Copy strong color={tokens.accent}>
                  SHOW LESS
                </Copy>
              </View>
              <View
                style={[
                  parityStyles.item2,
                  {
                    borderColor: tokens.border,
                  },
                ]}
              >
                <Copy strong>CONNECTED CARDS</Copy>
              </View>
              {connected.type === 'debit_card' ? (
                <View style={parityStyles.item3}>
                  <CardArt card={connected} width={64} />
                  <View style={parityStyles.item4}>
                    <Copy strong>Mastercard Standard Debit</Copy>
                    <Copy muted size={14} lineHeight={15}>
                      {formatMaskedCardNumber(connected.cardNumber)}
                    </Copy>
                  </View>
                  <Glyph name="chevron-link" />
                </View>
              ) : null}
            </>
          )}
        </View>
      </Page>
      <BankingCopyToast toast={toast} font={tokens.strongFont} />
    </View>
  );
}
const parityStyles = StyleSheet.create({
  item0: {
    paddingTop: 46,
    paddingBottom: 40,
  },
  item1: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  item2: {
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  item3: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 18,
  },
  item4: {
    flex: 1,
    gap: 2,
  },
});
const copyStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
