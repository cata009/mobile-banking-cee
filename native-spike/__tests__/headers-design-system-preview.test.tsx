import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, View } from 'react-native';
import { HeaderDesignSystemPreview } from '../src/app/designSystemPreviews/headers';
import { BaselinePageHeader } from '../src/universal/BaselinePageHeader';
import { BaselineL1Header } from '../src/universal/BaselineL1Header';
import { BaselineHeaderActionButton } from '../src/universal/BaselineHeaderActions';
import { sourceColor } from '../src/universal/sourceColor';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';

describe('canonical RN Header DS preview dispatch', () => {
  it.each([
    undefined,
    'level-1-page',
    'level-1-center',
    'level-1-categorized',
    'level-1-uncategorized',
    'collapsed',
    'dark',
  ])(
    'renders the supported page-header case %s with the real primitive',
    variantId => {
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <HeaderDesignSystemPreview
            componentId="shell.page-header"
            variantId={variantId}
            dark={false}
          />,
        );
      });
      const header = tree.root.findAllByType(BaselinePageHeader);
      expect(header).toHaveLength(1);
      const props = header[0].props;
      if (variantId === undefined || variantId === 'level-1-page') {
        expect(props.largeTitleGutter).toBe(24);
        expect(props.toolbarLayout).toBe('source-l2');
        expect(
          tree.root
            .findAllByType(BaselineHeaderActionButton)
            .map(node => node.props.icon),
        ).toEqual(['info', 'help']);
      } else {
        expect(props.largeTitleGutter).toBeUndefined();
        expect(props.toolbarLayout).toBeUndefined();
        expect(props.rightActions).toBeUndefined();
      }
      if (variantId === 'level-1-center')
        expect(props.largeTitleAlign).toBe('center');
      if (variantId === 'collapsed')
        expect(props.collapsedTitleProgress).toBe(1);
      if (variantId === 'dark')
        expect(props).toMatchObject({ variant: 'dark', dark: true });
      act(() => tree.unmount());
    },
  );

  it.each([false, true])(
    'keeps the mapped L2 Info/FAQ order, 32px targets and 8px gap, dark=%s',
    dark => {
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <HeaderDesignSystemPreview
            componentId="shell.page-header"
            variantId="level-1-page"
            dark={dark}
          />,
        );
      });
      const actions = tree.root.findAllByType(BaselineHeaderActionButton);
      expect(actions.map(node => node.props.label)).toEqual(['Info', 'FAQ']);
      expect(
        actions.map(node => node.findByType(SourceCustomIcon).props.name),
      ).toEqual(['info-circle', 'help-circle']);
      for (const action of actions) {
        expect(action.props.dark).toBe(dark);
        const target = action.findAll(
          node =>
            node.props.accessibilityLabel === action.props.label &&
            node.props.style,
        )[0];
        expect(StyleSheet.flatten(target.props.style)).toMatchObject({
          width: 32,
          height: 32,
        });
        act(() => {
          target.props.onPress();
        });
      }
      const rail = tree.root
        .findAllByType(View)
        .find(
          node =>
            node.findAllByType(BaselineHeaderActionButton).length === 2 &&
            StyleSheet.flatten(node.props.style)?.gap === 8 &&
            StyleSheet.flatten(node.props.style)?.width === 72,
        )!;
      expect(rail).toBeDefined();
      expect(StyleSheet.flatten(rail.props.style).height).toBe(32);
      act(() => tree.unmount());
    },
  );

  it.each([undefined, 'default', 'unread', 'contact-messages'])(
    'composes More state %s from canonical leaves',
    variantId => {
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <HeaderDesignSystemPreview
            componentId="shell.more-header"
            variantId={variantId}
            dark
          />,
        );
      });
      expect(tree.root.findAllByType(BaselineL1Header)).toHaveLength(1);
      expect(tree.root.findByType(BaselineL1Header).props).toMatchObject({
        variant: 'more',
        dark: true,
      });
      const actions = tree.root.findAllByType(BaselineHeaderActionButton);
      expect(actions.map(n => n.props.icon)).toEqual(
        variantId === 'contact-messages'
          ? ['contact-phone', 'messages']
          : ['profile', 'messages', 'logout'],
      );
      expect(
        actions.find(n => n.props.icon === 'messages')!.props.badgeCount,
      ).toBe(
        variantId === 'unread' ? 7 : variantId === 'contact-messages' ? 2 : 0,
      );
      act(() => tree.unmount());
    },
  );

  it('passes the explicit theme to the canonical title color conversion', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <HeaderDesignSystemPreview
          componentId="shell.page-header"
          variantId="level-1-categorized"
          dark
        />,
      );
    });
    expect(tree.root.findByType(BaselinePageHeader).props).toMatchObject({
      dark: true,
      largeTitleColor: sourceColor('var(--uc-pfm-utilities)', true),
    });
    act(() => tree.unmount());
  });

  it.each([
    ['shell.page-header', 'unknown'],
    ['shell.page-header', 'default'],
    ['shell.more-header', 'unknown'],
    ['shell.home-header', 'default'],
    ['unknown', undefined],
  ])('returns null for unsupported %s / %s', (componentId, variantId) => {
    expect(
      HeaderDesignSystemPreview({
        componentId: componentId!,
        variantId,
        dark: false,
      }),
    ).toBeNull();
  });
});
