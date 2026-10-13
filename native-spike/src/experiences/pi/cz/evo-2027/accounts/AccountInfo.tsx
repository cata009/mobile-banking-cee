import React from 'react';
import { View } from 'react-native';
import {
  getLoanDetails,
  getTermDepositDetails,
} from '@/data/accountProductDetails';
import type { Product } from '@/data/products';
import { Page, s, FieldValue, Copy, Row, infoMoney } from './Primitives';
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
      ['Deposit amount', format(detail.depositAmount)],
      ['Start value date', detail.startValueDate],
      ['Maturity period', detail.maturityPeriod],
      ['Interest rate per year', detail.interestRatePerYear],
      ['Current account number', detail.currentAccountNumber],
      ['Decrease amount by', format(detail.decreaseAmountBy)],
      ['Reinvest interest', detail.reinvestInterest],
    );
  } else if (product.type === 'loan' || product.type === 'mortgage') {
    const detail = getLoanDetails(product);
    fields.push(
      ['Next installment', format(detail.nextInstallment)],
      ['Next installment date', detail.nextInstallmentDate],
      ['Interest rate', detail.interestRate],
      ['Overdue amount', format(detail.overdueAmount)],
      ['Overdue interest rate', detail.overdueInterestRate],
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
    <Page
      title="Account Details"
      onBack={onBack}
      active={active}
      topInset={topInset}
    >
      <View style={s.inset}>
        {fields.map(([label, value]) => (
          <FieldValue key={label} label={label} value={value} />
        ))}
      </View>
      {connected && (
        <>
          <View style={s.section}>
            <Copy strong>CONNECTED CARDS</Copy>
          </View>
          <Row
            title={connected.name}
            subtitle={connected.accountNumber}
            onPress={() => {}}
            disabled
          />
        </>
      )}
    </Page>
  );
}
