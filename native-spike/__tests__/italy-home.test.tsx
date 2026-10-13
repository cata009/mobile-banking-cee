import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Image, PixelRatio, Platform, StyleSheet } from 'react-native';
import Svg, {
  FeGaussianBlur,
  Filter,
  LinearGradient,
  Rect,
  Image as SvgImage,
} from 'react-native-svg';
import Home from '../src/experiences/pi/it/Home';
import {
  DEFAULT_ITALY_COUNTS,
  type ItalyNativeHomeProps,
} from '../src/experiences/pi/it/contracts';
import { homeAmountParts } from '../src/experiences/pi/it/homeModel';
import * as homePresentation from '../src/experiences/pi/it/homeModel';
import { getItalyFinancialSnapshot } from '../../src/features/finance/italyFinancials';
import { getAccountLedgerRecord } from '../../src/features/accounts-payments/mobileFirstAccounts';
import { ACCOUNT_DIRECTORY } from '../../src/experiences/pi/it/mobile-first/accountContent';
import { MainHeader } from '../src/experiences/pi/it/MainHeader';
import { ModalPortal } from '../src/universal/ModalPortal';
import { homeStyles } from '../src/experiences/pi/it/homeStyles';
import { homeAssets } from '../src/experiences/pi/it/homeAssets';
import { VectorArtworkLayer } from '../src/universal/VectorArtworkLayer';

function button(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    node =>
      typeof node.props?.onPress === 'function' &&
      node.props.accessibilityLabel === label,
  )[0]!;
}
async function render(overrides: Partial<ItalyNativeHomeProps> = {}) {
  const props: ItalyNativeHomeProps = {
    productCounts: DEFAULT_ITALY_COUNTS,
    amountsHidden: false,
    onNavigate: jest.fn(),
    onSearch: jest.fn(),
    onProfile: jest.fn(),
    onAmountsToggle: jest.fn(),
    onIntent: jest.fn(),
    ...overrides,
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<Home {...props} />);
  });
  return { tree, props };
}
function capturedHermesFormatter(output: string) {
  const formatter = new Intl.NumberFormat('it-IT');
  Object.defineProperty(formatter, 'format', { value: () => output });
  return formatter;
}

test('home header and canonical account entry deliver exact host destinations', async () => {
  const { tree, props } = await render();
  await act(() => button(tree, 'Cerca').props.onPress());
  await act(() => button(tree, 'Profilo').props.onPress());
  await act(() => button(tree, 'Bilancio').props.onPress());
  await act(() => button(tree, 'Investimenti').props.onPress());
  await act(() => button(tree, 'Apri conto Andrea Rossini').props.onPress());
  expect(props.onSearch).toHaveBeenCalledTimes(1);
  expect(props.onProfile).toHaveBeenCalledTimes(1);
  expect(props.onNavigate).toHaveBeenNthCalledWith(1, {
    kind: 'pfm',
    tab: 'Bilancio familiare',
  });
  expect(props.onNavigate).toHaveBeenNthCalledWith(2, { kind: 'investments' });
  expect(props.onNavigate).toHaveBeenNthCalledWith(3, {
    kind: 'account',
    accountNumber: '000012345',
  });
  const ledgerAccount = getAccountLedgerRecord(
    ACCOUNT_DIRECTORY[0],
    getItalyFinancialSnapshot(),
  );
  const amount = homeAmountParts(ledgerAccount.balance, false);
  expect(
    tree.root.findAll(
      node =>
        node.props.accessibilityLabel === `${amount.integer}${amount.decimals}`,
    ).length,
  ).toBeGreaterThan(0);
  await act(() => tree.unmount());
});

test('privacy masks account and summary amounts and delegates toggling to host', async () => {
  const { tree, props } = await render({ amountsHidden: true });
  await act(() => button(tree, 'Mostra importi').props.onPress());
  expect(props.onAmountsToggle).toHaveBeenCalledTimes(1);
  expect(
    tree.root.findAll(node => node.props.accessibilityLabel === '**.***,** €')
      .length,
  ).toBeGreaterThan(0);
  expect(
    tree.root.findAll(
      node => node.props.accessibilityLabel === '*.***.***,** €',
    ).length,
  ).toBeGreaterThan(0);
  await act(() => tree.unmount());
});

