import React, { useState, type ReactNode, type CSSProperties } from 'react';
import { Platform, View, type ViewStyle } from 'react-native';
import type { Product } from '@/data/products';
import {
  groupAccountTransactionsByMonth,
  type AccountTransaction,
} from '@/data/accountDetails';
import {
  getCountryConfig,
  formatMoneyNumber,
} from '@/app/registry/countryConfig';
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting';
import {
  EMPTY_ACCOUNT_TRANSACTION_FILTERS,
  filterEvoTransactions,
  hasAccountTransactionFilters,
  type AccountTransactionFilterState,
} from '@/features/accounts-payments/evoTransactionFilters';
import type { CurrentScreenProps } from '../contracts';
import { BaselineSearchBar } from '../../../../universal/BaselineSearchBar';
import { BaselineTransactionRow } from '../../../../universal/BaselineTransactionRow';
import { BaselineTransactionDivider } from '../../../../universal/BaselineTransactionDivider';
import { Text } from '../../../../universal/Typography';
import { NativeTransactionLeadingVisual } from './NativeTransactionLeadingVisual';
import {
  applyCategoryOverride,
  overrideCategory,
} from '../banking/categoryOverrides';
import { getPfmCategorySelection } from '@/data/pfmCategories';
import { RoBaselineTransactionFilters } from './TransactionFilters';
import { RoBaselineCategorySheet } from './CategorySheet';
import { RoBaselineMonthlyReport } from './MonthlyReport';
import { sourceColor } from '../../../../universal/sourceColor';
export interface RoBaselineTransactionSections {
  search: ReactNode;
  body: ReactNode;
  overlays: ReactNode;
  stickyTop: number;
}

