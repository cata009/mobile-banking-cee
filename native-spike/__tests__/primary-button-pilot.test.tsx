import React from 'react';
import { createHash } from 'node:crypto';
import Renderer, { act } from 'react-test-renderer';
import { Platform, StyleSheet, View } from 'react-native';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import { resolvePrimaryButton } from '@/app/components/contracts/primaryButton';
import { sourceColor } from '../src/universal/sourceColor';
import {
  SourceCustomIcon,
  sourceCustomIconXml,
} from '../src/universal/SourceCustomIcon';
import { ButtonsDesignSystemPreview } from '../src/app/designSystemPreviews/buttons';

describe('isolated native primary pilot', () => {
  it('shows the web focus ring only for keyboard focus and clears it on pointer input', () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    let tree!: Renderer.ReactTestRenderer;
    try {
      act(() => {
        tree = Renderer.create(<PrimaryButton label="Continue" />);
      });
      const button = () =>
        tree.root.find(
          node =>
            node.props.accessibilityRole === 'button' &&
            typeof node.props.style === 'function',
        );
      const width = () =>
        StyleSheet.flatten(button().props.style({ pressed: false }))
          .outlineWidth;
      expect(width()).toBe(0);
      const matches = jest.fn(() => false);
      act(() => button().props.onFocus({ currentTarget: { matches } }));
      expect(matches).toHaveBeenCalledWith(':focus-visible');
      expect(width()).toBe(0);
      act(() => tree.update(<PrimaryButton label="Continue to next page" />));
      expect(width()).toBe(0);
      matches.mockReturnValue(true);
      act(() => button().props.onFocus({ currentTarget: { matches } }));
      expect(width()).toBe(2);
      act(() => button().props.onPointerDown());
      expect(width()).toBe(0);
      act(() => button().props.onBlur());
      expect(width()).toBe(0);
    } finally {
      act(() => tree?.unmount());
      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        value: originalPlatform,
      });
    }
  });
  it('reuses the exact original Chat path through the existing icon renderer', () => {
    const xml = sourceCustomIconXml('button-chat', '#FFFFFF');
    expect(xml).toContain('viewBox="0 0 24 24"');
    expect(xml).toContain('fill="#FFFFFF"');
    const path = xml?.match(/ d="([^"]+)"/)?.[1];
    expect(
      createHash('sha256')
        .update(path ?? '')
        .digest('hex'),
    ).toBe('2b531d31a929e2be60b1fa7b64482b659bd92c041bd71aa82a8d324dda0272af');
  });

  it('maps the icon and explicit-label contexts to the same canonical preview primitive', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <ButtonsDesignSystemPreview
          componentId="ui.primary-button"
          variantId="with-icon"
          dark={false}
        />,
      );
    });
    expect(tree.root.findByType(PrimaryButton).props.labelSize).toBe('18');
    expect(tree.root.findByType(SourceCustomIcon).props).toMatchObject({
      name: 'button-chat',
      size: 24,
    });
    act(() => {
      tree.update(
        <ButtonsDesignSystemPreview
          componentId="ui.primary-button"
          variantId="label-16"
          dark={false}
        />,
      );
    });
    expect(tree.root.findByType(PrimaryButton).props.labelSize).toBe('16');
    expect(tree.root.findAllByType(SourceCustomIcon)).toHaveLength(0);
    act(() => tree.unmount());
  });
  it.each(['action', 'surface'] as const)(
    'renders the canonical %s default at 18 px and retains the explicit 16 px context',
    variant => {
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <PrimaryButton label="Button" variant={variant} />,
        );
      });
      const label = () =>
        tree.root.findAll(
          n => n.props.children === 'Button' && n.props.style,
        )[0];
      expect(StyleSheet.flatten(label().props.style).fontSize).toBe(18);
      act(() => {
        tree.update(
          <PrimaryButton label="Button" variant={variant} labelSize="16" />,
        );
      });
      expect(StyleSheet.flatten(label().props.style).fontSize).toBe(16);
      act(() => tree.unmount());
    },
  );

  it('composes a decorative leading icon at 24 px with an 8 px gap and preserves activation blocking', () => {
    const onPress = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    const icon = <View testID="source-leading-icon" />;
    act(() => {
      tree = Renderer.create(
        <PrimaryButton label="Button" leadingIcon={icon} onPress={onPress} />,
      );
    });
    const sourceIcon = tree.root.findAll(
      n => n.props.testID === 'source-leading-icon',
    )[0];
    expect(sourceIcon).toBeDefined();
    const slot = sourceIcon.parent!;
    expect(StyleSheet.flatten(slot.props.style)).toMatchObject({
      width: 24,
      height: 24,
      flexShrink: 0,
    });
    expect(slot.props['aria-hidden']).toBe(true);
    const row = tree.root.findAll(
      n =>
        n.props.style &&
        typeof n.props.style !== 'function' &&
        StyleSheet.flatten(n.props.style).flexDirection === 'row',
    )[0];
    expect(StyleSheet.flatten(row.props.style)).toMatchObject({
      gap: 8,
      flexDirection: 'row',
      alignItems: 'center',
    });
    const button = () =>
      tree.root.find(
        n =>
          n.props.accessibilityRole === 'button' &&
          typeof n.props.style === 'function',
      );
    expect(button().props.accessibilityLabel).toBe('Button');
    expect(
      StyleSheet.flatten(button().props.style({ pressed: false })),
    ).toMatchObject({ height: 48, borderRadius: 4, paddingVertical: 12 });
    act(() => button().props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
    act(() => {
      tree.update(
        <PrimaryButton
          label="Button"
          leadingIcon={icon}
          onPress={onPress}
          disabled
        />,
      );
    });
    act(() => button().props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });
  it('shows focus without moving the artwork and clears it on blur or disabled', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <PrimaryButton label="Continue" variant="language-save" />,
      );
    });
    const findButton = () =>
      tree.root.find(
        node =>
          node.props.accessibilityRole === 'button' &&
          typeof node.props.style === 'function',
      );
    const unfocused = StyleSheet.flatten(
      findButton().props.style({ pressed: false }),
    );
    act(() => {
      findButton().props.onFocus();
    });
    const focused = StyleSheet.flatten(
      findButton().props.style({ pressed: false }),
    );
    expect(focused.outlineWidth).toBe(2);
    expect(focused.outlineOffset).toBe(2);
    expect(focused.outlineColor).toBe(sourceColor('var(--uc-action)', false));
    expect(focused.height).toBe(unfocused.height);
    expect(focused.paddingVertical).toBe(unfocused.paddingVertical);
    act(() => {
      findButton().props.onBlur();
    });
    expect(
      StyleSheet.flatten(findButton().props.style({ pressed: false }))
        .outlineWidth,
    ).toBe(0);
    act(() => {
      findButton().props.onFocus();
      tree.update(
        <PrimaryButton label="Continue" variant="language-save" disabled />,
      );
    });
    expect(
      StyleSheet.flatten(findButton().props.style({ pressed: true }))
        .outlineWidth,
    ).toBe(0);
    expect(findButton().props.accessibilityState).toEqual({ disabled: true });
    act(() => {
      tree.unmount();
    });
  });
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