test('summary carousel changes active selection and exposes canonical budget/wealth navigation', async () => {
  const { tree, props } = await render();
  expect(button(tree, 'Riepilogo precedente').props.disabled).toBe(true);
  await act(() => button(tree, 'Riepilogo successivo').props.onPress());
  expect(button(tree, 'Riepilogo 2').props.accessibilityState.selected).toBe(
    true,
  );
  await act(() => button(tree, 'Riepilogo 3').props.onPress());
  expect(button(tree, 'Riepilogo successivo').props.disabled).toBe(true);
  await act(() => button(tree, 'VAI AL BUDGET').props.onPress());
  await act(() => button(tree, 'VAI AL PATRIMONIO').props.onPress());
  expect(props.onNavigate).toHaveBeenNthCalledWith(1, {
    kind: 'pfm',
    tab: 'Budget',
  });
  expect(props.onNavigate).toHaveBeenNthCalledWith(2, {
    kind: 'pfm',
    tab: 'Patrimonio',
  });
  await act(() => tree.unmount());
});

test('category selection uses eligible cards and precise PIN and operations intents', async () => {
  const { tree, props } = await render();
  await act(() => button(tree, 'Carte').props.onPress());
  expect(button(tree, 'Carte').props.accessibilityState.selected).toBe(true);
  expect(
    tree.root.findAll(
      node => node.props.accessibilityLabel === 'Apri conto Andrea Rossini',
    ),
  ).toHaveLength(0);
  await act(() =>
    button(tree, 'Apri carta UniCredit Flexia Classic').props.onPress(),
  );
  await act(() => button(tree, 'PIN UniCredit Flexia Classic').props.onPress());
  await act(() => button(tree, 'TUTTE LE CARTE').props.onPress());
  await act(() => button(tree, 'Operazioni').props.onPress());
  expect(props.onNavigate).toHaveBeenNthCalledWith(1, {
    kind: 'card',
    cardId: 'flexia',
  });
  expect(props.onIntent).toHaveBeenNthCalledWith(1, {
    kind: 'card-action',
    cardId: 'flexia',
    action: 'pin',
  });
  expect(props.onIntent).toHaveBeenNthCalledWith(2, {
    kind: 'category-hub',
    category: 'Carte',
  });
  expect(props.onIntent).toHaveBeenNthCalledWith(3, { kind: 'operations' });
  await act(() => tree.unmount());
});

test('search category entry updates Home without opening an owned-products hub', async () => {
  const { tree, props } = await render({ initialCategory: 'Carte' });
  expect(button(tree, 'Carte').props.accessibilityState.selected).toBe(true);
  await act(() =>
    tree.update(<Home {...props} initialCategory="Mutui e Prestiti" />),
  );
  expect(
    button(tree, 'Mutui e Prestiti').props.accessibilityState.selected,
  ).toBe(true);
  expect(button(tree, 'Apri Mutuo Casa Milano')).toBeTruthy();
  expect(props.onNavigate).not.toHaveBeenCalled();
  expect(props.onIntent).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});

test('account quick action chooses a canonical account and preserves action intent', async () => {
  const { tree, props } = await render();
  await act(() => button(tree, 'Condividi IBAN 000012345').props.onPress());
  await act(() =>
    button(tree, 'Seleziona Andrea Rossini e Flavia Bianchini').props.onPress(),
  );
  expect(props.onIntent).toHaveBeenCalledWith({
    kind: 'account-action',
    accountNumber: '000067890',
    action: 'share',
  });
  expect(props.onNavigate).not.toHaveBeenCalled();
  expect(
    tree.root.findAll(
      node => node.props.accessibilityLabel === 'Chiudi pannello',
    ),
  ).toHaveLength(0);
  await act(() => tree.unmount());
});

