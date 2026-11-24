import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Path, Text as SvgText } from 'react-native-svg';
import { DEFAULT_ROBO_DEMO_CLOCK } from '@/features/investments/robo/demoClock';
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures';
import { ROBO_PORTFOLIOS } from '@/features/investments/robo/catalog';
import type { CurrentAccount } from '@/data/products';
import { Management } from '../src/experiences/pi/cz/evo-2027/robo/Management';
import { CzRoboFlow } from '../src/experiences/pi/cz/evo-2027/robo/RoboFlow';
import { CashAccountField } from '../src/experiences/pi/cz/evo-2027/robo/CashAccount';
import { Page } from '../src/experiences/pi/cz/evo-2027/investments/Primitives';
import { Signing } from '../src/experiences/pi/cz/evo-2027/investments/Signing';
import { BaselineInvestmentField } from '../src/experiences/pi/current/investments/baseline/Frame';
import { InvestmentTerms } from '../src/experiences/pi/current/investments/baseline/flows/BuyOrder';
import { TextInput } from '../src/universal/Typography';
import { BaselineBottomSheet } from '../src/universal/BaselineBottomSheet';
import { DemoViewport } from '../src/universal/DemoViewport';
import { BaselineStandardSuccess } from '../src/universal/BaselineStandardSuccess';
import { SourceRangeSlider } from '../src/universal/SourceRangeSlider';

const accounts: CurrentAccount[] = [
  {
    id: 'A',
    type: 'current_account',
    name: 'Cash A',
    accountNumber: '890123401/2700',
    balance: 50_000,
    currency: 'CZK',
  },
  {
    id: 'B',
    type: 'current_account',
    name: 'Cash B',
    accountNumber: '890123402/2700',
    balance: 100_000,
    currency: 'CZK',
  },
];
const unfundedGoal = {
  ...INITIAL_CZ_ROBO_GOALS[0]!,
  positions: [],
  transactions: [],
  orders: [],
};

function render(
  overrides: Partial<React.ComponentProps<typeof Management>> = {},
) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <DemoViewport>
        <Management
          goal={unfundedGoal}
          portfolio={ROBO_PORTFOLIOS[0]!}
          mode="add-money"
          release="release-future-cz-robo"
          projectionEligible
          onMode={jest.fn()}
          onBack={jest.fn()}
          onExit={jest.fn()}
          onGoalUpdated={jest.fn()}
          currentAccounts={accounts}
          securityCatalog={[]}
          clock={DEFAULT_ROBO_DEMO_CLOCK}
          amountsHidden={false}
          {...overrides}
        />
      </DemoViewport>,
    );
  });
  return tree;
}

function press(tree: Renderer.ReactTestRenderer, label: string) {
  const node = tree.root.findAll(
    n =>
      n.props.accessibilityLabel === label &&
      typeof n.props.onPress === 'function',
  )[0]!;
  expect(node).toBeDefined();
  expect(node.props.disabled).not.toBe(true);
  act(() => node.props.onPress());
}

test('changes the account after insufficient funds while preserving the amount through signing', () => {
  const onGoalUpdated = jest.fn();
  const tree = render({ onGoalUpdated });
  try {
    press(tree, 'Preview impact');
    expect(tree.root.findByType(Page).props.title).toBe(
      'Investment projection',
    );
    press(tree, 'Year 1');
    const editable = tree.root.findByType(TextInput);
    act(() => editable.props.onChangeText('75.000'));
    press(tree, 'Review investment');
    expect(tree.root.findByType(Page).props.title).toBe(
      'Investment projection',
    );
    expect(tree.root.findByType(BaselineBottomSheet).props.title).toBe(
      'Insufficient funds',
    );
    expect(tree.root.findByType(BaselineBottomSheet).props).toMatchObject({
      showCloseButton: false,
      padding: 24,
    });
    const sheet = tree.root.findByType(BaselineBottomSheet);
    expect(
      sheet
        .findAllByProps({ accessibilityLabel: '75.000,00 CZK' })
        .some(node => node.props.children === '75K CZK'),
    ).toBe(true);
    expect(
      sheet
        .findAllByProps({ accessibilityLabel: '50.000,00 CZK' })
        .some(node => node.props.children === '50K CZK'),
    ).toBe(true);
    press(tree, 'Edit amount or cash account');
    press(tree, 'Cash account');
    press(tree, 'Cash B, 890123402/2700, 100.000,00 CZK');
    press(tree, 'Select');
    expect(tree.root.findByType(TextInput).props.value).toBe('75.000');
    press(tree, 'Review investment');
    const fields = tree.root.findAllByType(BaselineInvestmentField);
    expect(
      fields.find(n => n.props.label === 'Cash account')?.props.value,
    ).toBe('Cash B');
    expect(
      fields.find(n => n.props.label === 'Estimated amount')?.props.value,
    ).toBe('75.000,00 CZK');
    act(() => tree.root.findByType(InvestmentTerms).props.onChange(true));
    press(tree, 'Buy');
    act(() => tree.root.findByType(Signing).props.onSigned());
    expect(tree.root.findByType(BaselineStandardSuccess).props.title).toBe(
      'Add money request submitted',
    );
    expect(onGoalUpdated).toHaveBeenCalledTimes(1);
  } finally {
    act(() => tree.unmount());
  }
});

