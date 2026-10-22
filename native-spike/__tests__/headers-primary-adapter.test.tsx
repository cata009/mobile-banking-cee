import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  Text as NativeText,
  View,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import PrimaryHeader from '../src/experiences/pi/current/PrimaryHeader';
import PrimaryHeaderBefore from './fixtures/headers-primary-before';
import { IconAction } from '../src/experiences/pi/current/Primitives';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { BaselineL1Header } from '../src/universal/BaselineL1Header';
import { mobileFirstTokens } from '../src/universal/tokens';
import { sourceColor } from '../src/universal/sourceColor';

function signature(tree: Renderer.ReactTestRenderer, title: string) {
  const heading = tree.root
    .findAllByType(NativeText)
    .find(
      node =>
        node.props.accessibilityRole === 'header' &&
        node.props.children === title,
    )!;
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  let ancestor = heading.parent;
  let background: ViewStyle['backgroundColor'];
  let row: Pick<ViewStyle, 'flexDirection' | 'alignItems' | 'gap'> | undefined;
  while (ancestor) {
    if (ancestor.type === View) {
      const s = StyleSheet.flatten(ancestor.props.style) ?? {};
      for (const [side, axis] of [
        ['top', 'Vertical'],
        ['right', 'Horizontal'],
        ['bottom', 'Vertical'],
        ['left', 'Horizontal'],
      ] as const) {
        const property = `padding${side[0].toUpperCase()}${side.slice(
          1,
        )}` as keyof ViewStyle;
        inset[side] += Number(
          s[property] ?? s[`padding${axis}`] ?? s.padding ?? 0,
        );
      }
      background ??= s.backgroundColor;
      if (!row && s.flexDirection === 'row')
        row = {
          flexDirection: s.flexDirection,
          alignItems: s.alignItems,
          gap: s.gap,
        };
    }
    ancestor = ancestor.parent;
  }
  const actions = tree.root.findAllByType(IconAction).map(node => ({
    name: node.props.name,
    label: node.props.label,
    slotSize: node.props.slotSize,
    size: node.props.size,
    hasHandler: typeof node.props.onPress === 'function',
  }));
  return {
    titleStyle: StyleSheet.flatten(heading.props.style),
    inset,
    background,
    row,
    actions,
  };
}

describe('active Products header canonical RN adapter', () => {
  it.each(['RO', 'BA', 'BA_BL', 'CZ'])(
    'preserves the frozen %s composition and callbacks',
    country => {
      const onNavigate = jest.fn();
      const host = {
        country,
        tokens: {
          ...mobileFirstTokens,
          background: '#102030',
          text: '#f1d2c3',
        },
        onNavigate,
        t: (key: string, fallback?: string) => fallback ?? key,
      } as unknown as CurrentScreenProps;
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <PrimaryHeaderBefore host={host} title="Products" />,
        );
      });
      const before = signature(tree, 'Products');
      act(() => {
        tree.update(<PrimaryHeader host={host} title="Products" />);
      });
      expect(signature(tree, 'Products')).toEqual(before);
      const canonical = tree.root.findAllByType(BaselineL1Header);
      expect(canonical).toHaveLength(1);
      expect(canonical[0].props).toMatchObject({
        variant: 'products',
        topInset: 54,
        backgroundColor: '#102030',
        titleColor: '#f1d2c3',
      });
      const actions = tree.root.findAllByType(IconAction);
      act(() =>
        actions
          .find(node => node.props.name === 'header-messages')!
          .props.onPress(),
      );
      expect(onNavigate).toHaveBeenLastCalledWith({ screen: 'messages' });
      if (country === 'BA' || country === 'BA_BL') {
        act(() =>
          actions
            .find(node => node.props.name === 'contact-phone')!
            .props.onPress(),
        );
        expect(onNavigate).toHaveBeenLastCalledWith({ screen: 'contacts' });
      }
      act(() => tree.unmount());
    },
  );

  it('retains default L1 colors and allows explicit experience insets', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineL1Header variant="products" title="Products" />,
      );
    });
    expect(signature(tree, 'Products')).toMatchObject({
      background: sourceColor('var(--uc-app-bg)', false),
      inset: { top: 0, right: 24, bottom: 22, left: 24 },
    });
    act(() => {
      tree.update(
        <BaselineL1Header
          variant="products"
          title="Products"
          gutter={20}
          topInset={72}
          backgroundColor="#abcdef"
          titleColor="#123456"
        />,
      );
    });
    expect(signature(tree, 'Products')).toMatchObject({
      background: '#abcdef',
      titleStyle: { color: '#123456' },
      inset: { top: 72, right: 20, bottom: 22, left: 20 },
    });
    act(() => tree.unmount());
  });
});
