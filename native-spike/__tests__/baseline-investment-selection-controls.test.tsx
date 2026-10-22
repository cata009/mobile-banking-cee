import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BaselineInvestmentPeriodChips } from '../src/universal/BaselineInvestmentPeriodChips';
import { BaselineInvestmentFilterChips } from '../src/universal/BaselineInvestmentFilterChips';
import { Text } from '../src/universal/Typography';
import { sourceColor } from '../src/universal/sourceColor';

describe('dedicated investment selection primitives', () => {
  it('keeps period selection controlled and labels each choice', () => {
    const onChange = jest.fn();
    const periods = [
      { id: '1m', label: '1 M' },
      { id: '1y', label: '1 Y' },
    ] as const;
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineInvestmentPeriodChips
          periods={periods}
          selectedPeriodId="1m"
          onChange={onChange}
        />,
      );
    });
    const buttons = tree.root.findAll(
      n =>
        n.props.accessibilityRole === 'button' &&
        typeof n.props.onPress === 'function',
    );
    expect(buttons.map(n => n.props.accessibilityLabel)).toEqual([
      '1 M',
      '1 Y',
    ]);
    expect(buttons.map(n => n.props.accessibilityState)).toEqual([
      { selected: true },
      { selected: false },
    ]);
    act(() => buttons[1]!.props.onPress());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('1y');
    expect(buttons[1]!.props['aria-pressed']).toBe(false);
    act(() => {
      tree.update(
        <BaselineInvestmentPeriodChips
          periods={periods}
          selectedPeriodId="1y"
          onChange={onChange}
          ariaLabel="Perioada de performanță"
        />,
      );
    });
    expect(
      tree.root.findAll(
        n =>
          n.props.accessibilityRole === 'button' &&
          typeof n.props.onPress === 'function',
      )[1]!.props['aria-pressed'],
    ).toBe(true);
    const group = tree.root
      .findAllByType(View)
      .find(n => n.props.role === 'group')!;
    expect(group.props.accessibilityLabel).toBe('Perioada de performanță');
    expect(group.props.accessible).toBe(false);
    act(() => tree.unmount());
  });

  it('preserves period ink, optional larger targets, UniCredit typography and soft unselected colors', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineInvestmentPeriodChips
          periods={[{ id: '1m', label: '1 M' }]}
          selectedPeriodId="1y"
          onChange={jest.fn()}
          softUnselected
          comfortableTouchTargets
          dark
        />,
      );
    });
    const button = tree.root.find(
      n =>
        n.props.accessibilityRole === 'button' &&
        typeof n.props.onPress === 'function',
    );
    expect(StyleSheet.flatten(button.props.style)).toMatchObject({
      height: 40,
      minWidth: 40,
    });
    const ink = button
      .findAllByType(View)
      .find(n => StyleSheet.flatten(n.props.style)?.height === 21)!;
    expect(StyleSheet.flatten(ink.props.style)).toMatchObject({
      minWidth: 35,
      borderRadius: 3.5,
      paddingHorizontal: 8,
      backgroundColor: sourceColor('var(--uc-neutral-100)', true),
    });
    expect(
      StyleSheet.flatten(tree.root.findByType(Text).props.style),
    ).toMatchObject({
      fontFamily: 'UniCredit-bold',
      fontSize: 14,
      lineHeight: 15,
    });
    act(() => tree.unmount());
  });

  it('renders caller-provided sorting options without changing their policy or selected value', () => {
    const onChange = jest.fn();
    const options = [
      { id: 'max-value', label: 'MAX VALUE' },
      { id: 'min-value', label: 'MIN VALUE' },
    ] as const;
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineInvestmentFilterChips
          options={options}
          selectedOptionId="max-value"
          onChange={onChange}
          ariaLabel="Sortarea investițiilor"
        />,
      );
    });
    const scroll = tree.root.findByType(ScrollView);
    expect(scroll.props.horizontal).toBe(true);
    expect(scroll.props.accessibilityLabel).toBe('Sortarea investițiilor');
    expect(scroll.props.accessible).toBe(false);
    const buttons = tree.root.findAll(
      n =>
        n.props.accessibilityRole === 'button' &&
        typeof n.props.onPress === 'function',
    );
    expect(buttons.map(n => n.props.accessibilityLabel)).toEqual([
      'MAX VALUE',
      'MIN VALUE',
    ]);
    expect(buttons[0]!.props.accessibilityState).toEqual({ selected: true });
    expect(StyleSheet.flatten(buttons[0]!.props.style)).toMatchObject({
      height: 24,
      borderRadius: 14.5,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: sourceColor('var(--uc-text)'),
    });
    act(() => buttons[1]!.props.onPress());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('min-value');
    expect(buttons[1]!.props['aria-pressed']).toBe(false);
    act(() => {
      tree.update(
        <BaselineInvestmentFilterChips
          options={options}
          selectedOptionId="min-value"
          onChange={onChange}
          dark
        />,
      );
    });
    const updated = tree.root.findAll(
      n =>
        n.props.accessibilityRole === 'button' &&
        typeof n.props.onPress === 'function',
    );
    expect(updated[1]!.props.accessibilityState).toEqual({ selected: true });
    expect(StyleSheet.flatten(updated[1]!.props.style).backgroundColor).toBe(
      sourceColor('var(--uc-text)', true),
    );
    act(() => tree.unmount());
  });
});