test('updates the selected projection and restores it after the Excel-aligned help screen', () => {
  const tree = render({
    goal: {
      ...INITIAL_CZ_ROBO_GOALS[0]!,
      positions: [],
      recurringContribution: undefined,
    },
  });
  const hasText = (value: string) =>
    tree.root.findAll(n => n.children.includes(value)).length > 0;
  try {
    press(tree, 'Preview impact');
    press(tree, 'Today');
    expect(hasText('Total contributions')).toBe(true);
    expect(hasText('Portfolio value')).toBe(true);
    expect(['Positive', 'Neutral', 'Negative'].every(hasText)).toBe(true);
    const amount = () => tree.root.findByType(TextInput);
    act(() => amount().props.onChangeText('75.000'));
    expect(hasText('75K CZK')).toBe(true);
    expect(hasText('Current plan')).toBe(false);
    press(tree, 'Help');
    expect(tree.root.findByType(Page).props.title).toBe(
      'About this projection',
    );
    expect(hasText('Total contributions')).toBe(true);
    act(() => tree.root.findByType(Page).props.onBack());
    expect(tree.root.findByType(Page).props.title).toBe(
      'Investment projection',
    );
    expect(hasText('75K CZK')).toBe(true);
    expect(amount().props.value).toBe('75.000');
  } finally {
    act(() => tree.unmount());
  }
});

test('keeps the zero-balance projection scale stable during a drag until the lines need more room', () => {
  jest.useFakeTimers();
  const tree = render();
  const slider = () => tree.root.findByType(SourceRangeSlider);
  const ticks = () =>
    tree.root
      .findAllByType(SvgText)
      .filter(
        node => node.props.textAnchor === 'end' && node.props.children !== 'Target',
      )
      .map(node => node.props.children);
  const capitalY = () =>
    Number(
      tree.root
        .findAllByType(Path)
        .find(node => node.props.strokeDasharray)?.props.d.split(' ')[1],
    );
  const setAmount = (amount: number) => {
    act(() => slider().props.onChange(amount));
    act(() => jest.advanceTimersByTime(240));
  };

  try {
    press(tree, 'Preview impact');
    setAmount(5_000);
    const initialTicks = ticks();
    const initialY = capitalY();
    expect(
      tree.root.findAll(node => node.children.join('') === 'Portfolio today · 0 CZK'),
    ).not.toHaveLength(0);
    act(() => slider().props.onInteractionChange?.(true));

    setAmount(5_500);
    expect(ticks()).toEqual(initialTicks);
    expect(capitalY()).toBeLessThan(initialY);
    expect(initialTicks[0]).toBe('0');

    setAmount(10_000_000);
    const expandedTicks = ticks();
    expect(expandedTicks).not.toEqual(initialTicks);
    expect(capitalY()).toBeGreaterThanOrEqual(9);

    setAmount(5_000);
    expect(ticks()).toEqual(expandedTicks);
    act(() => slider().props.onInteractionChange?.(false));
    expect(ticks()).toEqual(initialTicks);
  } finally {
    act(() => tree.unmount());
    jest.useRealTimers();
  }
});

test('remembers the first Add Money visit after exiting before investment', () => {
  const updated = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <DemoViewport>
        <CzRoboFlow
          release="release-future-cz-robo"
          initialGoal={unfundedGoal}
          currentAccounts={accounts}
          onBack={jest.fn()}
          onExit={jest.fn()}
          onGoalUpdated={updated}
        />
      </DemoViewport>,
    );
  });
  try {
    const preview = () =>
      tree.root.findAll(n => n.props.accessibilityLabel === 'Preview impact');
    press(tree, 'Add money');
    expect(preview().length).toBeGreaterThan(0);
    expect(updated).toHaveBeenLastCalledWith(
      expect.objectContaining({ addMoneyVisited: true }),
    );
    press(tree, 'Back');
    press(tree, 'Add money');
    expect(preview()).toHaveLength(0);
    press(tree, 'Review investment');
    expect(tree.root.findByType(InvestmentTerms)).toBeDefined();
  } finally {
    act(() => tree.unmount());
  }
});

