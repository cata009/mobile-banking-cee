import { CURRENT_BANKING_ADAPTER } from '../src/experiences/pi/current/banking/adapter';
import { RoBaselinePaymentsScreen } from '../src/experiences/pi/current/baseline/payments/hub/Payments';
import RoBaselinePaymentCreateScreen from '../src/experiences/pi/current/baseline/payments/domestic/RoBaselinePaymentCreateScreen';
import {
  PaymentsScreen,
  PaymentCreateScreen,
} from '../src/experiences/pi/current/banking/Payments';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import { isPiClassicCompositionContext } from '../src/experiences/pi/current/baseline/policy';
import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { View, StyleSheet, ScrollView } from 'react-native';
import NativeCurrentApp from '../src/experiences/pi/current/NativeCurrentApp';
import type { CurrentAdapter } from '../src/experiences/pi/current/contracts';
import { BaselineBottomSheet } from '../src/universal/BaselineBottomSheet';
import { BaselinePaymentHero } from '../src/universal/BaselinePaymentHero';
const fixture = (extra: Partial<CurrentScreenProps>): CurrentScreenProps => ({
  country: 'RO',
  release: 'release-current',
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
  route: { screen: 'payments' },
  tokens: currentTokens(),
  t: createCurrentTranslator('RO', 'en'),
  amountsHidden: false,
  screenTopInset: 12,
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
});

it.each(['payments', 'payment-create'] as const)(
  'selects Source-faithful RO baseline %s without changing legacy renderers',
  screen => {
    const render = CURRENT_BANKING_ADAPTER.screens[screen] as (
      host: CurrentScreenProps,
    ) => { type: unknown; props: CurrentScreenProps };
    const host = fixture({
      route: {
        screen,
        params: { selectionId: 'template-1', productId: 'acc-2' },
      },
      amountsHidden: true,
    });
    const actual = render(host);
    expect(actual.type).toBe(
      screen === 'payments'
        ? RoBaselinePaymentsScreen
        : RoBaselinePaymentCreateScreen,
    );
    expect(actual.props.route).toBe(host.route);
    expect(actual.props.amountsHidden).toBe(true);
  },
);

it.each([
  ['CZ', 'release-future-cz-coapping', 'active', true],
  ['CZ', 'release-future-cz-robo', 'active', true],
  ['RS', 'release-future-rs-future-gain', 'active', true],
  ['CZ', 'release-future-evo-2027', 'active', false],
  ['RO', 'release-future-evo-2027', 'active', false],
  ['RO', 'release-current', 'inactive', false],
] as const)(
  'uses the approved classic cohort for %s/%s/%s Payments',
  (country, release, scenario, classic) => {
    for (const screen of ['payments', 'payment-create'] as const) {
      const render = CURRENT_BANKING_ADAPTER.screens[screen] as (
        host: CurrentScreenProps,
      ) => { type: unknown; props: CurrentScreenProps };
      const host = fixture({
        country,
        release,
        scenario,
        route: { screen, params: { productId: 'selected-account' } },
        amountsHidden: true,
      });
      expect(isPiClassicCompositionContext(host)).toBe(classic);
      const expected = classic
        ? screen === 'payments'
          ? RoBaselinePaymentsScreen
          : RoBaselinePaymentCreateScreen
        : screen === 'payments'
          ? PaymentsScreen
          : PaymentCreateScreen;
      const actual = render(host);
      expect(actual.type).toBe(expected);
      expect(actual.props.route).toBe(host.route);
      expect(actual.props.amountsHidden).toBe(true);
    }
  },
);

it('routes hardware/header Back to the active flow before popping the application stack and ignores stale owners', async () => {
  let owner!: CurrentScreenProps;
  const Screen = (host: CurrentScreenProps) => {
    owner = host;
    return <View />;
  };
  const adapters: CurrentAdapter[] = [
    {
      id: 'payment-back-proof',
      screens: { payments: Screen, 'payment-create': Screen },
    },
  ];
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <NativeCurrentApp
        country="RO"
        release="release-current"
        scenario="active"
        initialRoute={{ screen: 'payments' }}
        adapters={adapters}
      />,
    );
  });
  try {
    const parent = owner;
    await act(() => owner.onNavigate({ screen: 'payment-create' }));
    const child = owner,
      consume = jest.fn(() => true);
    await act(() => owner.onBackHandlerChange?.(consume));
    await act(() => owner.onBack());
    expect(consume).toHaveBeenCalledTimes(1);
    expect(owner.route.screen).toBe('payment-create');
    await act(() => parent.onBackHandlerChange?.(() => false));
    await act(() => owner.onBack());
    expect(consume).toHaveBeenCalledTimes(2);
    await act(() => child.onBackHandlerChange?.(() => false));
    await act(() => owner.onBack());
    expect(owner.route.screen).toBe('payments');
    const replacement = jest.fn(() => true);
    await act(() => owner.onBackHandlerChange?.(replacement));
    await act(() => parent.onBackHandlerChange?.(null));
    await act(() => owner.onBack());
    expect(replacement).toHaveBeenCalledTimes(1);
    await act(() => child.onBackHandlerChange?.(consume));
    await act(() => owner.onBack());
    expect(consume).toHaveBeenCalledTimes(2);
  } finally {
    await act(() => tree.unmount());
  }
});

it('renders Source panel and hero shadows while static sheets retain their original untransformed raster', () => {
  let sheet!: Renderer.ReactTestRenderer, hero!: Renderer.ReactTestRenderer;
  act(() => {
    sheet = Renderer.create(
      <BaselineBottomSheet title="New payment" onClose={jest.fn()}>
        <View />
      </BaselineBottomSheet>,
    );
    hero = Renderer.create(
      <BaselinePaymentHero
        item={{
          id: 'new-payment',
          title: 'Payment to account',
          description: 'Send',
        }}
      />,
    );
  });
  try {
    const panel = sheet.root.findAll(n => n.props.role === 'dialog').at(-1)!;
    const style = StyleSheet.flatten(panel.props.style);
    expect(style.boxShadow).toBe('0 -8px 24px rgba(0,0,0,0.18)');
    expect(style.transform).toBeUndefined();
    const shadow = hero.root
      .findAll(n => n.props.testID === 'source-payment-hero-inset-shadow')
      .at(-1)!;
    expect(StyleSheet.flatten(shadow.props.style).boxShadow).toBe(
      'inset 0 0 0 1px rgba(38,38,38,0.06)',
    );
    const button = hero.root
      .findAll(n => n.props.accessibilityRole === 'button')
      .at(-1)!;
    expect(StyleSheet.flatten(button.props.style).boxShadow).toBeUndefined();
    expect(sheet.root.findByType(ScrollView)).toBeDefined();
  } finally {
    act(() => {
      sheet.unmount();
      hero.unmount();
    });
  }
});
