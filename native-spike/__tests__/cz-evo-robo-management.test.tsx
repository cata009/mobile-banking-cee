import { authorizeDemo } from '../test-support/cz-evo-investmentsHelpers';
import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { CzRoboFlow } from '../src/experiences/pi/cz/evo-2027/robo';
import { createCzInvestmentSnapshot } from '../src/experiences/pi/cz/evo-2027/investments/model';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures';
import { getRoboPortfolioForGoal } from '@/features/investments/robo/model';
import {
  getRoboGoalCurrentValue,
  getRoboWithdrawalProducts,
} from '@/features/investments/robo/goalModel';
import { hydrateRoboGoal } from '@/features/investments/robo/goalHydration';
import { DEFAULT_ROBO_DEMO_CLOCK } from '@/features/investments/robo/demoClock';
import type { RoboExistingGoal } from '@/features/investments/robo/types';

function control(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0];
}
function press(tree: Renderer.ReactTestRenderer, label: string) {
  const node = control(tree, label)!;
  expect(node).toBeDefined();
  expect(node.props.disabled).not.toBe(true);
  act(() => {
    node.props.onPress();
  });
}
function input(tree: Renderer.ReactTestRenderer, label: string, value: string) {
  act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === label)!
      .props.onChangeText(value),
  );
}
describe('native Robo management state families', () => {
  const snapshot = createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS);
  const source = INITIAL_CZ_ROBO_GOALS[0]!;
  const portfolio = getRoboPortfolioForGoal(source)!;
  const goal = hydrateRoboGoal(
    source,
    portfolio.basketFund!,
    'CZ',
    snapshot.catalog,
  );
  function mount(
    onGoalUpdated = jest.fn(),
    initialGoal: RoboExistingGoal = goal,
  ) {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <CzRoboFlow
          initialGoal={initialGoal}
          onBack={jest.fn()}
          onExit={jest.fn()}
          onGoalUpdated={onGoalUpdated}
          currentAccounts={snapshot.accounts}
          securityCatalog={snapshot.catalog}
          demoClock={DEFAULT_ROBO_DEMO_CLOCK}
        />,
      );
    });
    return tree;
  }
  it('updates a goal name and plan through native inputs', () => {
    const updated = jest.fn();
    const tree = mount(updated);
    press(tree, 'Goal settings');
    press(tree, 'Rename goal');
    input(tree, 'Goal name', 'My plans');
    press(tree, 'Save name');
    expect(updated.mock.calls.at(-1)![0].name).toBe('My plans');
    press(tree, 'Goal settings');
    press(tree, 'Change goal plan');
    input(tree, 'Target amount', '200000');
    press(tree, '10 years');
    press(tree, 'Save changes');
    expect(updated.mock.calls.at(-1)![0]).toMatchObject({
      targetInteger: '200.000',
      horizonYears: 10,
    });
    act(() => tree.unmount());
  });
  it('withdraws actual held units with canonical position and history updates', async () => {
    const updated = jest.fn();
    const tree = mount(updated);
    const product = getRoboWithdrawalProducts(
      portfolio,
      getRoboGoalCurrentValue(goal),
      'CZ',
      snapshot.catalog,
      goal.positions,
    ).find(item => item.security && item.security.quantity > 0)!;
    press(tree, 'Withdraw');
    press(tree, product.name);
    const quantity = Number(
      Math.min(0.25, product.security!.quantity).toFixed(6),
    );
    input(tree, 'Number of units', String(quantity));
    press(tree, 'Next');
    press(tree, 'Accept terms and conditions');
    press(tree, 'Sell');
    await authorizeDemo(tree, 'Sign order');
    press(tree, 'Back');
    const next = updated.mock.calls.at(-1)![0] as RoboExistingGoal;
    expect(getRoboGoalCurrentValue(next)).toBeLessThan(
      getRoboGoalCurrentValue(goal),
    );
    expect(next.transactions!.at(-1)).toMatchObject({ type: 'SELL', quantity });
    expect(next.orders!.at(-1)).toMatchObject({
      orderType: 'SELL',
      status: 'EXECUTED',
    });
    act(() => tree.unmount());
  });
  it('preserves Source navigation to an empty withdrawal list', () => {
    const empty = INITIAL_CZ_ROBO_GOALS.find(
      item => item.currentInteger === '0',
    )!;
    const tree = mount(jest.fn(), empty);
    press(tree, 'Withdraw');
    expect(
      tree.root.findAll(node => node.props.testID === 'cz-withdraw').length,
    ).toBeGreaterThan(0);
    act(() => tree.unmount());
  });
  it('seeds a valid existing recurring start date instead of replacing the schedule', () => {
    const tree = mount(jest.fn(), {
      ...goal,
      recurringContribution: {
        amount: 2000,
        startDate: '1 January 2027',
        cashAccountId: snapshot.accounts[0]!.id,
      },
    });
    press(tree, 'Add money');
    expect(
      tree.root
        .findAllByType(TextInput)
        .find(
          node =>
            node.props.accessibilityLabel === 'Monthly contribution starts',
        )!.props.value,
    ).toBe('01/01/2027');
    act(() => tree.unmount());
  });
  it('opens history and model portfolio from the current goal', () => {
    const tree = mount();
    press(tree, 'History');
    expect(
      tree.root.findAll(node => node.props.testID === 'cz-investment-history')
        .length,
    ).toBeGreaterThan(0);
    press(tree, 'Back');
    press(tree, 'Goal settings');
    press(tree, 'Model Portfolio');
    expect(
      tree.root.findAll(node => node.props.testID === 'cz-model-portfolio')
        .length,
    ).toBeGreaterThan(0);
    act(() => tree.unmount());
  });
});