test('sets the goal cash account below the horizon and carries the selection to review', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <DemoViewport>
        <CzRoboFlow
          release="release-future-cz-robo"
          currentAccounts={[
            ...accounts,
            { ...accounts[0]!, id: 'EUR', currency: 'EUR' },
          ]}
          onBack={jest.fn()}
          onExit={jest.fn()}
          initialEvents={[
            { type: 'navigate', to: 'intro' },
            { type: 'navigate', to: 'profile' },
            { type: 'navigate', to: 'goal-type' },
            { type: 'navigate', to: 'goal-name' },
            { type: 'navigate', to: 'target' },
          ]}
        />
      </DemoViewport>,
    );
  });
  try {
    expect(tree.root.findByType(CashAccountField).props.account.id).toBe('A');
    press(tree, 'Cash account, Cash A');
    expect(
      tree.root.findAll(n => /EUR/.test(n.props.accessibilityLabel ?? '')),
    ).toHaveLength(0);
    press(tree, 'Cash B, 890123402/2700, 100.000,00 CZK');
    press(tree, 'Close cash accounts');
    expect(tree.root.findByType(CashAccountField).props.account.id).toBe('A');
    press(tree, 'Cash account, Cash A');
    press(tree, 'Cash B, 890123402/2700, 100.000,00 CZK');
    press(tree, 'Select');
    expect(tree.root.findByType(CashAccountField).props.account.id).toBe('B');
    press(tree, '25.000 CZK');
    press(tree, '5 years');
    press(tree, 'Continue');
    press(tree, 'Continue');
    expect(
      tree.root.findAll(n => n.children.includes('890123402/2700')).length,
    ).toBeGreaterThan(0);
  } finally {
    act(() => tree.unmount());
  }
});

test('the optional preview is available without an account and the direct review still works', () => {
  const empty = render({ currentAccounts: [] });
  const ready = render();
  try {
    press(empty, 'Preview impact');
    expect(empty.root.findByType(Page).props.title).toBe(
      'Investment projection',
    );
    const disabled = empty.root.findAll(
      n =>
        n.props.accessibilityLabel === 'Review investment' &&
        n.props.disabled === true,
    );
    expect(disabled.length).toBeGreaterThan(0);
    press(ready, 'Review investment');
    expect(
      ready.root
        .findAllByType(BaselineInvestmentField)
        .some(n => n.props.label === 'Estimated amount'),
    ).toBe(true);
  } finally {
    act(() => empty.unmount());
    act(() => ready.unmount());
  }
});

test.each([
  ['Invest monthly. Choose an amount to contribute each month.', false],
  [
    'Invest now and monthly. Make an initial investment, then continue with monthly contributions.',
    true,
  ],
])(
  'carries the monthly date, edited contribution and cash account to review for %s',
  (choice, combined) => {
    const tree = render();
    try {
      press(tree, choice);
      press(tree, 'Preview impact');
      const fields = tree.root.findAllByType(TextInput);
      expect(fields.map(node => node.props.accessibilityLabel)).toEqual(
        combined
          ? ['Add today', 'New monthly contribution']
          : ['New monthly contribution'],
      );
      act(() => fields.at(-1)!.props.onChangeText('1.500'));
      expect(tree.root.findAllByType(TextInput).at(-1)!.props.value).toBe(
        '1.500',
      );
      press(tree, 'Review investment');
      const review = Object.fromEntries(
        tree.root
          .findAllByType(BaselineInvestmentField)
          .map(node => [node.props.label, node.props.value]),
      );
      expect(review['Monthly contribution']).toBe('1.500,00 CZK');
      expect(review['Monthly contribution starts']).toBe('1 March 2026');
      expect(review['Cash account']).toBe('Cash A');
      expect(review['Estimated amount']).toBe(
        combined ? '10.000,00 CZK' : undefined,
      );
      act(() => tree.root.findByType(InvestmentTerms).props.onChange(true));
      press(tree, combined ? 'Buy' : 'Set up monthly investment');
      act(() => tree.root.findByType(Signing).props.onSigned());
      expect(tree.root.findByType(BaselineStandardSuccess).props.title).toBe(
        combined
          ? 'Add money request submitted'
          : 'Monthly investment scheduled',
      );
    } finally {
      act(() => tree.unmount());
    }
  },
);
