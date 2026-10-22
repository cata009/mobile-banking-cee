import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, View } from 'react-native';
import { NavigationDesignSystemPreview } from '../src/app/designSystemPreviews/navigation';
import { BaselineNavigationRow } from '../src/universal/BaselineNavigationRow';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { ToggleButton } from '../src/universal/ToggleButton';

const trees: Renderer.ReactTestRenderer[] = [];
afterEach(() => {
  act(() => {
    for (const tree of trees) tree.unmount();
    trees.length = 0;
  });
});

function render(variantId: string, dark = false) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <NavigationDesignSystemPreview
        componentId="ui.navigation-row"
        variantId={variantId}
        dark={dark}
      />,
    );
  });
  trees.push(tree);
  return tree;
}

function childElements(node: Renderer.ReactTestInstance) {
  return node.children.filter(
    (child): child is Renderer.ReactTestInstance => typeof child !== 'string',
  );
}

describe.each(['toggle-title-light', 'toggle-description-light'])(
  '%s canonical FAQ composition',
  variantId => {
    it.each([false, true])(
      'puts FAQ after the copy and preserves the Toggle in dark=%s',
      dark => {
        const tree = render(variantId, dark);
        const row = tree.root.findByType(BaselineNavigationRow);
        expect(row.props.dark).toBe(dark);
        expect(row.props.leadingVisual).toBeUndefined();
        expect(row.props.trailingAccessory).toBe('toggle');
        expect(tree.root.findAllByType(ToggleButton)).toHaveLength(1);
        const cluster = tree.root.findAll(
          node =>
            String(node.type) === 'View' &&
            StyleSheet.flatten(node.props.style)?.gap === 8,
        )[0];
        expect(cluster).toBeDefined();
        expect(cluster.children.length).toBe(2);
        expect(
          childElements(cluster)[0].findAll(
            node => node.props.children === 'LOREM IPSUM',
          ).length,
        ).toBeGreaterThan(0);
        const icon = childElements(cluster)[1].findByType(SourceCustomIcon);
        expect(icon.props).toMatchObject({ name: 'help-circle', size: 16 });
        expect(
          StyleSheet.flatten(childElements(cluster)[1].props.style),
        ).toMatchObject({
          width: 32,
          height: variantId === 'toggle-description-light' ? 48 : 32,
          flexShrink: 0,
        });
        expect(StyleSheet.flatten(row.props.titleStyle)).toMatchObject({
          maxWidth: 94,
        });
        const switchControl = () =>
          tree.root.find(
            node =>
              node.props.accessibilityRole === 'switch' &&
              typeof node.props.onPress === 'function',
          );
        expect(switchControl().props.accessibilityState.checked).toBe(false);
        act(() => switchControl().props.onPress());
        expect(switchControl().props.accessibilityState.checked).toBe(true);
        expect(switchControl().props.accessibilityLabel).toBe('LOREM IPSUM');
        expect(
          tree.root.findAll(node => node.props.accessibilityRole === 'button'),
        ).toHaveLength(0);
      },
    );
  },
);

it('keeps the description under the title, before the inline accessory', () => {
  const tree = render('toggle-description-light');
  const row = tree.root.findByType(BaselineNavigationRow);
  expect(row.props.description).toBe('Lorem ipsum');
  const description = tree.root.findAll(
    node =>
      node.props.children === 'Lorem ipsum' && node.props.numberOfLines === 2,
  )[0];
  expect(StyleSheet.flatten(description.props.style)).toMatchObject({
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    marginTop: 4,
  });
});

it('allows long titles to shrink without shrinking the FAQ slot or invoking the row owner', () => {
  const rowPress = jest.fn(),
    toggle = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <BaselineNavigationRow
        title="Administrarea notificărilor și confirmarea preferințelor pentru serviciile contului"
        description="Descriere suplimentară"
        trailingAccessory="toggle"
        onPress={rowPress}
        onToggle={toggle}
        titleAccessory={<View />}
      />,
    );
  });
  trees.push(tree);
  const cluster = tree.root.findAll(
    node =>
      String(node.type) === 'View' &&
      StyleSheet.flatten(node.props.style)?.gap === 8,
  )[0];
  expect(StyleSheet.flatten(cluster.props.style)).toMatchObject({
    minWidth: 0,
    flexShrink: 1,
  });
  expect(
    StyleSheet.flatten(childElements(cluster)[0].props.style),
  ).toMatchObject({
    minWidth: 0,
    flexShrink: 1,
  });
  expect(
    StyleSheet.flatten(childElements(cluster)[1].props.style).flexShrink,
  ).toBe(0);
  const control = tree.root.find(
    node =>
      node.props.accessibilityRole === 'switch' &&
      typeof node.props.onPress === 'function',
  );
  act(() => control.props.onPress());
  expect(toggle).toHaveBeenCalledWith(true);
  expect(rowPress).not.toHaveBeenCalled();
});

it('does not add an accessory wrapper to existing row variants', () => {
  const tree = render('icon-description');
  expect(
    tree.root.findAll(
      node =>
        String(node.type) === 'View' &&
        StyleSheet.flatten(node.props.style)?.gap === 8,
    ),
  ).toHaveLength(0);
});

it('continues rejecting unknown variants', () => {
  expect(
    NavigationDesignSystemPreview({
      componentId: 'ui.navigation-row',
      variantId: 'unknown-faq',
      dark: false,
    }),
  ).toBeNull();
});

it.each(['toggle-title-light', 'toggle-description-light'])(
  '%s preview fills a narrower parent without growing past the 375px source width',
  variantId => {
    const tree = render(variantId);
    const wrapper = tree.root.findAll(node => String(node.type) === 'View')[0];
    expect(StyleSheet.flatten(wrapper.props.style)).toMatchObject({
      width: '100%',
      maxWidth: 375,
    });
  },
);