test('counts constrain owned product previews and highlight controls switch wallets', async () => {
  const { tree, props } = await render({
    productCounts: {
      ...DEFAULT_ITALY_COUNTS,
      accounts: 1,
      creditCards: 0,
      debitCards: 0,
      loans: 0,
      mortgages: 0,
    },
  });
  expect(
    tree.root.findAll(
      node =>
        node.props.accessibilityLabel ===
        'Apri conto Andrea Rossini e Flavia Bianchini',
    ),
  ).toHaveLength(0);
  await act(() => button(tree, 'Carte').props.onPress());
  expect(
    tree.root.findAll(node =>
      String(node.props.accessibilityLabel).startsWith('Apri carta '),
    ),
  ).toHaveLength(0);
  await act(() => button(tree, 'Mutui e Prestiti').props.onPress());
  expect(
    tree.root.findAll(
      node => node.props.accessibilityLabel === 'Apri Mutuo Casa Milano',
    ),
  ).toHaveLength(0);
  await act(() => button(tree, 'Simulazione mutuo').props.onPress());
  expect(props.onIntent).toHaveBeenCalledWith({
    kind: 'loan-action',
    view: 'simulations',
  });
  await act(() => button(tree, 'In evidenza successivo').props.onPress());
  expect(button(tree, 'Samsung Pay')).toBeTruthy();
  await act(() => tree.unmount());
});

test('brand preserves the source information panel and its close action', async () => {
  const { tree, props } = await render();
  await act(() => button(tree, 'UniCredit e buddy').props.onPress());
  const sheet = tree.root.findByType(ModalPortal);
  expect(
    sheet.findAll(
      node =>
        node.props.children ===
        'I tuoi prodotti UniCredit e le offerte buddy, in un’unica app.',
    ).length,
  ).toBeGreaterThan(0);
  expect(props.onNavigate).not.toHaveBeenCalled();
  expect(props.onIntent).not.toHaveBeenCalled();
  await act(() => button(tree, 'Chiudi').props.onPress());
  expect(tree.root.findAllByType(ModalPortal)).toHaveLength(0);
  await act(() => tree.unmount());
});

test('sticky header collapses the source gap without moving content and ignores hidden-route zero-width layout', async () => {
  const { tree } = await render();
  const main = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Homepage Mobile First' &&
      typeof node.props.onScroll === 'function',
  )[0];
  expect(tree.root.findByType(MainHeader).props.tabsGap).toBe(16);
  await act(() =>
    main.props.onScroll({ nativeEvent: { contentOffset: { y: 20 } } }),
  );
  expect(tree.root.findByType(MainHeader).props.tabsGap).toBe(0);
  expect(tree.root.findByType(MainHeader).parent!.props.style).toEqual(
    homeStyles.chromePlaceholder,
  );
  const root = tree.root.findAll(
    node =>
      node.props.style === homeStyles.root &&
      typeof node.props.onLayout === 'function',
  )[0];
  await act(() =>
    root.props.onLayout({ nativeEvent: { layout: { width: 320 } } }),
  );
  const summary = () =>
    tree.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Riepilogo 1' &&
        StyleSheet.flatten(node.props.style)?.width,
    )[0];
  expect(StyleSheet.flatten(summary().props.style).width).toBe(273);
  await act(() =>
    root.props.onLayout({ nativeEvent: { layout: { width: 0 } } }),
  );
  expect(StyleSheet.flatten(summary().props.style).width).toBe(273);
  await act(() => tree.unmount());
});

test('owned loans use the source bullet privacy mask and commercial offers lead to simulations', async () => {
  const { tree, props } = await render({
    initialCategory: 'Mutui e Prestiti',
    amountsHidden: true,
  });
  expect(
    tree.root.findAll(node => node.props.accessibilityLabel === '••••').length,
  ).toBeGreaterThan(0);
  await act(() =>
    button(tree, 'Mutuo UniCredit - Finalità acquisto').props.onPress(),
  );
  await act(() => button(tree, 'Avvia simulazione mutuo').props.onPress());
  expect(props.onIntent).toHaveBeenCalledWith({
    kind: 'loan-action',
    view: 'simulations',
  });
  expect(tree.root.findAllByType(ModalPortal)).toHaveLength(0);
  await act(() => tree.unmount());
});

test('all commercial cards expose selectable products instead of an inert text summary', async () => {
  const { tree } = await render({ initialCategory: 'Carte' });
  await act(() =>
    button(tree, 'SCOPRI TUTTI I NOSTRI PRODOTTI').props.onPress(),
  );
  const sheet = tree.root.findByType(ModalPortal);
  const product = sheet.findAll(
    node =>
      node.props.accessibilityLabel === 'UniCreditCard Flexia Classic' &&
      typeof node.props.onPress === 'function',
  )[0];
  await act(() => product.props.onPress());
  expect(
    tree.root
      .findByType(ModalPortal)
      .findAll(
        node =>
          node.props.children ===
          'Per i piccoli e grandi acquisti di tutti i giorni',
      ).length,
  ).toBeGreaterThan(0);
  await act(() => tree.unmount());
});

