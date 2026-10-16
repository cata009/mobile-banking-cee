import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { groupAccountTransactionsByMonth } from '@/data/accountDetails';
import {
  getCountryConfig,
  formatMoneyNumber,
} from '@/app/registry/countryConfig';
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting';
import { Text } from '../../../../universal/Typography';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import {
  EMPTY_ACCOUNT_TRANSACTION_FILTERS,
  filterEvoTransactions,
  hasAccountTransactionFilters,
  type AccountTransactionFilterState,
} from '@/features/accounts-payments/evoTransactionFilters';
import { getEvoMonthReport } from '@/features/accounts-payments/evoAccountActions';
import { FormField } from '../../../../universal/FormField';
import { ModalPanel } from '../../../../universal/ModalPanel';
import { ActionButton } from '../../../../universal/ActionButton';
import { Select } from '../../../../universal/Select';
import { Heading } from '../Primitives';
import { BankingPage as Page } from './Primitives';
import type { CurrentScreenProps } from '../contracts';
import {
  allAccountTransactions,
  bankingProducts,
  copy,
  type OwnedTransaction,
} from './model';
import { applyCategoryOverride } from './categoryOverrides';
import { Label, Search } from './Primitives';
import { CategoryMark } from './CategoryMark';
export function Ledger({
  host,
  rows,
  filtersEnabled = false,
  report = false,
  pending = true,
  query: controlledQuery,
  onQueryChange,
}: {
  host: CurrentScreenProps;
  rows: OwnedTransaction[];
  filtersEnabled?: boolean;
  report?: boolean;
  pending?: boolean;
  query?: string;
  onQueryChange?: (value: string) => void;
}) {
  const [localQuery, setLocalQuery] = useState('');
  const query = controlledQuery ?? localQuery;
  const setQuery = onQueryChange ?? setLocalQuery;
  const [filters, setFilters] = useState<AccountTransactionFilterState>({
    ...EMPTY_ACCOUNT_TRANSACTION_FILTERS,
  });
  const [draft, setDraft] = useState<AccountTransactionFilterState>(filters);
  const [open, setOpen] = useState(false);
  const currency = getCountryConfig(host.country).currency;
  const overridden = rows.map(row => ({
    ...row,
    transaction: applyCategoryOverride(host, row.transaction),
  }));
  const filtered = overridden.filter(
    row =>
      filterEvoTransactions({
        transactions: [row.transaction],
        search: query,
        filters,
        accountNumber: row.product.accountNumber,
        currency,
      }).length > 0,
  );
  const booked = filtered.filter(row => row.transaction.status === 'Booked');
  const groups = groupAccountTransactionsByMonth(
    booked.map(row => row.transaction),
  );
  const currentMonth = rows.reduce(
    (latest, row) =>
      row.transaction.monthKey > latest ? row.transaction.monthKey : latest,
    '',
  );
  const renderRow = ({ transaction, product }: OwnedTransaction) => {
    const pendingRow = transaction.status === 'Pending';
    const amount = formatEvo2027Number(Math.abs(transaction.amount));
    const split = amount.match(/^(.+?)([,.](?:\d{2}|\*\*))$/);
    const amountColor = pendingRow
      ? host.tokens.muted
      : transaction.type === 'credit'
      ? host.tokens.accent
      : host.tokens.text;
    return (
      <Pressable
        key={`${product.id}-${transaction.id}`}
        testID={`transaction-${product.id}-${transaction.id}`}
        accessibilityRole="button"
        accessibilityLabel={`${transaction.label}, ${transaction.day} ${transaction.month}`}
        onPress={() =>
          host.onNavigate({
            screen: 'transaction',
            params: {
              productId: product.id,
              transactionId: transaction.id,
            },
          })
        }
        style={[s.row, pendingRow ? parityStyles.item0 : parityStyles.item1]}
      >
        <View style={s.leading}>
          <View style={s.date}>
            <Label host={host} strong size={18} style={parityStyles.item2}>
              {transaction.day}
            </Label>
            <Label
              host={host}
              strong
              muted
              size={14}
              style={parityStyles.item3}
            >
              {transaction.month}
            </Label>
          </View>
          {!pendingRow ? (
            <CategoryMark category={transaction.pfmCategory} />
          ) : null}
        </View>
        <View style={s.amount}>
          <Label host={host} muted={pendingRow} style={parityStyles.item4}>
            {transaction.label}
          </Label>
          <Text
            style={[
              {
                fontFamily: host.tokens.strongFont,
              },
              parityStyles.item5,
              {
                color: amountColor,
              },
            ]}
          >
            {transaction.amount < 0 ? '-' : '+'}
            {split?.[1] ?? amount}
            <Text
              style={[
                {
                  fontFamily: host.tokens.font,
                },
                parityStyles.item6,
              ]}
            >
              {split?.[2] ?? ''} {product.currency}
            </Text>
          </Text>
          {pendingRow ? (
            <View style={parityStyles.item7}>
              <View style={parityStyles.item8} />
              <Label host={host} strong muted size={14}>
                PENDING
              </Label>
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  };
  const divider = (title: string, total?: number) => (
    <View
      style={[
        s.divider,
        {
          borderColor: host.tokens.border,
        },
      ]}
    >
      <View style={s.dividerRow}>
        <Label host={host} strong muted style={parityStyles.item9}>
          {title.toUpperCase()}
        </Label>
        {total !== undefined ? (
          <Label host={host} strong size={14}>
            {formatMoneyNumber(total, host.country)}{' '}
            {rows[0]?.product.currency ?? currency}
          </Label>
        ) : null}
      </View>
      <View
        style={[
          parityStyles.item10,
          {
            backgroundColor: host.tokens.border,
          },
        ]}
      />
    </View>
  );
  const monthReport = (group: (typeof groups)[number]) => {
    const totals = getEvoMonthReport(group),
      maxTotal = Math.max(totals.incomeTotal, totals.spendingTotal, 1);
    const incomeHeight = Math.max(
        18,
        Math.round((totals.incomeTotal / maxTotal) * 104),
      ),
      spendingHeight = Math.max(
        18,
        Math.round((totals.spendingTotal / maxTotal) * 104),
      );
    const openAnalytics = (direction: 'income' | 'expense' = 'expense') =>
      host.onNavigate({
        screen: 'pfm',
        params: {scopeId:host.route.params?.productId ?? host.route.params?.accountId ?? rows[0]?.product.id ?? 'all-accounts',direction},
      });
    return (
      <View style={parityStyles.item11}>
        <Pressable
          accessibilityLabel={`Open ${group.monthTitle} spending`}
          onPress={() => openAnalytics()}
          style={parityStyles.item12}
        >
          <Label host={host} strong size={18}>
            Monthly report
          </Label>
        </Pressable>
        <View style={s.chart}>
          <View
            style={[
              s.baseline,
              {
                borderColor: host.tokens.border,
              },
            ]}
          />
          <Pressable
            accessibilityLabel="Open income analytics"
            onPress={() => openAnalytics('income')}
            style={s.inflow}
          >
            <Label
              host={host}
              strong
              muted
              size={14}
              style={parityStyles.item13}
            >
              {copy(host, 'runtime.analytics.inflow', 'Inflow').toUpperCase()}
            </Label>
            <Label host={host} strong size={14} style={parityStyles.item14}>
              {formatMoneyNumber(totals.incomeTotal, host.country)} {currency}
            </Label>
          </Pressable>
          <View
            style={[
              s.verticalBar,
              [
                parityStyles.item15,
                {
                  height: incomeHeight,
                },
                {
                  top: 120 - incomeHeight,
                },
                {
                  backgroundColor: host.tokens.accent,
                },
              ],
            ]}
          />
          <View
            style={[
              s.verticalBar,
              [
                parityStyles.item16,
                {
                  height: spendingHeight,
                },
                {
                  top: 120 - spendingHeight,
                },
                {
                  backgroundColor: host.tokens.text,
                },
              ],
            ]}
          />
          <Pressable
            accessibilityLabel="Open expenses analytics"
            onPress={() => openAnalytics('expense')}
            style={s.outflow}
          >
            <Label host={host} strong muted size={14}>
              {copy(host, 'runtime.analytics.outflow', 'Outflow').toUpperCase()}
            </Label>
            <Label host={host} strong size={14} style={parityStyles.item17}>
              {formatMoneyNumber(totals.spendingTotal, host.country)} {currency}
            </Label>
          </Pressable>
          <View style={s.incomes}>
            <Label host={host} strong size={14} style={parityStyles.item13}>
              {copy(host, 'runtime.analytics.incomes', 'Incomes').toUpperCase()}
            </Label>
          </View>
          <View style={s.spendings}>
            <Label host={host} strong size={14}>
              {copy(
                host,
                'runtime.analytics.spendings',
                'Spendings',
              ).toUpperCase()}
            </Label>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View
      style={[
        s.ledger,
        {
          backgroundColor: host.tokens.surface,
        },
      ]}
    >
      <View style={parityStyles.item18}>
        <Search
          host={host}
          compact
          value={query}
          onChange={setQuery}
          trailing={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Filters"
              style={parityStyles.item19}
              onPress={
                filtersEnabled
                  ? () => {
                      setDraft(filters);
                      setOpen(true);
                    }
                  : undefined
              }
            >
              <SourceCustomIcon
                name="filters"
                size={24}
                color={host.tokens.text}
              />
            </Pressable>
          }
        />
      </View>
      {hasAccountTransactionFilters(filters) ? (
        <ActionButton
          tokens={host.tokens}
          secondary
          label="Remove filters"
          onPress={() =>
            setFilters({
              ...EMPTY_ACCOUNT_TRANSACTION_FILTERS,
            })
          }
        />
      ) : null}
      <View style={parityStyles.item20}>
        {pending &&
        filtered.some(row => row.transaction.status === 'Pending') ? (
          <View style={parityStyles.item21}>
            {divider('Pending')}
            {filtered
              .filter(row => row.transaction.status === 'Pending')
              .map(renderRow)}
          </View>
        ) : null}
        {groups.map((group, index) => (
          <View
            key={group.monthKey}
            style={index > 0 ? parityStyles.item22 : undefined}
          >
            {divider(
              group.monthTitle,
              host.route.screen === 'card' ? undefined : group.monthlyTotal,
            )}
            {report &&
            !query.trim() &&
            !hasAccountTransactionFilters(filters) &&
            group.monthKey !== currentMonth
              ? monthReport(group)
              : null}
            {booked
              .filter(row => row.transaction.monthKey === group.monthKey)
              .map(renderRow)}
          </View>
        ))}
      </View>
      {filtered.length === 0 ? (
        <Label host={host} muted>
          {copy(
            host,
            'runtime.accounts.noTransactionsFound',
            'No transactions found',
          )}
        </Label>
      ) : null}
      <ModalPanel
        tokens={host.tokens}
        title="Apply filters"
        visible={open}
        onClose={() => setOpen(false)}
      >
        <ScrollView style={s.filterScroll}>
          {(
            [
              ['keyword', 'Search by keyword'],
              ['accountNumber', 'Search by account number'],
              ['variableCode', 'Search by variable code'],
              ['amountFrom', 'From'],
              ['amountTo', 'To'],
            ] as const
          ).map(([key, label]) => (
            <FormField
              key={key}
              tokens={host.tokens}
              label={label}
              value={draft[key]}
              onChange={value =>
                setDraft(current => ({
                  ...current,
                  [key]: value,
                }))
              }
            />
          ))}
          <Select
            tokens={host.tokens}
            label="Search by date"
            value={draft.datePreset}
            items={(
              [
                'none',
                'last-week',
                'last-month',
                'last-3-months',
                'custom',
              ] as const
            ).map(value => ({
              value,
              label: value.replace(/-/g, ' '),
            }))}
            onChange={datePreset =>
              setDraft(current => ({
                ...current,
                datePreset,
              }))
            }
          />
          <Select
            tokens={host.tokens}
            label="Transaction status"
            value={draft.status}
            items={(['All transactions', 'Booked', 'Pending'] as const).map(
              value => ({
                value,
                label: value,
              }),
            )}
            onChange={status =>
              setDraft(current => ({
                ...current,
                status,
              }))
            }
          />
          <Select
            tokens={host.tokens}
            label="Transaction type"
            value={draft.transactionType}
            items={(['All transactions', 'Incoming', 'Outgoing'] as const).map(
              value => ({
                value,
                label: value,
              }),
            )}
            onChange={transactionType =>
              setDraft(current => ({
                ...current,
                transactionType,
              }))
            }
          />
          <Select
            tokens={host.tokens}
            label="Category"
            value={draft.category}
            items={[
              'All categories',
              ...new Set(rows.map(row => row.transaction.category)),
            ].map(value => ({
              value,
              label: value,
            }))}
            onChange={category =>
              setDraft(current => ({
                ...current,
                category,
              }))
            }
          />
          <ActionButton
            tokens={host.tokens}
            label="Apply filters"
            onPress={() => {
              setFilters(draft);
              setOpen(false);
            }}
          />
        </ScrollView>
      </ModalPanel>
    </View>
  );
}
export function TransactionsScreen(host: CurrentScreenProps) {
  const [scope, setScope] = useState(
    host.route.params?.productId ??
      host.route.params?.accountId ??
      'all-accounts',
  );
  const accounts = bankingProducts(host).currentAccounts;
  const rows = allAccountTransactions(host).filter(
    row => scope === 'all-accounts' || row.product.id === scope,
  );
  return (
    <Page
      host={host}
      title={copy(host, 'runtime.accounts.transactions', 'Transactions')}
    >
      <Heading host={host}>
        {copy(host, 'runtime.accounts.transactions', 'Transactions')}
      </Heading>
      <Select
        tokens={host.tokens}
        label="Account scope"
        value={scope}
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
      <Ledger host={host} rows={rows} filtersEnabled />
    </Page>
  );
}
const s = StyleSheet.create({
  flex: {
    flex: 1,
  },
  ledger: {
    paddingTop: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexShrink: 0,
  },
  date: {
    alignItems: 'center',
    gap: 2,
  },
  amount: {
    flex: 1,
    gap: 4,
    alignItems: 'flex-end',
  },
  filterScroll: {
    maxHeight: 480,
  },
  divider: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chart: {
    position: 'relative',
    height: 172,
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    paddingTop: 18,
  },
  baseline: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 120,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  inflow: {
    position: 'absolute',
    left: 8,
    top: 58,
    width: 100,
  },
  outflow: {
    position: 'absolute',
    left: 201,
    top: 74,
    width: 111,
  },
  verticalBar: {
    position: 'absolute',
    width: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  incomes: {
    position: 'absolute',
    left: 82,
    top: 136,
    width: 68,
  },
  spendings: {
    position: 'absolute',
    left: 166,
    top: 136,
  },
});
const parityStyles = StyleSheet.create({
  item0: {
    height: 92,
  },
  item1: {
    height: 80,
  },
  item2: {
    lineHeight: 20,
    textAlign: 'center',
  },
  item3: {
    lineHeight: 15,
    textAlign: 'center',
  },
  item4: {
    lineHeight: 18,
    textAlign: 'right',
  },
  item5: {
    fontSize: 20,
    lineHeight: 22,
  },
  item6: {
    fontSize: 14,
    letterSpacing: 0.3,
  },
  item7: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
  },
  item8: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e67300',
  },
  item9: {
    lineHeight: 20,
  },
  item10: {
    height: 1,
  },
  item11: {
    paddingTop: 8,
  },
  item12: {
    paddingHorizontal: 24,
  },
  item13: {
    textAlign: 'right',
  },
  item14: {
    marginTop: 4,
    textAlign: 'right',
  },
  item15: {
    left: 137,
  },
  item16: {
    left: 167,
  },
  item17: {
    marginTop: 4,
  },
  item18: {
    paddingHorizontal: 16,
  },
  item19: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item20: {
    paddingTop: 24,
  },
  item21: {
    paddingBottom: 8,
  },
  item22: {
    paddingTop: 16,
  },
});
