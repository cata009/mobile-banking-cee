import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { CzRoboFlow } from '../src/experiences/pi/cz/evo-2027/robo';
import { DEFAULT_ROBO_DEMO_CLOCK } from '@/features/investments/robo/demoClock';
import type { RoboEvent } from '@/features/investments/robo/flowState';
import { createCzInvestmentSnapshot } from '../src/experiences/pi/cz/evo-2027/investments/model';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';
import { getPortfoliosForStrategy } from '@/features/investments/robo/model';

const toTarget: readonly RoboEvent[] = [
  { type: 'navigate', to: 'contact' },
  { type: 'navigate', to: 'profile' },
  { type: 'navigate', to: 'goal-type' },
  {
    type: 'draft-changed',
    field: 'goalType',
    value: 'General build-up wealth',
  },
  { type: 'navigate', to: 'goal-name' },
  { type: 'draft-changed', field: 'goalName', value: 'My future' },
  { type: 'navigate', to: 'target' },
  { type: 'draft-changed', field: 'targetAmount', value: '100000' },
  { type: 'select-horizon', years: 10 },
];
function press(tree: Renderer.ReactTestRenderer, label: string) {
  const control = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0]!;
  expect(control).toBeDefined();
  expect(control.props.disabled).not.toBe(true);
  act(() => control.props.onPress());
}
function mount(events: readonly RoboEvent[], count: 1 | 2 | 3 = 3) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <CzRoboFlow
        initialEvents={events}
        demoClock={DEFAULT_ROBO_DEMO_CLOCK}
        availableStrategyCount={count}
        onBack={jest.fn()}
        onExit={jest.fn()}
      />,
    );
  });
  return tree;
}

describe('native Source alternate Robo state families', () => {
  it.each([1, 2, 3] as const)(
    'renders %i strategy variants with a real projection route',
    count => {
      const tree = mount(
        [...toTarget, { type: 'navigate', to: 'strategy' }],
        count,
      );
      const projections = tree.root.findAll(
        node =>
          typeof node.props.accessibilityLabel === 'string' &&
          node.props.accessibilityLabel.startsWith('Explore outcomes:') &&
          typeof node.props.onPress === 'function',
      );
      expect(projections.length).toBeGreaterThanOrEqual(count);
      press(tree, 'Explore outcomes: Sustainable Balanced');
      expect(
        tree.root.findAll(node => node.props.testID === 'cz-projection').length,
      ).toBeGreaterThan(0);
      const slider = tree.root.findAll(
        node =>
          node.props.accessibilityLabel === 'Invest now slider' &&
          typeof node.props.onAccessibilityAction === 'function',
      )[0]!;
      act(() =>
        slider.props.onAccessibilityAction({
          nativeEvent: { actionName: 'increment' },
        }),
      );
      expect(
        tree.root
          .findAllByType(TextInput)
          .find(node => node.props.accessibilityLabel === 'Invest now')!.props
          .value,
      ).toBe('60000');
      press(tree, 'Choose portfolio');
      expect(
        tree.root.findAll(node => node.props.testID === 'cz-portfolio').length,
      ).toBeGreaterThan(0);
      act(() => tree.unmount());
    },
  );
  it('renders one-off and monthly funding fields through the canonical alternate path', () => {
    const tree = mount([
      ...toTarget,
      { type: 'navigate', to: 'funding-setup' },
    ]);
    press(tree, 'Invest once. Make a single investment now.');
    expect(
      tree.root
        .findAllByType(TextInput)
        .find(node => node.props.accessibilityLabel === 'Amount to invest now'),
    ).toBeDefined();
    expect(
      tree.root
        .findAllByType(TextInput)
        .find(node => node.props.accessibilityLabel === 'Monthly contribution'),
    ).toBeUndefined();
    press(tree, 'Invest monthly. Choose an amount to contribute each month.');
    expect(
      tree.root
        .findAllByType(TextInput)
        .find(node => node.props.accessibilityLabel === 'Amount to invest now'),
    ).toBeUndefined();
    act(() =>
      tree.root
        .findAllByType(TextInput)
        .find(node => node.props.accessibilityLabel === 'Monthly contribution')!
        .props.onChangeText('2000'),
    );
    press(tree, 'Continue');
    expect(
      tree.root.findAll(node => node.props.testID === 'cz-portfolio').length,
    ).toBeGreaterThan(0);
    act(() => tree.unmount());
  });
  it('resumes a cancelled creation without discarding its draft', () => {
    const tree = mount(toTarget);
    press(tree, 'Close');
    press(tree, 'Continue');
    expect(
      tree.root
        .findAllByType(TextInput)
        .find(node => node.props.accessibilityLabel === 'Target amount')!.props
        .value,
    ).toBe('100000');
    act(() => tree.unmount());
  });
  it('opens model constituent details and returns with the creation draft intact', () => {
    const snapshot = createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS);
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <CzRoboFlow
          initialEvents={toTarget}
          demoClock={DEFAULT_ROBO_DEMO_CLOCK}
          securityCatalog={snapshot.catalog}
          onBack={jest.fn()}
          onExit={jest.fn()}
        />,
      );
    });
    press(tree, 'Continue');
    const holding = getPortfoliosForStrategy('sustainable-balanced')[0]!
      .basketFund!.holdings[0]!;
    press(tree, `Open ${holding.title} product details`);
    press(tree, 'Close holding details');
    press(tree, 'Back');
    expect(
      tree.root
        .findAllByType(TextInput)
        .find(node => node.props.accessibilityLabel === 'Target amount')!.props
        .value,
    ).toBe('100000');
    act(() => tree.unmount());
  });
});
