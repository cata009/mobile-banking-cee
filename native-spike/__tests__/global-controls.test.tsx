import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { View, StyleSheet } from 'react-native';
import { MainNavigationHeader } from '../src/universal/MainNavigationHeader';
import { Tabs } from '../src/universal/Tabs';
import { mobileFirstTokens } from '../src/universal/tokens';
test('an action-only header omits the empty tabs band', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <MainNavigationHeader
        tokens={mobileFirstTokens}
        brand={null}
        actions={null}
        items={[]}
        value="home"
        label="Main navigation"
        onChange={jest.fn()}
        actionsRowHeight={56}
        actionsPaddingHorizontal={24}
      />,
    );
  });
  expect(
    tree.root.findAll(node => node.props.accessibilityRole === 'tablist'),
  ).toHaveLength(0);
  const rows = tree.root
    .findAllByType(View)
    .map(node => StyleSheet.flatten(node.props.style))
    .filter(Boolean);
  expect(
    rows.some(style => style.height === 56 && style.paddingHorizontal === 24),
  ).toBe(true);
  await act(() => tree.unmount());
});

test('Evo tabs retain the filled selected pill and inline white Source dot', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <Tabs
        tokens={mobileFirstTokens}
        variant="evo"
        items={[{ value: 'accounts', label: 'Accounts' }]}
        value="accounts"
        onChange={jest.fn()}
      />,
    );
  });
  const tab = tree.root.findAll(
    node => node.props.accessibilityRole === 'tab' && node.props.onPress,
  )[0];
  expect(StyleSheet.flatten(tab.props.style)).toMatchObject({
    backgroundColor: mobileFirstTokens.accent,
    minHeight: 44,
    flexDirection: 'column',
  });
  expect(
    tree.root.findAllByType(View).some(node => {
      const style = StyleSheet.flatten(node.props.style);
      return (
        style?.width === 4 &&
        style.backgroundColor === mobileFirstTokens.inverse &&
        style.position !== 'absolute'
      );
    }),
  ).toBe(true);
  await act(() => tree.unmount());
});
test('current tabs expose their selected state and original 4px dot without filled pills', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <Tabs
        tokens={mobileFirstTokens}
        variant="current"
        items={[
          { value: 'accounts', label: 'Accounts' },
          { value: 'savings', label: 'Savings' },
        ]}
        value="accounts"
        onChange={jest.fn()}
      />,
    );
  });
  const tabs = tree.root.findAll(
    node => node.props.accessibilityRole === 'tab' && node.props.onPress,
  );
  expect(tabs[0].props.accessibilityState.selected).toBe(true);
  expect(StyleSheet.flatten(tabs[0].props.style).backgroundColor).toBe(
    'transparent',
  );
  expect(
    tree.root
      .findAllByType(View)
      .some(node => StyleSheet.flatten(node.props.style)?.width === 4),
  ).toBe(true);
  await act(() => tree.unmount());
});
