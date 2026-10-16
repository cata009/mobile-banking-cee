import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { createSpendingAnalyticsTimeline } from '@/data/spendingAnalytics';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';
import type { PfmCategorySelection } from '@/data/pfmCategories';
import RoBaselinePfmScreen from '../src/experiences/pi/current/baseline/spending/PfmScreen';
import { RoBaselinePfmCategoryDetail } from '../src/experiences/pi/current/baseline/spending/details';
import LegacyPfm from '../src/experiences/pi/current/analytics/LegacyPfm';
import { SourcePeriodIndicator } from '../src/experiences/pi/current/analytics/SourceCharts';
import { Header } from '../src/universal/Header';
import { getAnalyticsCategoryDisplayLabel } from '@/app/screens/analytics/analyticsCategoryLabels';
import { createSpendingRangeSummary, listSpendingMonthKeys } from '@/data/spendingAnalytics';
import EvoPfmScreen from '../src/experiences/pi/cz/evo-2027/pfm/PfmScreen';
import { createHomeProducts } from '../src/experiences/pi/cz/evo-2027/home/model';
import { DEFAULT_CZECH_COUNTS, type CzechNativeScreenProps } from '../src/experiences/pi/cz/evo-2027/contracts';
import { NavigationRow } from '../src/universal/controls';
import {
  createCurrentProducts,
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';

function host(overrides?: Readonly<Record<string, PfmCategorySelection>>): CurrentScreenProps {
  return {
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
    route: { screen: 'pfm' },
    bankingPresentation: overrides
      ? { transactionCategoryOverrides: overrides }
      : undefined,
    tokens: currentTokens(),
    t: createCurrentTranslator('RO', 'en'),
    amountsHidden: false,
    screenTopInset: 0,
    isActive: true,
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    mode: 'light',
    onModeChange: jest.fn(),
    onPrimaryNavigationChange: jest.fn(),
    onBackHandlerChange: jest.fn(),
  };
}

it('opens a requested Native baseline category and applies Source category overrides', () => {
  const baseHost = host();
  const products = createCurrentProducts(baseHost).products;
  const originalTimeline = createSpendingAnalyticsTimeline('RO', products);
  const activePeriodKey = originalTimeline.activePeriodKey;
  const target = originalTimeline.summariesByPeriodKey[
    activePeriodKey
  ].sourceTransactions.find(transaction => transaction.pfmCategory === 'Shopping');
  expect(target).toBeDefined();
  if (!target) throw new Error('Expected a Shopping transaction in the active period');

  const overrides: Readonly<Record<string, PfmCategorySelection>> = {
    [target.id]: {
      groupId: 'groceries',
      groupLabel: 'Groceries',
      category: 'Groceries',
      subcategory: 'Supermarket',
    },
  };
  const expectedTimeline = createSpendingAnalyticsTimeline('RO', products, overrides);
  const expectedShoppingTotal = expectedTimeline.summariesByPeriodKey[
    activePeriodKey
  ].moneyOutCategories.find(category => category.category === 'Shopping')?.total;
  const nativeHost = {
    ...host(overrides),
    route: {
      screen: 'pfm' as const,
      params: {
        category: 'Shopping',
        direction: 'out',
        periodKey: activePeriodKey,
      },
    },
  };

  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<RoBaselinePfmScreen {...nativeHost} />);
  });

  try {
    const detail = tree.root.findByType(RoBaselinePfmCategoryDetail);
    expect(detail.props.category).toBe('Shopping');
    expect(detail.props.direction).toBe('out');
    expect(detail.props.activePeriodKey).toBe(activePeriodKey);
    expect(
      detail.props.timeline.summariesByPeriodKey[activePeriodKey]
        .moneyOutCategories.find(
          (category: { category: string }) => category.category === 'Shopping',
        )?.total,
    ).toBe(expectedShoppingTotal);
  } finally {
    act(() => tree.unmount());
  }
});

