import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { PanResponder, Platform, ScrollView, StyleSheet } from 'react-native';
import { bankingProducts } from '../src/experiences/pi/current/banking/model';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting';
import { maskFormattedAmount } from '@/app/utils/amountPrivacy';
import { formatMaskedCardNumber } from '@/app/utils/cardNumber';
import { copyDemoText } from '../src/platform/nativeFiles';
import Card from '../src/experiences/pi/current/baseline/Card';
import { RoBaselineDetailsHeader } from '../src/experiences/pi/current/baseline/DetailsHeader';
import { BaselineAccountInfoField } from '../src/universal/BaselineAccountInfoField';
import { BaselineNavigationRow } from '../src/universal/BaselineNavigationRow';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import CardInfo from '../src/experiences/pi/current/baseline/CardInfo';
import CardOptions from '../src/experiences/pi/current/baseline/CardOptions';
import { Circle, Path } from 'react-native-svg';
import { FaceIdOverlay as MotionFaceId } from '../src/experiences/pi/current/baseline/FaceIdOverlay';

jest.mock('../src/platform/nativeFiles', () => ({
  copyDemoText: jest.fn(async () => {}),
}));

const counts = {
  accounts: 2,
  debitCards: 2,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 1,
  mortgages: 1,
  investments: 1,
};
function host(extra: Partial<CurrentScreenProps> = {}): CurrentScreenProps {
  return {
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: counts,
    route: { screen: 'card' },
    tokens: currentTokens(),
    t: createCurrentTranslator('RO', 'en'),
    amountsHidden: false,
    screenTopInset: 54,
    isActive: true,
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    mode: 'light',
    onModeChange: jest.fn(),
    ...extra,
  };
}
async function render(props = host()) {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(React.createElement(Card!, props));
  });
  return tree;
}
const button = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    n =>
      n.props.accessibilityLabel === label &&
      typeof n.props.onPress === 'function',
  )[0]!;
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('Romanian baseline card screen uses canonical credit availability and selected product callbacks', async () => {
  const props = host(),
    card = bankingProducts(props).cards.find(c => c.type === 'credit_card')!;
  props.route = { screen: 'card', params: { productId: card.id } };
  const tree = await render(props),
    json = JSON.stringify(tree.toJSON());
  expect(json).toContain(
    formatEvo2027Number(card.type === 'credit_card' ? card.availableCredit : 0),
  );
  expect(json).toContain(formatMaskedCardNumber(card.accountNumber));
  await act(() => button(tree, 'Card Details').props.onPress());
  expect(props.onNavigate).toHaveBeenLastCalledWith({
    screen: 'card-info',
    params: { productId: card.id },
  });
  await act(() => button(tree, 'Options').props.onPress());
  expect(props.onNavigate).toHaveBeenLastCalledWith({
    screen: 'card-options',
    params: { productId: card.id },
  });
  await act(() => tree.unmount());
});

test('indicator selects the canonical debit balance while amount privacy masks only that figure', async () => {
  const props = host({ amountsHidden: true }),
    data = bankingProducts(props),
    debit = data.cards.find(c => c.type === 'debit_card')!;
  const tree = await render(props),
    index = data.cards.indexOf(debit);
  await act(() => button(tree, `Go to account ${index + 1}`).props.onPress());
  const json = JSON.stringify(tree.toJSON());
  expect(json).toContain(
    maskFormattedAmount(formatEvo2027Number(Math.abs(debit.balance)), true),
  );
  expect(json).toContain(formatMaskedCardNumber(debit.accountNumber));
  await act(() => button(tree, 'Options').props.onPress());
  expect(props.onNavigate).toHaveBeenLastCalledWith({
    screen: 'card-options',
    params: { productId: debit.id },
  });
  await act(() => tree.unmount());
});

