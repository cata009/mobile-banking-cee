import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { BaselinePillSorting } from '../src/universal/BaselinePill';
import { BaselineInvestmentFilterChips } from '../src/universal/BaselineInvestmentFilterChips';
import { BaselineInvestmentPeriodChips } from '../src/universal/BaselineInvestmentPeriodChips';
import { PeriodChips } from '../src/experiences/pi/cz/evo-2027/investments/PeriodChips';
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
function controls(root: Renderer.ReactTestInstance) {
  return root.findAll(
    n =>
      n.props.accessibilityRole === 'button' &&
      typeof n.props.onPress === 'function',
  );
}

describe('canonical investment renderers', () => {
  it('preserves the existing standalone sorting default and explicit null selection', () => {
    const tree = render(<BaselinePillSorting />);
    const selected = controls(tree.root).filter(
      n => n.props.accessibilityState.selected,
    );
    expect(selected).toHaveLength(1);
    expect(selected[0]!.props.accessibilityLabel).toBe('MAX %');
    expect(
      StyleSheet.flatten(selected[0]!.findByType(Text).props.style),
    ).toMatchObject({
      fontFamily: 'UniCredit-bold',
      fontSize: 14,
      lineHeight: 15,
    });
    act(() => tree.update(<BaselinePillSorting selectedValue={null} />));
    expect(
      controls(tree.root).some(n => n.props.accessibilityState.selected),
    ).toBe(false);
  });

  it('keeps InvestmentFilterChips as an API adapter over BaselinePillSorting', () => {
    const options = [
      { id: 'custom-first', label: 'First' },
      { id: 'custom-second', label: 'Second' },
    ] as const;
    const onChange = jest.fn();
    const tree = render(
      <BaselineInvestmentFilterChips
        options={options}
        selectedOptionId="custom-first"
        onChange={onChange}
      />,
    );
    const canonical = tree.root.findByType(BaselinePillSorting);
    expect(canonical.props.options).toEqual(
      options.map(({ id, label }) => ({ value: id, label })),
    );
    act(() => controls(canonical)[1]!.props.onPress());
    expect(onChange).toHaveBeenCalledWith('custom-second');
  });

  it.each([false, true])(
    'keeps Evo period API and delegates its renderer, comfortable=%s',
    comfortable => {
      const onChange = jest.fn();
      const tree = render(
        <PeriodChips
          items={[
            { id: '1m', label: '1 M' },
            { id: '3y', label: '3 Y' },
          ]}
          value="1m"
          onChange={onChange}
          comfortable={comfortable}
        />,
      );
      const canonical = tree.root.findByType(BaselineInvestmentPeriodChips);
      expect(canonical.props.comfortableTouchTargets).toBe(comfortable);
      expect(canonical.props.wrapInk).toBe(true);
      expect(StyleSheet.flatten(canonical.props.style)).toMatchObject({
        marginTop: 12,
      });
      const choices = controls(canonical);
      act(() => choices[1]!.props.onPress());
      expect(onChange).toHaveBeenCalledWith('3y');
      expect(choices[0]!.props.accessibilityState.selected).toBe(true);
    },
  );
});
