import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, View } from 'react-native';
import { BaselinePageHeader } from '../src/universal/BaselinePageHeader';
import { BaselineBottomNavigation } from '../src/universal/BaselineBottomNavigation';
import { BaselineBackButton } from '../src/universal/BaselineBackButton';
import { BaselineHeaderActionButton } from '../src/universal/BaselineHeaderActions';
import {
  SourceCustomIcon,
  sourceCustomIconXml,
} from '../src/universal/SourceCustomIcon';

const control = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.find(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  );
describe('isolated Native baseline navigation', () => {
  it('reserves both 40px grid-equivalent slots when actions are absent', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselinePageHeader
          title="No actions"
          showBack={false}
          showHelp={false}
          onBack={() => {}}
        />,
      );
    });
    const slots = tree.root.findAll(
      node =>
        node.type === View &&
        StyleSheet.flatten(node.props.style)?.width === 40,
    );
    expect(slots).toHaveLength(2);
    act(() => tree.unmount());
  });
  it.each([0, 0.5, 1])(
    'keeps 40px header actions, safe reserve and large-title progression %s',
    progress => {
      let tree!: Renderer.ReactTestRenderer;
      const onBack = jest.fn(),
        onHelp = jest.fn();
      act(() => {
        tree = Renderer.create(
          <BaselinePageHeader
            title="Payments"
            compact
            includeSafeArea
            collapsedTitleProgress={progress}
            onBack={onBack}
            onHelpPress={onHelp}
          />,
        );
      });
      expect(StyleSheet.flatten(control(tree, 'Back').props.style).width).toBe(
        40,
      );
      expect(
        tree.root.findAll(node => node.props.style?.paddingTop === 54).length,
      ).toBeGreaterThan(0);
      expect(
        tree.root.findAll(node => node.props.numberOfLines === 2).length > 0,
      ).toBe(progress < 0.999);
      act(() => {
        control(tree, 'Back').props.onPress();
        control(tree, 'Help').props.onPress();
      });
      expect(onBack).toHaveBeenCalledTimes(1);
      expect(onHelp).toHaveBeenCalledTimes(1);
      act(() => tree.unmount());
    },
  );
  it('uses original vector glyphs and keeps the 32px standalone back', () => {
    for (const icon of [
      'back-line',
      'back-heavy',
      'help-circle',
      'nav-home',
      'nav-analytics',
      'nav-payments',
      'nav-products',
      'nav-more',
      'header-messages',
    ]) {
      expect(sourceCustomIconXml(icon, '#262626')).toContain('<path');
    }
    let tree!: Renderer.ReactTestRenderer;
    const onPress = jest.fn();
    act(() => {
      tree = Renderer.create(<BaselineBackButton onPress={onPress} />);
    });
    expect(StyleSheet.flatten(control(tree, 'Go back').props.style).width).toBe(
      32,
    );
    expect(tree.root.findByType(SourceCustomIcon).props.name).toBe('back-line');
    act(() => control(tree, 'Go back').props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });
  it('keeps callback-only and uncontrolled selection ownership', () => {
    let tree!: Renderer.ReactTestRenderer;
    const callback = jest.fn();
    const labels = { home: 'Home', payments: 'Payments' };
    act(() => {
      tree = Renderer.create(
        <BaselineBottomNavigation labels={labels} onTabChange={callback} />,
      );
    });
    act(() => control(tree, 'Payments').props.onPress());
    expect(callback).toHaveBeenCalledWith('payments');
    expect(control(tree, 'Home').props.accessibilityState.selected).toBe(true);
    act(() => tree.update(<BaselineBottomNavigation labels={labels} />));
    act(() => control(tree, 'Payments').props.onPress());
    expect(control(tree, 'Payments').props.accessibilityState.selected).toBe(
      true,
    );
    act(() =>
      tree.update(
        <BaselineBottomNavigation labels={labels} activeTab="home" />,
      ),
    );
    act(() => control(tree, 'Payments').props.onPress());
    expect(control(tree, 'Home').props.accessibilityState.selected).toBe(true);
    act(() => tree.unmount());
  });
  it.each([0, 1, 99, 100])('keeps action badges at %s', badgeCount => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineHeaderActionButton
          icon="messages"
          label="Messages"
          badgeCount={badgeCount}
        />,
      );
    });
    expect(tree.root.findByType(SourceCustomIcon).props.name).toBe(
      'header-messages',
    );
    const rendered = JSON.stringify(tree.toJSON());
    if (badgeCount === 100) expect(rendered).toContain('99+');
    if (badgeCount === 0) expect(rendered).not.toContain('letterSpacing');
    act(() => tree.unmount());
  });
});
