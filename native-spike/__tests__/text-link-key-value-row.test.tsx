import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { BaselineKeyValueRow } from '../src/universal/BaselineKeyValueRow';
import { BaselineTextLink } from '../src/universal/BaselineTextLink';
import { sourceColor } from '../src/universal/sourceColor';

const render = (element: React.ReactElement) => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(element);
  });
  return tree;
};

test('text link is a link in the action color with a 44 px target, and fires on press', () => {
  const onPress = jest.fn();
  const tree = render(<BaselineTextLink label="Edit" onPress={onPress} />);
  const link = tree.root.findByProps({ accessibilityRole: 'link' });
  expect(link.props.accessibilityLabel).toBe('Edit');
  const style = StyleSheet.flatten(link.props.style({ pressed: false }));
  expect(style.minHeight).toBe(44);
  const text = tree.root.findAll(
    n => n.props.children === 'Edit' && n.props.style,
  )[0];
  expect(StyleSheet.flatten(text.props.style).color).toBe(
    sourceColor('var(--uc-action)', false),
  );
  act(() => link.props.onPress());
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('text link follows the dark palette and ignores presses when disabled', () => {
  const onPress = jest.fn();
  const tree = render(
    <BaselineTextLink label="Cancel" onPress={onPress} disabled dark />,
  );
  const link = tree.root.findByProps({ accessibilityRole: 'link' });
  expect(link.props.accessibilityState).toEqual({ disabled: true });
  expect(link.props.disabled).toBe(true);
  const text = tree.root.findAll(
    n => n.props.children === 'Cancel' && n.props.style,
  )[0];
  expect(StyleSheet.flatten(text.props.style).color).toBe(
    sourceColor('var(--uc-action)', true),
  );
});

test('key-value row shows the muted label and the bold value, 24 px when emphasized', () => {
  const tree = render(
    <BaselineKeyValueRow
      label="New limit"
      value="9,000"
      emphasis
      paddingVertical={0}
      divider={false}
    />,
  );
  const label = tree.root.findAll(
    n => n.props.children === 'New limit' && n.props.style,
  )[0];
  const value = tree.root.findAll(
    n => n.props.children === '9,000' && n.props.style,
  )[0];
  expect(StyleSheet.flatten(label.props.style).color).toBe(
    sourceColor('var(--uc-text-muted)', false),
  );
  expect(StyleSheet.flatten(value.props.style)).toMatchObject({
    fontSize: 24,
    fontFamily: 'UniCredit-bold',
    color: sourceColor('var(--uc-text)', false),
  });
});

test('stacked key-value row uppercases the label above the value', () => {
  const tree = render(
    <BaselineKeyValueRow label="City" value="Belgrade" layout="stacked" />,
  );
  const label = tree.root.findAll(
    n => n.props.children === 'City' && n.props.style,
  )[0];
  expect(StyleSheet.flatten(label.props.style)).toMatchObject({
    textTransform: 'uppercase',
    fontFamily: 'UniCredit-bold',
  });
});
