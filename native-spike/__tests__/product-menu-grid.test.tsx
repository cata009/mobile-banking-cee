import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import {
  BaselineProductMenuCard,
  BaselineProductMenuGrid,
} from '../src/universal/BaselineProductMenuCard';

const render = (element: React.ReactElement) => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(element);
  });
  return tree;
};
const card = (id: string) => (
  <BaselineProductMenuCard
    key={id}
    card={{ id, title: id, background: 'var(--uc-brand)' }}
  />
);
const rowsOf = (tree: Renderer.ReactTestRenderer) =>
  tree.root.findAll(
    n =>
      (n.type as unknown) === 'View' && n.props.testID === 'product-menu-grid-row',
  );
const measure = (tree: Renderer.ReactTestRenderer, width: number) => {
  const root = tree.root.findAll(n => typeof n.props.onLayout === 'function')[0];
  act(() => root.props.onLayout({ nativeEvent: { layout: { width } } }));
};

test('a card fills the width it is given, it has no pixel width of its own', () => {
  const tree = render(card('cards'));
  const pressable = tree.root.findByProps({ accessibilityRole: 'button' });
  expect(StyleSheet.flatten(pressable.props.style).width).toBe('100%');
});

test('two columns on a phone, more on a wide foldable', () => {
  const items = ['a', 'b', 'c', 'd', 'e'].map(card);
  const tree = render(<BaselineProductMenuGrid>{items}</BaselineProductMenuGrid>);
  measure(tree, 327);
  expect(rowsOf(tree)).toHaveLength(3);
  measure(tree, 700);
  expect(rowsOf(tree)).toHaveLength(2);
});

test('forcing one column gives full-width cards', () => {
  const tree = render(
    <BaselineProductMenuGrid columns={1}>
      {['a', 'b'].map(card)}
    </BaselineProductMenuGrid>,
  );
  measure(tree, 700);
  expect(rowsOf(tree)).toHaveLength(2);
});