test('Face ID gates sensitive details, Back returns locally and deactivation clears authorization', async () => {
  const props = host(),
    first = bankingProducts(props).cards[0]!;
  const tree = await render(props);
  expect(JSON.stringify(tree.toJSON())).not.toContain('Card CVV2/CVC2');
  await act(() => button(tree, 'Show Card Details').props.onPress());
  expect(
    tree.root.findAllByProps({ testID: 'source-face-id-animation' }).length,
  ).toBeGreaterThan(0);
  await act(() => jest.advanceTimersByTime(839));
  expect(JSON.stringify(tree.toJSON())).not.toContain('Card CVV2/CVC2');
  await act(() => jest.advanceTimersByTime(1));
  expect(JSON.stringify(tree.toJSON())).toContain(first.cardNumber);
  expect(JSON.stringify(tree.toJSON())).toContain('Card CVV2/CVC2');
  await act(async () => button(tree, 'Copy card number').props.onPress());
  expect(copyDemoText).toHaveBeenLastCalledWith(first.cardNumber);
  expect(JSON.stringify(tree.toJSON())).toContain(
    'Card number successfully copied',
  );
  await act(() => button(tree, 'Back').props.onPress());
  expect(props.onBack).not.toHaveBeenCalled();
  expect(JSON.stringify(tree.toJSON())).not.toContain('Card CVV2/CVC2');
  await act(() => button(tree, 'Show Card Details').props.onPress());
  await act(() =>
    tree.update(React.createElement(Card!, { ...props, isActive: false })),
  );
  await act(() => jest.advanceTimersByTime(900));
  await act(() => tree.update(React.createElement(Card!, props)));
  expect(JSON.stringify(tree.toJSON())).not.toContain('Card CVV2/CVC2');
  await act(() => tree.unmount());
});

test('changing a selected card cancels pending Face ID and cannot expose another product', async () => {
  const props = host(),
    cards = bankingProducts(props).cards;
  const tree = await render(props);
  await act(() => button(tree, 'Show Card Details').props.onPress());
  await act(() => button(tree, 'Go to account 2').props.onPress());
  await act(() => jest.advanceTimersByTime(900));
  expect(JSON.stringify(tree.toJSON())).not.toContain('Card CVV2/CVC2');
  await act(() => button(tree, 'Show Card Details').props.onPress());
  await act(() => jest.advanceTimersByTime(840));
  expect(JSON.stringify(tree.toJSON())).toContain(cards[1]!.cardNumber);
  await act(() => tree.unmount());
});

test('empty configured cards preserve the collapsed header and default counts render all cards', async () => {
  const props = host({
      productCounts: { ...counts, debitCards: 0, creditCards: 0 },
    }),
    tree = await render(props);
  expect(JSON.stringify(tree.toJSON())).not.toContain('Free To Spend');
  await act(() => button(tree, 'Back').props.onPress());
  expect(props.onBack).toHaveBeenCalledTimes(1);
  await act(() => tree.update(React.createElement(Card!, host())));
  expect(
    tree.root.findAllByType(ScrollView).some(n => n.props.horizontal),
  ).toBe(true);
  expect(button(tree, 'Go to account 3')).toBeDefined();
  await act(() => tree.unmount());
});

test('language and resolved dark theme remain host controlled while scroll collapses the Source toolbar', async () => {
  const props = host({
    language: 'ro',
    mode: 'system',
    tokens: currentTokens(true),
    t: createCurrentTranslator('RO', 'ro'),
  });
  const tree = await render(props);
  expect(
    button(tree, props.t('runtime.cards.showCardDetails', 'Show Card Details')),
  ).toBeDefined();
  const page = tree.root.findAll(
    n =>
      n.props.testID === 'ro-baseline-card-scroll' &&
      typeof n.props.onScroll === 'function',
  )[0]!;
  await act(() =>
    page.props.onScroll({ nativeEvent: { contentOffset: { y: 32 } } }),
  );
  expect(tree.root.findByType(RoBaselineDetailsHeader).props.progress).toBe(
    0.5,
  );
  expect(
    tree.root.findByType(RoBaselineDetailsHeader).props.host.tokens.background,
  ).toBe(currentTokens(true).background);
  await act(() => tree.unmount());
});

