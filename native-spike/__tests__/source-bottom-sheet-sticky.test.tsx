import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SourceBottomSheet } from '../src/universal/SourceBottomSheet';
import { sourceColor } from '../src/universal/sourceColor';

jest.mock('../src/universal/ModalPortal', () => ({
  ModalPortal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('../src/universal/DemoViewport', () => ({
  useDemoViewport: () => ({ width: 375, height: 812 }),
}));

test('product sheet pins an opaque title and close control without covering the system bar', () => {
  const close = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <SourceBottomSheet
        title="Pictet Thematic Intelligence Fund"
        stickyHeader
        maxHeightOffsetPx={72}
        onClose={close}
      >
        <View testID="product-content" />
      </SourceBottomSheet>,
    );
  });
  const scroll = tree.root.findByType(ScrollView);
  expect(scroll.props.stickyHeaderIndices).toEqual([0]);
  expect(StyleSheet.flatten(scroll.props.style).maxHeight).toBe(740);
  const header = tree.root.findByProps({ testID: 'source-sheet-header' });
  expect(StyleSheet.flatten(header.props.style)).toMatchObject({
    paddingTop: 24,
    paddingBottom: 24,
    marginBottom: 0,
    backgroundColor: sourceColor('var(--uc-sheet-bg)', false),
  });
  act(() =>
    header
      .findAll(node => node.props.accessibilityLabel === 'Close')[0]
      .props.onPress(),
  );
  expect(close).toHaveBeenCalledTimes(1);
  act(() =>
    tree.update(
      <SourceBottomSheet title="Menu" onClose={close}>
        Menu item
      </SourceBottomSheet>,
    ),
  );
  expect(
    tree.root.findByType(ScrollView).props.stickyHeaderIndices,
  ).toBeUndefined();
  expect(
    StyleSheet.flatten(
      tree.root.findByType(ScrollView).props.contentContainerStyle,
    ).paddingTop,
  ).toBe(24);
  act(() => tree.unmount());
});
