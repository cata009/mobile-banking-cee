import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Pressable, StyleSheet, View } from 'react-native';
import { BaselinePageHeader } from '../src/universal/BaselinePageHeader';
import {
  BaselineHeaderActionRail,
  BaselineHeaderActionButton,
} from '../src/universal/BaselineHeaderActions';

describe('L2 source 8833:2469 toolbar composition', () => {
  it('keeps the legacy single 40px action and toolbar geometry by default', () => {
    let tree!: Renderer.ReactTestRenderer;
    const onBack = jest.fn();
    const onHelp = jest.fn();
    act(() => {
      tree = Renderer.create(
        <BaselinePageHeader
          title="Details"
          onBack={onBack}
          onHelpPress={onHelp}
        />,
      );
    });
    const back = tree.root.findByProps({ accessibilityLabel: 'Back' });
    const help = tree.root.findByProps({ accessibilityLabel: 'Help' });
    expect(StyleSheet.flatten(back.props.style)).toMatchObject({
      width: 40,
      height: 40,
    });
    expect(StyleSheet.flatten(help.props.style)).toMatchObject({
      width: 40,
      height: 40,
    });
    const toolbar = tree.root
      .findAllByType(View)
      .find(node => StyleSheet.flatten(node.props.style)?.height === 48)!;
    expect(StyleSheet.flatten(toolbar.props.style)).toMatchObject({
      paddingHorizontal: 8,
      paddingTop: 8,
    });
    act(() => {
      back.props.onPress();
      help.props.onPress();
    });
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onHelp).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });

  it('accepts an explicit source L2 rail, reserves matching 72px sides and preserves callbacks', () => {
    let tree!: Renderer.ReactTestRenderer;
    const onBack = jest.fn();
    const onAction = jest.fn();
    // The host owns action semantics; this fixture exercises the generic slot.
    const rail = (
      <BaselineHeaderActionRail>
        <BaselineHeaderActionButton
          icon="search"
          label="Search fixture"
          onPress={onAction}
        />
        <BaselineHeaderActionButton
          icon="help"
          label="FAQ fixture"
          onPress={onAction}
        />
      </BaselineHeaderActionRail>
    );
    act(() => {
      tree = Renderer.create(
        <BaselinePageHeader
          title="Details"
          onBack={onBack}
          toolbarLayout="source-l2"
          rightActions={rail}
          largeTitleGutter={24}
        />,
      );
    });
    const back = tree.root.findByProps({ accessibilityLabel: 'Back' });
    expect(StyleSheet.flatten(back.props.style)).toMatchObject({
      width: 32,
      height: 32,
    });
    const toolbar = tree.root
      .findAllByType(View)
      .find(
        node =>
          StyleSheet.flatten(node.props.style)?.height === 40 &&
          StyleSheet.flatten(node.props.style)?.paddingHorizontal === 16,
      )!;
    expect(StyleSheet.flatten(toolbar.props.style).paddingTop).toBe(0);
    const rails = toolbar
      .findAllByType(View)
      .filter(node => StyleSheet.flatten(node.props.style)?.width === 72);
    const leading = rails.find(
      node => node.findAllByProps({ accessibilityLabel: 'Back' }).length > 0,
    )!;
    expect(StyleSheet.flatten(leading.props.style)).toMatchObject({
      width: 72,
      height: 32,
      gap: 8,
      flexDirection: 'row',
    });
    expect(
      leading
        .findAllByType(View)
        .some(node => StyleSheet.flatten(node.props.style)?.width === 32),
    ).toBe(true);
    const trailing = rails.find(
      node => node.findAllByType(BaselineHeaderActionRail).length > 0,
    )!;
    expect(StyleSheet.flatten(trailing.props.style)).toMatchObject({
      width: 72,
      height: 32,
    });
    expect(trailing.findAllByType(BaselineHeaderActionRail)).toHaveLength(1);
    expect(trailing.findAllByType(BaselineHeaderActionButton)).toHaveLength(2);
    // Supplying actions must not wrap the rail in a nested action button.
    expect(trailing.type).toBe(View);
    expect(
      tree.root
        .findAllByType(Pressable)
        .filter(node => node.props.accessibilityLabel === 'Help'),
    ).toHaveLength(0);
    act(() => {
      back.props.onPress();
      trailing.findAllByType(BaselineHeaderActionButton)[0].props.onPress();
    });
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });
});