test('card search remains at Source 102px while the toolbar stays anchored during scrolling', async () => {
  const tree = await render();
  const search = tree.root.findAll(
    n =>
      n.props.testID === 'ro-card-sticky-search' &&
      typeof n.props.onLayout === 'function',
  )[0];
  expect(search).toBeDefined();
  expect(StyleSheet.flatten(search!.props.style).transform).toEqual([
    { translateY: 0 },
  ]);
  await act(() =>
    search!.props.onLayout({ nativeEvent: { layout: { y: 537 } } }),
  );
  const page = tree.root.findAll(
    n =>
      n.props.testID === 'ro-baseline-card-scroll' &&
      typeof n.props.onScroll === 'function',
  )[0]!;
  await act(() =>
    page.props.onScroll({ nativeEvent: { contentOffset: { y: 500 } } }),
  );
  const styles = StyleSheet.flatten(
    tree.root.findAll(n => n.props.testID === 'ro-card-sticky-search')[0]!.props
      .style,
  );
  expect(styles.transform).toEqual([{ translateY: 65 }]);
  expect(page.props.stickyHeaderIndices).toEqual([0]);
  await act(() => tree.unmount());
});

test('card information uses Source fields and selected canonical credit figures without masking', async () => {
  expect(CardInfo).toBeDefined();
  const props = host({ amountsHidden: true }),
    card = bankingProducts(props).cards.find(c => c.type === 'credit_card')!;
  props.route = { screen: 'card-info', params: { productId: card.id } };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(React.createElement(CardInfo!, props));
  });
  const fields = tree.root
    .findAllByType(BaselineAccountInfoField)
    .map(n => [n.props.title, n.props.subtitle]);
  expect(fields).toEqual([
    ['Card product', `${card.cardType} Credit card`],
    ['Card status', 'Active'],
    ['Card reference', `•••• ${card.cardNumber.slice(-4)}`],
    [
      'Available to spend',
      `${formatMoneyNumber(
        card.type === 'credit_card' ? card.availableCredit : 0,
        'RO',
      )} ${card.currency}`,
    ],
    [
      'Credit limit',
      `${formatMoneyNumber(
        card.type === 'credit_card' ? card.creditLimit : 0,
        'RO',
      )} ${card.currency}`,
    ],
  ]);
  await act(() => button(tree, 'Back').props.onPress());
  expect(props.onBack).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});

test.each(['credit_card', 'debit_card'] as const)(
  'Source card options keep all inert program and %s setting rows',
  async type => {
    expect(CardOptions).toBeDefined();
    const props = host(),
      card = bankingProducts(props).cards.find(c => c.type === type)!;
    props.route = { screen: 'card-options', params: { productId: card.id } };
    let tree!: Renderer.ReactTestRenderer;
    await act(() => {
      tree = Renderer.create(React.createElement(CardOptions!, props));
    });
    const rows = tree.root.findAllByType(BaselineNavigationRow);
    expect(rows.map(n => n.props.title)).toEqual([
      'APPLE PAY',
      'MASTERCARD PRICELESS',
      'CARD REGISTRATIONS',
      'VIEW PIN',
      'CARD LIMITS',
      'PUSH NOTIFICATIONS',
      ...(type === 'credit_card'
        ? ['CREDIT CARD STATEMENT', 'CHANGE CARD NAME', 'SHARE DETAILS']
        : ['CARD DELIVERY ADDRESS', 'REISSUE CARD']),
    ]);
    expect(
      rows.every(
        n =>
          n.props.onPress === undefined &&
          n.props.rowHeight === 80 &&
          n.props.trailingAccessory === 'chevron',
      ),
    ).toBe(true);
    expect(button(tree, 'Help')).toBeUndefined();
    await act(() => tree.unmount());
  },
);

