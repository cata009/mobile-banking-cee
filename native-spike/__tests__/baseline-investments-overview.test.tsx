import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Platform, StyleSheet } from 'react-native';
import { Path } from 'react-native-svg';
import {
  INVESTMENT_PERIODS,
  INVESTMENT_SORT_OPTIONS,
  buildInvestmentChartPoints,
  buildInvestmentSecurityCatalog,
} from '@/app/config/investmentsPortfolioConfig';
import {
  formatInvestmentAmountParts,
  formatInvestmentMoney,
} from '@/app/utils/investmentAmountFormatting';
import {
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures';
import { hydrateRoboGoal } from '@/features/investments/robo/goalHydration';
import { getRoboPortfolioForGoal } from '@/features/investments/robo/model';
import { DEFAULT_ROBO_DEMO_CLOCK } from '@/features/investments/robo/demoClock';
import { GoalDetail } from '../src/experiences/pi/cz/evo-2027/robo/GoalDetail';
import { CzRoboSecurityRow } from '../src/experiences/pi/current/investments/baseline/overview/CzRoboOverview';
import {
  BaselineInvestmentOverview,
  BaselineInvestmentPortfolioChart,
  BaselineInvestmentDistributionDetail,
} from '../src/experiences/pi/current/investments/baseline/overview';
import type { BaselineInvestmentOverviewProps } from '../src/experiences/pi/current/investments/baseline/contracts';
import {
  Copy,
  Periods,
} from '../src/experiences/pi/current/investments/baseline/overview/ui';
import { Text } from '../src/universal/Typography';

const countries = ['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'] as const;
function host(
  country: CurrentScreenProps['country'] = 'RO',
  hidden = false,
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
    amountsHidden: hidden,
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
}
function props(
  country: CurrentScreenProps['country'] = 'RO',
): BaselineInvestmentOverviewProps {
  const h = host(country);
  return {
    host: h,
    snapshot: createCurrentInvestmentSnapshot(h),
    state: { tabId: 'performance', periodId: 'max', sortId: 'max-value' },
    onStateChange: jest.fn(),
    onOpenSecurity: jest.fn(),
    onOpenDistribution: jest.fn(),
    onOpenCatalog: jest.fn(),
    onOpenHistory: jest.fn(),
    onOpenApprovals: jest.fn(),
  };
}
let trees: Renderer.ReactTestRenderer[] = [];
function render(p = props()) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<BaselineInvestmentOverview {...p} />);
  });
  trees.push(tree);
  return tree;
}
afterEach(() => {
  act(() => trees.forEach(t => t.unmount()));
  trees = [];
});
const button = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    n =>
      n.props.accessibilityRole === 'button' &&
      n.props.accessibilityLabel === label,
  )[0]!;

it.each(countries)(
  '%s retains canonical headline currency, ALL chart and both holding statuses',
  country => {
    const p = props(country),
      tree = render(p),
      json = JSON.stringify(tree.toJSON());
    const value = formatInvestmentAmountParts(
      p.snapshot.performance.totalValue,
      country,
      p.snapshot.securities[0]!.localCurrency,
    );
    expect(json).toContain(value.integer);
    expect(json).toContain(value.decimal);
    expect(json).toContain(value.currency);
    expect(
      tree.root.findByType(BaselineInvestmentPortfolioChart).props.points,
    ).toEqual(
      buildInvestmentChartPoints(p.snapshot.performance.totalValue, 'max'),
    );
    expect(button(tree, 'ALL').props.accessibilityState.selected).toBe(true);
    expect(button(tree, 'MAX VALUE').props.accessibilityState.selected).toBe(
      true,
    );
    expect(json).toContain('ACTIVE SECURITIES');
    expect(json).toContain('INACTIVE SECURITIES');
    expect(button(tree, 'Consolidated report').props.onPress).toBeUndefined();
  },
);

