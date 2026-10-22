import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, View } from 'react-native';
import { BaselinePaymentImage } from '../src/universal/BaselinePaymentImage';
import { BaselineCardArt } from '../src/universal/BaselineCardArt';
import { VectorArtworkLayer } from '../src/universal/VectorArtworkLayer';
import {
  CARD_ARTWORK_IMAGES,
  PAYMENT_IMAGE_ARTWORK,
} from '@/app/components/contracts/imageArtwork';
import { getArtworkAsset } from '../src/universal/images/artworkAssets';

it('resolves all 42 assets through the existing native SVG bundling convention', () => {
  for (const source of [
    ...Object.values(PAYMENT_IMAGE_ARTWORK),
    ...Object.values(CARD_ARTWORK_IMAGES),
  ]) {
    expect(getArtworkAsset(source.nodeId)).toMatch(/^data:image\/svg\+xml/);
  }
});

it('accepts an original Figma payment asset explicitly without coupling active presets to its payload', () => {
  let tree!: Renderer.ReactTestRenderer;
  const asset = getArtworkAsset('0:10883');
  act(() => {
    tree = Renderer.create(
      <BaselinePaymentImage variant="MakePayment" asset={asset} width={274} />,
    );
  });
  try {
    const vector = tree.root.findByType(VectorArtworkLayer);
    expect(vector.props.asset).toBe(asset);
    expect([vector.props.width, vector.props.height]).toEqual([137, 120]);
    expect(
      StyleSheet.flatten(tree.root.findAllByType(View)[0].props.style),
    ).toMatchObject({ width: 274, height: 240 });
  } finally {
    act(() => tree.unmount());
  }
});

it('preserves original intrinsic SVG size, proportional scale and accessible naming', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<BaselinePaymentImage />);
  });
  try {
    let root = tree.root.findAllByType(View)[0];
    expect(root.props.accessible).toBe(false);
    expect(root.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(StyleSheet.flatten(root.props.style)).toMatchObject({
      width: 137,
      height: 120,
    });
    act(() => {
      tree.update(
        <BaselineCardArt
          variant="Credit Mobexpert"
          width={438}
          ariaLabel="Mobexpert card ending 1234"
        />,
      );
    });
    root = tree.root.findAllByType(View)[0];
    expect(root.props.accessibilityRole).toBe('image');
    expect(root.props.accessibilityLabel).toBe('Mobexpert card ending 1234');
    expect(root.props.accessible).toBe(true);
    expect(StyleSheet.flatten(root.props.style)).toMatchObject({
      width: 438,
      height: 309.0264892578125,
    });
    const vector = tree.root.findByType(VectorArtworkLayer);
    expect(vector.props.width).toBe(219);
    expect(vector.props.height).toBe(155);
    expect(vector.props.fit).toBe('contain');
    expect(
      tree.root
        .findAllByType(View)
        .some(view =>
          StyleSheet.flatten(view.props.style)?.transform?.some(
            (t: object) => 'scale' in t && t.scale === 2,
          ),
        ),
    ).toBe(true);
  } finally {
    act(() => tree.unmount());
  }
});
