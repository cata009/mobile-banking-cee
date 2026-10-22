import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import {
  BaselinePill,
  BaselinePillSorting,
} from '../src/universal/BaselinePill';
import { BaselineShopsmartOfferCard } from '../src/universal/BaselineShopsmartOfferCard';
import { sourceColor } from '../src/universal/sourceColor';

const choices = [
  { value: 'newest', label: 'Newest' },
  { value: 'amount', label: 'Amount' },
] as const;
const buttons = (tree: Renderer.ReactTestRenderer) =>
  tree.root.findAll(
    n =>
      n.props.accessibilityRole === 'button' &&
      typeof n.props.onPress === 'function',
  );

describe('canonical pill composition', () => {
  it('keeps loading fully visible while blocking activation independently of unavailable state', () => {
    const onPress = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselinePill variant="loading-counter" onPress={onPress} />,
      );
    });
    const control = buttons(tree)[0];
    expect(control.props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });
    expect(StyleSheet.flatten(control.props.style).opacity).toBe(1);
    act(() => control.props.onPress());
    expect(onPress).not.toHaveBeenCalled();
    act(() => {
      tree.update(<BaselinePill disabled onPress={onPress} />);
    });
    expect(StyleSheet.flatten(buttons(tree)[0].props.style).opacity).toBe(0.5);
    act(() => buttons(tree)[0].props.onPress());
    expect(onPress).not.toHaveBeenCalled();
    act(() => tree.unmount());
  });

  it.each([
    'primary',
    'secondary',
    'active-counter',
    'loading-counter',
    'activated',
  ] as const)(
    'matches the original %s pill shadow and text metrics',
    variant => {
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(<BaselinePill variant={variant} />);
      });
      const control = buttons(tree)[0];
      expect(StyleSheet.flatten(control.props.style)).toMatchObject({
        width: 120,
        height: 36,
        borderRadius: 18,
        boxShadow: '0 2px 4px rgba(0,0,0,.2)',
      });
      const label = control.findAll(
        n => typeof n.props.children === 'string' && n.props.style,
      )[0];
      expect(StyleSheet.flatten(label.props.style)).toMatchObject({
        fontSize: 14,
        lineHeight: 15,
      });
      act(() => tree.unmount());
    },
  );

  it.each([false, true])(
    'keeps the default selected chip source fill, border and line height in dark=%s',
    dark => {
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(<BaselinePillSorting dark={dark} />);
      });
      const chip = buttons(tree).find(
        n => n.props.accessibilityLabel === 'MAX %',
      )!;
      expect(StyleSheet.flatten(chip.props.style)).toMatchObject({
        height: 24,
        borderRadius: 14.5,
        backgroundColor: '#333333',
        borderWidth: 0,
      });
      const label = chip.findAll(
        n => n.props.children === 'MAX %' && n.props.style,
      )[0];
      expect(StyleSheet.flatten(label.props.style)).toMatchObject({
        fontFamily: 'UniCredit-bold',
        fontSize: 14,
        lineHeight: 15,
        color: '#FFFFFF',
      });
      const idle = buttons(tree).find(
        n => n.props.accessibilityLabel === 'MIN %',
      )!;
      expect(StyleSheet.flatten(idle.props.style)).toMatchObject({
        backgroundColor: 'transparent',
        borderWidth: 1,
      });
      act(() => tree.unmount());
    },
  );
  it.each([false, true])(
    'keeps offer card content noninteractive and geometry intact in dark=%s',
    dark => {
      for (const tone of ['teal', 'white'] as const) {
        const onPress = jest.fn();
        let tree!: Renderer.ReactTestRenderer;
        act(() => {
          tree = Renderer.create(
            <BaselineShopsmartOfferCard
              merchant="Hilton"
              title="10% cashback"
              statusText="Until 31.12.2024"
              imageSrc="original.png"
              pillLabel="Activate"
              pillTone={tone}
              dark={dark}
              onPress={onPress}
            />,
          );
        });
        const pill = tree.root.findByType(BaselinePill);
        expect(pill.props.interactive).toBe(false);
        expect(buttons(tree)).toHaveLength(1);
        const root = pill.findAll(
          n =>
            n.props.style &&
            StyleSheet.flatten(n.props.style).position === 'absolute',
        )[0];
        expect(StyleSheet.flatten(root.props.style)).toMatchObject({
          width: 120,
          height: 36,
          borderRadius: 18,
          position: 'absolute',
          right: 7,
          top: 112,
          paddingVertical: 0,
          boxShadow: '0 0 4px rgba(0,0,0,.25)',
          backgroundColor: sourceColor(
            tone === 'white' ? 'var(--uc-surface)' : 'var(--uc-action-strong)',
            dark,
          ),
        });
        const label = pill.findAll(
          n => n.props.children === 'Activate' && n.props.style,
        )[0];
        expect(StyleSheet.flatten(label.props.style)).toMatchObject({
          fontSize: 14,
          lineHeight: 18,
          color: sourceColor(
            tone === 'white' ? 'var(--uc-text)' : 'var(--uc-static-white)',
            dark,
          ),
        });
        act(() => buttons(tree)[0].props.onPress());
        expect(onPress).toHaveBeenCalledTimes(1);
        act(() => tree.unmount());
      }
    },
  );

  it('presentation mode never creates an activation target even when given a callback', () => {
    const onPress = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselinePill
          interactive={false}
          label="Activated"
          onPress={onPress}
        />,
      );
    });
    expect(buttons(tree)).toHaveLength(0);
    expect(onPress).not.toHaveBeenCalled();
    act(() => tree.unmount());
  });

  it('custom sorting forwards only the controlled id and preserves null selection', () => {
    const onChange = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselinePillSorting
          options={choices}
          value={null}
          onChange={onChange}
          ariaLabel="Sort offers"
        />,
      );
    });
    const chips = buttons(tree);
    expect(chips.map(n => n.props.accessibilityLabel)).toEqual([
      'Newest',
      'Amount',
    ]);
    expect(
      chips.every(n => n.props.accessibilityState.selected === false),
    ).toBe(true);
    expect(
      tree.root.findAll(n => n.props.accessibilityLabel === 'Sort offers')[0]
        .props.role,
    ).toBe('group');
    act(() => chips[1].props.onPress());
    expect(onChange.mock.calls).toEqual([['amount']]);
    expect(chips[1].props.accessibilityState.selected).toBe(false);
    act(() => tree.unmount());
  });

  it.each([false, true])(
    'filter presentation preserves the existing investment ink and scroll geometry in dark=%s',
    dark => {
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <BaselinePillSorting
            options={choices}
            value="amount"
            presentation="filter"
            dark={dark}
            ariaLabel="Investment sorting"
          />,
        );
      });
      const rail = tree.root.findAll(
        n => n.props.horizontal && n.props.contentContainerStyle,
      )[0];
      expect(rail.props.horizontal).toBe(true);
      expect(
        StyleSheet.flatten(rail.props.contentContainerStyle),
      ).toMatchObject({
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 18,
        justifyContent: 'center',
        flexGrow: 1,
      });
      const chip = buttons(tree)[1];
      expect(chip.props['aria-pressed']).toBe(true);
      expect(StyleSheet.flatten(chip.props.style)).toMatchObject({
        height: 24,
        borderRadius: 14.5,
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: sourceColor('var(--uc-text)', dark),
      });
      const label = chip.findAll(
        n => n.props.children === 'Amount' && n.props.style,
      )[0];
      expect(StyleSheet.flatten(label.props.style)).toMatchObject({
        fontFamily: 'UniCredit-regular',
        fontSize: 14,
        lineHeight: 15,
        color: sourceColor('var(--uc-text-inverse)', dark),
      });
      act(() => tree.unmount());
    },
  );
});
