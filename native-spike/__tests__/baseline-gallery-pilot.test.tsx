import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { BaselineBanner } from '../src/universal/BaselineBanner';
import { BaselinePaymentHero } from '../src/universal/BaselinePaymentHero';
import {
  BaselinePill,
  BaselinePillSorting,
} from '../src/universal/BaselinePill';
import { BaselineToast } from '../src/universal/BaselineToast';
import { BaselineCardComponent } from '../src/universal/BaselineCardComponent';
import { BaselineCardArtwork } from '../src/universal/BaselineCardArtwork';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
const button = (tree: Renderer.ReactTestRenderer, label?: string) =>
  tree.root.find(
    node =>
      node.props.accessibilityRole === 'button' &&
      typeof node.props.onPress === 'function' &&
      (!label || node.props.accessibilityLabel === label),
  );
describe('isolated gallery/auxiliary Native leaves', () => {
  it('keeps helper external closure vs discovery internal dismissal and close sizes', () => {
    const onClose = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineBanner
          variant="helper"
          title="Help"
          dismissible
          onClose={onClose}
        />,
      );
    });
    expect(
      tree.root
        .findAllByType(SourceCustomIcon)
        .find(node => node.props.name === 'close-x')?.props.size,
    ).toBe(12);
    act(() => button(tree, 'Close').props.onPress());
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(tree.toJSON()).not.toBeNull();
    act(() =>
      tree.update(
        <BaselineBanner
          variant="payment-discover"
          title="Discover"
          description="Body"
        />,
      ),
    );
    expect(
      tree.root
        .findAllByType(SourceCustomIcon)
        .find(node => node.props.name === 'close-x')?.props.size,
    ).toBe(32);
    act(() => button(tree, 'Dismiss payment help').props.onPress());
    expect(tree.toJSON()).toBeNull();
    act(() => tree.unmount());
  });
  it.each([false, true])(
    'preserves hero disabled=%s and exact item payload',
    disabled => {
      const item = {
          id: 'payment',
          title: 'Make\npayment',
          description: 'Body',
        },
        onSelect = jest.fn();
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <BaselinePaymentHero
            item={item}
            imageVariant="payments-5"
            imageSrc="original.png"
            disabled={disabled}
            onSelect={onSelect}
          />,
        );
      });
      expect(button(tree).props.accessibilityState.disabled).toBe(disabled);
      expect(StyleSheet.flatten(button(tree).props.style).height).toBe(120);
      act(() => button(tree).props.onPress());
      expect(onSelect.mock.calls).toEqual(disabled ? [] : [[item]]);
      act(() => tree.unmount());
    },
  );
  it.each([
    'primary',
    'secondary',
    'active-counter',
    'loading-counter',
    'activated',
  ] as const)('keeps pill %s labels/disability', variant => {
    let tree!: Renderer.ReactTestRenderer;
    const onPress = jest.fn();
    act(() => {
      tree = Renderer.create(
        <BaselinePill variant={variant} onPress={onPress} />,
      );
    });
    const control = button(tree);
    expect(StyleSheet.flatten(control.props.style)).toMatchObject({
      width: 120,
      height: 36,
    });
    act(() => control.props.onPress());
    expect(onPress).toHaveBeenCalledTimes(
      variant === 'loading-counter' ? 0 : 1,
    );
    act(() => tree.unmount());
  });
  it('keeps sorting selection controlled and callback value unchanged', () => {
    let tree!: Renderer.ReactTestRenderer;
    const onChange = jest.fn();
    act(() => {
      tree = Renderer.create(
        <BaselinePillSorting selectedValue="max-percent" onChange={onChange} />,
      );
    });
    act(() => button(tree, 'MIN VALUE').props.onPress());
    expect(onChange).toHaveBeenCalledWith('min-value');
    expect(button(tree, 'MAX %').props.accessibilityState.selected).toBe(true);
    act(() => tree.unmount());
  });
  it('keeps card specimen on stable original artwork with no controller', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(<BaselineCardComponent />);
    });
    expect(
      tree.root
        .findAllByType(BaselineCardArtwork)
        .map(node => node.props.variant),
    ).toEqual(['mc-credit-partner-standard', 'mc-debit-standard']);
    expect(
      tree.root.findAll(node => node.props.accessibilityRole === 'button'),
    ).toHaveLength(0);
    act(() => tree.unmount());
  });
  it.each(['action-required', 'aware', 'google-pay'] as const)(
    'keeps toast %s default dimensions and polite announcements',
    variant => {
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(<BaselineToast variant={variant} />);
      });
      const root = tree.root.find(
        node => node.props.accessibilityLiveRegion === 'polite',
      );
      expect(StyleSheet.flatten(root.props.style).width).toBe(
        variant === 'google-pay' ? 174 : 327,
      );
      act(() => tree.unmount());
    },
  );
});
