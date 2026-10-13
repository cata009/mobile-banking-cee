import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  Text as NativeText,
  TextInput as NativeTextInput,
  StyleSheet,
} from 'react-native';
import {
  TypographyProvider,
  Text,
  TextInput,
} from '../src/universal/Typography';

test('profile enlargement updates explicit glyph sizes and baselines without changing box dimensions', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <TypographyProvider scale={1.125}>
        <Text style={{ fontSize: 16, lineHeight: 24, height: 40 }}>
          Titolo<Text> ereditato</Text>
        </Text>
        <TextInput
          style={{ fontSize: 18, lineHeight: 24, minHeight: 56 }}
          value="12,5"
        />
      </TypographyProvider>,
    );
  });
  const labels = tree.root.findAllByType(NativeText);
  expect(StyleSheet.flatten(labels[0]!.props.style)).toEqual({
    fontSize: 18,
    lineHeight: 27,
    height: 40,
  });
  expect(StyleSheet.flatten(labels[1]!.props.style)).toEqual({});
  expect(
    StyleSheet.flatten(tree.root.findByType(NativeTextInput).props.style),
  ).toEqual({ fontSize: 20.25, lineHeight: 27, minHeight: 56 });
  await act(() => {
    tree.update(
      <TypographyProvider scale={1}>
        <Text style={{ fontSize: 16, lineHeight: 24 }}>Titolo</Text>
      </TypographyProvider>,
    );
  });
  expect(
    StyleSheet.flatten(tree.root.findByType(NativeText).props.style),
  ).toEqual({ fontSize: 16, lineHeight: 24 });
});

test('explicit nested font sizes scale once and native accessibility font scaling remains enabled', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <TypographyProvider scale={1.125}>
        <Text style={{ fontSize: 24 }}>
          <Text style={{ fontSize: 12 }}>00</Text>
        </Text>
      </TypographyProvider>,
    );
  });
  const inner = tree.root.findAllByType(NativeText)[1]!;
  expect(StyleSheet.flatten(inner.props.style).fontSize).toBe(13.5);
  expect(inner.props.allowFontScaling).not.toBe(false);
});
