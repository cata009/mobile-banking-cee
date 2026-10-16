import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, View } from 'react-native';
import { BaselineL1Header } from '../src/universal/BaselineL1Header';
import { BaselineDetailToolbar } from '../src/universal/BaselineDetailToolbar';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { sourceColor } from '../src/universal/sourceColor';
import { resolveL1Header } from '@/app/components/contracts/l1Header';

describe('isolated Native header compositions', () => {
  it.each(['home', 'more', 'products', 'payments', 'analytics'] as const)(
    'keeps %s composition geometry and theme',
    variant => {
      for (const dark of [false, true]) {
        let tree!: Renderer.ReactTestRenderer;
        act(() => {
          tree = Renderer.create(
            <BaselineL1Header
              variant={variant}
              title="Title"
              dark={dark}
              actions={<View testID="action-slot" />}
            />,
          );
        });
        const contract = resolveL1Header(variant);
        const title = tree.root.find(
          node =>
            node.props.accessibilityRole === 'header' &&
            node.props.children === 'Title',
        );
        expect(StyleSheet.flatten(title.props.style)).toMatchObject({
          fontSize: 28,
          color: sourceColor('var(--uc-text)', dark),
          lineHeight: variant === 'products' ? 36 : undefined,
        });
        expect(
          tree.root.findAll(
            node =>
              node.type === View &&
              StyleSheet.flatten(node.props.style)?.paddingHorizontal ===
                contract.gutter,
          ).length,
        ).toBeGreaterThan(0);
        expect(tree.root.findByProps({ testID: 'action-slot' })).toBeDefined();
        act(() => tree.unmount());
      }
    },
  );
  it('keeps Home separately composable actions/title visibility', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineL1Header
          variant="home"
          title="Home"
          showTitle={false}
          actions={<View testID="actions" />}
        />,
      );
    });
    expect(
      tree.root.findAll(node => node.props.accessibilityRole === 'header'),
    ).toHaveLength(0);
    expect(tree.root.findByProps({ testID: 'actions' })).toBeDefined();
    act(() =>
      tree.update(
        <BaselineL1Header
          variant="home"
          title="Home"
          showActions={false}
          actions={<View testID="actions" />}
        />,
      ),
    );
    expect(tree.root.findAllByProps({ testID: 'actions' })).toHaveLength(0);
    act(() => tree.unmount());
  });
  it.each([0, 0.5, 1])(
    'keeps Account/Card progress=%s and help presence differences',
    progress => {
      let tree!: Renderer.ReactTestRenderer;
      const onBack = jest.fn(),
        onHelp = jest.fn();
      act(() => {
        tree = Renderer.create(
          <BaselineDetailToolbar
            variant="account"
            title="My Products"
            progress={progress}
            onBack={onBack}
          />,
        );
      });
      expect(
        tree.root.findAll(node => node.props.accessibilityLabel === 'Help'),
      ).toHaveLength(0);
      expect(
        tree.root.findAllByType(SourceCustomIcon).map(node => node.props.name),
      ).toEqual(['back-heavy']);
      const title = tree.root.find(
        node =>
          node.props.accessibilityRole === 'header' &&
          node.props.numberOfLines === 1,
      );
      expect(StyleSheet.flatten(title.props.style)).toMatchObject({
        opacity: progress,
        transform: [{ translateY: (1 - progress) * 6 }],
      });
      act(() =>
        tree.update(
          <BaselineDetailToolbar
            variant="card"
            title="Cards"
            progress={progress}
            onBack={onBack}
            onHelpPress={onHelp}
          />,
        ),
      );
      const back = tree.root.find(
        node =>
          node.props.accessibilityLabel === 'Back' &&
          typeof node.props.onPress === 'function',
      );
      const help = tree.root.find(
        node =>
          node.props.accessibilityLabel === 'Help' &&
          typeof node.props.onPress === 'function',
      );
      expect(StyleSheet.flatten(back.props.style).width).toBe(40);
      act(() => {
        back.props.onPress();
        help.props.onPress();
      });
      expect(onBack).toHaveBeenCalledTimes(1);
      expect(onHelp).toHaveBeenCalledTimes(1);
      act(() => tree.unmount());
    },
  );
  it('keeps Card Help even without callback and accepts explicit native safe reserve', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineDetailToolbar
          variant="card"
          title="Cards"
          progress={1}
          onBack={() => {}}
          safeAreaReserve={44}
        />,
      );
    });
    expect(
      tree.root.findAll(node => node.props.accessibilityLabel === 'Help')
        .length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAll(
        node =>
          node.type === View &&
          StyleSheet.flatten(node.props.style)?.paddingTop === 44,
      ).length,
    ).toBeGreaterThan(0);
    act(() => tree.unmount());
  });
});
