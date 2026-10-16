import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  createSpendingAnalyticsTimeline,
  createSpendingCategoryDetail,
} from '@/data/spendingAnalytics';
import {
  RoBaselinePfmCategoryDetail,
  type RoBaselinePfmCategoryDetailProps,
} from '../src/experiences/pi/current/baseline/spending/details';
import { bankingProducts } from '../src/experiences/pi/current/banking/model';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { BaselineTransactionRow } from '../src/universal/BaselineTransactionRow';
import { BaselineTransactionDivider } from '../src/universal/BaselineTransactionDivider';
import { BaselinePageHeader } from '../src/universal/BaselinePageHeader';
import { BaselineBanner } from '../src/universal/BaselineBanner';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import { BaselineSubcategoryBubbles } from '../src/experiences/pi/current/baseline/spending/charts';
import { BaselinePfmPeriodCarousel } from '../src/experiences/pi/current/baseline/spending/PeriodCarousel';
import { BaselineAccountActionBar } from '../src/universal/BaselineAccountActionBar';
import { Text } from '../src/universal/Typography';

function host(): CurrentScreenProps {
  return {
    country: 'RO',
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
    route: { screen: 'pfm' },
    tokens: currentTokens(),
    t: createCurrentTranslator('RO', 'en'),
    amountsHidden: false,
    screenTopInset: 54,
    isActive: true,
    mode: 'light',
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
  };
}
function props(
  category: RoBaselinePfmCategoryDetailProps['category'] = 'Shopping',
): RoBaselinePfmCategoryDetailProps {
  const h = host();
  const timeline = createSpendingAnalyticsTimeline(
    h.country,
    bankingProducts(h).products,
  );
  return {
    host: h,
    timeline,
    activePeriodKey: timeline.activePeriodKey,
    category,
    direction: 'out',
    onPeriodChange: jest.fn(),
    onBack: jest.fn(),
    onTransactionClick: jest.fn(),
  };
}
async function render(p = props()) {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<RoBaselinePfmCategoryDetail {...p} />);
  });
  return { tree, p };
}

test('category detail displays Source analytics transaction objects, reporting currency, category avatars and signed total', async () => {
  const { tree, p } = await render();
  const summary = p.timeline.summariesByPeriodKey[p.activePeriodKey]!;
  const expected = createSpendingCategoryDetail(
    summary,
    p.category,
    p.direction,
  );
  expect(expected.transactions.length).toBeGreaterThan(0);
  const rows = tree.root.findAllByType(BaselineTransactionRow);
  expect(rows).toHaveLength(expected.transactions.length);
  rows.forEach((row, i) => {
    expect(row.props.transaction).toBe(expected.transactions[i]);
    expect(row.props.currency).toBe(summary.currency);
    expect(row.props.avatarPresentation).toBe('category');
    expect(row.props.onCategoryPress).toBeUndefined();
  });
  expect(tree.root.findByType(BaselineTransactionDivider).props.total).toBe(
    formatMoneyNumber(-expected.total, 'RO'),
  );
  await act(() => rows[0]!.props.onPress(rows[0]!.props.transaction));
  expect(p.onTransactionClick).toHaveBeenCalledWith(expected.transactions[0]);
  expect(tree.root.findByType(BaselinePageHeader).props.showHelp).toBe(false);
  await act(() => tree.unmount());
});

test('privacy masking applies to hero, transaction rows and month total without changing forwarded data', async () => {
  const p = props();
  p.host.amountsHidden = true;
  const { tree } = await render(p);
  const rows = tree.root.findAllByType(BaselineTransactionRow);
  expect(rows.length).toBeGreaterThan(0);
  expect(rows.every(row => row.props.formattedAmount === '****,**')).toBe(true);
  expect(tree.root.findByType(BaselineTransactionDivider).props.total).toBe(
    '****,**',
  );
  const hero = tree.root.findByProps({
    testID: `ro-pfm-category-hero-${p.activePeriodKey}`,
  });
  expect(hero.findAllByType(Text)[2]!.props.children.join('')).toBe(
    '****,** RON',
  );
  await act(() => rows[0]!.props.onPress(rows[0]!.props.transaction));
  expect(p.onTransactionClick).toHaveBeenCalledWith(rows[0]!.props.transaction);
  await act(() => tree.unmount());
});

test('uncategorized helper follows the first transaction and dismissal persists only for this mounted detail', async () => {
  const p = props('Uncategorized');
  const { tree } = await render(p);
  expect(
    tree.root.findAllByType(BaselineTransactionRow).length,
  ).toBeGreaterThan(0);
  expect(tree.root.findAllByType(BaselineBanner)).toHaveLength(1);
  const sequence = tree.root.findAll(
    node =>
      node.type === BaselineTransactionRow || node.type === BaselineBanner,
  );
  expect(sequence[0]!.type).toBe(BaselineTransactionRow);
  expect(sequence[1]!.type).toBe(BaselineBanner);
  await act(() => tree.root.findByType(BaselineBanner).props.onClose());
  expect(tree.root.findAllByType(BaselineBanner)).toHaveLength(0);
  const nextPeriod = p.timeline.periods.find(
    period =>
      period.key !== p.activePeriodKey &&
      createSpendingCategoryDetail(
        p.timeline.summariesByPeriodKey[period.key]!,
        'Uncategorized',
        'out',
      ).transactions.length,
  )!;
  expect(nextPeriod).toBeDefined();
  await act(() =>
    tree.update(
      <RoBaselinePfmCategoryDetail {...p} activePeriodKey={nextPeriod.key} />,
    ),
  );
  expect(tree.root.findAllByType(BaselineBanner)).toHaveLength(0);
  await act(() => tree.unmount());
  const reopened = await render(p);
  expect(reopened.tree.root.findAllByType(BaselineBanner)).toHaveLength(1);
  await act(() => reopened.tree.unmount());
});

