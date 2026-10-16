import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Platform, StyleSheet } from 'react-native';
import {
  BaselineCashFlowChart,
  BaselineSubcategoryBubbles,
  BaselinePeriodIndicator,
  categoryPillColor,
  categoryPillWidth,
} from '../src/experiences/pi/current/baseline/spending/charts';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import type { SpendingAnalyticsSummary } from '@/data/spendingAnalytics';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';

const host: CurrentScreenProps = {
  country: 'RO',
  release: 'release-current',
  scenario: 'active',
  language: 'en',
  productCounts: DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
  route: { screen: 'pfm' },
  tokens: currentTokens(),
  t: createCurrentTranslator('RO', 'en'),
  amountsHidden: false,
  screenTopInset: 12,
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
function mount(children: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(children);
  });
  return tree;
}
function node(tree: Renderer.ReactTestRenderer, id: string) {
  return tree.root.findAll(
    n => n.props.testID === id && typeof n.type === 'string',
  )[0];
}

test('cash-flow bars scale the complete summary and retain the 18px zero-total floor', () => {
  const summary: SpendingAnalyticsSummary = {
    periodKey: '2026-04',
    periodKind: 'month',
    monthKey: '2026-04',
    monthTitle: 'April',
    yearLabel: '2026',
    periodLabel: 'April 2026',
    currency: 'RON',
    incomeTotal: 50,
    spendingTotal: 100,
    cashWithdrawalTotal: 0,
    netTotal: -50,
    moneyOutCategories: [],
    moneyInCategories: [],
    sourceTransactions: [],
    exchangeRateDate: '',
  };
  const tree = mount(
    <BaselineCashFlowChart
      host={{ ...host, amountsHidden: true }}
      summary={summary}
    />,
  );
  try {
    expect(
      StyleSheet.flatten(node(tree, 'baseline-pfm-income-bar').props.style),
    ).toMatchObject({ height: 52, top: 68, width: 16, left: 137 });
    expect(
      StyleSheet.flatten(node(tree, 'baseline-pfm-spending-bar').props.style),
    ).toMatchObject({ height: 104, top: 16, width: 16, left: 167 });
    expect(JSON.stringify(tree.toJSON())).toContain('50,00');
    act(() => {
      tree.update(
        <BaselineCashFlowChart
          host={host}
          summary={{ ...summary, incomeTotal: 0, spendingTotal: 0 }}
        />,
      );
    });
    expect(
      StyleSheet.flatten(node(tree, 'baseline-pfm-income-bar').props.style),
    ).toMatchObject({ height: 18, top: 102 });
  } finally {
    act(() => tree.unmount());
  }
});

test('subcategory exclusions preserve bubble geometry, expose pressed state and cannot remove the final active bubble', () => {
  const subcategories = [
    { label: 'A', total: 100, transactionCount: 1 },
    { label: 'B', total: 25, transactionCount: 1 },
  ];
  const toggled: string[] = [];
  const tree = mount(
    <BaselineSubcategoryBubbles
      host={host}
      subcategories={subcategories}
      colorVar="--uc-pfm-shopping"
      inactiveSubcategories={new Set(['A'])}
      onToggle={label => toggled.push(label)}
    />,
  );
  try {
    const a = node(tree, 'baseline-pfm-bubble-A'),
      b = node(tree, 'baseline-pfm-bubble-B');
    expect(StyleSheet.flatten(a.props.style)).toMatchObject({
      width: 138,
      height: 138,
    });
    expect(StyleSheet.flatten(b.props.style)).toMatchObject({
      width: 123,
      height: 123,
    });
    expect(a.props['aria-pressed']).toBe(true);
    expect(b.props.accessibilityState.disabled).toBe(true);
    const enableA = tree.root.findAll(
      n =>
        n.props.testID === 'baseline-pfm-bubble-A' &&
        typeof n.props.onPress === 'function',
    )[0];
    act(() => {
      enableA.props.onPress();
    });
    expect(toggled).toEqual(['A']);
    expect(node(tree, 'baseline-pfm-bubbles').props.role).toBe('group');
    const text = tree.root.findAll(
      n => typeof n.type === 'string' && n.props.children === 'B',
    )[0];
    expect(StyleSheet.flatten(text.props.style)).toMatchObject({
      fontSize: 14,
      lineHeight: 15,
    });
  } finally {
    act(() => tree.unmount());
  }
});

