import { useInvestmentMarket } from '../../../current/investments/Market';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  INVESTMENT_HISTORY_DATE_OPTIONS,
  type InvestmentHistoryOrder,
  type InvestmentHistoryTransaction,
  type InvestmentHistoryFilterState,
} from '@/app/config/investmentsPortfolioConfig';
import {
  getHistoryTypesForTab,
  normalizeFiltersForTab,
  resetFilterTypesForTab,
  selectInvestmentHistoryRows,
} from '@/features/investments/history/model';
import type { Currency } from '@/data/products';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import { SearchField } from '../../../../../universal/SearchField';
import { Select } from '../../../../../universal/Select';
import { DateField, validIsoDate } from '../../../../../universal/DateField';
import { ModalPanel } from '../../../../../universal/ModalPanel';
import { Tabs } from '../../../../../universal/Tabs';
import { useInvestmentBack } from './Runtime';
import {
  Button,
  Copy,
  Notice,
  Page,
  Row,
  czInvestmentTokens,
} from './Primitives';

export function InvestmentHistory({
  onBack,
  transactions,
  orders,
  initialTab = 'transactions',
  amountsHidden = false,
  onTabChange,
  allDatesByDefault = false,
  hideCurrencyFilter = false,
  hideAllTimeDateOption = false,
  securityId,
  filterByTitle,
  onToApprove,
  footer,
}: {
  onBack: () => void;
  transactions: readonly InvestmentHistoryTransaction[];
  orders: readonly InvestmentHistoryOrder[];
  initialTab?: 'transactions' | 'orders';
  amountsHidden?: boolean;
  onTabChange?: (tab: 'transactions' | 'orders') => void;
  allDatesByDefault?: boolean;
  hideCurrencyFilter?: boolean;
  hideAllTimeDateOption?: boolean;
  securityId?: string;
  filterByTitle?: string;
  onToApprove?: () => void;
  footer?: React.ReactNode;
}) {
  const market = useInvestmentMarket();
  const [tab, setTab] = useState(initialTab),
    [query, setQuery] = useState(filterByTitle ?? ''),
    [open, setOpen] = useState(false),
    [selected, setSelected] = useState<
      InvestmentHistoryTransaction | InvestmentHistoryOrder | null
    >(null);
  const currencies: Currency[] = [
    ...new Set<Currency>([
      market.currency,
      ...transactions.map(row => row.currency),
      ...orders.map(row => row.currency),
    ]),
  ];
  const defaults: InvestmentHistoryFilterState = {
    datePreset:
      allDatesByDefault && !hideAllTimeDateOption ? 'all-time' : 'last-year',
    customStartDate: '2025-09-01',
    customEndDate: '2026-06-30',
    selectedTypes: [...getHistoryTypesForTab(tab)],
    selectedCurrencies: currencies,
    selectedStatuses: ['EXECUTED', 'PENDING', 'REJECTED'],
  };
  const [filters, setFilters] = useState<InvestmentHistoryFilterState>(
      () => defaults,
    ),
    [draft, setDraft] = useState<InvestmentHistoryFilterState>(() => defaults);
  const data = selectInvestmentHistoryRows({
    transactions,
    orders,
    filters,
    searchQuery: query,
    securityId,
  });
  useInvestmentBack(() => {
    if (selected) setSelected(null);
    else if (open) setOpen(false);
    else onBack();
    return true;
  });
  const rows = tab === 'transactions' ? data.transactions : data.orders;
  const money = (value: number, currency: string) =>
    formatInvestmentMoney(value, market.country, currency, amountsHidden);
  const check = (label: string, checked: boolean, onPress: () => void) => (
    <Pressable
      key={label}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      onPress={onPress}
      style={s.check}
    >
      <Copy>
        {checked ? '☑' : '☐'} {label}
      </Copy>
    </Pressable>
  );
  if (selected)
    return (
      <Page
        kind="history-detail"
        title={selected.title}
        onBack={() => setSelected(null)}
        contentTop={16}
      >
        <Row title="Amount" value={money(selected.amount, selected.currency)} />
        <Row title="Date" value={selected.date.slice(0, 10)} />
        <Row
          title="Type"
          value={'type' in selected ? selected.type : selected.orderType}
        />
        {'status' in selected ? (
          <Row title="Status" value={selected.status} />
        ) : null}
        {selected.quantity !== undefined ? (
          <Row
            title="Quantity"
            value={amountsHidden ? '•• PCS' : String(selected.quantity)}
          />
        ) : null}
      </Page>
    );
  return (
    <Page
      title="History"
      footer={footer}
      footerTop={0}
      footerBottom={0}
      footerGutter={0}
      kind="investment-history"
      onBack={onBack}
      gray
      gutter={16}
      contentTop={16}
    >
      <Tabs
        tokens={czInvestmentTokens}
        variant="mailbox"
        value={tab}
        items={[
          { value: 'transactions', label: 'Transactions' },
          { value: 'orders', label: 'Orders' },
        ]}
        onChange={next => {
          setTab(next);
          setFilters(previous => resetFilterTypesForTab(previous, next));
          setDraft(previous => resetFilterTypesForTab(previous, next));
          onTabChange?.(next);
        }}
      />
      <SearchField
        tokens={czInvestmentTokens}
        label="Search history"
        placeholder="Search"
        value={query}
        onChange={setQuery}
        onSubmit={() => undefined}
        onClear={() => setQuery('')}
      />
      <Row
        title="Filters"
        onPress={() => {
          setDraft(normalizeFiltersForTab(filters, tab));
          setOpen(true);
        }}
      />
      {onToApprove ? <Row title="To approve" onPress={onToApprove} /> : null}
      {rows.length ? (
        [...rows]
          .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
          .map(row => (
            <View key={row.id} testID={'cz-history-row-' + row.id}>
              <Row
                title={row.title}
                subtitle={
                  row.date.slice(0, 10) +
                  ' · ' +
                  ('type' in row
                    ? row.type
                    : row.orderType + ' · ' + row.status)
                }
                value={money(row.amount, row.currency)}
                label={'Open ' + row.title + ' history details'}
                onPress={() => setSelected(row)}
              />
            </View>
          ))
      ) : (
        <Notice
          text={
            tab === 'transactions'
              ? 'No transactions match your search and filters.'
              : 'No orders match your search and filters.'
          }
        />
      )}
      <ModalPanel
        tokens={czInvestmentTokens}
        title="Filters"
        visible={open}
        onClose={() => setOpen(false)}
        closeLabel="Close filters"
      >
        <ScrollView keyboardShouldPersistTaps="handled">
          <Select
            tokens={czInvestmentTokens}
            label="Period"
            value={draft.datePreset}
            items={INVESTMENT_HISTORY_DATE_OPTIONS.filter(
              item => !hideAllTimeDateOption || item.id !== 'all-time',
            ).map(item => ({ value: item.id, label: item.label }))}
            onChange={datePreset =>
              setDraft(previous => ({ ...previous, datePreset }))
            }
            closeLabel="Close periods"
          />
          {draft.datePreset === 'define' ? (
            <>
              <DateField
                tokens={czInvestmentTokens}
                locale="en-GB"
                label="From date"
                value={draft.customStartDate}
                max={draft.customEndDate}
                onChange={customStartDate =>
                  setDraft(previous => ({ ...previous, customStartDate }))
                }
              />
              <DateField
                tokens={czInvestmentTokens}
                locale="en-GB"
                label="To date"
                value={draft.customEndDate}
                min={draft.customStartDate}
                onChange={customEndDate =>
                  setDraft(previous => ({ ...previous, customEndDate }))
                }
              />
            </>
          ) : null}
          <Copy strong>Type</Copy>
          {getHistoryTypesForTab(tab).map(type =>
            check(type, draft.selectedTypes.includes(type), () =>
              setDraft(previous => ({
                ...previous,
                selectedTypes: previous.selectedTypes.includes(type)
                  ? previous.selectedTypes.filter(value => value !== type)
                  : [...previous.selectedTypes, type],
              })),
            ),
          )}
          {tab === 'orders' ? (
            <>
              <Copy strong>Status</Copy>
              {(['EXECUTED', 'PENDING', 'REJECTED'] as const).map(status =>
                check(status, draft.selectedStatuses.includes(status), () =>
                  setDraft(previous => ({
                    ...previous,
                    selectedStatuses: previous.selectedStatuses.includes(status)
                      ? previous.selectedStatuses.filter(
                          value => value !== status,
                        )
                      : [...previous.selectedStatuses, status],
                  })),
                ),
              )}
            </>
          ) : null}
          {!hideCurrencyFilter ? (
            <>
              <Copy strong>Currency</Copy>
              {currencies.map(currency =>
                check(
                  currency,
                  draft.selectedCurrencies.includes(currency),
                  () =>
                    setDraft(previous => ({
                      ...previous,
                      selectedCurrencies: previous.selectedCurrencies.includes(
                        currency,
                      )
                        ? previous.selectedCurrencies.filter(
                            value => value !== currency,
                          )
                        : [...previous.selectedCurrencies, currency],
                    })),
                ),
              )}
            </>
          ) : null}
          <Button
            label="Apply filters"
            disabled={
              draft.datePreset === 'define' &&
              (!validIsoDate(draft.customStartDate) ||
                !validIsoDate(draft.customEndDate) ||
                draft.customStartDate > draft.customEndDate)
            }
            onPress={() => {
              setFilters(draft);
              setOpen(false);
            }}
          />
          <Button
            label="Reset filters"
            secondary
            onPress={() => {
              setDraft(defaults);
              setFilters(defaults);
              setOpen(false);
            }}
          />
        </ScrollView>
      </ModalPanel>
    </Page>
  );
}
const s = StyleSheet.create({
  check: { minHeight: 44, justifyContent: 'center' },
});
