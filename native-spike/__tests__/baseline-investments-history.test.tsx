import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { BaselineInvestmentHistory } from '../src/experiences/pi/current/investments/baseline/flows/History';
import { BaselineSearchBar } from '../src/universal/BaselineSearchBar';
import { BaselineMailboxTabs } from '../src/universal/BaselineMailboxTabs';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import {
  getHistoryTypesForTab,
  selectInvestmentHistoryRows,
} from '@/features/investments/history/model';
import { getCountryConfig } from '@/app/registry/countryConfig';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import type { Currency } from '@/data/products';
import { addToRange } from 'react-day-picker';
import { selectHistoryCalendarDay } from '../src/experiences/pi/current/investments/baseline/flows/HistoryFilters';
function host(
  country: CurrentScreenProps['country'] = 'RO',
): CurrentScreenProps {
  return {
    country,
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: {
      accounts: 2,
      debitCards: 2,
      creditCards: 1,
      mealCards: 0,
      deposits: 1,
      savingsAccounts: 1,
      loans: 1,
      mortgages: 1,
      investments: 1,
    },
    route: { screen: 'investments' },
    tokens: currentTokens(),
    t: createCurrentTranslator(country, 'en'),
    amountsHidden: false,
    screenTopInset: 54,
    isActive: true,
    onBack: jest.fn(),
    onBackHandlerChange: jest.fn(),
  } as unknown as CurrentScreenProps;
}
const press = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    n =>
      n.props.accessibilityLabel === label &&
      typeof n.props.onPress === 'function',
  )[0]!;
const rows = (tree: Renderer.ReactTestRenderer) =>
  tree.root.findAll(
    n =>
      String(n.props.testID ?? '').startsWith('baseline-history-row-') &&
      typeof n.props.onPress === 'function',
  );
test.each(['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'] as const)(
  'history %s uses canonical Source defaultfilter/title intent and tab categories',
  async country => {
    const p = host(country),
      data = createCurrentInvestmentSnapshot(p),
      title = data.transactions[0]!.title;
    let tree!: Renderer.ReactTestRenderer;
    await act(() => {
      tree = Renderer.create(
        <BaselineInvestmentHistory
          host={p}
          transactions={data.transactions}
          orders={data.orders}
          filterByTitle={title}
          onBack={p.onBack}
        />,
      );
    });
    const currencies = [
      ...new Set<Currency>([
        getCountryConfig(country).currency as Currency,
        ...data.securities.map(s => s.instrumentCurrency),
      ]),
    ];
    const expected = selectInvestmentHistoryRows({
      transactions: data.transactions,
      orders: data.orders,
      searchQuery: title,
      filters: {
        datePreset: 'last-year',
        customStartDate: '2025-09-01',
        customEndDate: '2026-06-30',
        selectedTypes: [...getHistoryTypesForTab('transactions')],
        selectedStatuses: ['EXECUTED', 'PENDING', 'REJECTED'],
        selectedCurrencies: currencies,
      },
    });
    expect(rows(tree)).toHaveLength(expected.transactions.length);
    expect(tree.root.findByType(BaselineSearchBar).props.value).toBe(title);
    await act(() =>
      tree.root.findByType(BaselineMailboxTabs).props.onChange('orders'),
    );
    expect(tree.root.findByType(BaselineSearchBar).props.value).toBe(title);
    await act(() => tree.unmount());
  },
);
test('history filter subpage Back, clear/apply and selected detail preserve parent route', async () => {
  const p = host(),
    data = createCurrentInvestmentSnapshot(p);
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <BaselineInvestmentHistory
        host={p}
        transactions={data.transactions}
        orders={data.orders}
        onBack={p.onBack}
      />,
    );
  });
  expect(rows(tree).length).toBeGreaterThan(0);
  await act(() =>
    tree.root.findByType(BaselineSearchBar).props.onFilterClick(),
  );
  await act(() => press(tree, 'By type').props.onPress());
  await act(() => press(tree, 'CLEAR').props.onPress());
  await act(() => press(tree, 'Apply').props.onPress());
  expect(rows(tree)).toHaveLength(0);
  expect(JSON.stringify(tree.toJSON())).toContain(
    "You don't have any transactions",
  );
  await act(() => press(tree, 'REMOVE FILTERS').props.onPress());
  expect(rows(tree).length).toBeGreaterThan(0);
  await act(() => rows(tree)[0]!.props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Transaction details');
  let consumed = false;
  await act(() => {
    consumed = (p.onBackHandlerChange as jest.Mock).mock.calls.at(-1)[0]();
  });
  expect(consumed).toBe(true);
  expect(rows(tree).length).toBeGreaterThan(0);
  expect(p.onBack).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});