test('subcategory tooltips use Source formatting and hide monetary values with the app privacy setting', () => {
  const props = {
    subcategories: [{ label: 'Shopping', total: 1234.56, transactionCount: 2 }],
    colorVar: '--uc-pfm-shopping',
    inactiveSubcategories: new Set<string>(),
    onToggle: () => {},
  };
  const tree = mount(<BaselineSubcategoryBubbles host={host} {...props} />);
  try {
    expect(node(tree, 'baseline-pfm-bubble-Shopping').props.title).toBe(
      'Shopping: 1.234,56 RON',
    );
    expect(
      node(tree, 'baseline-pfm-bubble-Shopping').props.dataSet
        .pfmSubcategoryTotal,
    ).toBe('1234.56');
    act(() => {
      tree.update(
        <BaselineSubcategoryBubbles
          host={{ ...host, amountsHidden: true }}
          {...props}
        />,
      );
    });
    expect(node(tree, 'baseline-pfm-bubble-Shopping').props.title).toBe(
      'Shopping: ****,** RON',
    );
    expect(
      node(tree, 'baseline-pfm-bubble-Shopping').props.dataSet
        .pfmSubcategoryTotal,
    ).toBeUndefined();
  } finally {
    act(() => tree.unmount());
  }
});

test('period indicator consumes the supplied visible window and uses the dark Source subtle color', () => {
  const tree = mount(
    <BaselinePeriodIndicator
      host={{ ...host, mode: 'dark', tokens: currentTokens(true) }}
      periodKeys={['1', '2', '3', '4', '5', '6']}
      activePeriodKey="4"
    />,
  );
  try {
    expect(
      node(tree, 'baseline-pfm-period-indicator').props['aria-hidden'],
    ).toBe(true);
    const dots = tree.root.findAll(
      n =>
        typeof n.type === 'string' &&
        String(n.props.testID).startsWith('baseline-pfm-period-dot-'),
    );
    expect(dots).toHaveLength(6);
    expect(
      StyleSheet.flatten(node(tree, 'baseline-pfm-period-dot-4').props.style)
        .width,
    ).toBe(30);
    expect(
      StyleSheet.flatten(node(tree, 'baseline-pfm-period-dot-1').props.style)
        .backgroundColor,
    ).toBe('#909090');
  } finally {
    act(() => tree.unmount());
  }
});

test('category pill width scales totals with the Source minimum and preserves fractional tint channels', () => {
  expect(categoryPillWidth(100, 100)).toBe(282);
  expect(categoryPillWidth(0, 100)).toBe(147);
  expect(categoryPillWidth(50, 100)).toBe(193);
  expect(categoryPillColor('--uc-pfm-shopping')).toBe(
    'rgb(238.84,214.2,215.96)',
  );
  expect(categoryPillColor('--uc-pfm-shopping', true)).toBe(
    'rgb(77.72,55.96,55.8)',
  );
});

test('browser leaves keep real button privacy tooltips and send the Source color-mix through RN Web unchanged', () => {
  const platform = jest.replaceProperty(Platform, 'OS', 'web');
  let tree: Renderer.ReactTestRenderer | undefined;
  try {
    expect(categoryPillColor('--uc-pfm-shopping')).toBe(
      'var(--ro-pfm-category-pill-tint, color-mix(in srgb, #9A000B 16%, #FFFFFF))',
    );
    tree = mount(
      <BaselineSubcategoryBubbles
        host={{ ...host, amountsHidden: true }}
        subcategories={[
          { label: 'Shopping', total: 1234.56, transactionCount: 2 },
        ]}
        colorVar="--uc-pfm-shopping"
        inactiveSubcategories={new Set()}
        onToggle={() => {}}
      />,
    );
    const bubble = tree.root.findByType('button');
    expect(bubble.props.title).toBe('Shopping: ****,** RON');
    expect(bubble.props.disabled).toBe(true);
    expect(bubble.props['aria-pressed']).toBe(false);
    expect(bubble.props['data-pfm-subcategory-total']).toBeUndefined();
  } finally {
    if (tree) act(() => tree!.unmount());
    platform.restore();
  }
});
