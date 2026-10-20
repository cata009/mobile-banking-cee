import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { BaselineNavigationRow } from '../src/universal/BaselineNavigationRow';
import { ToggleButton } from '../src/universal/ToggleButton';

describe('Navigation page 2 Figma geometry on React Native', () => {
  it.each([false, true])('keeps 24/16px insets around the toggle with leading=%s', hasLeading => {
    const onToggle = jest.fn(), onPress = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineNavigationRow
          title="Notifications"
          trailingAccessory="toggle"
          leadingIconName={hasLeading ? 'chevron-link' : undefined}
          toggleChecked
          onToggle={onToggle}
          onPress={onPress}
        />,
      );
    });
    const row = tree.root.findAll(node => StyleSheet.flatten(node.props.style)?.width === '100%')[0];
    expect(StyleSheet.flatten(row.props.style)).toMatchObject({
      height: 80, paddingLeft: 24, paddingRight: 16,
    });
    const control = tree.root.find(node => node.props.accessibilityRole === 'switch' && typeof node.props.onPress === 'function');
    act(() => control.props.onPress());
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(false);
    expect(onPress).not.toHaveBeenCalled();
    expect(control.props.accessibilityState.checked).toBe(true);
    act(() => tree.unmount());
  });

  it('uses the original 14px type for compact centered special rows', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(<BaselineNavigationRow title="Show more" rowHeight={64} centerContent titleTone="action" />);
    });
    const title = tree.root.findAll(node => node.props.children === 'Show more' && node.props.style)[0];
    expect(StyleSheet.flatten(title.props.style)).toMatchObject({
      fontFamily: 'UniCredit-bold', fontSize: 14, textAlign: 'center',
    });
    expect(title.props.numberOfLines).toBe(1);
    act(() => tree.unmount());
  });

  it('retains the measured Payment type artwork position with responsive content', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(<BaselineNavigationRow title="Payment type" rowHeight={64} trailingAccessory="toggle" leadingIconName="chevron-link" />);
    });
    const row = tree.root.findAll(node => StyleSheet.flatten(node.props.style)?.width === '100%')[0];
    expect(StyleSheet.flatten(row.props.style)).toMatchObject({ paddingLeft: 14, paddingRight: 16, height: 64 });
    act(() => tree.unmount());
  });

  it.each([false, true])('preserves native switch geometry and disabled state checked=%s', checked => {
    const onToggle = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(<ToggleButton ariaLabel="Setting" checked={checked} onToggle={onToggle} disabled />);
    });
    const frame = tree.root.findAll(node => StyleSheet.flatten(node.props.style)?.width === 60)[0];
    expect(StyleSheet.flatten(frame.props.style)).toMatchObject({ width: 60, height: 30 });
    const control = tree.root.find(node => node.props.accessibilityRole === 'switch' && typeof node.props.onPress === 'function');
    expect(control.props.accessibilityState).toEqual({ checked, disabled: true });
    act(() => control.props.onPress());
    expect(onToggle).not.toHaveBeenCalled();
    act(() => tree.unmount());
  });
});
