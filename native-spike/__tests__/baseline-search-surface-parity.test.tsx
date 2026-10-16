import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Platform, View, StyleSheet } from 'react-native';
import { BaselineSearchBar } from '../src/universal/BaselineSearchBar';
import { TextInput } from '../src/universal/Typography';

it.each(['muted', 'raised'] as const)(
  'keeps the Source active-filter band transparent with only its inner field painted (%s)',
  fieldSurface => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineSearchBar
          filtersActive
          fieldSurface={fieldSurface}
          onFilterClick={jest.fn()}
          onRemoveFilters={jest.fn()}
        />,
      );
    });
    try {
      const [outer, inner] = tree.root.findAllByType(View);
      expect(StyleSheet.flatten(outer.props.style).backgroundColor).toBe(
        'transparent',
      );
      expect(StyleSheet.flatten(outer.props.style).boxShadow).toBeUndefined();
      expect(StyleSheet.flatten(inner.props.style).backgroundColor).not.toBe(
        'transparent',
      );
      expect(StyleSheet.flatten(inner.props.style).height).toBe(36);
      expect(
        tree.root.findAll(
          node =>
            node.props.accessibilityRole === 'button' &&
            typeof node.props.onPress === 'function',
        ).length,
      ).toBeGreaterThanOrEqual(2);
    } finally {
      act(() => tree.unmount());
    }
  },
);

it('uses browser search semantics without adding browser-specific keyboard behavior to Android', () => {
  const descriptor = Object.getOwnPropertyDescriptor(Platform, 'OS')!;
  let tree!: Renderer.ReactTestRenderer;
  try {
    Object.defineProperty(Platform, 'OS', { ...descriptor, value: 'web' });
    act(() => {
      tree = Renderer.create(<BaselineSearchBar />);
    });
    expect(tree.root.findByType(TextInput).props.keyboardType).toBe(
      'web-search',
    );
    expect(tree.root.findByType(TextInput).props.blurOnSubmit).toBe(false);
    act(() => tree.unmount());
    Object.defineProperty(Platform, 'OS', { ...descriptor, value: 'android' });
    act(() => {
      tree = Renderer.create(<BaselineSearchBar />);
    });
    expect(tree.root.findByType(TextInput).props.keyboardType).toBeUndefined();
  } finally {
    act(() => tree?.unmount());
    Object.defineProperty(Platform, 'OS', descriptor);
  }
});