test('insurance promotional entries and the source catalogue link emit the actual catalogue intent', async () => {
  const { tree, props } = await render({
    initialCategory: 'Polizze assicurative',
  });
  await act(() => button(tree, 'UniCredit My Care Futuro').props.onPress());
  await act(() => button(tree, 'SCOPRI I NOSTRI PRODOTTI').props.onPress());
  expect(props.onIntent).toHaveBeenNthCalledWith(1, {
    kind: 'insurance-action',
    view: 'catalogue',
  });
  expect(props.onIntent).toHaveBeenNthCalledWith(2, {
    kind: 'insurance-action',
    view: 'catalogue',
  });
  expect(tree.root.findAllByType(ModalPortal)).toHaveLength(0);
  await act(() => tree.unmount());
});

test('card art keeps distinct source credit/debit gradients so debit never reuses the dark credit shade', async () => {
  const { tree } = await render({ initialCategory: 'Carte' });
  const gradients = tree.root.findAllByType(LinearGradient);
  expect(gradients).toHaveLength(2);
  expect(gradients[0].props.id).not.toBe(gradients[1].props.id);
  expect(gradients[0].props.x1).toBeCloseTo(375.38, 0);
  expect(gradients[0].props.y1).toBeCloseTo(36.36, 0);
  gradients.forEach(gradient => {
    expect(
      tree.root
        .findAllByType(Rect)
        .filter(rect => rect.props.fill === `url(#${gradient.props.id})`),
    ).toHaveLength(1);
  });
  await act(() => tree.unmount());
});

test('Home credit and debit art use native vector layers with exact source texture and arrow geometry', async () => {
  const { tree } = await render({ initialCategory: 'Carte' });
  const layers = tree.root.findAllByType(VectorArtworkLayer);
  expect(layers).toHaveLength(6);
  expect(layers[0].props).toMatchObject({
    asset: homeAssets.flexia,
    width: 361,
    height: 227,
  });
  expect(layers[3].props).toMatchObject({
    asset: homeAssets.myOne,
    width: 361,
    height: 227,
  });
  [layers[1], layers[4]].forEach(texture =>
    expect(texture.props).toMatchObject({
      asset: homeAssets.pattern,
      x: -109.998,
      y: -136.115,
      width: 643.939,
      height: 622.738,
    }),
  );
  expect(layers[2].props).toMatchObject({
    asset: homeAssets.creditArrow,
    x: -50.855,
    y: -0.59,
    width: 226.188,
    height: 229.165,
    opacity: 1,
  });
  expect(layers[5].props).toMatchObject({
    asset: homeAssets.debitArrow,
    x: -50.855,
    y: -0.59,
    width: 226.188,
    height: 229.165,
    opacity: 0.8,
  });
  expect(tree.root.findAllByType(SvgImage)).toHaveLength(0);
  tree.root
    .findAllByType(Svg)
    .filter(svg => svg.props.viewBox === '0 0 361 227')
    .forEach(svg =>
      expect(StyleSheet.flatten(svg.props.style)).toMatchObject({
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }),
    );
  expect(
    tree.root
      .findAllByType(Image)
      .filter(node =>
        /^data:image\/svg\+xml/.test(node.props.source?.uri ?? ''),
      ),
  ).toHaveLength(0);
  await act(() => tree.unmount());
});

test.each([
  [1341.27, '1.341,27', '1341', ',27 €'],
  [-1341.27, '-1.341,27', '-1341', ',27 €'],
  [999.995, '1.000,00', '1000', ',00 €'],
  [-999.995, '-1.000,00', '-1000', ',00 €'],
  [9999.994, '9.999,99', '9999', ',99 €'],
  [-9999.994, '-9.999,99', '-9999', ',99 €'],
  [9999.995, '10.000,00', '10.000', ',00 €'],
  [-9999.995, '-10.000,00', '-10.000', ',00 €'],
  [53550.27, '53.550,27', '53.550', ',27 €'],
] as const)(
  'Home auto presentation normalizes old Hermes output for %s using the rounded integer',
  (value, hermes, integer, decimals) => {
    const hermesInstance = capturedHermesFormatter(hermes);
    const formatter = jest
      .spyOn(Intl, 'NumberFormat')
      .mockImplementationOnce(() => hermesInstance);
    try {
      expect(homeAmountParts(value, false)).toEqual({ integer, decimals });
    } finally {
      formatter.mockRestore();
    }
  },
);

