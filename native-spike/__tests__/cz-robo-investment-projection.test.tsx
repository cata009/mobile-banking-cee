import React from 'react';
import Renderer, { act } from 'react-test-renderer';
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
import { BaselineAmountField } from '../src/universal/BaselineAmountField';
import { BaselineBottomSheet } from '../src/universal/BaselineBottomSheet';
import { DemoViewport } from '../src/universal/DemoViewport';
import { BaselineStandardSuccess } from '../src/universal/BaselineStandardSuccess';

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

function render(
  overrides: Partial<React.ComponentProps<typeof Management>> = {},
) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <DemoViewport>
        <Management
          goal={INITIAL_CZ_ROBO_GOALS[0]!}
          portfolio={ROBO_PORTFOLIOS[0]!}
          mode="add-money"
          release="release-future-cz-robo"
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
    press(tree, 'All years');
    const year = tree.root.findAll(
      n =>
        /^Year 1, current plan/.test(n.props.accessibilityLabel ?? '') &&
        typeof n.props.onPress === 'function',
    )[0]!;
    act(() => year.props.onPress());
    const editable = tree.root.findByType(BaselineAmountField);
    act(() => editable.props.onChange('75000'));
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
    press(tree, 'Edit amount or cash account');
    press(tree, 'Cash account');
    press(tree, 'Cash B, 890123402/2700, 100.000,00 CZK');
    press(tree, 'Select');
    expect(tree.root.findByType(BaselineAmountField).props.value).toBe('75000');
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
      const fields = tree.root.findAllByType(BaselineAmountField);
      expect(fields.map(node => node.props.label)).toEqual(
        combined
          ? ['Add today', 'New monthly contribution']
          : ['New monthly contribution'],
      );
      act(() => fields.at(-1)!.props.onChange('1500'));
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
