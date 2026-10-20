import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, View } from 'react-native';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { Choice } from '../src/experiences/pi/cz/evo-2027/investments/Primitives';

test('retains the standard field icon and supports the compact calendar slot', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <BaselineTextField
        label="Account"
        value="123"
        onChange={jest.fn()}
        trailingIconName="chevron-down-wide"
      />,
    );
  });
  const icon = () => tree.root.findByType(SourceCustomIcon);
  expect(icon().props.size).toBe(20);
  expect(StyleSheet.flatten(icon().parent!.props.style)).toMatchObject({
    width: 32,
    height: 32,
  });
  act(() =>
    tree.update(
      <BaselineTextField
        label="Start date"
        value="20/10/2026"
        onChange={jest.fn()}
        trailingIconName="prime-book-appointment"
        trailingIconSize={24}
        trailingIconLayout="compact"
      />,
    ),
  );
  expect(icon().props.size).toBe(24);
  expect(StyleSheet.flatten(icon().parent!.props.style)).toMatchObject({
    width: 24,
    height: 24,
  });
  expect(
    tree.root.findAll(
      node =>
        node.props.style &&
        typeof node.props.style !== 'function' &&
        StyleSheet.flatten(node.props.style).paddingRight === 32,
    ),
  ).not.toHaveLength(0);
  act(() => tree.unmount());
});

test('composes original artwork in the existing field and radio slots without replacing controls', () => {
  const select = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <BaselineTextField
        label="Cash Account"
        value="123"
        onChange={jest.fn()}
        helperText="Primary Account"
        trailingIcon={<View testID="original-chevron" />}
        selectionControl={{ expanded: false, onPress: select }}
      />,
    );
  });
  const artwork = tree.root.findByProps({ testID: 'original-chevron' });
  expect(StyleSheet.flatten(artwork.parent!.props.style)).toMatchObject({
    width: 32,
    height: 32,
  });
  const button = tree.root.findAll(
    node =>
      node.props.accessibilityRole === 'button' &&
      typeof node.props.onPress === 'function',
  )[0];
  expect(button.props.accessibilityState.expanded).toBe(false);
  act(() => button.props.onPress());
  expect(select).toHaveBeenCalledTimes(1);
  act(() =>
    tree.update(
      <Choice
        title="Invest once"
        selected
        variant="radio"
        onPress={select}
        radioIcon={<View testID="original-radio" />}
        style={{ gap: 8 }}
      />,
    ),
  );
  expect(tree.root.findByProps({ testID: 'original-radio' })).toBeDefined();
  const choice = tree.root.findAll(
    node => node.props.accessibilityRole === 'radio',
  )[0];
  expect(StyleSheet.flatten(choice.props.style).gap).toBe(8);
  expect(choice.props.accessibilityState.checked).toBe(true);
  act(() => tree.unmount());
});