test('Source card/loan always grouping remains explicit and privacy masks stay unchanged', () => {
  const hermesInstance = capturedHermesFormatter('1.341,27');
  const formatter = jest
    .spyOn(Intl, 'NumberFormat')
    .mockImplementation(() => hermesInstance);
  try {
    expect(homeAmountParts(1341.27, false, false, 'always')).toEqual({
      integer: '1.341',
      decimals: ',27 €',
    });
    expect(homeAmountParts(1341.27, true)).toEqual({
      integer: '**.***',
      decimals: ',** €',
    });
    expect(homeAmountParts(1341.27, true, true)).toEqual({
      integer: '*.***.***',
      decimals: ',** €',
    });
  } finally {
    formatter.mockRestore();
  }
});

test('actual Intl cent rounding keeps Source grouping after crossing ten thousand euros', () => {
  expect(homeAmountParts(1341.27, false, false, 'always')).toEqual({
    integer: '1.341',
    decimals: ',27 €',
  });
  expect(homeAmountParts(-1341.27, false, false, 'always')).toEqual({
    integer: '-1.341',
    decimals: ',27 €',
  });
  expect(homeAmountParts(9999.995, false)).toEqual({
    integer: '10.000',
    decimals: ',00 €',
  });
  expect(homeAmountParts(-9999.995, false)).toEqual({
    integer: '-10.000',
    decimals: ',00 €',
  });
});

test.each([
  ['Conti', 'auto'],
  ['Carte', 'always'],
  ['Mutui e Prestiti', 'always'],
] as const)(
  'Home %s passes the Source-specific %s grouping mode without changing domain values',
  async (initialCategory, grouping) => {
    const presentation = jest.spyOn(homePresentation, 'homeAmountParts');
    try {
      const { tree } = await render({ initialCategory });
      expect(presentation).toHaveBeenCalledWith(
        expect.any(Number),
        false,
        false,
        grouping,
      );
      expect(presentation).toHaveBeenCalledWith(
        expect.any(Number),
        false,
        true,
        'auto',
      );
      await act(() => tree.unmount());
    } finally {
      presentation.mockRestore();
    }
  },
);

test('only each card shade receives its own Source blur filter, leaving original vectors and layout intact', async () => {
  const { tree } = await render({ initialCategory: 'Carte' });
  const filters = tree.root.findAllByType(Filter);
  expect(filters).toHaveLength(2);
  expect(filters[0].props.id).not.toBe(filters[1].props.id);
  filters.forEach(filter => {
    expect(filter.props).toMatchObject({
      x: -6,
      y: -6,
      width: 373,
      height: 239,
      filterUnits: 'userSpaceOnUse',
      primitiveUnits: 'userSpaceOnUse',
    });
    expect(filter.findByType(FeGaussianBlur).props).toMatchObject({
      in: 'SourceGraphic',
      stdDeviation: 2,
    });
    const shaded = tree.root
      .findAllByType(Rect)
      .filter(rect => rect.props.filter === `url(#${filter.props.id})`);
    expect(shaded).toHaveLength(1);
    expect(shaded[0].props).toMatchObject({
      x: 0,
      y: 0,
      width: 361,
      height: 227,
    });
  });
  expect(tree.root.findAllByType(VectorArtworkLayer)).toHaveLength(6);
  expect(tree.root.findAllByType(SvgImage)).toHaveLength(0);
  await act(() => tree.unmount());
});

test('Android shade blur compensates for the SVG backend pixel units without changing the source canvas', async () => {
  const os = Platform.OS;
  Platform.OS = 'android';
  const density = jest.spyOn(PixelRatio, 'get').mockReturnValue(2.625);
  try {
    const { tree } = await render({ initialCategory: 'Carte' });
    tree.root
      .findAllByType(FeGaussianBlur)
      .forEach(blur => expect(blur.props.stdDeviation).toBe(5.25));
    expect(tree.root.findAllByType(Filter)).toHaveLength(2);
    await act(() => tree.unmount());
  } finally {
    density.mockRestore();
    Platform.OS = os;
  }
});
