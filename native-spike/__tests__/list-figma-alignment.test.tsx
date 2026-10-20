import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, View } from 'react-native';
import type { AccountTransaction } from '@/data/accountDetails';
import { BaselineTransactionRow } from '../src/universal/BaselineTransactionRow';

const transaction: AccountTransaction = {
  id: 'list-pending',
  day: '1',
  month: 'OCT',
  monthKey: '2026-10',
  monthTitle: 'October',
  label: 'Transaction details',
  amount: -498,
  type: 'debit',
  category: 'Transfers',
  pfmCategory: 'Transfers',
  pfmSubcategory: 'Transfer',
  status: 'Pending',
  source: 'account',
};

test('Native read-only transaction does not expose a nonfunctional button', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <BaselineTransactionRow
        transaction={transaction}
        formattedAmount="498.00"
        currency="RON"
        leadingVisual={<View />}
      />,
    );
  });
  expect(
    tree.root.findAll(n => n.props.accessibilityRole === 'button'),
  ).toHaveLength(0);
  expect(JSON.stringify(tree.toJSON())).toContain('Transaction details');
  act(() => tree.unmount());
});

test('Native pending List row uses the source 80px shell and a 32px status line', () => {
  const onPress = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <BaselineTransactionRow
        transaction={transaction}
        formattedAmount="498.00"
        currency="RON"
        leadingVisual={<View />}
        onPress={onPress}
      />,
    );
  });
  const root = tree.root.findAll(
    n =>
      n.props.accessibilityRole === 'button' &&
      typeof n.props.onPress === 'function',
  )[0]!;
  expect(StyleSheet.flatten(root.props.style)).toMatchObject({
    minHeight: 80,
    paddingVertical: 2,
  });
  expect(StyleSheet.flatten(root.props.style).height).toBeUndefined();
  const status = tree.root.findAll(
    n => StyleSheet.flatten(n.props.style)?.gap === 7,
  )[0];
  expect(StyleSheet.flatten(status?.props.style)).toMatchObject({ height: 32 });
  act(() => {
    root.props.onPress();
  });
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(onPress).toHaveBeenCalledWith(transaction);
  act(() => tree.unmount());
});

test('Evo pending row keeps its separate experience sizing', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <BaselineTransactionRow
        transaction={transaction}
        formattedAmount="498.00"
        currency="RON"
        evo2027
        leadingVisual={<View />}
        onPress={() => {}}
      />,
    );
  });
  const root = tree.root.findAll(
    n =>
      n.props.accessibilityRole === 'button' &&
      typeof n.props.onPress === 'function',
  )[0]!;
  expect(StyleSheet.flatten(root.props.style)).toMatchObject({
    minHeight: 92,
    paddingVertical: 16,
  });
  expect(StyleSheet.flatten(root.props.style).height).toBeUndefined();
  act(() => tree.unmount());
});
