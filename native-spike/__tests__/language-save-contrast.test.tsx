import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { PrimaryButton } from '../src/universal/PrimaryButton';

test.each([false, true])(
  'language save renders a contrasting label in dark=%s',
  dark => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <PrimaryButton label="Save" variant="language-save" dark={dark} />,
      );
    });
    const button = tree.root.find(
      n =>
        n.props.accessibilityRole === 'button' &&
        typeof n.props.style === 'function',
    );
    const label = tree.root.findAll(
      n => n.props.children === 'Save' && n.props.style,
    )[0]!;
    expect(
      StyleSheet.flatten(button.props.style({ pressed: false }))
        .backgroundColor,
    ).toBe(dark ? '#FFFFFF' : '#007A91');
    expect(StyleSheet.flatten(label.props.style).color).toBe(
      dark ? '#262626' : '#FFFFFF',
    );
    act(() => tree.unmount());
  },
);
