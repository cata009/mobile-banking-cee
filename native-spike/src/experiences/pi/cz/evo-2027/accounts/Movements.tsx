import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import {
  groupAccountTransactionsByMonth,
  groupAccountTransactionsByDate,
  type AccountTransaction,
} from '@/data/accountDetails';
import type { Product } from '@/data/products';
import { createTransactionDetailData } from '@/data/paymentFlow';
import { tokens, s, Copy, money, Page, FieldValue, Button } from './Primitives';
import MovementAvatar from './MovementAvatar';
import MonthlyReport from './MonthlyReport';
import { Text } from '../../../../../universal/Typography';
export function MovementRows({
  transactions,
  onSelect,
  hidden,
  currency = 'CZK',
  pending = true,
  monthlyReports = false,
  onOpenReport,
}: {
  transactions: AccountTransaction[];
  onSelect: (tx: AccountTransaction) => void;
  hidden: boolean;
  currency?: string;
  pending?: boolean;
  monthlyReports?: boolean;
  onOpenReport?: (direction?: 'income' | 'expense') => void;
}) {
  const row = (tx: AccountTransaction, compact = false) => (
    <Pressable
      key={tx.id}
      accessibilityRole="button"
      accessibilityLabel={`Transaction ${tx.id}`}
      onPress={() => onSelect(tx)}
      style={[
        extractedStyles.item0,
        [
          compact ? extractedStyles.item6 : extractedStyles.item7,
          compact
            ? extractedStyles.item8
            : tx.status === 'Pending'
            ? extractedStyles.item9
            : extractedStyles.item10,
        ],
      ]}
    >
      <MovementAvatar transaction={tx} />
      <View style={extractedStyles.item1}>
        <Copy strong>{tx.label}</Copy>
        <Copy muted size={14}>
          {tx.details ?? tx.category}
        </Copy>
      </View>
      <View style={extractedStyles.item2}>
        <Text
          style={[
            extractedStyles.item3,
            [
              tx.status === 'Pending'
                ? {
                    color: tokens.muted,
                  }
                : tx.type === 'credit'
                ? extractedStyles.item11
                : {
                    color: tokens.text,
                  },
              {
                fontFamily: tokens.strongFont,
              },
            ],
          ]}
        >
          {money(tx.amount, currency, hidden, true).replace(
            /([,.]\d{2}|[,.]\*\*)\s\w+$/,
            '',
          )}
          <Text
            style={[
              extractedStyles.item4,
              {
                fontFamily: tokens.font,
              },
            ]}
          >
            {
              money(tx.amount, currency, hidden, true).match(
                /([,.](?:\d{2}|\*\*)\s\w+)$/,
              )?.[0]
            }
          </Text>
        </Text>
        {tx.status === 'Pending' && (
          <Copy muted size={12}>
            Pending
          </Copy>
        )}
      </View>
    </Pressable>
  );
  const pendingRows = pending
    ? transactions.filter(tx => tx.status === 'Pending')
    : [];
  return (
    <>
      {pendingRows.length > 0 && (
        <>
          <View style={s.section}>
            <Copy strong>PENDING TRANSACTIONS</Copy>
          </View>
          <View style={ledger.card}>{pendingRows.map(tx => row(tx))}</View>
        </>
      )}
      {groupAccountTransactionsByMonth(
        transactions.filter(tx => tx.status === 'Booked'),
      ).map(month => (
        <View key={month.monthKey}>
          {monthlyReports &&
            month.monthKey !==
              transactions.reduce(
                (latest, tx) => (tx.monthKey > latest ? tx.monthKey : latest),
                '',
              ) && (
              <MonthlyReport
                group={month}
                currency={currency}
                hidden={hidden}
                onOpen={onOpenReport}
              />
            )}
          {groupAccountTransactionsByDate(month.transactions).map(day => (
            <View key={day.dateKey}>
              <View
                style={[
                  extractedStyles.item12,
                  {
                    borderColor: tokens.border,
                  },
                ]}
              >
                <Copy strong muted size={14} lineHeight={15.5}>
                  {day.dateTitle}
                </Copy>
                {day.transactions.length > 1 && (
                  <Copy muted size={14}>
                    {money(day.dailyTotal, currency, hidden, true)}
                  </Copy>
                )}
              </View>
              <View style={ledger.card}>
                {day.transactions.map(tx =>
                  row(tx, day.transactions.length === 1),
                )}
              </View>
            </View>
          ))}
        </View>
      ))}
      {transactions.length === 0 && (
        <View style={s.alert}>
          <Copy>No transactions found</Copy>
        </View>
      )}
    </>
  );
}
export function MovementDetail({
  transaction,
  product,
  hidden,
  onBack,
  onRedo,
  active,
  topInset,
}: {
  transaction: AccountTransaction;
  product: Product;
  hidden: boolean;
  onBack: () => void;
  onRedo?: () => void;
  active?: boolean;
  topInset?: number;
}) {
  const detail = createTransactionDetailData(transaction, 'CZ', product);
  return (
    <Page
      title={transaction.label}
      onBack={onBack}
      active={active}
      topInset={topInset}
    >
      <View style={s.inset}>
        <Copy strong size={30}>
          {money(transaction.amount, 'CZK', hidden, true)}
        </Copy>
        <FieldValue label="Status" value={transaction.status} />
        <FieldValue label="Booking date" value={detail.bookingDate} />
        <FieldValue label="Category" value={transaction.category} />
        <FieldValue label="Account" value={product.accountNumber} />
        {transaction.beneficiaryAccountNumber && (
          <FieldValue
            label="Beneficiary account"
            value={transaction.beneficiaryAccountNumber}
          />
        )}
        <FieldValue label="Reference number" value={detail.referenceNumber} />
        {transaction.details && (
          <FieldValue label="Transaction details" value={transaction.details} />
        )}
      </View>
      {onRedo &&
        transaction.source !== 'card' &&
        transaction.status !== 'Pending' && (
          <Button label="Repeat payment" onPress={onRedo} />
        )}
    </Page>
  );
}
const ledger = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 8,
    backgroundColor: tokens.surface,
    overflow: 'hidden',
  },
});
const extractedStyles = StyleSheet.create({
  item0: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    alignItems: 'center',
  },
  item1: {
    flex: 1,
  },
  item2: {
    alignItems: 'flex-end',
  },
  item3: {
    fontSize: 20,
    lineHeight: 22,
  },
  item4: {
    fontSize: 14,
    lineHeight: 18,
  },
  item5: {
    padding: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item6: {
    paddingVertical: 8,
  },
  item7: {
    paddingVertical: 16,
  },
  item8: {
    minHeight: 64,
  },
  item9: {
    minHeight: 92,
  },
  item10: {
    minHeight: 80,
  },
  item11: {
    color: '#3d7d43',
  },
  item12: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
