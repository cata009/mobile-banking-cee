import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
import { getEligibleRomanianInstallmentTransactions } from '@/features/cards/roCardServices';
import { productTransactions } from '../src/experiences/pi/current/banking/model';
import {
  getCardInstallmentPlans,
  isCardWalletEnrolled,
  isRomanianDemoWalletEnrolled,
  enrollCardWallet,
} from '../src/experiences/pi/current/banking/cardServicesStore';
import { BaselinePageHeader } from '../src/universal/BaselinePageHeader';
import { ModalPortal } from '../src/universal/ModalPortal';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { BaselineAccountActionBar } from '../src/universal/BaselineAccountActionBar';
import { CardWalletEnrollmentFlow } from '../src/experiences/pi/current/baseline/RoCardServices';

jest.mock('../src/platform/nativeFiles', () => ({
  copyDemoText: jest.fn(async () => {}),
}));
jest.mock('@/app/components/ui/WalletButton', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ kind, ...props }: { kind: string; [key: string]: unknown }) =>
      React.createElement('button', {
        ...props,
        'data-wallet-button': kind,
        'aria-label':
          kind === 'apple-wallet'
            ? 'Add to Apple Wallet'
            : 'Add to Click to Pay',
      }),
  };
});

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
  expect(tree.root.findByType(RoBaselineDetailsHeader).props.showHelp).toBe(
    false,
  );
  expect(button(tree, 'Help')).toBeUndefined();
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
  'Source card options retain program and %s settings with supported controls',
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
      'CLICK TO PAY',
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
          (['VIEW PIN', 'CARD LIMITS', 'PUSH NOTIFICATIONS'].includes(
            n.props.title,
          )
            ? typeof n.props.onPress === 'function'
            : n.props.onPress === undefined) &&
          n.props.rowHeight === 80 &&
          n.props.trailingAccessory === 'chevron',
      ),
    ).toBe(true);
    expect(
      rows.find(node => node.props.title === 'APPLE PAY')?.props.description,
    ).toBe('Enrolled');
    expect(button(tree, 'Help')).toBeUndefined();
    await act(() => tree.unmount());
  },
);

test('card information fields sit 16px below the title frame', async () => {
  const props = host({
    route: { screen: 'card-info', params: { productId: 'card-credit-1' } },
  });
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(React.createElement(CardInfo!, props));
  });
  const fieldsFrame = tree.root.findAll(
    node =>
      typeof node.type === 'string' &&
      node.props.style &&
      StyleSheet.flatten(node.props.style).paddingHorizontal === 24,
  )[0]!;
  expect(StyleSheet.flatten(fieldsFrame.props.style).paddingTop).toBe(16);
  await act(() => tree.unmount());
});

