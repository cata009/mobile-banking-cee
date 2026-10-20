import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, TextInput } from 'react-native';
import { FormField } from '../src/universal/FormField';
import { mobileFirstTokens } from '../src/universal/tokens';

test('shared fields focus with a teal underline and preserve caller focus handlers', () => {
  const onFocus = jest.fn(),
    onBlur = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <FormField
        tokens={mobileFirstTokens}
        label="Amount"
        value="50"
        onChange={jest.fn()}
        inputProps={{ onFocus, onBlur }}
      />,
    );
  });
  const input = () => tree.root.findByType(TextInput);
  act(() => input().props.onFocus({ nativeEvent: {} }));
  expect(StyleSheet.flatten(input().props.style)).toMatchObject({
    borderBottomWidth: 2,
    borderColor: mobileFirstTokens.accent,
  });
  expect(onFocus).toHaveBeenCalledTimes(1);
  act(() => input().props.onBlur({ nativeEvent: {} }));
  expect(StyleSheet.flatten(input().props.style)).toMatchObject({
    borderBottomWidth: 1,
    borderColor: mobileFirstTokens.border,
  });
  expect(onBlur).toHaveBeenCalledTimes(1);
  act(() => tree.unmount());
});

test('validation errors retain their underline color while focused', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <FormField
        tokens={mobileFirstTokens}
        label="Amount"
        value=""
        error="Required"
        onChange={jest.fn()}
      />,
    );
  });
  const input = () => tree.root.findByType(TextInput);
  act(() => input().props.onFocus({ nativeEvent: {} }));
  expect(StyleSheet.flatten(input().props.style)).toMatchObject({
    borderBottomWidth: 2,
    borderColor: '#e2001a',
  });
  act(() => tree.unmount());
});
