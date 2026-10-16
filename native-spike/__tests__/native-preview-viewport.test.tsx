import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, Text, View } from 'react-native';
import { DemoViewport, useDemoCanvas } from '../src/universal/DemoViewport';

test('a component preview grows in normal layout and never scales its parent fragment into an 812px page', () => {
  let canvas: ReturnType<typeof useDemoCanvas>;
  function Child() {
    canvas = useDemoCanvas();
    return <Text>Region</Text>;
  }
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <DemoViewport authoringWidth={630} fitContent>
        <Child />
      </DemoViewport>,
    );
  });
  try {
    const layout = tree.root
      .findAllByType(View)
      .find(node => typeof node.props.onLayout === 'function')!;
    expect(StyleSheet.flatten(layout.props.style)).toMatchObject({
      width: '100%',
      flexShrink: 0,
    });
    act(() =>
      layout.props.onLayout({
        nativeEvent: { layout: { width: 630, height: 72 } },
      }),
    );
    expect(canvas!).toEqual({ width: 630, height: 72, scale: 1 });
    for (const view of tree.root.findAllByType(View)) {
      expect(StyleSheet.flatten(view.props.style)?.position).not.toBe(
        'absolute',
      );
      expect(StyleSheet.flatten(view.props.style)?.height).not.toBe(812);
    }
  } finally {
    act(() => tree.unmount());
  }
});
