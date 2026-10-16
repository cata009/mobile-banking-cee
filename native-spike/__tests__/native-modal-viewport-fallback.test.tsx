import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import * as Native from 'react-native';
import { ModalPortal } from '../src/universal/ModalPortal';
import { DemoViewport, useDemoViewport } from '../src/universal/DemoViewport';

const windowDP = { width: 392, height: 800, scale: 2.75, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    width: 392,
    height: 800,
    scale: 2.75,
    fontScale: 1,
  })),
}));

function modalStyle(tree: Renderer.ReactTestRenderer) {
  const modal = tree.root.findByType(Native.Modal);
  return modal
    .findAllByType(Native.View)
    .map(node => Native.StyleSheet.flatten(node.props.style))
    .find(
      style =>
        style?.transformOrigin === 'top left' && style.width !== undefined,
    )!;
}

test('a selector modal outside an authored viewport uses window DP and identity instead of density', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <ModalPortal visible>
        <Native.Text>Version</Native.Text>
      </ModalPortal>,
    );
  });
  try {
    expect(modalStyle(tree)).toMatchObject({
      width: 392,
      height: 800,
      transform: [{ scale: 1 }],
    });
  } finally {
    act(() => tree.unmount());
  }
});

test('a modal inside DemoViewport retains authored dimensions and applies its scale once', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <DemoViewport>
        <ModalPortal visible>
          <Native.Text>Sheet</Native.Text>
        </ModalPortal>
      </DemoViewport>,
    );
  });
  try {
    expect(modalStyle(tree)).toMatchObject({
      width: 375,
      height: 812,
      transform: [{ scale: 1 }],
    });
    const viewport = tree.root
      .findByType(DemoViewport)
      .findAllByType(Native.View)
      .find(node => typeof node.props.onLayout === 'function')!;
    act(() =>
      viewport.props.onLayout({
        nativeEvent: { layout: { width: 750, height: 1400 } },
      }),
    );
    expect(modalStyle(tree)).toMatchObject({
      width: 375,
      height: 700,
      transform: [{ scale: 2 }],
    });
  } finally {
    act(() => tree.unmount());
  }
});

test('the established useDemoViewport fallback still exposes window density to its existing consumers', () => {
  let value: ReturnType<typeof useDemoViewport> | undefined;
  function Probe() {
    value = useDemoViewport();
    return null;
  }
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<Probe />);
  });
  try {
    expect(value).toEqual(windowDP);
  } finally {
    act(() => tree.unmount());
  }
});
