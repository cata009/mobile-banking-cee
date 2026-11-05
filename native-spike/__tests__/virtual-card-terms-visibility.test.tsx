import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { VirtualCardTermsSheet } from '../src/experiences/pi/current/baseline/virtual-card/VirtualCardTermsSheet';
import { PrimaryButton } from '../src/universal/PrimaryButton';

test('confirmation stays visible and unlocks only after the document is read', () => {
  const confirm = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <VirtualCardTermsSheet
        onClose={() => {}}
        onConfirm={confirm}
        screenTopInset={54}
        dark={false}
      />,
    );
  });
  const button = () =>
    tree.root
      .findAllByType(PrimaryButton)
      .find(node => node.props.label === 'I have read it')!;
  expect(button()).toBeDefined();
  expect(button().props.disabled).toBe(true);
  const document = tree.root.findByProps({
    testID: 'ro-virtual-card-terms-scroll',
  });
  act(() =>
    document.props.onScroll({
      nativeEvent: {
        contentOffset: { y: 0 },
        layoutMeasurement: { height: 200 },
        contentSize: { height: 600 },
      },
    }),
  );
  expect(button().props.disabled).toBe(true);
  act(() =>
    document.props.onScroll({
      nativeEvent: {
        contentOffset: { y: 400 },
        layoutMeasurement: { height: 200 },
        contentSize: { height: 600 },
      },
    }),
  );
  expect(button().props.disabled).toBe(false);
  act(() => button().props.onPress());
  expect(confirm).toHaveBeenCalledTimes(1);
  act(() => tree.unmount());
});
