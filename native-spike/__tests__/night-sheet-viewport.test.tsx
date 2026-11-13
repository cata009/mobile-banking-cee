import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SourceBottomSheet } from '../src/universal/SourceBottomSheet';

let mockHeight = 640;
jest.mock('../src/universal/ModalPortal', () => ({
  ModalPortal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('../src/universal/DemoViewport', () => ({
  useDemoViewport: () => ({ width: 360, height: mockHeight }),
}));

test('long sheet reserves the measured footer across viewport changes', () => {
  const close = jest.fn();
  const sheet = () => (
    <SourceBottomSheet title="Options" onClose={close} stickyHeader fixedHeight footer={<View testID="action" />}>
      <TextInput testID="search" />
      <View style={{ height: 1000 }} />
    </SourceBottomSheet>
  );
  let tree!: Renderer.ReactTestRenderer;
  act(() => { tree = Renderer.create(sheet()); });
  const footer = tree.root.findByProps({ testID: 'action' }).parent!;
  expect(typeof footer.props.onLayout).toBe('function');
  act(() => footer.props.onLayout({ nativeEvent: { layout: { height: 200, width: 360, x: 0, y: 0 } } }));
  const scroll = () => tree.root.findByType(ScrollView);
  expect(StyleSheet.flatten(scroll().props.style).maxHeight).toBe(386);
  expect(scroll().props.stickyHeaderIndices).toEqual([0]);
  expect(scroll().props.keyboardShouldPersistTaps).toBe('handled');
  expect(tree.root.findByProps({ testID: 'search' })).toBeTruthy();
  mockHeight = 360;
  act(() => tree.update(sheet()));
  expect(StyleSheet.flatten(scroll().props.style)).toMatchObject({ maxHeight: 106, height: 106 });
  mockHeight = 300; // Simulate a viewport resized by the software keyboard.
  act(() => tree.update(sheet()));
  expect(StyleSheet.flatten(scroll().props.style).maxHeight).toBe(46);
  act(() => tree.root.findAllByProps({ accessibilityLabel: 'Close' })[0].props.onPress());
  expect(close).toHaveBeenCalledTimes(1);
  act(() => tree.unmount());
  mockHeight = 640;
});
