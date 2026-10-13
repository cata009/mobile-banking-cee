import React, { useRef, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '../../../../../universal/Typography';
import { Header } from '../../../../../universal/Header';
import { SearchField } from '../../../../../universal/SearchField';
import { Select } from '../../../../../universal/Select';
import type { CzechNativeScreenProps } from '../contracts';
import type { AccountTransaction } from '@/data/accountDetails';
import type { CurrentAccount } from '@/data/products';
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting';
import { czechProducts, baseAccountMovements } from './source';
import { tokens, s, Copy, money, Glyph, IconButton } from './Primitives';
import MovementAvatar from './MovementAvatar';
import { MovementDetail } from './Movements';
interface OwnedMovement {
  transaction: AccountTransaction;
  product: CurrentAccount;
  rawTransactionId: string;
}
/** Source pooling keeps an account-prefixed row ID and its canonical ledger identity. */
export function pooledMovements(
  accounts: CurrentAccount[],
  allProducts: import('@/data/products').Product[],
): OwnedMovement[] {
  return accounts.flatMap(product =>
    baseAccountMovements(product, allProducts).map(tx => ({
      product,
      rawTransactionId: tx.id,
      transaction: {
        ...tx,
        id: `${product.id}-${tx.id}`,
      },
    })),
  );
}
export default function TransactionsScreen(props: CzechNativeScreenProps) {
  const products = czechProducts(props.productCounts),
    accounts = products.filter(
      (product): product is CurrentAccount =>
        product.type === 'current_account',
    );
  const [scopeId, setScope] = useState('all-accounts'),
    [query, setQuery] = useState(''),
    [rail, setRail] = useState(false),
    [selected, setSelected] = useState<OwnedMovement | null>(null);
  const scroll = useRef<React.ElementRef<typeof ScrollView>>(null),
    sections = useRef(new Map<string, number>());
  const scoped =
    scopeId === 'all-accounts'
      ? accounts
      : accounts.filter(a => a.id === scopeId);
  const filtered = pooledMovements(scoped, products).filter(row =>
    [
      row.transaction.label,
      row.transaction.details,
      row.transaction.category,
      row.transaction.status,
      row.transaction.type,
      row.transaction.day,
      row.transaction.month,
      row.transaction.monthTitle,
      formatEvo2027Number(Math.abs(row.transaction.amount)),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const dates = new Map<string, OwnedMovement[]>();
  for (const row of filtered) {
    const key = `${row.transaction.monthKey}-${row.transaction.day.padStart(
      2,
      '0',
    )}`;
    dates.set(key, [...(dates.get(key) ?? []), row]);
  }
  const ordered = [...dates].sort(([left], [right]) =>
      right.localeCompare(left),
    ),
    months = [...new Set(ordered.map(([key]) => key.slice(0, 7)))];
  const titleFor = (key: string) =>
    new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${key}T12:00:00Z`));
  return (
    <View style={s.page}>
      <View style={[t.main, selected && t.hidden]}>
        <KeyboardAvoidingView
          style={[
            s.page,
            {
              paddingTop: props.screenTopInset ?? 0,
            },
          ]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Header
            tokens={tokens}
            variant="current"
            title="Transactions"
            onBack={props.onBack}
            renderLargeTitle={false}
            backIcon={<Glyph name="back-heavy" />}
            trailing={
              <IconButton
                label={props.amountsHidden ? 'Show amounts' : 'Hide amounts'}
                name={props.amountsHidden ? 'show' : 'hide'}
                onPress={props.onAmountsToggle}
              />
            }
          />
          <View style={t.band}>
            <Select
              tokens={tokens}
              label="Account scope"
              value={scopeId}
              items={[
                {
                  value: 'all-accounts',
                  label: 'All accounts',
                },
                ...accounts.map(account => ({
                  value: account.id,
                  label: account.name,
                })),
              ]}
              onChange={setScope}
            />
            <View style={t.search}>
              {(!rail || query) && (
                <View style={t.input}>
                  <SearchField
                    tokens={tokens}
                    label="Search transactions"
                    placeholder="Search transactions"
                    value={query}
                    onChange={setQuery}
                    onSubmit={() => {}}
                    onClear={() => setQuery('')}
                    icon={<Glyph name="search" />}
                  />
                </View>
              )}
              <IconButton
                label={rail ? 'Hide months' : 'Show months'}
                name="calendar-days"
                onPress={() => setRail(value => !value)}
              />
            </View>
            {rail && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {months.map(month => (
                  <Pressable
                    key={month}
                    accessibilityRole="button"
                    accessibilityLabel={`Month ${month}`}
                    onPress={() => {
                      const y = sections.current.get(month);
                      if (y !== undefined)
                        scroll.current?.scrollTo({
                          y,
                          animated: true,
                        });
                    }}
                    style={t.month}
                  >
                    <Copy strong>
                      {new Intl.DateTimeFormat('en-GB', {
                        month: 'short',
                        year: 'numeric',
                        timeZone: 'UTC',
                      }).format(new Date(`${month}-01T12:00:00Z`))}
                    </Copy>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
          <ScrollView
            ref={scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={t.content}
          >
            {ordered.map(([date, rows], index) => (
              <View
                key={date}
                onLayout={event => {
                  if (
                    index === 0 ||
                    ordered[index - 1]?.[0].slice(0, 7) !== date.slice(0, 7)
                  )
                    sections.current.set(
                      date.slice(0, 7),
                      event.nativeEvent.layout.y,
                    );
                }}
              >
                <View style={t.day}>
                  <Copy muted size={14}>
                    {titleFor(date)}
                  </Copy>
                  {rows.length > 1 && (
                    <Copy muted size={14}>
                      {money(
                        rows.reduce(
                          (sum, row) => sum + row.transaction.amount,
                          0,
                        ),
                        'CZK',
                        props.amountsHidden,
                        true,
                      )}
                    </Copy>
                  )}
                </View>
                <View style={s.panel}>
                  {rows.map(row => (
                    <Pressable
                      key={row.transaction.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Transaction ${row.transaction.id}`}
                      onPress={() => setSelected(row)}
                      style={t.row}
                    >
                      <MovementAvatar transaction={row.transaction} />
                      <View style={t.input}>
                        <Copy strong>{row.transaction.label}</Copy>
                        {row.transaction.details && (
                          <Copy muted size={14}>
                            {row.transaction.details}
                          </Copy>
                        )}
                        {scopeId === 'all-accounts' && (
                          <Copy muted size={14}>
                            {row.product.name}
                          </Copy>
                        )}
                        {row.transaction.status === 'Pending' && (
                          <Copy muted size={12}>
                            Pending
                          </Copy>
                        )}
                      </View>
                      <Text
                        style={[
                          t.amount,
                          row.transaction.status === 'Pending'
                            ? {
                                color: tokens.muted,
                              }
                            : row.transaction.type === 'credit'
                            ? extractedStyles.item0
                            : {
                                color: tokens.text,
                              },
                        ]}
                      >
                        {money(
                          row.transaction.amount,
                          'CZK',
                          props.amountsHidden,
                          true,
                        )}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
            {!filtered.length && (
              <View style={s.alert}>
                <Copy>No transactions found</Copy>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      {selected && (
        <MovementDetail
          transaction={selected.transaction}
          product={selected.product}
          hidden={props.amountsHidden}
          active={props.isActive}
          topInset={props.screenTopInset}
          onBack={() => setSelected(null)}
          onRedo={() =>
            props.onNavigate({
              screen: 'payment-create',
              params: {
                productId: selected.product.id,
                transactionId: selected.rawTransactionId,
                entry: 'redo',
              },
            })
          }
        />
      )}
    </View>
  );
}
const t = StyleSheet.create({
  main: {
    flex: 1,
  },
  hidden: {
    display: 'none',
  },
  band: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 16,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    gap: 2,
  },
  month: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  content: {
    paddingBottom: 32,
  },
  day: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amount: {
    fontFamily: tokens.strongFont,
    fontSize: 20,
    lineHeight: 22,
  },
});
const extractedStyles = StyleSheet.create({
  item0: {
    color: '#3d7d43',
  },
});
