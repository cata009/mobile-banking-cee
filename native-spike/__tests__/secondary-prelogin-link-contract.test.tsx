import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { NAVIGATION_LINK } from '@/app/components/contracts/navigationLink';
import { BaselineNavigationLink } from '../src/universal/BaselineNavigationLink';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';

const trees: Renderer.ReactTestRenderer[] = [];
afterEach(() => {
  act(() => {
    for (const tree of trees) tree.unmount();
    trees.length = 0;
  });
});

function render(dark: boolean, onPress?: () => void) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <BaselineNavigationLink text="CONTACTS" dark={dark} onPress={onPress} />,
    );
  });
  trees.push(tree);
  return tree;
}

it('matches Secondary prelogin 7060:3064 without the historical extra pixel', () => {
  expect(NAVIGATION_LINK).toMatchObject({
    gap: 0,
    fontSize: 14,
    iconSlot: 32,
    colorToken: '--uc-static-white',
  });
  expect(NAVIGATION_LINK.rootClass.split(' ')).toContain('gap-[0px]');
  expect(NAVIGATION_LINK.rootClass.split(' ')).not.toContain('gap-[1px]');
});

it.each([false, true])(
  'renders the canonical 0px gap and retains white14px text/32px slot in dark=%s',
  dark => {
    const onPress = jest.fn();
    const tree = render(dark, onPress);
    const button = tree.root.find(
      node =>
        node.props.accessibilityRole === 'button' &&
        typeof node.props.onPress === 'function',
    );
    expect(StyleSheet.flatten(button.props.style)).toMatchObject({
      gap: 0,
      opacity: 1,
    });
    const label = tree.root.findAll(
      node => node.props.children === 'CONTACTS' && node.props.style,
    )[0];
    expect(StyleSheet.flatten(label.props.style)).toMatchObject({
      fontFamily: 'UniCredit-bold',
      fontSize: 14,
      color: '#FFFFFF',
    });
    const icon = tree.root.findByType(SourceCustomIcon);
    expect(icon.props).toMatchObject({
      name: 'chevron-link',
      color: '#FFFFFF',
    });
    const slot = tree.root.findAll(
      node => StyleSheet.flatten(node.props.style)?.width === 32,
    )[0];
    expect(StyleSheet.flatten(slot.props.style)).toMatchObject({
      width: 32,
      height: 32,
    });
    act(() => button.props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
    act(() => button.props.onHoverIn());
    expect(StyleSheet.flatten(button.props.style).opacity).toBe(0.8);
    act(() => button.props.onHoverOut());
    expect(StyleSheet.flatten(button.props.style).opacity).toBe(1);
  },
);

it('keeps the no-handler button and its existing geometry override API', () => {
  const tree = render(false);
  const button = tree.root.find(
    node => node.props.accessibilityRole === 'button',
  );
  expect(button.props.onPress).toBeUndefined();
  expect(button.props.disabled).toBeUndefined();
  act(() =>
    tree.update(<BaselineNavigationLink text="CONTACTS" chevronSize={24} />),
  );
  expect(tree.root.findByType(SourceCustomIcon).props.size).toBe(24);
});