/** Source baseline list: owner controls product/query/navigation; list controls its drafts. */
export function RoBaselineTransactions({
  host,
  kind,
  product,
  transactions,
  query,
  onQueryChange,
  report = false,
  showPending = false,
  onTransaction,
  onActivateSearch,
  filters: controlledFilters,
  onFiltersChange,
  stickyTop = host.screenTopInset + 48,
  renderSections,
}: {
  host: CurrentScreenProps;
  kind: 'account' | 'card';
  product: Product;
  transactions: readonly AccountTransaction[];
  query: string;
  onQueryChange: (value: string) => void;
  report?: boolean;
  showPending?: boolean;
  onTransaction: (transaction: AccountTransaction) => void;
  onActivateSearch?: () => void;
  filters?: AccountTransactionFilterState;
  onFiltersChange?: (filters: AccountTransactionFilterState) => void;
  stickyTop?: number;
  renderSections?: (sections: RoBaselineTransactionSections) => ReactNode;
}) {
  const [localFilters, setLocalFilters] =
    useState<AccountTransactionFilterState>({
      ...EMPTY_ACCOUNT_TRANSACTION_FILTERS,
    });
  const filters = controlledFilters ?? localFilters,
    setFilters = onFiltersChange ?? setLocalFilters;
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categoryTransaction, setCategoryTransaction] =
    useState<AccountTransaction | null>(null);
  const [, setRevision] = useState(0);
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true),
    surface = sourceColor('var(--uc-surface)', dark),
    currency =
      kind === 'card'
        ? getCountryConfig(host.country).currency
        : product.currency;
  const presentation = host.bankingPresentation;
  const sourceRows =
    presentation?.rows !== undefined &&
    (presentation.productId === undefined ||
      presentation.productId === product.id)
      ? presentation.rows
      : undefined;
  const presentationById = new Map(
    (sourceRows ?? []).map(row => [row.transaction.id, row] as const),
  );
  const scoped = (sourceRows?.map(row => row.transaction) ?? transactions).map(
    transaction => {
      const locallyResolved =
        kind === 'account'
          ? applyCategoryOverride(host, transaction)
          : transaction;
      const sourceOverride =
        presentation?.transactionCategoryOverrides?.[transaction.id];
      return sourceOverride
        ? {
            ...locallyResolved,
            category: sourceOverride.groupLabel,
            pfmCategory: sourceOverride.category,
            pfmSubcategory: sourceOverride.subcategory,
          }
        : locallyResolved;
    },
  );
  const filtered = filterEvoTransactions({
    transactions: scoped,
    search: query,
    filters: kind === 'account' ? filters : EMPTY_ACCOUNT_TRANSACTION_FILTERS,
    accountNumber: product.accountNumber,
    currency: getCountryConfig(host.country).currency,
  });
  const active = kind === 'account' && hasAccountTransactionFilters(filters);
  const hasSearch = Boolean(query.trim());
  const groups = groupAccountTransactionsByMonth(
    filtered.filter(t => {
      return t.status === 'Booked';
    }),
  );
  const currentMonth = scoped.reduce((latest, t) => {
    return t.monthKey > latest ? t.monthKey : latest;
  }, '');
  const pending = showPending
    ? filtered.filter(t => {
        return t.status === 'Pending';
      })
    : [];
  const changeQuery = (value: string) => {
    onQueryChange(value);
    onActivateSearch?.();
  };
  const row = (transaction: AccountTransaction, category = false) => {
    const sourceRow = presentationById.get(transaction.id);
    return (
      <BaselineTransactionRow
        key={transaction.id}
        transaction={transaction}
        formattedAmount={formatEvo2027Number(Math.abs(transaction.amount))}
        currency={currency}
        displayLabel={sourceRow?.displayLabel}
        leadingVisual={
          sourceRow?.leadingVisual ? (
            <NativeTransactionLeadingVisual
              transaction={transaction}
              visual={sourceRow.leadingVisual}
            />
          ) : undefined
        }
        avatarPresentation="category"
        categoryIconVariant="glyph"
        dark={dark}
        onPress={onTransaction}
        onCategoryPress={category ? setCategoryTransaction : undefined}
      />
    );
  };
  const sourceStyle0 = {
    paddingHorizontal: 16,
    paddingTop: 24,
    backgroundColor: surface,
    zIndex: 20,
    ...(Platform.OS === 'web' && !renderSections
      ? ({
          position: 'sticky',
          top: stickyTop,
        } satisfies CSSProperties as unknown as ViewStyle)
      : {}),
  } as const;
  const search = (
    <View testID="ro-transactions-search" style={sourceStyle0}>
      <BaselineSearchBar
        value={query}
        placeholder={host.t('runtime.actions.search', 'Search')}
        trailingLabel={host.t('runtime.actions.filters', 'Filters')}
        onValueChange={changeQuery}
        onClick={onActivateSearch}
        onFocus={onActivateSearch}
        dark={dark}
        filtersActive={active}
        onFilterClick={
          kind === 'account'
            ? () => {
                return setFiltersOpen(true);
              }
            : undefined
        }
        onRemoveFilters={() => {
          setFilters({
            ...EMPTY_ACCOUNT_TRANSACTION_FILTERS,
          });
          onActivateSearch?.();
        }}
      />
    </View>
  );
  const sourceStyle1 = {
    paddingTop: 24,
    backgroundColor: surface,
  } as const;
  const sourceStyle2 = {
    paddingBottom: 8,
  } as const;
  const sourceStyle3 = {
    paddingTop: 16,
  } as const;
  const sourceStyle6 = {
    paddingHorizontal: 16,
    paddingVertical: 32,
  } as const;
  const sourceStyle7 = {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 17,
    textAlign: 'center',
    color: host.tokens.muted,
  } as const;
  const body = (
    <View testID="ro-transactions-body" style={sourceStyle1}>
      {pending.length > 0 ? (
        <View testID="ro-pending-transactions" style={sourceStyle2}>
          <BaselineTransactionDivider
            title="Pending"
            currency={currency}
            dark={dark}
          />
          <View style={sourceStyle3}>
            {pending.map(t => {
              return row(t);
            })}
          </View>
        </View>
      ) : null}
      {groups.length > 0 ? (
        groups.map((group, index) => {
          const sourceStyle4 = {
            paddingTop: 16,
          } as const;
          const sourceStyle5 = {
            paddingTop: 16,
          } as const;
          return (
            <View
              key={group.monthKey}
              style={index > 0 ? sourceStyle4 : undefined}
            >
              <BaselineTransactionDivider
                title={group.monthTitle}
                total={
                  kind === 'account'
                    ? formatMoneyNumber(group.monthlyTotal, host.country)
                    : undefined
                }
                currency={currency}
                dark={dark}
              />
              {kind === 'account' &&
              report &&
              !hasSearch &&
              !active &&
              group.monthKey !== currentMonth ? (
                <RoBaselineMonthlyReport
                  host={host}
                  product={product}
                  group={group}
                />
              ) : null}
              <View style={sourceStyle5}>
                {group.transactions.map(t => {
                  return row(t, kind === 'account');
                })}
              </View>
            </View>
          );
        })
      ) : (
        <View style={sourceStyle6}>
          <Text style={sourceStyle7}>
            {hasSearch || active
              ? host.t(
                  'runtime.accounts.noTransactionsFound',
                  'No transactions found',
                )
              : null}
          </Text>
        </View>
      )}
    </View>
  );
  const overlays = (
    <>
      {filtersOpen ? (
        <RoBaselineTransactionFilters
          host={host}
          currency={getCountryConfig(host.country).currency}
          filters={filters}
          onClose={() => {
            return setFiltersOpen(false);
          }}
          onApply={next => {
            setFilters(next);
            setFiltersOpen(false);
            onActivateSearch?.();
          }}
        />
      ) : null}
      {categoryTransaction ? (
        <RoBaselineCategorySheet
          host={host}
          currentSelection={getPfmCategorySelection(
            categoryTransaction.pfmCategory,
            categoryTransaction.pfmSubcategory,
          )}
          onClose={() => {
            return setCategoryTransaction(null);
          }}
          onConfirm={selection => {
            overrideCategory(host, categoryTransaction.id, selection);
            setCategoryTransaction(null);
            setRevision(n => {
              return n + 1;
            });
            host.onChanged();
          }}
        />
      ) : null}
    </>
  );
  if (renderSections)
    return renderSections({
      search,
      body,
      overlays,
      stickyTop,
    });
  const sourceStyle8 = {
    backgroundColor: surface,
  } as const;
  return (
    <View style={sourceStyle8}>
      {search}
      {body}
      {overlays}
    </View>
  );
}
