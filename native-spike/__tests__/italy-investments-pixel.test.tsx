import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ScrollView, StyleSheet, Text as NativeText, View } from 'react-native';
import InvestmentsScreen from '../src/experiences/pi/it/investments/InvestmentsScreen';
import { AssetGlyph } from '../src/experiences/pi/it/investments/Primitives';
import {
  DEFAULT_ITALY_COUNTS,
  type ItalyNativeScreenProps,
} from '../src/experiences/pi/it/contracts';
import {
  resetSecuritiesFinancialState,
  readSecuritiesFinancialState,
} from '@/features/investments/mobileFirstSecurities';
import { resetFundsState } from '@/features/investments/mobileFirstFundsState';

function button(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0]!;
}
async function renderSecurity() {
  resetSecuritiesFinancialState();
  const props: ItalyNativeScreenProps = {
    target: {
      kind: 'investments',
      destination: {
        area: 'securities',
        view: 'security',
        instrument: 'nvidia',
      },
    },
    productCounts: DEFAULT_ITALY_COUNTS,
    amountsHidden: false,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onProfile: jest.fn(),
    onChanged: jest.fn(),
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<InvestmentsScreen {...props} />);
  });
  return { tree, props };
}
async function renderFund() {
  resetFundsState();
  let tree!: Renderer.ReactTestRenderer;
  const props: ItalyNativeScreenProps = {
    target: {
      kind: 'investments',
      destination: { area: 'funds', view: 'fund', instrument: 'allianz' },
    },
    productCounts: DEFAULT_ITALY_COUNTS,
    amountsHidden: false,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onProfile: jest.fn(),
    onChanged: jest.fn(),
  };
  await act(() => {
    tree = Renderer.create(<InvestmentsScreen {...props} />);
  });
  return tree;
}

test('Source fund position uses its two-column value cards and source title-link typography', async () => {
  const tree = await renderFund();
  const pmc = tree.root.findAll(
    node => node.type === View && node.props.testID === 'fund-data-PMC',
  )[0]!;
  expect(pmc).toBeDefined();
  expect(StyleSheet.flatten(pmc.props.style)).toMatchObject({
    minHeight: 72,
    padding: 12,
    borderRadius: 16,
    gap: 8,
    backgroundColor: '#f5f5f5',
  });
  const label = pmc
    .findAllByType(NativeText)
    .find(node => node.props.children === 'PMC')!;
  expect(StyleSheet.flatten(label.props.style)).toMatchObject({
    fontSize: 18,
    lineHeight: 20,
    color: '#262626',
  });
  expect(
    StyleSheet.flatten(
      button(tree, 'scheda fondo').findByType(NativeText).props.style,
    ),
  ).toMatchObject({ fontSize: 14, lineHeight: 28 });
  const selected = button(tree, 'La tua posizione');
  expect(
    StyleSheet.flatten(selected.findByType(NativeText).props.style),
  ).toMatchObject({ fontSize: 16, lineHeight: 22 });
});

