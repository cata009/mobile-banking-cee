import React from 'react';
import { StyleSheet } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import { BaselineMailboxTabs } from '../src/universal/BaselineMailboxTabs';
import { BaselineSectionDivider } from '../src/universal/BaselineSectionDivider';

function styleForText(tree: Renderer.ReactTestRenderer, text: string) {
  const node = tree.root.find(
    candidate => candidate.props?.children === text && candidate.props?.style,
  );
  return StyleSheet.flatten(node.props.style);
}

describe('shared baseline tabs and dividers match Source geometry', () => {
  it('preserves the More/Messages tab type and border-inclusive height', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineMailboxTabs
          tabs={[
            { id: 'inbox', label: 'Inbox', hasNewItems: true },
            { id: 'outbox', label: 'Outbox' },
          ]}
          activeTabId="inbox"
          onChange={() => {}}
          includeBorderInHeight
          withTopMargin={false}
          labelTextStyle={{ overflow: 'visible' }}
        />,
      );
    });

    const tabList = tree.root.find(node => node.props?.role === 'tablist');
    expect(StyleSheet.flatten(tabList.props.style)).toMatchObject({
      height: 48,
      marginTop: 0,
      borderBottomWidth: 1,
    });
    expect(
      StyleSheet.flatten(
        tree.root.find(
          node => node.props?.accessibilityRole === 'tab' && node.props?.accessibilityLabel === 'Inbox',
        ).props.style,
      ),
    ).toMatchObject({ height: 47 });
    expect(styleForText(tree, 'Inbox')).toMatchObject({
      fontFamily: 'UniCredit-bold',
      fontSize: 18,
      overflow: 'visible',
    });
    expect(styleForText(tree, 'Inbox').lineHeight).toBe(20);
    act(() => tree.unmount());
  });

  it('uses the approved two-item type for Czech catalogue tabs with the existing border allowance', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineMailboxTabs
          tabs={[
            { id: 'all', label: 'All products' },
            { id: 'regular', label: 'Regular Plan' },
          ]}
          activeTabId="all"
          onChange={() => {}}
          ariaLabel="Investment catalogue type"
          includeBorderInHeight
        />,
      );
    });

    for (const label of ['All products', 'Regular Plan']) {
      expect(styleForText(tree, label)).toMatchObject({
        fontFamily: 'UniCredit-bold',
        fontSize: 18,
      });
      expect(styleForText(tree, label).lineHeight).toBe(20);
    }
    expect(
      StyleSheet.flatten(
        tree.root.find(node => node.props?.role === 'tablist').props.style,
      ),
    ).toMatchObject({ height: 48, borderBottomWidth: 1 });
    act(() => tree.unmount());
  });

  it('keeps Products section dividers on their canonical 14px type and 8px rule gap', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineSectionDivider
          title="PRODUCTS"
          count={3}
          countAlign="end"
        />,
      );
    });

    expect(styleForText(tree, 'PRODUCTS')).toMatchObject({
      fontFamily: 'UniCredit-bold',
      fontSize: 14,
      textTransform: 'uppercase',
    });
    expect(styleForText(tree, 'PRODUCTS').lineHeight).toBeUndefined();
    expect(
      tree.root.findAll(
        node =>
          node.props?.style &&
          StyleSheet.flatten(node.props.style).height === 1 &&
          StyleSheet.flatten(node.props.style).marginTop === 8,
      ).length,
    ).toBeGreaterThan(0);
    act(() => tree.unmount());
  });

  it('uses the 15px Source-computed title linebox for basket medium dividers', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineSectionDivider
          title="BASKET CONTENTS"
          variant="medium-title"
        />,
      );
    });

    expect(styleForText(tree, 'BASKET CONTENTS').lineHeight).toBe(15);
    act(() => tree.unmount());
  });
});