it('applies Source category overrides to the CZ/Evo Native PFM breakdown', () => {
  const { products } = createHomeProducts(DEFAULT_CZECH_COUNTS);
  const accounts = products.filter(product => product.type === 'current_account');
  const scopeProducts = accounts.length ? accounts : products;
  const monthKeys = listSpendingMonthKeys('CZ', products);
  const activeMonth = monthKeys[monthKeys.length - 1];
  expect(activeMonth).toBeDefined();
  if (!activeMonth) throw new Error('Expected a CZ PFM month');
  const originalSummary = createSpendingRangeSummary(
    'CZ',
    scopeProducts,
    [activeMonth],
    { key: activeMonth, label: activeMonth, year: activeMonth.slice(0, 4), kind: 'month' },
    {},
    { includeOwnTransfers: false },
  );
  const expenses = originalSummary.sourceTransactions.filter(
    transaction => transaction.amount < 0,
  );
  expect(expenses.length).toBeGreaterThan(0);
  const overrides: Readonly<Record<string, PfmCategorySelection>> = Object.fromEntries(
    expenses.map(transaction => [
      transaction.id,
      {
        groupId: 'groceries',
        groupLabel: 'Groceries',
        category: 'Groceries',
        subcategory: 'Supermarket',
      },
    ]),
  );
  const host: CzechNativeScreenProps = {
    route: { screen: 'pfm', params: { scopeId: 'all-accounts', direction: 'expense' } },
    scenario: 'active',
    language: 'en',
    productCounts: DEFAULT_CZECH_COUNTS,
    amountsHidden: false,
    bankingPresentation: { transactionCategoryOverrides: overrides },
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onSearch: jest.fn(),
    onProfile: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
  };

  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<EvoPfmScreen {...host} />);
  });
  try {
    const categoryRows = tree.root
      .findAllByType(NavigationRow)
      .map(row => row.props.title);
    expect(categoryRows).toContain('Groceries');
    expect(categoryRows).not.toContain('Shopping');
  } finally {
    act(() => tree.unmount());
  }
});

it('opens the current Native PFM route with its period and Source overrides', () => {
  const baseHost = host();
  const products = createCurrentProducts(baseHost).products;
  const originalTimeline = createSpendingAnalyticsTimeline('RO', products);
  const period = originalTimeline.periods.find(candidate =>
    originalTimeline.summariesByPeriodKey[candidate.key].sourceTransactions.some(
      transaction => transaction.pfmCategory === 'Shopping',
    ),
  );
  expect(period).toBeDefined();
  if (!period) throw new Error('Expected a period containing Shopping transactions');
  const target = originalTimeline.summariesByPeriodKey[
    period.key
  ].sourceTransactions.find(transaction => transaction.pfmCategory === 'Shopping');
  expect(target).toBeDefined();
  if (!target) throw new Error('Expected a Shopping transaction');
  const overrides: Readonly<Record<string, PfmCategorySelection>> = {
    [target.id]: {
      groupId: 'groceries',
      groupLabel: 'Groceries',
      category: 'Groceries',
      subcategory: 'Supermarket',
    },
  };
  const nativeHost = {
    ...host(overrides),
    route: {
      screen: 'pfm' as const,
      params: { category: 'Shopping', direction: 'out', periodKey: period.key },
    },
  };
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<LegacyPfm {...nativeHost} />);
  });
  try {
    expect(
      tree.root.findAllByType(Header).some(
        header =>
          header.props.title ===
          getAnalyticsCategoryDisplayLabel('Shopping', nativeHost.t),
      ),
    ).toBe(true);
    expect(tree.root.findByType(SourcePeriodIndicator).props.active).toBe(period.key);
    expect(
      tree.root.findAll(node => node.props.accessibilityLabel === target.label),
    ).toHaveLength(0);
  } finally {
    act(() => tree.unmount());
  }
});
