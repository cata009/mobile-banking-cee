import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import Home from '../src/experiences/pi/it/Home';
import NativeItalyApp from '../src/experiences/pi/it/NativeItalyApp';
import Search from '../src/experiences/pi/it/Search';
import { MainHeader } from '../src/experiences/pi/it/MainHeader';
import { MainNavigationHeader } from '../src/universal/MainNavigationHeader';
import AccountScreen from '../src/experiences/pi/it/accounts/AccountScreen';
import CardScreen from '../src/experiences/pi/it/cards/CardScreen';
import { AssetGlyph } from '../src/universal/AssetGlyph';
import { DEFAULT_ITALY_COUNTS } from '../src/experiences/pi/it/contracts';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('../src/platform/nativeUpdates', () => {
  const state = { phase: 'idle' };
  return {
    nativeUpdateIdentity: () => null,
    nativeUpdates: {
      getSnapshot: () => state,
      subscribe: () => () => {},
      check: jest.fn(),
      applyIfSafe: jest.fn(),
    },
  };
});

test('measured Source sticky rows retain their content footprint while collapsing the sixteen pixel gap', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <Home
        productCounts={DEFAULT_ITALY_COUNTS}
        amountsHidden={false}
        onNavigate={jest.fn()}
        onSearch={jest.fn()}
        onProfile={jest.fn()}
        onAmountsToggle={jest.fn()}
      />,
    );
  });
  const scroll = tree.root
    .findAllByType(ScrollView)
    .find(node => node.props.accessibilityLabel === 'Homepage Mobile First')!;
  expect(scroll.props.stickyHeaderIndices).toEqual([0]);
  const operations = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Operazioni' &&
      typeof node.props.onPress === 'function',
  )[0];
  expect(StyleSheet.flatten(operations.props.style).height).toBe(66);
  expect(StyleSheet.flatten(operations.parent!.props.style)).toMatchObject({
    height: 72,
    justifyContent: 'flex-start',
  });
  expect(
    tree.root.findByType(MainNavigationHeader).props.tabJustifyContent,
  ).toBe('center');
  expect(tree.root.findByType(MainHeader).props.tabsGap).toBe(16);
  await act(() =>
    scroll.props.onScroll({ nativeEvent: { contentOffset: { y: 20 } } }),
  );
  expect(tree.root.findByType(MainHeader).props.tabsGap).toBe(0);
  await act(() =>
    scroll.props.onScroll({ nativeEvent: { contentOffset: { y: 75 } } }),
  );
  expect(tree.root.findByType(MainHeader).props.tabsGap).toBe(0);
  await act(() =>
    scroll.props.onScroll({ nativeEvent: { contentOffset: { y: 86 } } }),
  );
  expect(tree.root.findByType(MainHeader).props.tabsGap).toBe(0);
  await act(() => tree.unmount());
});

test('Italy host carries Source counts and initial privacy through Home and the search snapshot', async () => {
  const counts = {
    ...DEFAULT_ITALY_COUNTS,
    accounts: 0,
    debitCards: 0,
    creditCards: 0,
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <NativeItalyApp
        productCounts={counts}
        initialAmountsHidden
        previewInsetTop={70}
      />,
    );
  });
  const home = tree.root.findByType(Home);
  expect(home.props.productCounts).toEqual(counts);
  expect(home.props.amountsHidden).toBe(true);
  await act(() => home.props.onSearch());
  const search = tree.root.findByType(Search);
  expect(search.props.amountsHidden).toBe(true);
  expect(
    search.props.entries.filter(
      (entry: { target: { kind: string } }) => entry.target.kind === 'card',
    ),
  ).toHaveLength(0);
  await act(() => search.props.onClose());
  await act(() =>
    tree.root
      .findByType(Home)
      .props.onNavigate({ kind: 'account', accountNumber: '000012345' }),
  );
  expect(tree.root.findByType(AccountScreen).props.productCounts).toEqual(
    counts,
  );
  expect(tree.root.findByType(AccountScreen).props.amountsHidden).toBe(true);
  const accountTree = tree.root.findByType(AccountScreen);
  const quickTransfer = accountTree.findAll(
    node =>
      node.props.accessibilityLabel === 'Bonifico' &&
      typeof node.props.onPress === 'function',
  )[0];
  expect(quickTransfer).toBeDefined();
  expect(quickTransfer.findByType(AssetGlyph).props.size).toBe(24);
  const reserve = accountTree.findAll(
    node =>
      node.props.accessibilityLabel === 'Riserva di liquidità' &&
      typeof node.props.onPress === 'function',
  )[0];
  expect(reserve.findByType(AssetGlyph).props.size).toBe(16);
  await act(() => tree.unmount());
});

test('Source category keyboard navigation wraps and moves focus to the selected tab', async () => {
  const original = Platform.OS;
  Platform.OS = 'web';
  let tree!: Renderer.ReactTestRenderer;
  try {
    await act(() => {
      tree = Renderer.create(
        <Home
          productCounts={DEFAULT_ITALY_COUNTS}
          amountsHidden={false}
          onNavigate={jest.fn()}
          onSearch={jest.fn()}
          onProfile={jest.fn()}
          onAmountsToggle={jest.fn()}
        />,
      );
    });
    const rail = tree.root
      .findAllByType(ScrollView)
      .find(node => node.props.accessibilityLabel === 'Categorie prodotti')!;
    const focus = Array.from({ length: 4 }, () => jest.fn());
    const currentTarget = {
      querySelectorAll: () => focus.map(f => ({ focus: f })),
    };
    const preventDefault = jest.fn();
    expect(typeof rail.props.onKeyDown).toBe('function');
    await act(() =>
      rail.props.onKeyDown({ key: 'ArrowLeft', preventDefault, currentTarget }),
    );
    const selected = (label: string) =>
      tree.root.findAll(
        node =>
          node.props.accessibilityLabel === label &&
          typeof node.props.onPress === 'function',
      )[0];
    expect(
      selected('Polizze assicurative').props.accessibilityState.selected,
    ).toBe(true);
    expect(focus[3]).toHaveBeenCalledWith({ preventScroll: true });
    await act(() =>
      rail.props.onKeyDown({ key: 'Home', preventDefault, currentTarget }),
    );
    expect(selected('Conti').props.accessibilityState.selected).toBe(true);
    expect(focus[0]).toHaveBeenCalledWith({ preventScroll: true });
    expect(preventDefault).toHaveBeenCalledTimes(2);
  } finally {
    if (tree) await act(() => tree.unmount());
    Platform.OS = original;
  }
});

test('card detail quick actions use the original twenty-four pixel glyph canvas', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <CardScreen
        target={{ kind: 'card', cardId: 'flexia' }}
        productCounts={DEFAULT_ITALY_COUNTS}
        amountsHidden={false}
        onBack={jest.fn()}
        onNavigate={jest.fn()}
        onProfile={jest.fn()}
        onChanged={jest.fn()}
      />,
    );
  });
  const installment = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Paga a rate' &&
      typeof node.props.onPress === 'function',
  )[0];
  expect(installment.findByType(AssetGlyph).props.size).toBe(24);
  await act(() => tree.unmount());
});
