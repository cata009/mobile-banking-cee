import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, View, StyleSheet } from 'react-native';
import {
  getHistoryTypesForTab,
  normalizeFiltersForTab,
  resetFilterTypesForTab,
  selectInvestmentHistoryRows,
} from '@/features/investments/history/model';
import {
  INVESTMENT_HISTORY_DATE_OPTIONS,
  type InvestmentHistoryFilterState,
} from '@/app/config/investmentsPortfolioConfig';
import { getCountryConfig } from '@/app/registry/countryConfig';
import type { Currency } from '@/data/products';
import { BaselineMailboxTabs } from '../../../../../../universal/BaselineMailboxTabs';
import { BaselineSearchBar } from '../../../../../../universal/BaselineSearchBar';
import { Text } from '../../../../../../universal/Typography';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import {
  BaselineInvestmentFrame,
  investmentColor,
  investmentDark,
  investmentScrollStyle,
} from '../Frame';
import {
  BaselineInvestmentHistoryRows,
  type BaselineHistoryItem,
} from './HistoryRows';
import {
  BaselineInvestmentHistoryDetail,
  HistoryHomeIndicator,
} from './HistoryDetail';
import {
  BaselineInvestmentHistoryFilters,
  HISTORY_STATUSES,
  historyFilterDate,
  type HistoryFilterMode,
} from './HistoryFilters';
import { useBaselineFlowBack } from './Signing';
import type { BaselineHistoryProps } from './contracts';
type BaselineHistoryAdapterProps = BaselineHistoryProps & {
  filterBySecurityId?: string | null;
  hideAllTimeDateOption?: boolean;
  hideCurrencyFilter?: boolean;
  allDatesByDefault?: boolean;
  titleOverride?: string;
  closeModuleButton?: boolean;
  onTabChange?: (tab: 'transactions' | 'orders') => void;
  approvalCount?: number;
  onToApprove?: () => void;
};
const same = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every(v => b.includes(v));
function matches(
  filters: InvestmentHistoryFilterState,
  defaults: InvestmentHistoryFilterState,
  tab: 'transactions' | 'orders',
) {
  return (
    filters.datePreset === defaults.datePreset &&
    same(filters.selectedTypes, defaults.selectedTypes) &&
    same(filters.selectedCurrencies, defaults.selectedCurrencies) &&
    (tab !== 'orders' ||
      same(filters.selectedStatuses, defaults.selectedStatuses))
  );
}
export function BaselineInvestmentHistory({
  host,
  transactions,
  orders,
  currencies: providedCurrencies,
  initialTab = 'transactions',
  filterByTitle,
  filterBySecurityId,
  hideAllTimeDateOption = false,
  hideCurrencyFilter = false,
  allDatesByDefault = false,
  titleOverride,
  closeModuleButton = false,
  onTabChange,
  approvalCount = 0,
  onToApprove,
  onBack,
}: BaselineHistoryAdapterProps) {
  const [tab, setTab] = useState(initialTab),
    [query, setQuery] = useState(''),
    [securityIdFilter, setSecurityIdFilter] = useState(
      filterBySecurityId ?? null,
    ),
    [filterMode, setFilterMode] = useState<HistoryFilterMode | null>(null),
    [info, setInfo] = useState<'transactions' | 'orders' | null>(null),
    [selected, setSelected] = useState<BaselineHistoryItem | null>(null),
    previousCountry = useRef(host.country);
  const currencyKey = (
    providedCurrencies ?? [
      getCountryConfig(host.country).currency as Currency,
      ...transactions.map(t => t.currency),
      ...orders.map(o => o.currency),
    ]
  ).join('|');
  const currencies = useMemo(
    () => [...new Set(currencyKey.split('|') as Currency[])],
    [currencyKey],
  );
  const defaults = useMemo<InvestmentHistoryFilterState>(
    () => ({
      datePreset:
        allDatesByDefault && !hideAllTimeDateOption ? 'all-time' : 'last-year',
      customStartDate: '2025-09-01',
      customEndDate: '2026-06-30',
      selectedTypes: [...getHistoryTypesForTab('transactions')],
      selectedCurrencies: currencies,
      selectedStatuses: [...HISTORY_STATUSES],
    }),
    [allDatesByDefault, currencies, hideAllTimeDateOption],
  );
  const tabDefaults = useMemo(
    () => resetFilterTypesForTab(defaults, tab),
    [defaults, tab],
  );
  const [applied, setApplied] = useState<InvestmentHistoryFilterState | null>(
      null,
    ),
    [draft, setDraft] = useState(defaults);
  useEffect(() => {
    if (typeof filterByTitle === 'string' && filterByTitle.trim())
      setQuery(filterByTitle);
  }, [filterByTitle]);
  useEffect(() => {
    setSecurityIdFilter(
      typeof filterBySecurityId === 'string' && filterBySecurityId.trim()
        ? filterBySecurityId
        : null,
    );
  }, [filterBySecurityId]);
  useEffect(() => {
    if (previousCountry.current === host.country) return;
    previousCountry.current = host.country;
    setApplied(null);
    setDraft(tabDefaults);
    setQuery('');
    setSecurityIdFilter(null);
    setFilterMode(null);
    setInfo(null);
    setSelected(null);
  }, [host.country, tabDefaults]);
  useEffect(() => {
    setDraft(current => resetFilterTypesForTab(current, tab));
    setApplied(current => {
      if (!current) return current;
      const next = resetFilterTypesForTab(current, tab);
      return matches(next, tabDefaults, tab) ? null : next;
    });
  }, [tab, tabDefaults]);
  useBaselineFlowBack(host, () => {
    if (selected) setSelected(null);
    else if (info) setInfo(null);
    else if (filterMode === 'main') setFilterMode(null);
    else if (filterMode) setFilterMode('main');
    else return false;
    return true;
  });
  const results = selectInvestmentHistoryRows({
    transactions,
    orders,
    filters: applied ?? tabDefaults,
    searchQuery: query,
    securityId: securityIdFilter,
  });
  const apply = () => {
    const normalized = normalizeFiltersForTab(draft, tab);
    setApplied(matches(normalized, tabDefaults, tab) ? null : normalized);
    setFilterMode(null);
  };
  const update = (next: InvestmentHistoryFilterState) =>
    setApplied(matches(next, tabDefaults, tab) ? null : next);
  const open = () => {
    setDraft(normalizeFiltersForTab(applied ?? tabDefaults, tab));
    setFilterMode('main');
  };
  if (selected)
    return (
      <BaselineInvestmentHistoryDetail
        host={host}
        selected={selected}
        onBack={() => setSelected(null)}
      />
    );
  const renderStyle1 = {
    backgroundColor: investmentColor(host, '--uc-action-strong'),
  } as const;
  const renderStyle2 = {
    color: investmentColor(host, '--uc-static-white'),
  } as const;
  const renderStyle3 = {
    color: investmentColor(host, '--uc-text'),
  } as const;
  if (info)
    return (
      <BaselineInvestmentFrame
        host={host}
        title={
          info === 'orders' ? 'Status of orders' : 'Status of transactions'
        }
        onBack={() => setInfo(null)}
        footer={
          <>
            <View style={baselineStyles.inline1}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ok, got it"
                onPress={() => setInfo(null)}
                style={[
                  baselineStyles.inline2,
                  renderStyle1,
                  baselineStyles.inline3,
                ]}
              >
                <Text style={[baselineStyles.inline4, renderStyle2]}>
                  Ok, got it
                </Text>
              </Pressable>
            </View>
            <HistoryHomeIndicator host={host} />
          </>
        }
      >
        <View style={baselineStyles.inline5}>
          <Text style={[baselineStyles.inline6, renderStyle3]}>
            {info === 'orders'
              ? 'Order statuses show whether an investment instruction was executed, is still pending, or was rejected by the market or bank checks.'
              : 'Transaction statuses help you understand posted investment movements such as buys, sells, coupons, and withdrawals in your portfolio history.'}
          </Text>
        </View>
      </BaselineInvestmentFrame>
    );
  if (filterMode)
    return (
      <BaselineInvestmentHistoryFilters
        host={host}
        mode={filterMode}
        filters={draft}
        currencies={currencies}
        tab={tab}
        onClose={() => setFilterMode(null)}
        onApply={apply}
        onChange={setDraft}
        onMode={setFilterMode}
        hideAllTimeDateOption={hideAllTimeDateOption}
        hideCurrencyFilter={hideCurrencyFilter}
      />
    );
  const chips: {
    id: string;
    label: string;
    onRemove(): void;
  }[] = [];
  if (applied) {
    if (applied.datePreset !== defaults.datePreset)
      chips.push({
        id: 'date',
        label:
          applied.datePreset === 'define'
            ? `${historyFilterDate(
                applied.customStartDate,
                host,
              )} - ${historyFilterDate(applied.customEndDate, host)}`
            : INVESTMENT_HISTORY_DATE_OPTIONS.find(
                o => o.id === applied.datePreset,
              )?.label ?? 'Date',
        onRemove: () =>
          update({
            ...applied,
            datePreset: defaults.datePreset,
          }),
      });
    const types = getHistoryTypesForTab(tab);
    if (!same(applied.selectedTypes, types)) {
      if (!applied.selectedTypes.length)
        chips.push({
          id: 'types-none',
          label: 'No types',
          onRemove: () =>
            update({
              ...applied,
              selectedTypes: [...types],
            }),
        });
      else
        applied.selectedTypes.forEach(type =>
          chips.push({
            id: `type-${type}`,
            label: type,
            onRemove: () =>
              update({
                ...applied,
                selectedTypes: applied.selectedTypes.filter(v => v !== type),
              }),
          }),
        );
    }
    if (tab === 'orders' && !same(applied.selectedStatuses, HISTORY_STATUSES)) {
      if (!applied.selectedStatuses.length)
        chips.push({
          id: 'statuses-none',
          label: 'No statuses',
          onRemove: () =>
            update({
              ...applied,
              selectedStatuses: [...HISTORY_STATUSES],
            }),
        });
      else
        applied.selectedStatuses.forEach(status =>
          chips.push({
            id: `status-${status}`,
            label: status,
            onRemove: () =>
              update({
                ...applied,
                selectedStatuses: applied.selectedStatuses.filter(
                  v => v !== status,
                ),
              }),
          }),
        );
    }
    if (!same(applied.selectedCurrencies, currencies)) {
      if (!applied.selectedCurrencies.length)
        chips.push({
          id: 'currencies-none',
          label: 'No currencies',
          onRemove: () =>
            update({
              ...applied,
              selectedCurrencies: [...currencies],
            }),
        });
      else
        applied.selectedCurrencies.forEach(currency =>
          chips.push({
            id: `currency-${currency}`,
            label: currency,
            onRemove: () =>
              update({
                ...applied,
                selectedCurrencies: applied.selectedCurrencies.filter(
                  v => v !== currency,
                ),
              }),
          }),
        );
    }
  }
  const renderStyle4 = {
    gap: 8,
    paddingBottom: 8,
  } as const;
  const renderStyle7 = {
    color: investmentColor(host, '--uc-action'),
  } as const;
  return (
    <BaselineInvestmentFrame
      host={host}
      title={titleOverride ?? 'History'}
      onBack={onBack}
      onHelp={() => setInfo(tab)}
      headerOptions={{
        showHelp: true,
        ...(closeModuleButton
          ? {
              variant: 'gray' as const,
              backIconName: 'close-flow' as const,
              backLabel: 'Back to mobile banking',
            }
          : {}),
      }}
    >
      <BaselineMailboxTabs
        tabs={[
          {
            id: 'transactions',
            label: 'TRANSACTIONS',
          },
          {
            id: 'orders',
            label: 'ORDERS',
          },
        ]}
        activeTabId={tab}
        onChange={id => {
          const nextTab = id as typeof tab;
          setTab(nextTab);
          onTabChange?.(nextTab);
        }}
        minTabWidth={188}
        layout="equal"
        ariaLabel="Investment history tabs"
        withTopMargin={false}
        includeBorderInHeight
        dark={investmentDark(host)}
      />
      {tab === 'orders' && onToApprove ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${approvalCount} orders need your approval`}
          onPress={onToApprove}
          style={[
            baselineStyles.approvalBanner,
            { backgroundColor: investmentColor(host, '--uc-action') },
          ]}
        >
          <Text
            style={[
              baselineStyles.approvalBannerText,
              { color: investmentColor(host, '--uc-static-white') },
            ]}
          >
            {approvalCount} orders need your approval
          </Text>
          <Text
            style={[
              baselineStyles.approvalBannerAction,
              { color: investmentColor(host, '--uc-static-white') },
            ]}
          >
            View orders to approve
          </Text>
        </Pressable>
      ) : null}
      <View style={baselineStyles.inline7}>
        <BaselineSearchBar
          value={query}
          onValueChange={setQuery}
          onFilterClick={open}
          filtersActive={applied !== null}
          showRemoveFiltersAction={false}
          onRemoveFilters={() => setApplied(null)}
          dark={investmentDark(host)}
        />
      </View>
      {applied ? (
        <View style={baselineStyles.inline8}>
          <ScrollView
            style={investmentScrollStyle()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={renderStyle4}
          >
            {chips.map(chip => {
              const renderStyle5 = {
                borderColor: investmentColor(host, '--uc-action'),
              } as const;
              const renderStyle6 = {
                color: investmentColor(host, '--uc-action'),
              } as const;
              return (
                <View
                  key={chip.id}
                  style={[
                    baselineStyles.inline9,
                    renderStyle5,
                    baselineStyles.inline10,
                  ]}
                >
                  <Text style={[baselineStyles.inline11, renderStyle6]}>
                    {chip.label}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${chip.label} filter`}
                    onPress={chip.onRemove}
                    style={baselineStyles.inline12}
                  >
                    <SourceCustomIcon
                      name="close-x"
                      size={16}
                      color={investmentColor(host, '--uc-action')}
                    />
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="REMOVE FILTERS"
            onPress={() => setApplied(null)}
            style={baselineStyles.inline13}
          >
            <Text style={[baselineStyles.inline14, renderStyle7]}>
              REMOVE FILTERS
            </Text>
          </Pressable>
        </View>
      ) : null}
      <BaselineInvestmentHistoryRows
        host={host}
        tab={tab}
        transactions={results.transactions}
        orders={results.orders}
        onSelect={setSelected}
      />
      <View style={baselineStyles.inline15} />
    </BaselineInvestmentFrame>
  );
}
const baselineStyles = StyleSheet.create({
  inline1: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  inline2: {
    height: 48,
    borderRadius: 4,
  },
  inline3: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline4: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
  },
  inline5: {
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  inline6: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 22,
  },
  inline7: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  inline8: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  inline9: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 3,
    borderWidth: 1,
  },
  inline10: {
    paddingHorizontal: 6,
  },
  inline11: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
  },
  inline12: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline13: {
    paddingVertical: 6,
  },
  inline14: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    textAlign: 'right',
  },
  inline15: {
    height: 34,
  },
  approvalBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  approvalBannerText: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
  },
  approvalBannerAction: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    marginTop: 4,
  },
});
