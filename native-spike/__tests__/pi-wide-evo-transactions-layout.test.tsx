import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import { getAccountTransactions, type AccountTransaction } from '@/data/accountDetails';
import type { Product } from '@/data/products';
import { Select as NativeSelect } from '../src/universal/Select';
import TransactionsScreen from '../src/experiences/pi/cz/evo-2027/accounts/TransactionsScreen';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import { tokens } from '../src/experiences/pi/cz/evo-2027/accounts/Primitives';
import { createCurrentProducts } from '../src/experiences/pi/current/context';
import type { NativeBankingPresentation } from '@/features/demo-native/bankingPresentation';

const productCounts = DEFAULT_CZECH_COUNTS;
const productAuthority = createCurrentProducts({
  country: 'CZ',
  release: 'release-future-evo-2027',
  productCounts,
});
const productCategories = productAuthority.categories;
const products = productAuthority.products;
const accounts = products.filter(
  (product): product is Extract<Product, { type: 'current_account' }> =>
    product.type === 'current_account',
);
if (accounts.length < 2) throw new Error('Expected the Czech current-account fixtures');

function fixtureRow(
  accountIndex: number,
  id: string,
  monthKey: string,
  day: string,
  label: string,
  amount: number,
  type: AccountTransaction['type'],
) {
  const account = accounts[accountIndex]!;
  const sourceTransaction = getAccountTransactions('CZ', accountIndex, 'CZK')[0];
  if (!sourceTransaction) throw new Error(`Expected transaction data for ${account.name}`);
  const [year, monthNumber] = monthKey.split('-');
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = monthNames[Number(monthNumber) - 1]!;
  return {
    transaction: {
      ...sourceTransaction,
      id: `${account.id}-${id}`,
      monthKey,
      month,
      monthTitle: `${month} ${year}`,
      day,
      label,
      details: `${label} transaction`,
      amount,
      type,
      status: 'Booked' as const,
      source: 'account' as const,
    },
    displayLabel: label,
  };
}

const rows = [
  fixtureRow(0, 'april-market', '2026-04', '19', 'April Market', -120, 'debit'),
  fixtureRow(1, 'april-salary', '2026-04', '19', 'April Salary', 800, 'credit'),
  fixtureRow(0, 'december-media', '2025-12', '12', 'Media Markt', -65, 'debit'),
  fixtureRow(1, 'june-rent', '2025-06', '05', 'June Rent', -500, 'debit'),
  fixtureRow(0, 'june-coffee', '2025-06', '05', 'June Coffee', -20, 'debit'),
];

const bankingPresentation: NativeBankingPresentation = {
  productCategories,
  rows,
};

const mounted: Renderer.ReactTestRenderer[] = [];

function props(extra: Partial<CzechNativeScreenProps> = {}): CzechNativeScreenProps {
  return {
    route: { screen: 'transactions' },
    scenario: 'active',
    bankingScenario: 'retail-single-account',
    productCounts,
    amountsHidden: false,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onSearch: jest.fn(),
    onProfile: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    bankingPresentation,
    ...extra,
  };
}

async function renderScreen(extra: Partial<CzechNativeScreenProps> = {}) {
  const input = props(extra);
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<TransactionsScreen {...input} />);
  });
  mounted.push(tree);
  return { tree, input };
}

function press(tree: Renderer.ReactTestRenderer, label: string) {
  const node = tree.root.findAll(
    candidate =>
      candidate.props.accessibilityLabel === label &&
      typeof candidate.props.onPress === 'function',
  )[0];
  if (!node) throw new Error(`Missing transaction control ${label}`);
  return node;
}

function input(tree: Renderer.ReactTestRenderer) {
  const node = tree.root.findAll(
    candidate =>
      candidate.props.accessibilityLabel === 'Search transactions' &&
      typeof candidate.props.onChangeText === 'function',
  )[0];
  if (!node) throw new Error('Missing transaction search input');
  return node;
}

function scrollView(tree: Renderer.ReactTestRenderer, value: string) {
  const node = tree.root
    .findAllByType(ScrollView)
    .find(candidate => candidate.props.testID === value);
  if (!node) throw new Error(`Missing Native transaction ScrollView ${value}`);
  return node;
}

function hostElements(tree: Renderer.ReactTestRenderer, value: string) {
  return tree.root.findAll(
    node => typeof node.type === 'string' && node.props.testID === value,
  );
}

function transactionButtons(tree: Renderer.ReactTestRenderer) {
  return rows.flatMap(row => {
    const accessibleLabels = [
      row.transaction.id,
      row.displayLabel ?? row.transaction.label,
    ];
    const button = tree.root.findAll(
      candidate => {
        const label = candidate.props.accessibilityLabel;
        return (
          typeof candidate.props.onPress === 'function' &&
          typeof label === 'string' &&
          accessibleLabels.some(value => label.includes(value))
        );
      },
    )[0];
    return button ? [{ row, button }] : [];
  });
}

async function reportLayouts(tree: Renderer.ReactTestRenderer) {
  const groups = hostElements(tree, 'transactions-date-group');
  await act(() => {
    groups.forEach((group, index) => {
      group.props.onLayout?.({
        nativeEvent: { layout: { x: 0, y: index * 350, width: 343, height: 240 } },
      });
    });
  });
}

afterEach(async () => {
  await act(() => mounted.splice(0).forEach(tree => tree.unmount()));
});