it('routes only implemented Source action callbacks and uses controlled period/sort patches', () => {
  const p = props(),
    tree = render(p);
  for (const [label, callback] of [
    ['History', p.onOpenHistory],
    ['To approve', p.onOpenApprovals],
    ['Invest', p.onOpenCatalog],
  ] as const) {
    act(() => button(tree, label).props.onPress());
    expect(callback).toHaveBeenCalledTimes(1);
  }
  for (const period of INVESTMENT_PERIODS) {
    act(() => button(tree, period.label).props.onPress());
    expect(p.onStateChange).toHaveBeenLastCalledWith({ periodId: period.id });
  }
  for (const sort of INVESTMENT_SORT_OPTIONS) {
    act(() => button(tree, sort.label).props.onPress());
    expect(p.onStateChange).toHaveBeenLastCalledWith({ sortId: sort.id });
  }
  const first = p.snapshot.securities
    .filter(s => s.status === 'active')
    .sort((a, b) => b.localValue - a.localValue)[0]!;
  const row = tree.root.findAll(
    n =>
      n.props.testID === `baseline-investment-product-${first.id}` &&
      typeof n.props.onPress === 'function',
  )[0]!;
  act(() => row.props.onPress());
  expect(p.onOpenSecurity).toHaveBeenLastCalledWith(first.id);
});

it('distribution selection passes the canonical group while summary stays visible and performance chart disappears', () => {
  const p = props();
  p.state = { ...p.state, tabId: 'product-type' };
  const tree = render(p),
    json = JSON.stringify(tree.toJSON());
  expect(
    tree.root.findAllByType(BaselineInvestmentPortfolioChart),
  ).toHaveLength(0);
  expect(json).toContain('PRODUCT TYPE DISTRIBUTION');
  expect(json).toContain('Total value');
  const row = tree.root.findAll(
    n =>
      n.props.testID === 'baseline-investment-distribution-Fund' &&
      typeof n.props.onPress === 'function',
  )[0]!;
  act(() => row.props.onPress());
  expect(p.onOpenDistribution).toHaveBeenCalledWith(
    'product-type',
    expect.objectContaining({ id: 'Fund', label: 'Fund', currency: 'RON' }),
  );
  const group = jest.mocked(p.onOpenDistribution).mock.calls[0]![1];
  const amount = formatInvestmentAmountParts(
    group.value,
    p.host.country,
    group.currency,
    false,
  );
  expect(row.props.accessibilityLabel).toBe(
    `${group.label} ${amount.integer}${amount.decimal} ${amount.currency} ${group.percent}%`,
  );
  const security = p.snapshot.securities[0]!;
  let detail!: Renderer.ReactTestRenderer;
  act(() => {
    detail = Renderer.create(
      <BaselineInvestmentDistributionDetail
        host={p.host}
        item={group}
        tab="product-type"
        securities={[security]}
        onBack={jest.fn()}
      />,
    );
  });
  trees.push(detail);
  const securityRow = detail.root.findAll(
    n => n.props.testID === `baseline-investment-category-row-${security.id}`,
  )[0]!;
  const primary = formatInvestmentAmountParts(
    security.value,
    p.host.country,
    security.currency,
    false,
  );
  const local = formatInvestmentAmountParts(
    security.localValue,
    p.host.country,
    security.localCurrency,
    false,
  );
  expect(securityRow.props.accessibilityLabel).toBe(
    `${security.title} ${primary.integer}${primary.decimal} ${
      primary.currency
    }${
      security.currency !== security.localCurrency
        ? ` (${local.integer}${local.decimal} ${local.currency})`
        : ''
    }`,
  );
  expect(securityRow.props.onPress).toBeUndefined();
});

