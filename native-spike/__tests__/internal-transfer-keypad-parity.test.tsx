import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import Transfer from '../src/experiences/pi/cz/evo-2027/payments/Transfer';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';

const host = (): CzechNativeScreenProps => ({
  route: { screen: 'payments' },
  scenario: 'active',
  productCounts: DEFAULT_CZECH_COUNTS,
  amountsHidden: false,
  isActive: true,
  onBack: jest.fn(),
  onNavigate: jest.fn(),
  onSearch: jest.fn(),
  onProfile: jest.fn(),
  onAmountsToggle: jest.fn(),
  onChanged: jest.fn(),
});
const control = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0]!;
const amount = (tree: Renderer.ReactTestRenderer) =>
  tree.root
    .findAllByType(TextInput)
    .find(node => node.props.accessibilityLabel === 'Amount in CZK')!;
const keypadDigits = (tree: Renderer.ReactTestRenderer) =>
  tree.root.findAll(
    node =>
      node.props.accessibilityRole === 'button' &&
      node.props.accessibilityLabel === '1' &&
      typeof node.props.onPress === 'function',
  );

it.each(['press', 'pointer-down'] as const)(
  'Swap finishes Source calculator editing on %s, keeps CZK expression and reverses the submitted account roles',
  interaction => {
    const onDemoTransfer = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <Transfer {...host()} onDemoTransfer={onDemoTransfer} />,
      );
    });
    try {
      expect(keypadDigits(tree).length).toBeGreaterThan(0);
      act(() => amount(tree).props.onChangeText('2428,40'));
      const swap = control(tree, 'Swap accounts');
      if (interaction === 'pointer-down') {
        act(() => swap.props.onPressIn());
        expect(keypadDigits(tree)).toHaveLength(0);
      }
      act(() => control(tree, 'Swap accounts').props.onPress());
      expect(keypadDigits(tree)).toHaveLength(0);
      expect(amount(tree).props.value).toBe('2428,40');
      expect(amount(tree).props.inputMode).toBe('none');
      expect(JSON.stringify(tree.toJSON())).toContain('1 EUR = 24.2840 CZK');
      act(() => control(tree, 'Move money').props.onPress());
      expect(onDemoTransfer).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceAccountId: 'acc-2',
          destinationAccountId: 'acc-1',
          amount: 100,
          currency: 'EUR',
        }),
      );
    } finally {
      act(() => tree.unmount());
    }
  },
);

it('Swap finalizes pending arithmetic like Source and amount focus reopens the calculator without reversing roles again', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<Transfer {...host()} />);
  });
  try {
    act(() => amount(tree).props.onChangeText('1000+1428.40'));
    act(() => control(tree, 'Swap accounts').props.onPress());
    expect(keypadDigits(tree)).toHaveLength(0);
    expect(amount(tree).props.value).toBe('2428.4');
    act(() => amount(tree).props.onFocus());
    expect(keypadDigits(tree).length).toBeGreaterThan(0);
    expect(amount(tree).props.value).toBe('2428.4');
    expect(JSON.stringify(tree.toJSON())).toContain('1 EUR = 24.2840 CZK');
  } finally {
    act(() => tree.unmount());
  }
});