test('exclusion filters rows and total through Source helper while retaining complete bubble geometry and resets on period/category/direction', async () => {
  const { tree, p } = await render();
  const summary = p.timeline.summariesByPeriodKey[p.activePeriodKey]!;
  const complete = createSpendingCategoryDetail(
    summary,
    p.category,
    p.direction,
  );
  const bubbles = () =>
    tree.root.findAllByType(BaselineSubcategoryBubbles)[
      p.timeline.periods.findIndex(period => period.key === p.activePeriodKey)
    ]!;
  const label = complete.subcategories[0]!.label;
  await act(() => bubbles().props.onToggle(label));
  const filtered = createSpendingCategoryDetail(
    summary,
    p.category,
    p.direction,
    new Set([label]),
  );
  expect(
    tree.root
      .findAllByType(BaselineTransactionRow)
      .map(row => row.props.transaction),
  ).toEqual(filtered.transactions);
  expect(tree.root.findByType(BaselineTransactionDivider).props.total).toBe(
    formatMoneyNumber(-filtered.total, 'RO'),
  );
  expect(bubbles().props.subcategories).toEqual(complete.subcategories);
  expect(bubbles().props.inactiveSubcategories).toEqual(new Set([label]));
  for (const changed of [
    { activePeriodKey: p.timeline.periods[0]!.key },
    { category: 'Groceries' as const },
    { direction: 'in' as const },
  ]) {
    await act(() =>
      tree.update(<RoBaselinePfmCategoryDetail {...p} {...changed} />),
    );
    expect(
      tree.root
        .findAllByType(BaselineSubcategoryBubbles)
        .every(node => node.props.inactiveSubcategories.size === 0),
    ).toBe(true);
    await act(() => tree.update(<RoBaselinePfmCategoryDetail {...p} />));
    await act(() => bubbles().props.onToggle(label));
  }
  await act(() => tree.unmount());
});

test('year hero uses raw year, income total is positive and Source action remains inert', async () => {
  const p = props('Income');
  p.direction = 'in';
  p.activePeriodKey = p.timeline.periods.find(
    period => period.kind === 'year' && period.year === '2026',
  )!.key;
  const { tree } = await render(p);
  const detail = createSpendingCategoryDetail(
    p.timeline.summariesByPeriodKey[p.activePeriodKey]!,
    p.category,
    'in',
  );
  expect(tree.root.findByType(BaselineTransactionDivider).props.title).toBe(
    '2026',
  );
  expect(tree.root.findByType(BaselineTransactionDivider).props.total).toBe(
    formatMoneyNumber(detail.total, 'RO'),
  );
  expect(
    tree.root.findByType(BaselineAccountActionBar).props.items[0].onPress,
  ).toBeUndefined();
  await act(() =>
    tree.root
      .findByType(BaselinePfmPeriodCarousel)
      .props.onPeriodChange('2026-03'),
  );
  expect(p.onPeriodChange).toHaveBeenCalledWith('2026-03');
  await act(() => tree.root.findByType(BaselinePageHeader).props.onBack());
  expect(p.onBack).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});

test('empty period displays the Source no transactions text and no uncategorized helper', async () => {
  const p = props('Uncategorized');
  p.activePeriodKey = p.timeline.periods.find(
    period =>
      !createSpendingCategoryDetail(
        p.timeline.summariesByPeriodKey[period.key]!,
        p.category,
        p.direction,
      ).transactions.length,
  )!.key;
  const { tree } = await render(p);
  expect(tree.root.findAllByType(BaselineTransactionRow)).toHaveLength(0);
  expect(tree.root.findAllByType(BaselineBanner)).toHaveLength(0);
  expect(JSON.stringify(tree.toJSON())).toContain(
    'No transactions for this period',
  );
  await act(() => tree.unmount());
});

test('effective dark tokens drive the detail palette when the host preference is system', async () => {
  const p = props();
  p.host.mode = 'system';
  p.host.tokens = currentTokens(true);
  const { tree } = await render(p);
  expect(tree.root.findByType(BaselinePageHeader).props.dark).toBe(true);
  expect(
    tree.root
      .findAllByType(BaselineTransactionRow)
      .every(row => row.props.dark),
  ).toBe(true);
  expect(
    tree.root.findByType(BaselinePfmPeriodCarousel).props.hideInactivePanels,
  ).toBe(true);
  await act(() => tree.unmount());
});