it('Robo goal detail uses the shared holding row and retains its Source quantity', () => {
  const initialGoal = INITIAL_CZ_ROBO_GOALS[0]!;
  const portfolio = getRoboPortfolioForGoal(initialGoal);
  if (!portfolio)
    throw new Error('The seeded wealth goal must have a portfolio');
  if (!portfolio.basketFund)
    throw new Error('The seeded wealth goal must have a basket');
  const securityCatalog = buildInvestmentSecurityCatalog([], 'CZ', {
    includeRoboGoals: true,
  });
  const goal = hydrateRoboGoal(
    initialGoal,
    portfolio.basketFund,
    'CZ',
    securityCatalog,
  );
  const onOpenSecurity = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <GoalDetail
        goal={goal}
        portfolio={portfolio}
        onBack={jest.fn()}
        onExit={jest.fn()}
        onAction={jest.fn()}
        securityCatalog={securityCatalog}
        clock={DEFAULT_ROBO_DEMO_CLOCK}
        amountsHidden={false}
        onOpenSecurity={onOpenSecurity}
      />,
    );
  });
  trees.push(tree);

  const row = tree.root
    .findAllByType(CzRoboSecurityRow)
    .find(item => item.props.security.title === 'Nano-Chip Equity Fund');
  expect(row).toBeDefined();
  expect(JSON.stringify(tree.toJSON())).toContain('11,660 PCS');
  const productRow = tree.root.findByProps({
    testID: `baseline-investment-product-${row!.props.security.id}`,
  });
  act(() => productRow.props.onPress());
  expect(onOpenSecurity).toHaveBeenCalledWith(row!.props.security);
});

it('privacy masks financial text while keeping Source percentage badges and empty portfolio Invest', () => {
  const p = props();
  p.host = { ...p.host, amountsHidden: true };
  const tree = render(p),
    json = JSON.stringify(tree.toJSON());
  expect(json).toContain('****');
  expect(json).toContain('**,**%');
  const empty = props();
  empty.snapshot = {
    securities: [],
    performance: { totalValue: 0, performanceAmount: 0, performancePercent: 0 },
  };
  const noHoldings = render(empty);
  expect(JSON.stringify(noHoldings.toJSON())).toContain(
    'Your portfolio is still empty',
  );
  expect(
    noHoldings.root.findAllByType(BaselineInvestmentPortfolioChart),
  ).toHaveLength(0);
  act(() => button(noHoldings, 'Invest').props.onPress());
  expect(empty.onOpenCatalog).toHaveBeenCalledTimes(1);
});

it('chart press/drag shows masked tooltip and clears on release, leave, cancellation and period change', () => {
  const p = props();
  p.host = { ...p.host, amountsHidden: true };
  const tree = render(p);
  const surface = () =>
    tree.root.findAll(
      n =>
        n.props.testID === 'baseline-investment-portfolio-chart' &&
        typeof n.props.onResponderGrant === 'function',
    )[0]!;
  const tooltip = () =>
    tree.root.findAll(
      n => n.props.testID === 'baseline-investment-chart-tooltip',
    );
  act(() =>
    surface().props.onResponderGrant({ nativeEvent: { locationX: 70 } }),
  );
  expect(tooltip().length).toBeGreaterThan(0);
  expect(JSON.stringify(tree.toJSON())).toContain('**,**%');
  act(() =>
    surface().props.onResponderMove({ nativeEvent: { locationX: 210 } }),
  );
  expect(tooltip().length).toBeGreaterThan(0);
  for (const event of [
    'onResponderRelease',
    'onPointerLeave',
    'onResponderTerminate',
  ]) {
    act(() => surface().props[event]());
    expect(tooltip()).toHaveLength(0);
    act(() =>
      surface().props.onResponderGrant({ nativeEvent: { locationX: 120 } }),
    );
  }
  act(() =>
    tree.update(
      <BaselineInvestmentOverview
        {...p}
        state={{ ...p.state, periodId: '1m' }}
      />,
    ),
  );
  expect(tooltip()).toHaveLength(0);
});

it('preserves Source Cyrillic sans-serif bold fallback on Web and the actual Native branded face', () => {
  const descriptor = Object.getOwnPropertyDescriptor(Platform, 'OS')!;
  try {
    for (const platform of ['web', 'android']) {
      Object.defineProperty(Platform, 'OS', { ...descriptor, value: platform });
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <Copy host={host('RS')} bold>
            Укупна вредност
          </Copy>,
        );
      });
      trees.push(tree);
      const style = StyleSheet.flatten(tree.root.findByType(Text).props.style);
      expect(style.fontFamily).toBe(
        platform === 'web' ? 'UniCredit-bold, sans-serif' : 'UniCredit-bold',
      );
      expect(style.fontWeight).toBe(platform === 'web' ? '700' : undefined);
      expect(style.fontSynthesis).toBe(platform === 'web' ? 'none' : undefined);
    }
  } finally {
    Object.defineProperty(Platform, 'OS', descriptor);
  }
});

