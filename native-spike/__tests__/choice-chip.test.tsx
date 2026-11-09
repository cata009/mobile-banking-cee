import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import {
  BaselineChoiceChip,
  BaselineChoiceChips,
} from '../src/universal/BaselineChoiceChip';
import { sourceColor } from '../src/universal/sourceColor';

const render = (element: React.ReactElement) => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(element);
  });
  return tree;
};

test('the chosen chip is filled with the action color and has white text', () => {
  const tree = render(<BaselineChoiceChip label="12 months" selected />);
  const chip = tree.root.findByProps({ accessibilityRole: 'button' });
  expect(chip.props.accessibilityState).toEqual({ selected: true });
  expect(StyleSheet.flatten(chip.props.style)).toMatchObject({
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: sourceColor('var(--uc-action)', false),
  });
  const text = tree.root.findAll(
    n => n.props.children === '12 months' && n.props.style,
  )[0];
  expect(StyleSheet.flatten(text.props.style)).toMatchObject({
    fontSize: 14,
    fontFamily: 'UniCredit-bold',
    color: sourceColor('var(--uc-static-white)', false),
  });
});

test('an unchosen chip sits on the soft neutral fill with normal text', () => {
  const tree = render(<BaselineChoiceChip label="6 months" dark />);
  const chip = tree.root.findByProps({ accessibilityRole: 'button' });
  expect(StyleSheet.flatten(chip.props.style)).toMatchObject({
    borderWidth: 0,
    backgroundColor: sourceColor('var(--uc-neutral-100)', true),
  });
});

test('the row reports the pressed value and marks only the chosen chip', () => {
  const onChange = jest.fn();
  const tree = render(
    <BaselineChoiceChips
      items={[
        { value: 1, label: '1' },
        { value: 2, label: '2' },
      ]}
      value={2}
      onChange={onChange}
    />,
  );
  const chips = tree.root
    .findAllByProps({ accessibilityRole: 'button' })
    .filter(n => typeof n.props.onPress === 'function');
  expect(chips.map(c => c.props.accessibilityState.selected)).toEqual([
    false,
    true,
  ]);
  act(() => chips[0].props.onPress());
  expect(onChange).toHaveBeenCalledWith(1);
});
