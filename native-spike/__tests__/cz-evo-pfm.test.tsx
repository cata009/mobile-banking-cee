import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import PfmScreen from '../src/experiences/pi/cz/evo-2027/pfm/PfmScreen';
import { Donut } from '../src/experiences/pi/cz/evo-2027/pfm/Charts';
import { StyleSheet } from 'react-native';
import { createEvoTranslations } from '@/translations/evo';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import { createHomeProducts } from '../src/experiences/pi/cz/evo-2027/home/model';
import {
  createSpendingRangeSummary,
  listSpendingMonthKeys,
} from '@/data/spendingAnalytics';
const mounted: Renderer.ReactTestRenderer[] = [];
function button(tree: Renderer.ReactTestRenderer, label: string) {
  const node = tree.root.findAll(
    n =>
      n.props.accessibilityLabel === label &&
      typeof n.props.onPress === 'function',
  )[0];
  if (!node) throw new Error(`Missing ${label}`);
  return node;
}
async function render(extra: Partial<CzechNativeScreenProps> = {}) {
  const input: CzechNativeScreenProps = {
    route: { screen: 'pfm' },
    scenario: 'active',
    productCounts: DEFAULT_CZECH_COUNTS,
    amountsHidden: false,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    ...extra,
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<PfmScreen {...input} />);
  });
  mounted.push(tree);
  return { input, tree };
}
afterEach(async () => {
  await act(() => mounted.splice(0).forEach(t => t.unmount()));
});
test('Source latest account-ledger month anchors overview, avoiding host clock', async () => {
  const { tree } = await render();
  const products = createHomeProducts(DEFAULT_CZECH_COUNTS).products.filter(
    p => p.type === 'current_account',
  );
  const months = listSpendingMonthKeys(
    'CZ',
    createHomeProducts(DEFAULT_CZECH_COUNTS).products,
  );
  const latest = months[months.length - 1];
  const summary = createSpendingRangeSummary('CZ', products, [latest], {
    key: latest,
    label: latest,
    year: latest.split('-')[0],
    kind: 'month',
  });
  expect(tree.root.findByProps({ testID: 'cz-pfm-income' }).props.amount).toBe(
    summary.incomeTotal,
  );
  expect(tree.root.findByProps({ testID: 'cz-pfm-expense' }).props.amount).toBe(
    summary.spendingTotal,
  );
  const net = tree.root.findByProps({ testID: 'cz-pfm-net' });
  expect(net.props.amount).toBe(summary.netTotal);
  expect(net.props.signed).toBe(true);
});
test('income/expense analysis, chart mode, period presets and scope sheets are interactive', async () => {
  const { tree } = await render();
  await act(() => button(tree, 'Analyse money out').props.onPress());
  await act(() => button(tree, 'Bars').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Week 1');
  await act(() =>
    button(
      tree,
      createEvoTranslations('en').spending.changePeriod,
    ).props.onPress(),
  );
  await act(() => button(tree, 'Last 3 months').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Last 3 months');
  await act(() => button(tree, 'Choose accounts').props.onPress());
  await act(() => button(tree, 'Euro account').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Euro account');
  expect(JSON.stringify(tree.toJSON())).not.toContain('Currencies');
});
test('breakdown opens real Source transactions with product/transaction IDs and no synthetic budgets', async () => {
  const { tree, input } = await render({
    route: { screen: 'pfm', params: { direction: 'expense' } },
  });
  await act(() => button(tree, 'See all transactions').props.onPress());
  const transactionButton = tree.root.findAll(
    n =>
      n.props.testID === 'cz-pfm-transaction' &&
      typeof n.props.onPress === 'function',
  )[0];
  expect(transactionButton).toBeDefined();
  await act(() => transactionButton.props.onPress());
  expect(input.onNavigate).toHaveBeenCalledWith({
    screen: 'transaction',
    params: expect.objectContaining({
      transactionId: expect.any(String),
      productId: expect.any(String),
    }),
  });
  expect(JSON.stringify(tree.toJSON())).not.toContain('Budget rimanente');
});
test('visibility masks overview and analysis money while retaining accessible chart controls', async () => {
  const { tree } = await render({ amountsHidden: true });
  expect(JSON.stringify(tree.toJSON())).toContain('****');
  await act(() => button(tree, 'Analyse money in').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('****');
  expect(button(tree, 'Donut').props.accessibilityState.selected).toBe(true);
});

test('Source donut markers orbit outside the 220px ring without an extra legend', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <Donut
        segments={[
          {
            category: 'Income',
            label: 'Income',
            total: 100,
            colorVar: '--uc-pfm-income',
            iconCategory: 'Income',
          },
        ]}
        selected={new Set()}
        onToggle={() => {}}
        amount={100}
        label="Total income"
        currency="CZK"
        hidden={false}
      />,
    );
  });
  mounted.push(tree);
  const marker = button(tree, 'Show Income transactions');
  const style = StyleSheet.flatten(marker.props.style);
  expect(style.left).toBeCloseTo(118);
  expect(style.top).toBeCloseTo(236);
  expect(
    tree.root.findAll(
      n =>
        typeof n.type === 'string' && n.props.testID === 'cz-pfm-donut-marker',
    ),
  ).toHaveLength(1);
});

test('all spending categories opens Source analysis, retaining charts and split controls', async () => {
  const { tree } = await render();
  await act(() =>
    button(
      tree,
      createEvoTranslations('en').spending.allSpendingCategories,
    ).props.onPress(),
  );
  expect(button(tree, 'Donut').props.accessibilityState.selected).toBe(true);
  expect(button(tree, 'Merchants')).toBeDefined();
});
test('Czech period presets and transfer captions consume canonical Source translations', async () => {
  const { tree } = await render({ language: 'cs' });
  const copy = createEvoTranslations('cs');
  expect(
    tree.root.findAll(
      n => n.props.accessibilityLabel === copy.spending.excludeTransfers,
    ).length,
  ).toBeGreaterThan(0);
  await act(() => button(tree, copy.spending.changePeriod).props.onPress());
  expect(button(tree, copy.spending.presetLast3Months)).toBeDefined();
});
