import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { BaselineStatusTag } from '../src/universal/BaselineStatusTag';
import { sourceColor } from '../src/universal/sourceColor';

const render = (element: React.ReactElement) => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(element);
  });
  return tree;
};

test('a tag takes its text color from the tone and tints the fill', () => {
  const tree = render(<BaselineStatusTag label="Active" tone="positive" />);
  const text = tree.root.findAll(
    n => n.props.children === 'Active' && n.props.style,
  )[0];
  expect(StyleSheet.flatten(text.props.style)).toMatchObject({
    fontSize: 12,
    fontFamily: 'UniCredit-bold',
    color: sourceColor('var(--uc-green-status)', false),
  });
  const root = tree.root.findByProps({ accessibilityLabel: 'Active' });
  expect(StyleSheet.flatten(root.props.style).backgroundColor).toMatch(
    /^rgba\(53,159,66,0\.12\)$/,
  );
});

test('a neutral tag sits on the muted surface and the dot can be hidden', () => {
  const tree = render(
    <BaselineStatusTag label="Not verified" tone="neutral" dot={false} dark />,
  );
  const root = tree.root.findByProps({ accessibilityLabel: 'Not verified' });
  expect(StyleSheet.flatten(root.props.style).backgroundColor).toBe(
    sourceColor('var(--uc-surface-muted)', true),
  );
});