test('card carousel selects continuously during scroll and desktop pointer drag settles on Source offsets', async () => {
  const original = Platform.OS;
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  const create = jest.spyOn(PanResponder, 'create');
  try {
    const props = host(),
      cards = bankingProducts(props).cards,
      tree = await render(props);
    const rail = tree.root.findAll(
      n =>
        n.props.testID === 'ro-card-carousel' &&
        typeof n.props.onScroll === 'function',
    )[0];
    expect(rail).toBeDefined();
    await act(() =>
      rail!.props.onScroll({ nativeEvent: { contentOffset: { x: 189 } } }),
    );
    await act(() => button(tree, 'Options').props.onPress());
    expect(props.onNavigate).toHaveBeenLastCalledWith({
      screen: 'card-options',
      params: { productId: cards[1]!.id },
    });
    const gesture = create.mock.calls[0]![0];
    expect(
      gesture.onMoveShouldSetPanResponder?.(
        {} as never,
        { dx: 24, dy: 1 } as never,
      ),
    ).toBe(true);
    expect(
      gesture.onMoveShouldSetPanResponder?.(
        {} as never,
        { dx: 1, dy: 24 } as never,
      ),
    ).toBe(false);
    await act(() => {
      gesture.onPanResponderGrant?.({} as never, {} as never);
    });
    await act(() => {
      gesture.onPanResponderMove?.({} as never, { dx: -150, dy: 0 } as never);
    });
    await act(() =>
      rail!.props.onScroll({ nativeEvent: { contentOffset: { x: 378 } } }),
    );
    await act(() => {
      gesture.onPanResponderRelease?.({} as never, {} as never);
    });
    await act(() => button(tree, 'Options').props.onPress());
    expect(props.onNavigate).toHaveBeenLastCalledWith({
      screen: 'card-options',
      params: { productId: cards[2]!.id },
    });
    const first = tree.root.findAll(
      n =>
        n.props.testID === `ro-card-carousel-${cards[0]!.id}` &&
        typeof n.props.onPress === 'function',
    )[0]!;
    await act(() => first.props.onPress());
    await act(() => button(tree, 'Options').props.onPress());
    expect(props.onNavigate).toHaveBeenLastCalledWith({
      screen: 'card-options',
      params: { productId: cards[2]!.id },
    });
    await act(() => jest.advanceTimersByTime(80));
    await act(() => first.props.onPress());
    await act(() => button(tree, 'Options').props.onPress());
    expect(props.onNavigate).toHaveBeenLastCalledWith({
      screen: 'card-options',
      params: { productId: cards[0]!.id },
    });
    await act(() => tree.unmount());
  } finally {
    create.mockRestore();
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      value: original,
    });
  }
});

test('Source Face ID retains exiting glyph, then animates ring and delayed check before 840ms completion', async () => {
  expect(MotionFaceId).toBeDefined();
  const done = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      React.createElement(MotionFaceId!, { onComplete: done }),
    );
  });
  expect(
    tree.root.findAllByProps({ testID: 'ro-face-id-scanning' }).length,
  ).toBeGreaterThan(0);
  await act(() => jest.advanceTimersByTime(360));
  expect(
    tree.root.findAllByProps({ testID: 'ro-face-id-exiting-glyph' }).length,
  ).toBeGreaterThan(0);
  expect(tree.root.findAllByType(Circle)).toHaveLength(0);
  await act(() => jest.advanceTimersByTime(149));
  expect(tree.root.findAllByType(Circle)).toHaveLength(0);
  await act(() => jest.advanceTimersByTime(1));
  const circle = tree.root.findByType(Circle),
    path = tree.root.findByType(Path);
  expect(circle.props.strokeDasharray).toEqual([201.06193, 201.06193]);
  expect(path.props.d).toBe('M 22 36 L 30 44 L 50 24');
  expect(path.props.strokeDasharray).toEqual([39.59798, 39.59798]);
  expect(circle.props.strokeDashoffset).toBeCloseTo(201.06193);
  expect(path.props.strokeDashoffset).toBeCloseTo(39.59798);
  await act(() => jest.advanceTimersByTime(130));
  expect(
    tree.root.findAllByProps({ testID: 'ro-face-id-complete' }).length,
  ).toBeGreaterThan(0);
  expect(tree.root.findByType(Circle).props.strokeDashoffset).toBeLessThan(
    201.06193,
  );
  expect(tree.root.findByType(Circle).props.strokeDashoffset).toBeGreaterThan(
    0,
  );
  expect(tree.root.findByType(Path).props.strokeDashoffset).toBeLessThan(
    39.59798,
  );
  expect(tree.root.findByType(Path).props.strokeDashoffset).toBeGreaterThan(0);
  await act(() => jest.advanceTimersByTime(199));
  expect(done).not.toHaveBeenCalled();
  await act(() => jest.advanceTimersByTime(1));
  expect(done).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});

test('Source Face ID cancels callbacks and drawing animations when unmounted during confirmation', async () => {
  expect(MotionFaceId).toBeDefined();
  const done = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      React.createElement(MotionFaceId!, { onComplete: done }),
    );
  });
  await act(() => jest.advanceTimersByTime(600));
  await act(() => tree.unmount());
  await act(() => jest.advanceTimersByTime(600));
  expect(done).not.toHaveBeenCalled();
});
