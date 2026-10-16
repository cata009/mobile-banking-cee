import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Text } from '../../../../../universal/Typography';
import { Header } from '../../../../../universal/Header';
import { BaselineSearchBar } from '../../../../../universal/BaselineSearchBar';
import { Select } from '../../../../../universal/Select';
import type { CzechNativeScreenProps } from '../contracts';
import type { AccountTransaction } from '@/data/accountDetails';
import type { CurrentAccount, DebitCard } from '@/data/products';
import type { NativeBankingPresentation } from '@/features/demo-native/bankingPresentation';
import { NativeTransactionLeadingVisual } from '../../../current/baseline/NativeTransactionLeadingVisual';
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting';
import { czechProducts, baseAccountMovements } from './source';
import { tokens, s, Copy, money, Glyph, IconButton } from './Primitives';
import MovementAvatar from './MovementAvatar';
import { MovementDetail } from './Movements';
interface OwnedMovement {
  transaction: AccountTransaction;
  product: CurrentAccount;
  rawTransactionId: string;
  displayLabel?: string;
  leadingVisual?: NonNullable<
    NativeBankingPresentation['rows']
  >[number]['leadingVisual'];
}
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
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
function presentationMovements(
  presentation: NativeBankingPresentation | undefined,
  accounts: readonly CurrentAccount[],
  allProducts: import('@/data/products').Product[],
): OwnedMovement[] | undefined {
  if (presentation?.rows === undefined) return undefined;
  if (presentation.productId === undefined) {
    return presentation.rows.flatMap(row => {
      const product = accounts.find(account =>
        row.transaction.id.startsWith(`${account.id}-`),
      );
      if (!product) return [];
      return [
        {
          transaction: row.transaction,
          product,
          rawTransactionId: row.transaction.id.slice(product.id.length + 1),
          displayLabel: row.displayLabel,
          leadingVisual: row.leadingVisual,
        },
      ];
    });
  }
  const product = accounts.find(
    account => account.id === presentation.productId,
  );
  if (!product) return undefined;
  const otherAccounts = accounts.filter(account => account.id !== product.id);
  const preservedRows = pooledMovements(otherAccounts, allProducts);
  const selectedRows = presentation.rows.map(row => {
    const prefixed = row.transaction.id.startsWith(`${product.id}-`);
    const rawTransactionId = prefixed
      ? row.transaction.id.slice(product.id.length + 1)
      : row.transaction.id;
    return {
      transaction: prefixed
        ? row.transaction
        : { ...row.transaction, id: `${product.id}-${row.transaction.id}` },
      product,
      rawTransactionId,
      displayLabel: row.displayLabel,
      leadingVisual: row.leadingVisual,
    };
  });
  return [...preservedRows, ...selectedRows];
}
export default function TransactionsScreen(props: CzechNativeScreenProps) {
  const products = czechProducts(
      props.productCounts,
      props.bankingPresentation,
    ),
    accounts = products.filter(
      (product): product is CurrentAccount =>
        product.type === 'current_account',
    );
  const [scopeId, setScope] = useState('all-accounts'),
    [query, setQuery] = useState(''),
    [monthRailVisible, setMonthRailVisible] = useState(false),
    [activeMonthKey, setActiveMonthKey] = useState(''),
    [selected, setSelected] = useState<OwnedMovement | null>(null);
  const scroll = useRef<React.ElementRef<typeof ScrollView>>(null),
    sections = useRef(new Map<string, number>()),
    monthRail = useRef<React.ElementRef<typeof ScrollView>>(null),
    monthRailViewportWidth = useRef(0),
    monthRailScrollLeft = useRef(0),
    monthChipFrames = useRef(
      new Map<string, { left: number; width: number }>(),
    );
  const scoped =
    scopeId === 'all-accounts'
      ? accounts
      : accounts.filter(a => a.id === scopeId);
  const presentation = presentationMovements(
    props.bankingPresentation,
    scoped,
    products,
  );
  const filtered = (presentation ?? pooledMovements(scoped, products))
    .map(row => {
      const override =
        props.bankingPresentation?.transactionCategoryOverrides?.[
          row.rawTransactionId
        ];
      return override
        ? {
            ...row,
            transaction: {
              ...row.transaction,
              category: override.groupLabel,
              pfmCategory: override.category,
              pfmSubcategory: override.subcategory,
            },
          }
        : row;
    })
    .filter(row =>
      [
        row.displayLabel ?? row.transaction.label,
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
  const firstMonthKey = months[0] ?? '',
    activeMonthExists = months.includes(activeMonthKey);
  useEffect(() => {
    if (!activeMonthExists) setActiveMonthKey(firstMonthKey);
  }, [activeMonthExists, activeMonthKey, firstMonthKey]);
  const ensureMonthVisible = useCallback((monthKey: string) => {
    const frame = monthChipFrames.current.get(monthKey),
      viewport = monthRailViewportWidth.current;
    if (!frame || viewport <= 0) return;

    const visibleLeft = monthRailScrollLeft.current,
      visibleRight = visibleLeft + viewport,
      frameRight = frame.left + frame.width;
    if (frame.left < visibleLeft)
      monthRail.current?.scrollTo({ x: frame.left, animated: true });
    else if (frameRight > visibleRight)
      monthRail.current?.scrollTo({ x: frameRight - viewport, animated: true });
  }, []);
  useEffect(() => {
    if (activeMonthKey) ensureMonthVisible(activeMonthKey);
  }, [activeMonthKey, ensureMonthVisible]);
  const titleFor = (key: string) =>
    new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${key}T12:00:00Z`));
  const handleListScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = Math.max(0, event.nativeEvent.contentOffset.y);
    setMonthRailVisible(offset > 0);

    let currentMonth = months[0] ?? '';
    const threshold = offset + 24;
    for (const month of months) {
      const sectionTop = sections.current.get(month);
      // Later months cannot start at zero; a pending layout must not select the oldest month.
      if (
        sectionTop !== undefined &&
        (sectionTop > 0 || month === months[0]) &&
        sectionTop <= threshold
      )
        currentMonth = month;
    }
    setActiveMonthKey(currentMonth);
  };
  const jumpToMonth = (monthKey: string) => {
    setActiveMonthKey(monthKey);
    const sectionTop = sections.current.get(monthKey);
    if (sectionTop !== undefined) {
      // Header and scope are fixed above the list, so this y is already in its scroll frame.
      scroll.current?.scrollTo({ y: Math.max(0, sectionTop), animated: true });
    }
  };
  const handleMonthRailLayout = (event: LayoutChangeEvent) => {
    monthRailViewportWidth.current = event.nativeEvent.layout.width;
    ensureMonthVisible(activeMonthKey);
  };
  const handleMonthChipLayout = (
    monthKey: string,
    event: LayoutChangeEvent,
  ) => {
    monthChipFrames.current.set(monthKey, {
      left: event.nativeEvent.layout.x,
      width: event.nativeEvent.layout.width,
    });
    if (monthKey === activeMonthKey) ensureMonthVisible(monthKey);
  };
  const activeYear = activeMonthKey.slice(0, 4);
  const showTransactionSearch = !monthRailVisible || query.trim().length > 0;
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
          <View testID="transactions-header">
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
          </View>
          <View style={t.band} testID="transactions-scope-band">
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
            <View style={t.tools}>
              {showTransactionSearch && (
                <View style={t.searchField} testID="transactions-search-field">
                  <BaselineSearchBar
                    placeholder="Search transactions"
                    value={query}
                    onValueChange={setQuery}
                    showTrailingAction={false}
                    fieldSurface="raised"
                    fieldSize="comfortable"
                  />
                </View>
              )}
              {monthRailVisible && months.length > 0 && (
                <ScrollView
                  ref={monthRail}
                  testID="transactions-month-rail"
                  accessibilityRole="tablist"
                  accessibilityLabel="Jump to month"
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  onLayout={handleMonthRailLayout}
                  onScroll={event => {
                    monthRailScrollLeft.current =
                      event.nativeEvent.contentOffset.x;
                  }}
                  scrollEventThrottle={16}
                  contentContainerStyle={t.monthRail}
                >
                  {months.map(month => {
                    const [year, monthNumber] = month.split('-');
                    const label =
                      MONTH_LABELS[Number(monthNumber) - 1] ?? month;
                    const isActive = month === activeMonthKey;
                    const visibleLabel =
                      year === activeYear
                        ? label
                        : `${label} ${year?.slice(-2)}`;
                    return (
                      <Pressable
                        key={month}
                        testID={`transactions-month-${month}`}
                        accessibilityRole="button"
                        accessibilityLabel={`Month ${month}`}
                        accessibilityState={{ selected: isActive }}
                        onPress={() => jumpToMonth(month)}
                        onLayout={event => handleMonthChipLayout(month, event)}
                        style={[
                          t.month,
                          isActive ? t.monthActive : t.monthInactive,
                        ]}
                      >
                        <Copy
                          strong={isActive}
                          color={isActive ? tokens.inverse : tokens.muted}
                        >
                          {visibleLabel}
                        </Copy>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          </View>
          <ScrollView
            ref={scroll}
            testID="transactions-list"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={handleListScroll}
            contentContainerStyle={t.content}
          >
            {ordered.map(([date, rows], index) => (
              <View
                key={date}
                testID="transactions-date-group"
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
                <View style={t.day} testID="transactions-date-divider">
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
                <View style={s.panel} testID="transactions-date-card">
                  {rows.map(row => (
                    <Pressable
                      key={row.transaction.id}
                      accessibilityRole="button"
                      accessibilityLabel={`Transaction ${row.transaction.id}`}
                      onPress={() =>
                        props.onTransactionSelected
                          ? props.onTransactionSelected({
                              productId: row.product.id,
                              source: 'account',
                              transaction: row.transaction,
                            })
                          : setSelected(row)
                      }
                      style={t.row}
                    >
                      {row.leadingVisual ? (
                        <NativeTransactionLeadingVisual
                          transaction={row.transaction}
                          visual={row.leadingVisual}
                        />
                      ) : (
                        <MovementAvatar transaction={row.transaction} />
                      )}
                      <View style={t.input}>
                        <Copy strong>
                          {row.displayLabel ?? row.transaction.label}
                        </Copy>
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
                <Copy>
                  {query.trim()
                    ? 'No transactions match your search.'
                    : 'No transactions on the selected accounts.'}
                </Copy>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      {selected && (
        <MovementDetail
          transaction={selected.transaction}
          product={selected.product}
          onTransactionCategoryChange={props.onTransactionCategoryChange}
          cardUsed={
            selected.transaction.source === 'card'
              ? products.find(
                  (candidate): candidate is DebitCard =>
                    candidate.type === 'debit_card' &&
                    candidate.linkedAccountId === selected.product.id,
                )
              : undefined
          }
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
  tools: { gap: 8 },
  searchField: { width: '100%' },
  input: {
    flex: 1,
    gap: 2,
  },
  monthRail: { flexDirection: 'row', gap: 5, paddingHorizontal: 2 },
  month: {
    height: 38,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  monthActive: { backgroundColor: tokens.accent },
  monthInactive: { backgroundColor: tokens.surface },
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
