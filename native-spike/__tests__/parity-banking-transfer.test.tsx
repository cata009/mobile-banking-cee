import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import Transfer from '../src/experiences/pi/cz/evo-2027/payments/Transfer';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import { getCountryConfig } from '@/app/registry/countryConfig';
const preset = `${new Intl.NumberFormat(getCountryConfig('CZ').locale, {
  maximumFractionDigits: 0,
}).format(1000)} CZK`;
const host = (): CzechNativeScreenProps => ({
  route: { screen: 'payments' },
  scenario: 'active',
  productCounts: DEFAULT_CZECH_COUNTS,
  amountsHidden: false,
  onBack: jest.fn(),
  onNavigate: jest.fn(),
  onProfile: jest.fn(),
  onSearch: jest.fn(),
  onAmountsToggle: jest.fn(),
  onChanged: jest.fn(),
  isActive: true,
  screenTopInset: 12,
});
const press = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root
    .findAll(
      n =>
        n.props.accessibilityLabel === label &&
        typeof n.props.onPress === 'function',
    )[0]!
    .props.onPress();
const value = (tree: Renderer.ReactTestRenderer) => {
  const walk = (n: any): string =>
    typeof n === 'string'
      ? n
      : Array.isArray(n)
      ? n.map(walk).join('')
      : n?.children
      ? walk(n.children)
      : '';
  return walk(tree.toJSON());
};
test('Source Move money starts with its original keypad presets and completes directly', async () => {
  const props = host(),
    onDemoTransfer = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <Transfer {...props} onDemoTransfer={onDemoTransfer} />,
    );
  });
  expect(value(tree)).toContain('Move between accounts');
  await act(() => press(tree, preset));
  expect(
    tree.root
      .findAllByType(TextInput)
      .find(n => n.props.accessibilityLabel === 'Amount in CZK')!.props.value,
  ).toBe('1000');
  await act(() => press(tree, 'Move money'));
  expect(value(tree)).toContain('Money moved');
  expect(value(tree)).toContain('1000.00 CZK');
  expect(onDemoTransfer).toHaveBeenCalledWith(
    expect.objectContaining({
      sourceAccountId: 'acc-1',
      destinationAccountId: 'acc-2',
      amount: 1000,
      currency: 'CZK',
      schedule: null,
    }),
  );
  await act(() => press(tree, 'Done'));
  expect(props.onBack).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});
test('Source transfer swaps roles while keeping physical account positions and the entered expression', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<Transfer {...host()} />);
  });
  await act(() => press(tree, preset));
  await act(() => press(tree, 'Swap accounts'));
  expect(
    tree.root
      .findAllByType(TextInput)
      .find(n => n.props.accessibilityLabel === 'Amount in CZK')!.props.value,
  ).toBe('1000');
  expect(
    tree.root.findAll(
      n =>
        typeof n.props.onPress === 'function' &&
        String(n.props.accessibilityLabel).startsWith(
          'To account Everyday account',
        ),
    ),
  ).not.toHaveLength(0);
  await act(() => tree.unmount());
});
