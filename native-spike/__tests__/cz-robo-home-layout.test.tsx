import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Animated, StyleSheet, View } from 'react-native';
import RoboHome from '../src/experiences/pi/current/RoboHome';
import {
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const host: CurrentScreenProps = {
  country: 'CZ',
  release: 'release-future-cz-robo',
  scenario: 'active',
  language: 'en',
  productCounts: {
    accounts: 2,
    debitCards: 2,
    creditCards: 1,
    mealCards: 0,
    deposits: 1,
    savingsAccounts: 1,
    loans: 1,
    mortgages: 1,
    investments: 1,
  },
  route: { screen: 'home' },
  tokens: currentTokens(),
  t: createCurrentTranslator('CZ', 'en'),
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
};

async function renderRoboHome() {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<RoboHome {...host} />);
  });
  return tree;
}

function mockAnimatedTiming() {
  return jest.spyOn(Animated, 'timing').mockImplementation(
    () =>
      ({
        start: jest.fn(),
        stop: jest.fn(),
        reset: jest.fn(),
      }) as unknown as ReturnType<typeof Animated.timing>,
  );
}

test('CZ Robo collapsed stack previews align with the product cards', async () => {
  const tree = await renderRoboHome();
  const accountsStack = tree.root.findByProps({
    testID: 'robo-home-stack-accounts',
  });

  expect(accountsStack.props.style).toEqual(
    expect.arrayContaining([expect.objectContaining({ left: 24, right: 24 })]),
  );

  await act(() => tree.unmount());
});

test('CZ Robo home keeps scrolling while hiding the vertical scrollbar', async () => {
  const tree = await renderRoboHome();
  const scroll = tree.root.findByProps({
    keyboardShouldPersistTaps: 'handled',
  });

  expect(scroll.props.showsVerticalScrollIndicator).toBe(false);

  await act(() => tree.unmount());
});

test('CZ Robo accordion animates products and chevron with baseline motion', async () => {
  const timing = mockAnimatedTiming();
  const tree = await renderRoboHome();
  const accountsHeader = () =>
    tree.root.findByProps({ accessibilityLabel: 'Accounts' });

  await act(() => accountsHeader().props.onPress());

  let configs = timing.mock.calls.map(([, config]) => config);
  expect(configs).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      expect.objectContaining({
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]),
  );

  await act(() => accountsHeader().props.onPress());

  configs = timing.mock.calls.map(([, config]) => config);
  expect(configs).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      expect.objectContaining({
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]),
  );

  await act(() => tree.unmount());
});

test('CZ Robo expanded total amount is aligned below its label', async () => {
  mockAnimatedTiming();
  const tree = await renderRoboHome();
  const accountsHeader = tree.root.findByProps({
    accessibilityLabel: 'Accounts',
  });

  await act(() => accountsHeader.props.onPress());

  const totalMoney = tree.root.findByProps({
    testID: 'robo-home-total-money-accounts',
  });
  expect(totalMoney.props.style).toEqual(
    expect.objectContaining({ alignItems: 'flex-start' }),
  );

  await act(() => tree.unmount());
});

test('CZ Robo expanded Cards reveals all 27 products without clipping the last row', async () => {
  jest.spyOn(Animated, 'timing').mockImplementation(
    (value, config) =>
      ({
        start: () =>
          (value as Animated.Value).setValue(config.toValue as number),
        stop: jest.fn(),
        reset: jest.fn(),
      }) as ReturnType<typeof Animated.timing>,
  );
  const onNavigate = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <RoboHome
        {...host}
        onNavigate={onNavigate}
        productCounts={{
          ...host.productCounts,
          debitCards: 9,
          creditCards: 9,
          mealCards: 9,
        }}
      />,
    );
  });
  const expanded = () =>
    tree.root.findByProps({ testID: 'robo-home-expanded-products-cards' });
  const rows = expanded()
    .findAllByType(View)
    .filter(row => row.props.testID === 'robo-home-evolution-card');
  expect(rows).toHaveLength(26);
  // Native layout reports the natural inner size even when the outer accordion
  // is collapsed. Each ordinary card requires at least 108px at 100% text size.
  const naturalHeight = rows.length * 108;
  const content = tree.root.findAllByProps({
    testID: 'robo-home-products-content-cards',
  })[0];
  if (content)
    act(() =>
      content.props.onLayout({
        nativeEvent: { layout: { height: naturalHeight } },
      }),
    );
  await act(() =>
    tree.root.findByProps({ accessibilityLabel: 'Cards' }).props.onPress(),
  );
  const limit = StyleSheet.flatten(expanded().props.style).maxHeight;
  expect(
    (limit as unknown as { __getValue: () => number }).__getValue(),
  ).toBeGreaterThanOrEqual(naturalHeight);
  expect(content).toBeDefined();
  expect(expanded().props.pointerEvents).toBe('auto');
  act(() =>
    content!.props.onLayout({
      nativeEvent: { layout: { height: naturalHeight + 520 } },
    }),
  );
  const resizedLimit = StyleSheet.flatten(expanded().props.style).maxHeight;
  expect(
    (resizedLimit as unknown as { __getValue: () => number }).__getValue(),
  ).toBe(naturalHeight + 520);
  const debit = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Debit Card 9' &&
      typeof node.props.onPress === 'function',
  )[0];
  act(() => debit!.props.onPress());
  expect(onNavigate).toHaveBeenCalledWith({
    screen: 'card',
    params: { productId: 'card-debit-9', cardId: 'card-debit-9' },
  });
  await act(() => tree.unmount());
});
