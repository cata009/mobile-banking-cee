import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { SvgXml } from 'react-native-svg';
import { PrimeDiamondMark } from '@/app/components/prime/PrimeDiamondMark';
import { SHARED_CUSTOM_ICONS } from '@/app/components/icons/domains/shared/custom';
import {
  SourceCustomIcon,
  SourceVector,
  sourceCustomIconXml,
} from '../src/universal/SourceCustomIcon';

it('preserves the Source Prime diamond path and 16px viewport through SourceVector', () => {
  const sourceNode = PrimeDiamondMark({ color: '#ffffff' });
  const children = sourceNode.props.children;
  const sourcePath = (
    Array.isArray(children)
      ? children.find(
          child =>
            child && typeof child === 'object' && 'props' in child,
        )
      : children
  ) as React.ReactElement<{ d: string }>;
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <SourceVector node={sourceNode} color="#ffffff" size={16} />,
    );
  });

  const svg = tree.root.findByType(SvgXml);
  expect(svg.props.width).toBe(16);
  expect(svg.props.height).toBe(16);
  expect(svg.props.xml).toContain('viewBox="0 0 16 16"');
  expect(svg.props.xml).toContain(`d="${sourcePath.props.d}"`);
  expect(svg.props.xml).toContain('fill="#ffffff"');
  expect(svg.props.xml).not.toContain('transform=');
  act(() => tree.unmount());
});

it('preserves the Source Offers path, fill rules, and 20px viewport through SourceCustomIcon', () => {
  const source = SHARED_CUSTOM_ICONS['nav-products'];
  const sourcePath = source.render() as React.ReactElement<{
    d: string;
    fillRule: string;
    clipRule: string;
  }>;
  const xml = sourceCustomIconXml('nav-products', '#666666')!;
  expect(xml).toContain(`viewBox="${source.viewBox}"`);
  expect(xml).toContain(`d="${sourcePath.props.d}"`);
  expect(xml).toContain('fill-rule="evenodd"');
  expect(xml).toContain('clip-rule="evenodd"');
  expect(xml).toContain('fill="#666666"');
  expect(xml).not.toContain('stroke=');
  expect(xml).not.toContain('transform=');

  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <SourceCustomIcon name="nav-products" color="#666666" size={20} />,
    );
  });
  const svg = tree.root.findByType(SvgXml);
  expect(svg.props.width).toBe(20);
  expect(svg.props.height).toBe(20);
  expect(svg.props.xml).toContain(`viewBox="${source.viewBox}"`);
  expect(svg.props.xml).toContain(`d="${sourcePath.props.d}"`);
  act(() => tree.unmount());
});
