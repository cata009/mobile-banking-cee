import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Image, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { AssetGlyph } from '../src/universal/AssetGlyph';

test.each(['data:image/svg+xml,', 'data:image/svg+xml;utf8,'])(
  'renders bundled SVG %s with its non-square dimensions and monochrome tint',
  async prefix => {
    let tree!: Renderer.ReactTestRenderer;
    const xml = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 22' fill='none'><path d='M0 0L12 11L0 22' fill='white' stroke='white'/></svg>`;
    await act(() => {
      tree = Renderer.create(
        <AssetGlyph
          asset={prefix + encodeURIComponent(xml)}
          width={12}
          height={22}
          tintColor="#262626"
        />,
      );
    });
    const svg = tree.root.findByType(SvgXml);
    expect(svg.props.width).toBe(12);
    expect(svg.props.height).toBe(22);
    expect(svg.props.xml).toContain("fill='none'");
    expect(svg.props.xml).toContain('fill="#262626"');
    expect(svg.props.xml).toContain('stroke="#262626"');
    expect(svg.props.preserveAspectRatio).toBe('xMidYMid meet');
  },
);
test('keeps merchant photographs untinted and cropped rather than stretched', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <AssetGlyph
        asset="https://example.test/merchant.png"
        size={40}
        fit="cover"
      />,
    );
  });
  const photo = tree.root.findByType(Image);
  expect(photo.props.tintColor).toBeUndefined();
  expect(photo.props.resizeMode).toBe('cover');
  expect(StyleSheet.flatten(photo.props.style)).toMatchObject({
    width: 40,
    height: 40,
    flexShrink: 0,
  });
});
