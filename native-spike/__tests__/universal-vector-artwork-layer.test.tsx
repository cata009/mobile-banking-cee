import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Image, StyleSheet, View } from 'react-native';
import { SvgXml, Image as SvgImage } from 'react-native-svg';
import {
  VectorArtworkLayer,
  namespaceSvgArtworkXml,
} from '../src/universal/VectorArtworkLayer';

const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 361 227"><defs><linearGradient id="paint"><stop offset="0" stop-color="#fff"/></linearGradient><clipPath id="crop"><rect width="361" height="227"/></clipPath></defs><path id="figure" fill="url(#paint)" clip-path="url('#crop')" d="M0 0L361 227"/><use href="#figure"/><use xlink:href="#figure"/><path fill="#262626" style="stroke:url('#paint')"/></svg>`;
const dataUri = 'data:image/svg+xml;utf8,' + encodeURIComponent(xml);
let consoleError: jest.SpyInstance;
let consoleWarn: jest.SpyInstance;
beforeEach(() => {
  consoleError = jest.spyOn(console, 'error');
  consoleWarn = jest.spyOn(console, 'warn');
});
afterEach(() => {
  expect(consoleError).not.toHaveBeenCalled();
  expect(consoleWarn).not.toHaveBeenCalled();
  consoleError.mockRestore();
  consoleWarn.mockRestore();
});

test('SVG XML keeps source positions/opacity and never enters a bitmap SVG-image decoder', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <VectorArtworkLayer
        asset={dataUri}
        x={-50.855}
        y={-0.59}
        width={226.188}
        height={229.165}
        opacity={0.8}
      />,
    );
  });
  const layer = tree.root.findAllByType(View)[0];
  expect(StyleSheet.flatten(layer.props.style)).toMatchObject({
    position: 'absolute',
    left: -50.855,
    top: -0.59,
    width: 226.188,
    height: 229.165,
    opacity: 0.8,
  });
  expect(layer.props.pointerEvents).toBe('none');
  const vector = tree.root.findByType(SvgXml);
  expect(vector.props.width).toBe(226.188);
  expect(vector.props.height).toBe(229.165);
  expect(vector.props.preserveAspectRatio).toBe('none');
  expect(vector.props.xml).toContain('d="M0 0L361 227"');
  expect(vector.props.xml).toContain('fill="#262626"');
  expect(tree.root.findAllByType(Image)).toHaveLength(0);
  expect(tree.root.findAllByType(SvgImage)).toHaveLength(0);
  expect(dataUri).toBe('data:image/svg+xml;utf8,' + encodeURIComponent(xml));
  await act(() => tree.unmount());
});

test('each mounted vector receives a separate namespace with matching local definition references', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <>
        <VectorArtworkLayer asset={dataUri} width={361} height={227} />
        <VectorArtworkLayer asset={dataUri} width={361} height={227} />
      </>,
    );
  });
  const [first, second] = tree.root
    .findAllByType(SvgXml)
    .map(node => node.props.xml as string);
  const id = (value: string) => value.match(/linearGradient id="([^"]+)"/)![1];
  expect(id(first)).not.toBe(id(second));
  [first, second].forEach(value => {
    const paint = id(value);
    const crop = value.match(/clipPath id="([^"]+)"/)![1];
    const figure = value.match(/path id="([^"]+)"/)![1];
    expect(value).toContain(`fill="url(#${paint})"`);
    expect(value).toContain(`clip-path="url(#${crop})"`);
    expect(value).toContain(`href="#${figure}"`);
    expect(value).toContain(`xlink:href="#${figure}"`);
  });
  await act(() => tree.unmount());
});

test('namespace substitution preserves colors, unrelated external links and raster content', () => {
  const result = namespaceSvgArtworkXml(
    `<svg><defs><linearGradient id='paint'/></defs><path fill='#fff' style='fill:url("#paint")'/><image href='photo.png'/><use href='other.svg#paint'/></svg>`,
    'layer',
  );
  expect(result).toContain("id='layer-0'");
  expect(result).toContain('url(#layer-0)');
  expect(result).toContain("fill='#fff'");
  expect(result).toContain("href='photo.png'");
  expect(result).toContain("href='other.svg#paint'");
});

test('browser SVG asset URLs are read as original XML rather than passed to Image', async () => {
  const originalFetch = global.fetch;
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, text: async () => xml });
  let tree!: Renderer.ReactTestRenderer;
  try {
    await act(async () => {
      tree = Renderer.create(
        <VectorArtworkLayer
          asset="/source/card.svg?import"
          width={361}
          height={227}
        />,
      );
    });
    expect(global.fetch).toHaveBeenCalledWith('/source/card.svg?import');
    expect(tree.root.findByType(SvgXml).props.xml).toContain(
      'd="M0 0L361 227"',
    );
    expect(tree.root.findAllByType(Image)).toHaveLength(0);
    await act(() => tree.unmount());
  } finally {
    global.fetch = originalFetch;
  }
});

test('PNG painting remains a native raster image with the same source dimensions', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <VectorArtworkLayer asset={17} width={362} height={227} />,
    );
  });
  expect(tree.root.findAllByType(SvgXml)).toHaveLength(0);
  const painting = tree.root.findByType(Image);
  expect(painting.props.source).toBe(17);
  expect(StyleSheet.flatten(painting.props.style)).toMatchObject({
    width: 362,
    height: 227,
  });
  await act(() => tree.unmount());
});
