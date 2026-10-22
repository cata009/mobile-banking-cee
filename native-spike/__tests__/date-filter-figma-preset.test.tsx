import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, View } from 'react-native';
import { BaselineInvestmentPeriodChips } from '../src/universal/BaselineInvestmentPeriodChips';
import { Text } from '../src/universal/Typography';

const trees: Renderer.ReactTestRenderer[] = [];
afterEach(() => {
  for (const tree of trees.splice(0)) act(() => tree.unmount());
});
function render(node: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(node);
  });
  trees.push(tree);
  return tree;
}
function choices(root: Renderer.ReactTestInstance) {
  return root.findAll(
    n =>
      n.props.accessibilityRole === 'button' &&
      typeof n.props.onPress === 'function',
  );
}

describe('Date filter source preset290:14520', () => {
  it('renders the five source options in the original fixed geometry', () => {
    const periods = ['1 M', '3 M', '1 Y', '3 Y', 'MAX'].map((label, index) => ({
      id: String(index),
      label,
    }));
    const tree = render(
      <BaselineInvestmentPeriodChips
        preset="figma"
        periods={periods}
        selectedPeriodId="3"
        onChange={jest.fn()}
      />,
    );
    const rail = tree.root
      .findAllByType(View)
      .find(n => n.props.role === 'group')!;
    expect(StyleSheet.flatten(rail.props.style)).toMatchObject({
      width: 238,
      height: 24,
      gap: 15,
      paddingHorizontal: 1,
      paddingVertical: 1,
      justifyContent: 'flex-start',
    });
    expect(choices(tree.root).map(n => n.props.accessibilityLabel)).toEqual(
      periods.map(p => p.label),
    );
    for (const choice of choices(tree.root)) {
      expect(StyleSheet.flatten(choice.props.style)).toMatchObject({
        width: 35,
        height: 22,
        borderRadius: 3.5,
      });
      expect(
        StyleSheet.flatten(choice.findByType(Text).props.style),
      ).toMatchObject({
        fontFamily: 'UniCredit-bold',
        fontSize: 14,
        lineHeight: 15,
      });
    }
  });

  it('centers four source options and distinguishes repeated labels by their supplied IDs', () => {
    const periods = ['0 Y', '1 Y', '3 Y', '3 Y'].map((label, index) => ({
      id: String(index),
      label,
    }));
    const onChange = jest.fn();
    const tree = render(
      <BaselineInvestmentPeriodChips
        preset="figma"
        periods={periods}
        selectedPeriodId="2"
        onChange={onChange}
      />,
    );
    const rail = tree.root
      .findAllByType(View)
      .find(n => n.props.role === 'group')!;
    expect(StyleSheet.flatten(rail.props.style)).toMatchObject({
      width: 238,
      justifyContent: 'center',
    });
    const buttons = choices(tree.root);
    expect(buttons.map(n => n.props.accessibilityState.selected)).toEqual([
      false,
      false,
      true,
      false,
    ]);
    act(() => buttons[3]!.props.onPress());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('3');
    expect(buttons[2]!.props.accessibilityState.selected).toBe(true);
  });
});
