import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, Text, View } from 'react-native';
import { ROBO_PORTFOLIOS } from '@/features/investments/robo/catalog';
import type { RoboExistingGoal } from '@/features/investments/robo/types';
import { GoalDetail } from '../src/experiences/pi/cz/evo-2027/robo/GoalDetail';
import { Page } from '../src/experiences/pi/cz/evo-2027/investments/Primitives';
import { PerformanceChart } from '../src/experiences/pi/cz/evo-2027/investments/PerformanceChart';
import { BaselineBanner } from '../src/universal/BaselineBanner';
import { BaselineInvestmentPeriodChips } from '../src/universal/BaselineInvestmentPeriodChips';

const emptyGoal: RoboExistingGoal = {
  id: 'new-car',
  name: 'My next car',
  purpose: 'Saving for a major purchase',
  currentInteger: '0',
  currentDecimals: ',00 CZK',
  returnLabel: '0 total return',
  returnTone: 'neutral',
  targetInteger: '100000',
  targetDecimals: ',00 CZK',
  horizonYears: 2,
  startDate: '15 Feb 2025',
  endDate: '15 Feb 2027',
  portfolioId: ROBO_PORTFOLIOS[0]!.id,
  positions: [],
  transactions: [],
  orders: [],
};

function renderGoal(goal = emptyGoal, amountsHidden = false) {
  const onAction = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <GoalDetail
        goal={goal}
        portfolio={ROBO_PORTFOLIOS[0]!}
        onBack={jest.fn()}
        onExit={jest.fn()}
        onAction={onAction}
        securityCatalog={[]}
        clock={{ referenceDay: { year: 2026, month: 10, day: 20 } }}
        amountsHidden={amountsHidden}
      />,
    );
  });
  return { tree, onAction };
}

function press(tree: Renderer.ReactTestRenderer, label: string) {
  const control = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0];
  expect(control).toBeDefined();
  act(() => control!.props.onPress());
}

test('new goal keeps its real zero chart and exposes all six source periods', () => {
  const { tree } = renderGoal();
  const periods = tree.root.findByType(BaselineInvestmentPeriodChips);
  expect(
    periods.props.periods.map((item: { label: string }) => item.label),
  ).toEqual(['1 M', '3 M', '6M', '1 Y', '3 Y', 'MAX']);
  expect(periods.props.selectedPeriodId).toBe('3y');
  expect(tree.root.findByType(PerformanceChart).props.zeroBaselineOnly).toBe(
    true,
  );
  expect(
    tree.root
      .findByType(PerformanceChart)
      .props.points.every((point: { value: number }) => point.value === 0),
  ).toBe(true);
  expect(
    tree.root
      .findByType(PerformanceChart)
      .props.points.every((point: { showDot?: boolean }) => !point.showDot),
  ).toBe(true);
  press(tree, '6M');
  expect(
    tree.root.findByType(BaselineInvestmentPeriodChips).props.selectedPeriodId,
  ).toBe('6m');
  act(() => tree.unmount());
});

test('empty goal message is one outlined source information banner before progress', () => {
  const { tree } = renderGoal();
  const banner = tree.root.findByType(BaselineBanner);
  expect(banner.props).toMatchObject({
    variant: 'info',
    title: 'Your goal is ready to invest',
    description:
      'Your model portfolio is ready. Select Add money to make your first investment towards this goal.',
    presentation: { width: '100%', bodyLineHeight: 22 },
  });
  const bannerRoot = banner.findAllByType(View)[0]!;
  expect(StyleSheet.flatten(bannerRoot.props.style)).toMatchObject({
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    width: '100%',
  });
  const page = tree.root.findByType(Page);
  expect(page.props).toMatchObject({
    gutter: 16,
    descriptionTop: 4,
    contentTop: 30,
  });
  expect(
    tree.root
      .findAllByType(Text)
      .some(node => node.props.children === 'Portfolio allocation'),
  ).toBe(false);
  act(() => tree.unmount());
});

test.each([
  {
    title: 'Your investment is being processed',
    override: {
      orders: [
        {
          id: 'pending-buy',
          date: '2026-10-20',
          title: 'Basket',
          amount: 1000,
          currency: 'CZK',
          orderType: 'BUY',
          status: 'PENDING',
          tone: 'neutral',
        },
      ],
    },
  },
  {
    title: 'Your recurring top-up is scheduled',
    override: {
      recurringContribution: { amount: 1000, startDate: '15 Nov 2026' },
    },
  },
  {
    title: 'Your goal is currently empty',
    override: {
      transactions: [
        {
          id: 'sale',
          date: '2026-10-20',
          title: 'Fund',
          amount: 1000,
          quantity: 1,
          currency: 'CZK',
          type: 'SELL',
          tone: 'negative',
        },
      ],
    },
  },
])('keeps the feature-derived empty state: $title', ({ title, override }) => {
  const { tree } = renderGoal({
    ...emptyGoal,
    ...override,
  } as RoboExistingGoal);
  expect(tree.root.findByType(BaselineBanner).props.title).toBe(title);
  act(() => tree.unmount());
});

test('source action bar preserves all management callbacks for an unfunded goal', () => {
  const { tree, onAction } = renderGoal();
  for (const label of ['Add money', 'Withdraw', 'History', 'Goal settings'])
    press(tree, label);
  expect(onAction.mock.calls).toEqual([
    ['add-money'],
    ['withdraw'],
    ['history'],
    ['settings'],
  ]);
  act(() => tree.unmount());
});

test('fully sold goal keeps executed history and masks chart and progress amounts', () => {
  const goal: RoboExistingGoal = {
    ...emptyGoal,
    returnTone: 'negative',
    returnLabel: '-1.100,00 CZK (-1,36%)',
    transactions: [
      {
        id: 'buy',
        date: '2026-06-12',
        title: 'Fund',
        amount: 22000,
        quantity: 10,
        currency: 'CZK',
        type: 'BUY',
        tone: 'neutral',
      },
      {
        id: 'sale',
        date: '2026-10-08',
        title: 'Fund',
        amount: 20900,
        quantity: 10,
        currency: 'CZK',
        type: 'SELL',
        tone: 'negative',
      },
    ],
  };
  const { tree } = renderGoal(goal, true);
  const chart = tree.root.findByType(PerformanceChart);
  expect(chart.props).toMatchObject({
    step: true,
    zeroBaselineOnly: false,
    hidden: true,
    showPerformance: false,
  });
  expect(
    chart.props.points.map((point: { value: number }) => point.value),
  ).toEqual([22000, 0, 0]);
  expect(tree.root.findByType(BaselineBanner).props.title).toBe(
    'Your goal is currently empty',
  );
  const text = JSON.stringify(tree.toJSON());
  expect(text).toContain('••%');
  expect(text).not.toContain('-1.100,00 CZK');
  act(() => tree.unmount());
});
