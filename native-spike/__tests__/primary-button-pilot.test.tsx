import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import { resolvePrimaryButton } from '@/app/components/contracts/primaryButton';
import { sourceColor } from '../src/universal/sourceColor';

describe('isolated native primary pilot', () => {
  it.each(['action', 'surface', 'language-save'] as const)(
    'uses the shared %s contract and Source theme tokens for both themes',
    variant => {
      for (const dark of [false, true]) {
        let tree!: Renderer.ReactTestRenderer;
        act(() => {
          tree = Renderer.create(
            <PrimaryButton variant={variant} dark={dark} label="Continue" />,
          );
        });
        const button = tree.root.find(
          node =>
            node.props.accessibilityRole === 'button' &&
            typeof node.props.style === 'function',
        );
        const style = StyleSheet.flatten(button.props.style({ pressed: true }));
        const contract = resolvePrimaryButton({ variant });
        expect(style.height).toBe(contract.height);
        expect(style.borderRadius).toBe(contract.radius);
        expect(style.backgroundColor).toBe(
          sourceColor(`var(${contract.backgroundToken})`, dark),
        );
        expect(style.transform).toEqual([{ scale: contract.pressedScale }]);
        act(() => {
          tree.unmount();
        });
      }
    },
  );

  it('blocks disabled activation while enabled activation calls once', () => {
    const onPress = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <PrimaryButton label="Save" disabled onPress={onPress} />,
      );
    });
    const disabled = tree.root.find(
      node =>
        node.props.accessibilityRole === 'button' &&
        typeof node.props.style === 'function',
    );
    expect(disabled.props.accessibilityState).toEqual({ disabled: true });
    act(() => {
      disabled.props.onPress();
    });
    expect(onPress).not.toHaveBeenCalled();
    act(() => {
      tree.update(<PrimaryButton label="Save" onPress={onPress} />);
    });
    act(() => {
      tree.root
        .find(
          node =>
            node.props.accessibilityRole === 'button' &&
            typeof node.props.style === 'function',
        )
        .props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
    act(() => {
      tree.unmount();
    });
  });
});