test('restores the Source-maintained Orders tab and forwards later Native tab selections', async () => {
  const p = host('RO'),
    data = createCurrentInvestmentSnapshot(p),
    onTabChange = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <BaselineInvestmentHistory
        host={p}
        transactions={data.transactions}
        orders={data.orders}
        initialTab="orders"
        onTabChange={onTabChange}
        onBack={p.onBack}
      />,
    );
  });
  expect(tree.root.findByType(BaselineMailboxTabs).props.activeTabId).toBe(
    'orders',
  );
  await act(() => press(tree, 'TRANSACTIONS').props.onPress());
  expect(onTabChange).toHaveBeenLastCalledWith('transactions');
  expect(tree.root.findByType(BaselineMailboxTabs).props.activeTabId).toBe(
    'transactions',
  );
  await act(() => tree.unmount());
});
test('Native calendar range interaction equals the actual Source calendar authority at interval boundaries', () => {
  const cases: [string, { from?: string; to?: string } | undefined][] = [
    ['2026-06-02', undefined],
    ['2026-06-02', { from: '2026-06-01' }],
    ['2026-05-31', { from: '2026-06-01' }],
    ['2026-06-01', { from: '2026-06-01', to: '2026-06-01' }],
    ['2026-06-02', { from: '2026-06-01', to: '2026-06-02' }],
    ['2026-06-01', { from: '2026-06-01', to: '2026-06-02' }],
    ['2026-05-31', { from: '2026-06-01', to: '2026-06-02' }],
    ['2026-06-03', { from: '2026-06-01', to: '2026-06-02' }],
    ['2026-06-03', { to: '2026-06-02' }],
  ];
  const parse = (s: string) => new Date(`${s}T12:00:00`),
    string = (d: Date | undefined) =>
      d
        ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            '0',
          )}-${String(d.getDate()).padStart(2, '0')}`
        : undefined;
  for (const [day, range] of cases) {
    const expected = addToRange(
      parse(day),
      range
        ? {
            from: range.from ? parse(range.from) : undefined,
            to: range.to ? parse(range.to) : undefined,
          }
        : undefined,
    );
    const actual = selectHistoryCalendarDay(day, range);
    expect(actual).toEqual(
      expected
        ? {
            from: string(expected.from),
            ...(expected.to ? { to: string(expected.to) } : {}),
          }
        : undefined,
    );
  }
});
test('history resets title search and applied filters when country changes', async () => {
  const p = host('RO'),
    data = createCurrentInvestmentSnapshot(p);
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <BaselineInvestmentHistory
        host={p}
        transactions={data.transactions}
        orders={data.orders}
        filterByTitle={data.transactions[0]!.title}
        onBack={p.onBack}
      />,
    );
  });
  expect(tree.root.findByType(BaselineSearchBar).props.value).not.toBe('');
  const next = host('CZ'),
    nextData = createCurrentInvestmentSnapshot(next);
  await act(() =>
    tree.update(
      <BaselineInvestmentHistory
        host={next}
        transactions={nextData.transactions}
        orders={nextData.orders}
        filterByTitle={data.transactions[0]!.title}
        onBack={next.onBack}
      />,
    ),
  );
  expect(tree.root.findByType(BaselineSearchBar).props.value).toBe('');
  expect(rows(tree).length).toBeGreaterThan(0);
  await act(() => tree.unmount());
});
