import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { BaselineBanner } from '../src/universal/BaselineBanner';
import { BaselineInvestmentPeriodChips } from '../src/universal/BaselineInvestmentPeriodChips';

test('info banners keep their default dimensions and accept the source goal presentation', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <BaselineBanner
        variant="info"
        title="Ready"
        description="Add money to invest."
      />,
    );
  });
  const root = () => tree.toJSON() as Renderer.ReactTestRendererJSON;
  expect(StyleSheet.flatten(root().props.style).width).toBe(327);
  act(() =>
    tree.update(
      <BaselineBanner
        variant="info"
        title="Ready"
        description="Add money to invest."
        presentation={{ width: '100%', bodyLineHeight: 22 }}
      />,
    ),
  );
  expect(StyleSheet.flatten(root().props.style).width).toBe('100%');
  const description = tree.root.findAll(
    node => node.props.children === 'Add money to invest.' && node.props.style,
  )[0];
  expect(StyleSheet.flatten(description.props.style).lineHeight).toBe(22);
  act(() => tree.unmount());
});

test('goal period ink adapts inside the existing comfortable control and retains selection', () => {
  const select = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <BaselineInvestmentPeriodChips
        periods={[
          { id: '3y', label: '3 Y' },
          { id: 'all', label: 'MAX' },
        ]}
        selectedPeriodId="3y"
        onChange={select}
        comfortableTouchTargets
        inkStyle={{ width: 40, height: 24 }}
        labelStyle={{ letterSpacing: 0.4 }}
      />,
    );
  });
  const button = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'MAX' &&
      typeof node.props.onPress === 'function',
  )[0];
  const ink = button.findAll(
    node =>
      node.props.style &&
      typeof node.props.style !== 'function' &&
      StyleSheet.flatten(node.props.style).height === 24,
  )[0];
  expect(StyleSheet.flatten(ink.props.style)).toMatchObject({
    width: 40,
    height: 24,
  });
  const label = ink.findAll(
    node => node.props.children === 'MAX' && node.props.style,
  )[0];
  expect(StyleSheet.flatten(label.props.style).letterSpacing).toBe(0.4);
  expect(button.props.accessibilityState.selected).toBe(false);
  act(() => button.props.onPress());
  expect(select).toHaveBeenCalledWith('all');
  act(() => tree.unmount());
});
