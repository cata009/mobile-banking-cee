import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Text as NativeText, View, StyleSheet } from 'react-native';
import { Header } from '../src/universal/Header';
import { BaselinePageHeader } from '../src/universal/BaselinePageHeader';
import { MainNavigationHeader } from '../src/universal/MainNavigationHeader';
import { mobileFirstTokens } from '../src/universal/tokens';

function exposedHeadings(tree: Renderer.ReactTestRenderer) {
  return tree.root.findAllByType(NativeText).filter(node => {
    if (node.props.accessibilityRole !== 'header') return false;
    let ancestor: Renderer.ReactTestInstance | null = node;
    while (ancestor) {
      if (
        ancestor.props.accessibilityElementsHidden ||
        ancestor.props.importantForAccessibility === 'no-hide-descendants' ||
        ancestor.props['aria-hidden'] === true
      )
        return false;
      ancestor = ancestor.parent;
    }
    return true;
  });
}

describe('Headers & Titles semantics with original geometry', () => {
  it.each([
    [undefined, 16],
    [24, 24],
    [20, 20],
  ])('keeps the L2 title gutter explicit: %s → %s', (gutter, expected) => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselinePageHeader
          title="Large Title"
          onBack={jest.fn()}
          largeTitleGutter={gutter}
        />,
      );
    });
    const largeTitle = tree.root
      .findAllByType(NativeText)
      .find(node => node.props.numberOfLines === 2)!;
    let band = largeTitle.parent;
    while (band && StyleSheet.flatten(band.props.style)?.paddingVertical !== 8)
      band = band.parent;
    expect(StyleSheet.flatten(band?.props.style)?.paddingHorizontal).toBe(
      expected,
    );
    act(() => tree.unmount());
  });

  it.each([0, 0.5, 0.999, 1])(
    'exposes one current page title through collapse at %s',
    progress => {
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <Header
            tokens={mobileFirstTokens}
            title="Payments"
            variant="current"
            collapsedTitleProgress={progress}
            onBack={jest.fn()}
          />,
        );
      });
      expect(exposedHeadings(tree)).toHaveLength(1);
      expect(exposedHeadings(tree)[0].props.children).toBe('Payments');
      expect(exposedHeadings(tree)[0].props.numberOfLines).toBe(
        progress < 1 ? 2 : 1,
      );
      act(() => tree.unmount());
    },
  );

  it.each([false, true])(
    'exposes one baseline title with compact=%s',
    compact => {
      for (const progress of [0, 0.5, 0.999, 1]) {
        let tree!: Renderer.ReactTestRenderer;
        act(() => {
          tree = Renderer.create(
            <BaselinePageHeader
              title="My Accounts"
              compact={compact}
              collapsedTitleProgress={progress}
              onBack={jest.fn()}
            />,
          );
        });
        expect(exposedHeadings(tree)).toHaveLength(1);
        expect(exposedHeadings(tree)[0].props.children).toBe('My Accounts');
        expect(exposedHeadings(tree)[0].props.numberOfLines).toBe(
          progress < (compact ? 0.999 : 1) ? 2 : 1,
        );
        act(() => tree.unmount());
      }
    },
  );

  it('hides an invisible toolbar title when the host supplies the page title', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselinePageHeader
          title="Advisor"
          renderLargeTitle={false}
          hideCollapsedTitleWhenHidden
          onBack={jest.fn()}
        />,
      );
    });
    expect(exposedHeadings(tree)).toHaveLength(0);
    act(() => tree.unmount());
  });

  it('preserves the standalone toolbar heading used by active external-title compositions', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <Header
          tokens={mobileFirstTokens}
          title="Advisor"
          variant="current"
          renderLargeTitle={false}
          collapsedTitleOpacity={0}
          onBack={jest.fn()}
        />,
      );
    });
    expect(exposedHeadings(tree)).toHaveLength(1);
    act(() => tree.unmount());
  });

  it('announces a default header title and preserves its back action', () => {
    let tree!: Renderer.ReactTestRenderer;
    const onBack = jest.fn();
    act(() => {
      tree = Renderer.create(
        <Header
          tokens={mobileFirstTokens}
          title="Details"
          onBack={onBack}
          backLabel="Înapoi"
        />,
      );
    });
    expect(exposedHeadings(tree)).toHaveLength(1);
    const back = tree.root.find(
      node => node.props.accessibilityLabel === 'Înapoi' && node.props.onPress,
    );
    act(() => back.props.onPress());
    expect(onBack).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });

  it('preserves the main header brand/actions slots and action-only geometry', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <MainNavigationHeader
          tokens={mobileFirstTokens}
          brand={<View testID="brand" />}
          actions={<View testID="actions" />}
          items={[]}
          value="home"
          label="Main navigation"
          onChange={jest.fn()}
          actionsRowHeight={56}
          actionsPaddingHorizontal={24}
        />,
      );
    });
    expect(tree.root.findByProps({ testID: 'brand' })).toBeDefined();
    expect(tree.root.findByProps({ testID: 'actions' })).toBeDefined();
    expect(
      tree.root.findAll(node => node.props.accessibilityRole === 'tablist'),
    ).toHaveLength(0);
    expect(
      tree.root.findAllByType(View).some(node => {
        const style = StyleSheet.flatten(node.props.style);
        return style?.height === 56 && style.paddingHorizontal === 24;
      }),
    ).toBe(true);
    act(() => tree.unmount());
  });
});
