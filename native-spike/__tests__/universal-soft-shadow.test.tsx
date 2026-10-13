import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Platform } from 'react-native';
import Svg, { G, Mask, Rect } from 'react-native-svg';
import { SoftShadow } from '../src/universal/SoftShadow';

const props = {
  width: 172,
  height: 72,
  radius: 120,
  offsetY: 11,
  blur: 17,
  color: '#262626',
  opacity: 0.36,
};
const originalOS = Platform.OS;
afterEach(() => {
  Platform.OS = originalOS;
});

test('Android shadow has a smooth 17-unit Gaussian falloff and enough bounds for the 11-unit offset', async () => {
  Platform.OS = 'android';
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<SoftShadow {...props} />);
  });
  const svg = tree.root.findByType(Svg);
  expect(svg.props.width).toBe(224);
  expect(svg.props.height).toBe(135);
  expect(svg.props.pointerEvents).toBe('none');
  const knockout = tree.root.findByType(Mask).findAllByType(Rect)[1];
  expect(knockout.props).toMatchObject({
    x: 26,
    y: 26,
    width: 172,
    height: 72,
    rx: 36,
    fill: '#000',
  });
  const layers = tree.root
    .findByType(G)
    .findAllByType(Rect)
    .filter(layer => layer.props.fill === props.color);
  expect(layers.length).toBeGreaterThan(50);
  let opacity = 0;
  layers.forEach(layer => {
    expect(layer.props.y).toBeGreaterThanOrEqual(0);
    expect(layer.props.y + layer.props.height).toBeLessThanOrEqual(135);
    expect(layer.props.fillOpacity).toBeGreaterThan(0);
    expect(layer.props.fillOpacity).toBeLessThan(0.02);
    opacity += (1 - opacity) * layer.props.fillOpacity;
  });
  expect(opacity).toBeCloseTo(0.359514, 5);
  const outermost = layers[0];
  expect(outermost.props.fillOpacity).toBeLessThan(0.0005);
  await act(() => tree.unmount());
});

test('negative offsets keep the original knockout and all visible contours inside the canvas', async () => {
  Platform.OS = 'android';
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <SoftShadow
        {...props}
        width={90}
        height={40}
        radius={8}
        offsetY={-12}
        blur={8}
      />,
    );
  });
  const svg = tree.root.findByType(Svg);
  expect(svg.props.height).toBe(76);
  const knockout = tree.root.findByType(Mask).findAllByType(Rect)[1];
  expect(knockout.props).toMatchObject({
    x: 12,
    y: 24,
    width: 90,
    height: 40,
    rx: 8,
  });
  tree.root
    .findByType(G)
    .findAllByType(Rect)
    .forEach(layer => {
      expect(layer.props.y).toBeGreaterThanOrEqual(0);
      expect(layer.props.y + layer.props.height).toBeLessThanOrEqual(76);
    });
  await act(() => tree.unmount());
});

test.each(['web', 'ios'] as const)(
  '%s keeps its platform CSS shadow without a duplicate SVG decoration',
  async os => {
    Platform.OS = os;
    let tree!: Renderer.ReactTestRenderer;
    await act(() => {
      tree = Renderer.create(<SoftShadow {...props} />);
    });
    expect(tree.toJSON()).toBeNull();
    await act(() => tree.unmount());
  },
);
