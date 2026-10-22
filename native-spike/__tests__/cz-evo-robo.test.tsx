import { authorizeDemo } from '../test-support/cz-evo-investmentsHelpers';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import { resolvePrimaryButton } from '@/app/components/contracts/primaryButton';
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
  it('keeps the Source Edit data sizing and opens the host profile route', () => {
    let tree!: TestRenderer.ReactTestRenderer;
    const onProfile = jest.fn();
    act(() => {
      tree = TestRenderer.create(
        <CzRoboFlow
          onBack={jest.fn()}
          onExit={jest.fn()}
          onProfile={onProfile}
        />,
      );
    });

    press(tree, 'Create Goal');
    const editData = tree.root
      .findAllByType(PrimaryButton)
      .find(button => button.props.label === 'Edit data');
    expect(editData).toBeDefined();
    expect(editData!.props.variant).toBe('secondary');
    expect(resolvePrimaryButton(editData!.props)).toMatchObject({
      height: 48,
      radius: 4,
      fontSize: 18,
      transparent: true,
    });

    press(tree, 'Edit data');
    expect(onProfile).toHaveBeenCalledTimes(1);
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
    act(() =>
      tree.root
        .findByProps({ testID: 'cz-investment-contract-scroll' })
        .props.onScroll({
          nativeEvent: {
            contentOffset: { y: 400 },
            layoutMeasurement: { height: 300 },
            contentSize: { height: 700 },
          },
        }),
    );
    press(tree, 'I have read it');
    press(tree, 'Continue to sign');
    await act(async () => Promise.resolve());
    await act(async () => {
      await tree.root
        .findAll(
          node =>
            node.props.accessibilityLabel === 'Sign' &&
            typeof node.props.onPress === 'function',
        )[0]!
        .props.onPress();
    });
    expect(
      tree.root.findByProps({ testID: 'source-face-id-animation' }),
    ).toBeDefined();
    await act(async () => {
      jest.advanceTimersByTime(840);
      await Promise.resolve();
    });
    await act(async () => {
      jest.advanceTimersByTime(900);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(published).toHaveLength(1);
    expect(published[0]!.currentInteger).toBe('0');
    expect(published[0]!.transactions).toEqual([]);
    press(tree, 'View goal');
    press(tree, 'Add money');
    input(tree, 'Amount to invest now', '10000');
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
      const continueButtons = tree.root.findAll(
        node =>
          node.props.accessibilityLabel === 'Continue' &&
          typeof node.props.onPress === 'function',
      );
      expect(continueButtons).toHaveLength(1);
      expect(continueButtons[0]!.props.disabled).toBe(true);
      act(() => tree.unmount());
    },
  );
});