test('Source fund operation menu keeps its white bordered container and original separated rows', async () => {
  const tree = await renderFund();
  await act(() => button(tree, 'Operazioni').props.onPress());
  const menu = tree.root.findAll(
    node => node.type === View && node.props.testID === 'fund-operation-menu',
  )[0]!;
  expect(menu).toBeDefined();
  expect(StyleSheet.flatten(menu.props.style)).toMatchObject({
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    padding: 16,
  });
  const subscribe = button(tree, 'Sottoscrizione fondi');
  expect(StyleSheet.flatten(subscribe.props.style)).toMatchObject({
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  });
  expect(
    StyleSheet.flatten(subscribe.findByType(NativeText).props.style),
  ).toMatchObject({ fontSize: 16, lineHeight: 22, color: '#262626' });
});
test('Source security heading uses28/32 and buy action stays outside the scrolling content', async () => {
  const { tree } = await renderSecurity();
  const name = tree.root
    .findAllByType(NativeText)
    .find(node => node.props.children === 'NVIDIA')!;
  expect(StyleSheet.flatten(name.props.style)).toMatchObject({
    fontSize: 28,
    lineHeight: 32,
  });
  const buy = button(tree, 'Acquista');
  expect(
    tree.root
      .findAllByType(ScrollView)
      .some(scroll => scroll.findAll(node => node === buy).length > 0),
  ).toBe(false);
  expect(button(tree, 'Vendi')).toBeUndefined();
});
test('Source security quick actions use original24px glyphs and preserve exact watchlist and virtual entry identity', async () => {
  const { tree, props } = await renderSecurity();
  for (const label of [
    'Aggiungi a Watchlist',
    'Portafoglio virtuale',
    'Grafico avanzato',
  ]) {
    const glyph = button(tree, label).findByType(AssetGlyph);
    expect(glyph.props.width).toBe(24);
    expect(glyph.props.height).toBe(24);
  }
  await act(() => button(tree, 'Aggiungi a Watchlist').props.onPress());
  await act(() => button(tree, 'Aggiungi a ETF').props.onPress());
  expect(
    readSecuritiesFinancialState().watchlists.find(list => list.name === 'ETF')!
      .instruments,
  ).toContain('nvidia');
  await act(() => button(tree, 'Indietro').props.onPress());
  expect(props.onBack).not.toHaveBeenCalled();
  await act(() => button(tree, 'Portafoglio virtuale').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Portafoglio virtuale');
});
test('Source quote market selection is retained through buy and nested Back without changing its exact instrument', async () => {
  const { tree, props } = await renderSecurity();
  await act(() => button(tree, 'Mercato').props.onPress());
  await act(() => button(tree, 'Mercato: Euronext Milano').props.onPress());
  await act(() => button(tree, 'Acquista').props.onPress());
  await act(() => button(tree, 'Indietro').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Euronext Milano');
  expect(JSON.stringify(tree.toJSON())).toContain('US67066G1040');
  expect(props.onBack).not.toHaveBeenCalled();
});

test('Source instrument overview and analyst section headings keep the h3 hierarchy', async () => {
  const { tree } = await renderSecurity();
  const heading = () =>
    tree.root
      .findAllByType(NativeText)
      .find(node => node.props.children === 'Quotazione')!;
  expect(StyleSheet.flatten(heading().props.style)).toMatchObject({
    fontSize: 28,
    lineHeight: 32,
    marginTop: 16,
  });
  await act(() => button(tree, 'Valutazioni').props.onPress());
  const analyst = tree.root
    .findAllByType(NativeText)
    .find(node => node.props.children === 'Valutazioni degli analisti')!;
  expect(StyleSheet.flatten(analyst.props.style)).toMatchObject({
    fontSize: 28,
    lineHeight: 32,
    marginTop: 16,
  });
});

test('Source security market control and detail tabs keep source frames and grow with their text', async () => {
  const { tree } = await renderSecurity();
  expect(StyleSheet.flatten(button(tree, 'Mercato').props.style)).toMatchObject(
    {
      minHeight: 50,
      paddingVertical: 12,
      borderRadius: 12,
      borderColor: '#666',
    },
  );
  const selected = button(tree, 'Overview');
  expect(StyleSheet.flatten(selected.props.style)).toMatchObject({
    height: 'auto',
    minHeight: 46,
    paddingBottom: 18,
  });
  expect(
    StyleSheet.flatten(selected.findByType(NativeText).props.style).lineHeight,
  ).toBe(24);
});

test('Source watchlist cards preserve44px count hierarchy and the original whole new-list tile', async () => {
  const { tree } = await renderSecurity();
  await act(() => button(tree, 'Aggiungi a Watchlist').props.onPress());
  const count =
    tree.root
      .findAllByType(NativeText)
      .find(node => node.props.testID === 'list-count-w1') ??
    tree.root
      .findAllByType(NativeText)
      .find(node => node.props.testID?.startsWith('list-count-'));
  expect(count).toBeDefined();
  expect(StyleSheet.flatten(count!.props.style)).toMatchObject({
    fontSize: 44,
    lineHeight: 48,
  });
  const newList = button(tree, 'Nuova lista');
  expect(StyleSheet.flatten(newList.props.style)).toMatchObject({
    minHeight: 176,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  });
  expect(newList.findByType(AssetGlyph).props.width).toBe(24);
});