test('card carousel selects continuously during scroll and touch responder drag settles on Source offsets', async () => {
  const original = Platform.OS;
  const originalAdd = window.addEventListener;
  const originalRemove = window.removeEventListener;
  Object.defineProperty(window, 'addEventListener', {
    configurable: true,
    value: jest.fn(),
  });
  Object.defineProperty(window, 'removeEventListener', {
    configurable: true,
    value: jest.fn(),
  });
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
    const gesture = create.mock.calls.at(-1)![0];
    const event = { nativeEvent: { pageX: 300 } } as never;
    expect(
      gesture.onMoveShouldSetPanResponderCapture?.(event, {
        dx: 24,
        dy: 1,
      } as never),
    ).toBe(true);
    expect(
      gesture.onMoveShouldSetPanResponderCapture?.(event, {
        dx: 1,
        dy: 24,
      } as never),
    ).toBe(false);
    await act(() => {
      gesture.onStartShouldSetPanResponderCapture?.(event, {} as never);
      gesture.onPanResponderMove?.(event, {
        dx: -150,
        dy: 0,
        moveX: 150,
      } as never);
    });
    await act(() =>
      rail!.props.onScroll({ nativeEvent: { contentOffset: { x: 378 } } }),
    );
    await act(() => {
      gesture.onPanResponderRelease?.(event, {
        dx: -150,
        dy: 0,
        moveX: 150,
      } as never);
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
    Object.defineProperty(window, 'addEventListener', {
      configurable: true,
      value: originalAdd,
    });
    Object.defineProperty(window, 'removeEventListener', {
      configurable: true,
      value: originalRemove,
    });
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

test('keeps the requested card selected while its programmatic scroll is in progress', async () => {
  const props = host(),
    cards = bankingProducts(props).cards,
    tree = await render(props);
  const rail = tree.root.findAll(
    node =>
      node.props.testID === 'ro-card-carousel' &&
      typeof node.props.onScroll === 'function',
  )[0]!;
  const second = tree.root.findAll(
    node =>
      node.props.testID === `ro-card-carousel-${cards[1]!.id}` &&
      typeof node.props.onPress === 'function',
  )[0]!;
  await act(() => second.props.onPress());
  await act(() =>
    rail.props.onScroll({ nativeEvent: { contentOffset: { x: 0 } } }),
  );
  await act(() => rail.props.onMomentumScrollEnd());
  await act(() => button(tree, 'Options').props.onPress());
  expect(props.onNavigate).toHaveBeenLastCalledWith({
    screen: 'card-options',
    params: { productId: cards[1]!.id },
  });
  await act(() =>
    rail.props.onScroll({ nativeEvent: { contentOffset: { x: 189 } } }),
  );
  await act(() => rail.props.onScrollBeginDrag());
  await act(() =>
    rail.props.onScroll({ nativeEvent: { contentOffset: { x: 0 } } }),
  );
  await act(() => button(tree, 'Options').props.onPress());
  expect(props.onNavigate).toHaveBeenLastCalledWith({
    screen: 'card-options',
    params: { productId: cards[0]!.id },
  });
  await act(() => tree.unmount());
});

test('Romanian credit-card repayment opens its own repayment form', async () => {
  const props = host(),
    card = bankingProducts(props).cards.find(
      item => item.type === 'credit_card',
    )!;
  props.route = { screen: 'card', params: { productId: card.id } };
  const tree = await render(props);

  await act(() => button(tree, 'Repayment').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Card Repayment');
  expect(JSON.stringify(tree.toJSON())).toContain('MINIMUM AMOUNT TO REPAY');
  const flow = tree.root.findByProps({ testID: 'ro-card-repayment-flow' });
  expect(StyleSheet.flatten(flow.props.style).backgroundColor).toBe('#FFFFFF');
  const scroll = tree.root.findByProps({ testID: 'ro-card-repayment-scroll' });
  expect(scroll.props.showsVerticalScrollIndicator).toBe(false);
  const header = () => tree.root.findByType(BaselinePageHeader);
  expect(header().props.renderLargeTitle).toBe(false);
  expect(header().props.collapsedTitleProgress).toBe(0);
  expect(
    tree.root
      .findAllByType(SourceCustomIcon)
      .some(
        icon =>
          icon.props.name === 'payment-card-repayment' &&
          icon.props.size === 24,
      ),
  ).toBe(true);
  await act(() =>
    scroll.props.onScroll({ nativeEvent: { contentOffset: { y: 48 } } }),
  );
  expect(header().props.collapsedTitleProgress).toBe(1);
  const dateActivator = tree.root.findByProps({
    accessibilityLabel: 'Open calendar for PAYMENT PROCESSING DATE',
  });
  await act(() => dateActivator.props.onPress());
  expect(tree.root.findByType(ModalPortal).props.visible).toBe(true);
  await act(() => tree.root.findByType(ModalPortal).props.onRequestClose());
  await act(() => button(tree, 'Next').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Review data');
  expect(header().props.collapsedTitleProgress).toBe(0);
  const payerLabel = tree.root
    .findAllByType(Text)
    .find(node => node.props.children === 'PAYER ACCOUNT NUMBER');
  expect(payerLabel).toBeDefined();
  expect(JSON.stringify(payerLabel!.props.style)).toContain(
    'UniCredit-regular',
  );
  expect(
    StyleSheet.flatten(payerLabel!.parent!.props.style).borderBottomWidth ?? 0,
  ).toBe(0);
  expect(props.onNavigate).not.toHaveBeenCalledWith({ screen: 'payments' });
  await act(() => tree.unmount());
});

test('installments are offered only on Romanian credit cards and use booked card transactions', async () => {
  const props = host(),
    credit = bankingProducts(props).cards.find(
      item => item.type === 'credit_card',
    )!,
    transactions = productTransactions(props, credit),
    eligible = getEligibleRomanianInstallmentTransactions(transactions);
  props.route = { screen: 'card', params: { productId: credit.id } };
  const tree = await render(props);
  const planned = getCardInstallmentPlans(credit.id);
  const available = eligible.filter(
    transaction => !planned.some(plan => plan.transactionId === transaction.id),
  );
  const row = tree.root
    .findAllByType(BaselineNavigationRow)
    .find(node => node.props.title === 'Installments plan');
  expect(row?.props.description).toBe(
    `Available transactions to split: ${available.length}`,
  );
  await act(() => row!.props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain(
    'Available to split into installments',
  );
  expect(JSON.stringify(tree.toJSON())).toContain('Active installments');
  expect(planned.length).toBeGreaterThan(0);
  const twentyFourPlan = planned.find(plan => plan.numberOfInstallments === 24);
  expect(twentyFourPlan).toBeDefined();
  const twentyFourPlanRow = tree.root.findByProps({
    accessibilityLabel: `Installment details for ${
      twentyFourPlan!.merchantName
    }`,
  });
  expect(
    twentyFourPlanRow
      .findAllByType(Text)
      .some(
        node =>
          Array.isArray(node.props.children) &&
          node.props.children.join('') === 'Current installment 7/24',
      ),
  ).toBe(true);
  await act(() => twentyFourPlanRow.props.onPress());
  const merchantValue = tree.root
    .findAllByType(Text)
    .find(node => node.props.children === twentyFourPlan!.merchantName);
  expect(merchantValue).toBeDefined();
  expect(JSON.stringify(merchantValue!.props.style)).toContain(
    'UniCredit-bold',
  );
  const merchantLabel = tree.root
    .findAllByType(Text)
    .find(node => node.props.children === 'MERCHANT NAME');
  expect(JSON.stringify(merchantLabel!.props.style)).toContain(
    'UniCredit-regular',
  );
  await act(() => button(tree, 'Back').props.onPress());
  if (available[0]) {
    expect(JSON.stringify(tree.toJSON())).toContain(available[0].label);
    const availableRow = tree.root.findByProps({
      accessibilityLabel: `Create installments for ${available[0].label}`,
    });
    await act(() => availableRow.props.onPress());
    const countSelector = tree.root.findByProps({
      accessibilityLabel: 'Choose number of installments',
    });
    await act(() =>
      countSelector.props.onPress({ stopPropagation: jest.fn() }),
    );
    expect(JSON.stringify(tree.toJSON())).toContain(
      'Number of installments to split',
    );
    const options = () =>
      tree.root.findAll(
        node =>
          node.props.accessibilityRole === 'radio' &&
          typeof node.props.onPress === 'function',
      );
    expect(options().map(option => option.props.accessibilityLabel)).toEqual([
      expect.stringMatching(/^12 INSTALLMENTS\./),
      expect.stringMatching(/^24 INSTALLMENTS\./),
      expect.stringMatching(/^36 INSTALLMENTS\./),
    ]);
    const radioStyles = options().map(option =>
      StyleSheet.flatten(option.props.style),
    );
    expect(radioStyles.map(style => style.paddingHorizontal)).toEqual([
      0, 0, 0,
    ]);
    expect(
      radioStyles.every(style => style.borderBottomWidth === undefined),
    ).toBe(true);
    expect(options()[0]!.props.accessibilityState).toEqual({ checked: true });
    await act(() => options()[1]!.props.onPress());
    expect(options()[1]!.props.accessibilityState).toEqual({ checked: true });
    expect(JSON.stringify(tree.toJSON())).toContain('Total monthly payment');
    await act(() => button(tree, 'Select').props.onPress());
    expect(JSON.stringify(tree.toJSON())).toContain('24 installments');
    expect(JSON.stringify(tree.toJSON())).not.toContain(
      'Number of installments to split',
    );
  }
  await act(() => tree.unmount());

  const debitProps = host(),
    debit = bankingProducts(debitProps).cards.find(
      item => item.type === 'debit_card',
    )!;
  debitProps.route = { screen: 'card', params: { productId: debit.id } };
  const debitTree = await render(debitProps);
  expect(
    debitTree.root
      .findAllByType(BaselineNavigationRow)
      .some(node => node.props.title === 'Installments plan'),
  ).toBe(false);
  await act(() => debitTree.unmount());
});

test('Romanian euro debit card actions stay left aligned when mCash is unavailable', async () => {
  const props = host(),
    card = [...bankingProducts(props).cards]
      .reverse()
      .find(item => item.type === 'debit_card' && item.currency === 'EUR')!;
  props.route = { screen: 'card', params: { productId: card.id } };
  const tree = await render(props),
    actionBar = tree.root.findByType(BaselineAccountActionBar),
    actionBarShell = actionBar.findAllByType(View)[0]!;

  expect(actionBar.props.items.map((item: { id: string }) => item.id)).toEqual([
    'card-details',
    'options',
    'block-card',
  ]);
  expect(actionBar.props.align).toBe('start');
  expect(StyleSheet.flatten(actionBarShell.props.style).justifyContent).toBe(
    'flex-start',
  );
  await act(() => tree.unmount());
});

test('wallet options reflect the demo card enrollment and offer both compact setup actions', async () => {
  const props = host();
  const cards = bankingProducts(props).cards;
  const unregistered = [...cards].reverse().find(item => item.type === 'debit_card' && item.currency === 'EUR')!;
  for (const card of cards) {
    const cardProps = host({ route: { screen: 'card-options', params: { productId: card.id } } });
    let tree!: Renderer.ReactTestRenderer;
    await act(() => { tree = Renderer.create(<CardOptions {...cardProps} />); });
    const rows = tree.root.findAllByType(BaselineNavigationRow);
    const apple = rows.find(row => row.props.title === 'APPLE PAY')!;
    const click = rows.find(row => row.props.title === 'CLICK TO PAY')!;
    expect(apple).toBeDefined();
    expect(click).toBeDefined();
    if (card.id === unregistered.id) {
      expect(apple.props.description).toBe('Add to Apple Wallet');
      expect(click.props.description).toBe('Add to Mastercard Wallet');
      const buttons = tree.root.findAll(node => typeof node.props.onClick === 'function' && node.props['data-wallet-button']);
      expect(buttons.map(node => node.props['data-wallet-button'])).toEqual(['apple-wallet', 'click-to-pay']);
      expect(buttons.every(node => node.props.size === 'condensed')).toBe(true);
      await act(() => buttons[0].props.onClick());
      expect(JSON.stringify(tree.toJSON())).toContain('Add Card to Apple Pay');
      await act(() => tree.root.findByType(CardWalletEnrollmentFlow).props.onClose());
      const clickButton = tree.root.findAll(node => node.props['data-wallet-button'] === 'click-to-pay' && typeof node.props.onClick === 'function')[0];
      await act(() => clickButton.props.onClick());
      expect(tree.root.findByType(CardWalletEnrollmentFlow).props.provider).toBe('click-to-pay');
    } else {
      expect(apple.props.description).toBe('Enrolled');
      expect(click.props.description).toBe('Enrolled');
      expect(tree.root.findAll(node => node.props['data-wallet-button'])).toHaveLength(0);
    }
    await act(() => tree.unmount());
  }
});

test('wallet enrollment flows update Apple Pay and Click to Pay status on the selected RO card', async () => {
  const props = host(),
    cards = bankingProducts(props).cards,
    card = [...cards]
      .reverse()
      .find(item => item.type === 'debit_card' && item.currency === 'EUR')!;
  props.route = { screen: 'card', params: { productId: card.id } };
  const tree = await render(props);

  let apple = tree.root.findAll(
    node =>
      node.props['data-wallet-button'] === 'apple-wallet' &&
      typeof node.props.onClick === 'function',
  )[0]!;
  await act(() => apple.props.onClick());
  await act(() =>
    tree.root
      .findByProps({ accessibilityLabel: 'Add card to iPhone (2)' })
      .props.onPress(),
  );
  await act(() => button(tree, 'OK').props.onPress());
  expect(JSON.stringify(tree.toJSON())).not.toContain('Apple Pay active');
  const intermediateProps = host({ route: { screen: 'card-options', params: { productId: card.id } } });
  let intermediate!: Renderer.ReactTestRenderer;
  await act(() => { intermediate = Renderer.create(<CardOptions {...intermediateProps} />); });
  const intermediateRows = intermediate.root.findAllByType(BaselineNavigationRow);
  expect(intermediateRows.find(row => row.props.title === 'APPLE PAY')?.props.description).toBe('Enrolled');
  expect(intermediateRows.find(row => row.props.title === 'CLICK TO PAY')?.props.description).toBe('Add to Mastercard Wallet');
  expect(intermediate.root.findAll(node => node.props['data-wallet-button'] === 'apple-wallet')).toHaveLength(0);
  expect(intermediate.root.findAll(node => node.props['data-wallet-button'] === 'click-to-pay')).toHaveLength(1);
  await act(() => intermediate.unmount());

  const clickToPay = tree.root.findAll(
    node =>
      node.props['data-wallet-button'] === 'click-to-pay' &&
      typeof node.props.onClick === 'function',
  )[0]!;
  await act(() => clickToPay.props.onClick());
  expect(tree.root.findByType(BaselinePageHeader).props.renderLargeTitle).toBe(
    false,
  );
  await act(() => button(tree, 'Enroll in Click to Pay now').props.onPress());
  expect(tree.root.findByType(BaselinePageHeader).props.renderLargeTitle).toBe(
    undefined,
  );
  const securityIntro = tree.root
    .findAllByType(Text)
    .find(node =>
      String(node.props.children).startsWith(
        'For your security, Mastercard may send text messages',
      ),
    );
  expect(StyleSheet.flatten(securityIntro!.props.style).textAlign).toBe(
    'center',
  );
  await act(() => button(tree, 'Continue').props.onPress());
  await act(() => button(tree, 'Done').props.onPress());
  expect(isCardWalletEnrolled(card.id, 'apple-pay')).toBe(true);
  expect(isCardWalletEnrolled(card.id, 'click-to-pay')).toBe(true);
  expect(
    tree.root.findAll(
      node => node.props['data-wallet-button'] === 'click-to-pay',
    ),
  ).toHaveLength(0);
  expect(JSON.stringify(tree.toJSON())).not.toContain('Click to Pay active');
  await act(() => tree.unmount());

  for (const otherCard of cards.filter(item => item.id !== card.id)) {
    const otherProps = host({
      route: { screen: 'card', params: { productId: otherCard.id } },
    });
    const otherTree = await render(otherProps);
    expect(
      otherTree.root.findAll(
        node =>
          node.props['data-wallet-button'] === 'apple-wallet' ||
          node.props['data-wallet-button'] === 'click-to-pay',
      ),
    ).toHaveLength(0);
    expect(JSON.stringify(otherTree.toJSON())).not.toContain(
      'Apple Pay active',
    );
    expect(JSON.stringify(otherTree.toJSON())).not.toContain(
      'Click to Pay active',
    );
    await act(() => otherTree.unmount());
  }

  const optionsProps = host({
    route: { screen: 'card-options', params: { productId: card.id } },
  });
  let optionsTree!: Renderer.ReactTestRenderer;
  await act(() => {
    optionsTree = Renderer.create(
      React.createElement(CardOptions!, optionsProps),
    );
  });
  expect(
    optionsTree.root
      .findAllByType(BaselineNavigationRow)
      .find(node => node.props.title === 'APPLE PAY')?.props.description,
  ).toBe('Enrolled');
  expect(optionsTree.root.findAllByType(BaselineNavigationRow).find(node => node.props.title === 'CLICK TO PAY')?.props.description).toBe('Enrolled');
  await act(() => optionsTree.unmount());
});

test('recording one service preserves the seeded enrollment of the other', () => {
  const cards = bankingProducts(host()).cards;
  const credit = cards.find(card => card.type === 'credit_card')!;
  enrollCardWallet(credit.id, 'apple-pay');
  expect(isRomanianDemoWalletEnrolled(credit.id, 'click-to-pay', cards)).toBe(true);
});

test('the final Romanian card carousel item opens the virtual-card issue flow', async () => {
  const tree = await render();
  const placeholder = tree.root.findByProps({
    testID: 'ro-card-create-virtual',
  });
  await act(() => placeholder.props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Select your preferred card');
  await act(() => button(tree, 'Select Clean Green').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain(
    'Select the account you want to attach to the card',
  );
  await act(() => tree.unmount());
});
