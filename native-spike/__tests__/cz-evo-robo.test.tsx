import { authorizeDemo } from '../test-support/cz-evo-investmentsHelpers';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { ActionButton } from '../src/universal/ActionButton';
import { CzRoboFlow } from '../src/experiences/pi/cz/evo-2027/robo';
import { DEFAULT_ROBO_DEMO_CLOCK } from '@/features/investments/robo/demoClock';
import type { RoboExistingGoal } from '@/features/investments/robo/types';

function press(tree: TestRenderer.ReactTestRenderer, label: string) {
  const button = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0];
  expect(button).toBeDefined();
  expect(button!.props.disabled).not.toBe(true);
  act(() => button!.props.onPress());
}
function input(
  tree: TestRenderer.ReactTestRenderer,
  label: string,
  value: string,
) {
  act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === label)!
      .props.onChangeText(value),
  );
}

describe('CZ Evo native Robo', () => {
  it('keeps the Source Edit data text affordance at Source sizing without adding an action', () => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <CzRoboFlow onBack={jest.fn()} onExit={jest.fn()} />,
      );
    });

    press(tree, 'Create Goal');
    const editData = tree.root
      .findAllByType(ActionButton)
      .find(button => button.props.label === 'Edit data');
    expect(editData).toBeDefined();
    expect(editData!.props.secondary).toBe(true);
    expect(editData!.props.containerStyle).toEqual(
      expect.objectContaining({
        minHeight: 44,
        width: '100%',
        borderRadius: 4,
      }),
    );
    expect(editData!.props.labelStyle).toEqual(
      expect.objectContaining({ fontSize: 16, lineHeight: 22 }),
    );

    press(tree, 'Edit data');
    expect(
      tree.root.findByProps({ testID: 'cz-personal-data-confirmation' }),
    ).toBeDefined();
    act(() => tree.unmount());
  });

  it('creates a zero-valued goal through consent/signing and submits a pending top-up without inventing holdings', async () => {
    jest.useFakeTimers();
    const published: RoboExistingGoal[] = [];
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <CzRoboFlow
          onBack={jest.fn()}
          onExit={jest.fn()}
          demoClock={DEFAULT_ROBO_DEMO_CLOCK}
          onGoalUpdated={goal => published.push(goal)}
        />,
      );
    });
    press(tree, 'Create Goal');
    press(tree, 'I confirm these data');
    press(tree, 'Continue');
    press(
      tree,
      'General build-up wealth. Grow your wealth to support long-term goals.',
    );
    press(tree, 'Continue');
    input(tree, 'Enter your goal name', 'Future freedom');
    press(tree, 'Continue');
    input(tree, 'Target amount', '100000');
    press(tree, '10 years');
    press(tree, 'Continue');
    press(tree, 'Continue');
    expect(
      tree.root.findAll(
        node =>
          node.props.accessibilityLabel === 'Continue to sign' &&
          typeof node.props.onPress === 'function',
      )[0]!.props.disabled,
    ).toBe(true);
    press(tree, 'Investment account contract');
    press(tree, 'I have read this');
    press(tree, 'Continue to sign');
    await authorizeDemo(tree, 'Sign goal');
    expect(published).toHaveLength(1);
    expect(published[0]!.currentInteger).toBe('0');
    expect(published[0]!.transactions).toEqual([]);
    act(() => jest.advanceTimersByTime(900));
    press(tree, 'View goal');
    press(tree, 'Add money');
    input(tree, 'Amount to add', '10000');
    press(tree, 'Review investment');
    press(tree, 'Continue to sign');
    await authorizeDemo(tree, 'Confirm investment');
    expect(
      published.at(-1)!.orders!.some(order => order.status === 'PENDING'),
    ).toBe(true);
    expect(published.at(-1)!.currentInteger).toBe('0');
    expect(
      tree.root.findAll(node => node.props.testID === 'cz-top-up-success')
        .length,
    ).toBeGreaterThan(0);
    act(() => tree.unmount());
    jest.useRealTimers();
  });

  it.each(['expired', 'missing'] as const)(
    'blocks goal creation for a %s investor profile',
    status => {
      let tree!: TestRenderer.ReactTestRenderer;
      act(() => {
        tree = TestRenderer.create(
          <CzRoboFlow
            onBack={jest.fn()}
            onExit={jest.fn()}
            profileStatus={status}
          />,
        );
      });
      press(tree, 'Create Goal');
      press(tree, 'I confirm these data');
      expect(
        tree.root.findAll(
          node =>
            node.props.accessibilityLabel === 'Continue' &&
            typeof node.props.onPress === 'function',
        ),
      ).toHaveLength(0);
      act(() => tree.unmount());
    },
  );
});