it('instrument period subset omits 6m without changing the overview defaults or callback IDs', () => {
  const change = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <Periods
        host={host()}
        items={INVESTMENT_PERIODS.filter(item => item.id !== '6m')}
        value="max"
        onChange={change}
        marginTop={12}
      />,
    );
  });
  trees.push(tree);
  expect(
    tree.root.findAll(n => n.props.accessibilityLabel === '6 M'),
  ).toHaveLength(0);
  act(() => button(tree, '1 M').props.onPress());
  expect(change).toHaveBeenLastCalledWith('1m');
  const portfolio = render();
  expect(button(portfolio, '6 M')).toBeDefined();
});

it('matches the Source Area fill opacity instead of strengthening its gradient', () => {
  const tree = render();
  const fill = tree.root
    .findAllByType(Path)
    .find(n => n.props.fill?.startsWith('url(#'))!;
  expect(fill.props.fillOpacity).toBe(0.6);
});

it.each([
  ['web', 'mousedown', 17],
  ['web', 'touchstart', 16],
  ['android', 'touchstart', 16],
] as const)(
  '%s %s preserves Source first/last chart point selection',
  (platform, eventType, lastIndex) => {
    const descriptor = Object.getOwnPropertyDescriptor(Platform, 'OS')!;
    const documentDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'document',
    );
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: { addEventListener: jest.fn(), removeEventListener: jest.fn() },
    });
    Object.defineProperty(Platform, 'OS', { ...descriptor, value: platform });
    const h = host(),
      points = buildInvestmentChartPoints(9166.97, 'max');
    let tree!: Renderer.ReactTestRenderer;
    try {
      act(() => {
        tree = Renderer.create(
          <BaselineInvestmentPortfolioChart
            host={h}
            points={points}
            currency="RON"
            amountsHidden={false}
          />,
        );
      });
      const surface = () =>
        tree.root.findAll(
          n =>
            n.props.testID === 'baseline-investment-portfolio-chart' &&
            typeof n.props.onResponderGrant === 'function',
        )[0]!;
      const label = () =>
        tree.root
          .findAll(
            n => n.props.testID === 'baseline-investment-chart-tooltip',
          )[0]!
          .findAllByType(Copy)[0]!.props.children;
      const money = () =>
        tree.root
          .findAll(
            n => n.props.testID === 'baseline-investment-chart-tooltip',
          )[0]!
          .findAllByType(Copy)[1]!.props.children;
      act(() =>
        surface().props.onResponderGrant({
          nativeEvent: { locationX: 325, type: eventType },
        }),
      );
      expect(label()).toBe(points[lastIndex]!.label);
      expect(money()).toBe(
        formatInvestmentMoney(points[lastIndex]!.value, 'RO', 'RON', false),
      );
      if (platform === 'web' && eventType === 'mousedown') {
        act(() =>
          surface().props.onResponderGrant({
            currentTarget: { getBoundingClientRect: () => ({ width: 179.5 }) },
            nativeEvent: { locationX: 162.5, type: 'mousedown' },
          }),
        );
        expect(label()).toBe(points[17]!.label);
        expect(money()).toBe(
          formatInvestmentMoney(points[17]!.value, 'RO', 'RON', false),
        );
      }
      act(() =>
        surface().props.onResponderMove({
          nativeEvent: {
            locationX: 68,
            type: eventType === 'mousedown' ? 'mousemove' : 'touchmove',
          },
        }),
      );
      const firstIndex =
        platform === 'web' && eventType === 'mousedown' ? 0 : 1;
      expect(label()).toBe(points[firstIndex]!.label);
      expect(money()).toBe(
        formatInvestmentMoney(points[firstIndex]!.value, 'RO', 'RON', false),
      );
    } finally {
      if (tree) act(() => tree.unmount());
      Object.defineProperty(Platform, 'OS', descriptor);
      if (documentDescriptor)
        Object.defineProperty(globalThis, 'document', documentDescriptor);
      else Reflect.deleteProperty(globalThis, 'document');
    }
  },
);