test('keeps the Source scope below the header and daily transaction groups in separate 18px cards', async () => {
  const { tree } = await renderScreen();
  const regions = tree.root
    .findAll(node =>
      typeof node.type === 'string' &&
      ['transactions-header', 'transactions-scope-band', 'transactions-list'].includes(
        node.props.testID,
      ),
    )
    .map(node => node.props.testID);

  expect(regions).toEqual([
    'transactions-header',
    'transactions-scope-band',
    'transactions-list',
  ]);
  expect(transactionButtons(tree)).toHaveLength(rows.length);

  const dateGroups = hostElements(tree, 'transactions-date-group');
  const dailyCards = hostElements(tree, 'transactions-date-card');
  expect(dateGroups).toHaveLength(3);
  expect(dailyCards).toHaveLength(3);
  for (const card of dailyCards) {
    expect(StyleSheet.flatten(card.props.style).borderRadius).toBe(18);
    expect(StyleSheet.flatten(card.props.style).backgroundColor).toBe(tokens.surface);
  }
});

test('shows the month rail on scroll, tracks its active month, and preserves visible search and clear behavior', async () => {
  const { tree } = await renderScreen();
  expect(input(tree)).toBeDefined();
  expect(hostElements(tree, 'transactions-month-rail')).toHaveLength(0);
  await reportLayouts(tree);

  const list = scrollView(tree, 'transactions-list');
  const scrollTo = jest.spyOn(list.instance, 'scrollTo');
  await act(() =>
    list.props.onScroll({ nativeEvent: { contentOffset: { x: 0, y: 400 } } }),
  );
  expect(hostElements(tree, 'transactions-month-rail')).toHaveLength(1);
  expect(
    press(tree, 'Month 2025-12').props.accessibilityState.selected,
  ).toBe(true);
  expect(
    tree.root.findAllByProps({ accessibilityLabel: 'Search transactions' }),
  ).toHaveLength(0);

  const rail = scrollView(tree, 'transactions-month-rail');
  const railScrollTo = jest.spyOn(rail.instance, 'scrollTo');
  await act(() => {
    rail.props.onLayout({
      nativeEvent: { layout: { x: 0, y: 0, width: 100, height: 38 } },
    });
    for (const [month, left] of [
      ['2026-04', 0],
      ['2025-12', 120],
      ['2025-06', 240],
    ] as const) {
      const chip = press(tree, `Month ${month}`);
      chip.props.onLayout({
        nativeEvent: {
          layout: { x: left, y: 0, width: 80, height: 38 },
        },
      });
    }
  });
  expect(railScrollTo).toHaveBeenLastCalledWith({ x: 100, animated: true });

  await act(() => press(tree, 'Month 2025-06').props.onPress());
  const lastVerticalScroll = scrollTo.mock.calls
    .map(([options]) => options)
    .filter((options): options is { y: number; animated?: boolean } =>
      typeof options === 'object' &&
      options !== null &&
      'y' in options &&
      typeof (options as { y?: unknown }).y === 'number',
    )
    .at(-1);
  expect(lastVerticalScroll).toEqual({ y: 700, animated: true });
  expect(
    press(tree, 'Month 2025-06').props.accessibilityState.selected,
  ).toBe(true);

  await act(() =>
    list.props.onScroll({ nativeEvent: { contentOffset: { x: 0, y: 0 } } }),
  );
  const search = input(tree);
  await act(() => search.props.onChangeText('Media Markt'));
  await act(() =>
    list.props.onScroll({ nativeEvent: { contentOffset: { x: 0, y: 400 } } }),
  );
  expect(input(tree)).toBeDefined();
  const matchingRows = transactionButtons(tree);
  expect(matchingRows).toHaveLength(1);
  expect(matchingRows[0]!.row.transaction.id).toBe(rows[2]!.transaction.id);

  await act(() => press(tree, 'Clear search results').props.onPress());
  expect(transactionButtons(tree)).toHaveLength(rows.length);
  expect(hostElements(tree, 'transactions-month-rail')).toHaveLength(1);
  expect(
    tree.root.findAllByProps({ accessibilityLabel: 'Search transactions' }),
  ).toHaveLength(0);

  await act(() =>
    list.props.onScroll({ nativeEvent: { contentOffset: { x: 0, y: 0 } } }),
  );
  expect(hostElements(tree, 'transactions-month-rail')).toHaveLength(0);
  expect(input(tree)).toBeDefined();
  scrollTo.mockRestore();
  railScrollTo.mockRestore();
});

test('uses Source product categories for account scope and preserves transaction selection identity', async () => {
  const onTransactionSelected = jest.fn();
  const { tree } = await renderScreen({ onTransactionSelected });

  const scope = tree.root.findByType(NativeSelect);
  expect(scope.props.value).toBe('all-accounts');
  await act(() => scope.props.onChange(accounts[1]!.id));
  expect(tree.root.findByType(NativeSelect).props.value).toBe(accounts[1]!.id);
  expect(transactionButtons(tree).map(({ row }) => row.transaction.id)).toEqual([
    rows[1]!.transaction.id,
    rows[3]!.transaction.id,
  ]);

  const firstVisibleRow = transactionButtons(tree)[0]!;
  await act(() => firstVisibleRow.button.props.onPress());
  expect(onTransactionSelected).toHaveBeenCalledWith({
    productId: accounts[1]!.id,
    source: 'account',
    transaction: firstVisibleRow.row.transaction,
  });
});
