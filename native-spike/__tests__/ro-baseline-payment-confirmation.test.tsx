import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, TextInput } from 'react-native';
import {
  RoBaselinePaymentSign,
  RoBaselinePaymentSuccess,
} from '../src/experiences/pi/current/baseline/payments/confirmation/RoBaselinePaymentConfirmation';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { BaselinePageHeader } from '../src/universal/BaselinePageHeader';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import { FaceIdOverlay } from '../src/experiences/pi/current/baseline/FaceIdOverlay';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { sourceColor } from '../src/universal/sourceColor';

const host = (
  language: 'en' | 'ro' = 'en',
  dark = false,
): CurrentScreenProps => ({
  country: 'RO',
  release: 'release-current',
  scenario: 'active',
  language,
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
  route: { screen: 'payment-create' },
  tokens: currentTokens(dark),
  t: createCurrentTranslator('RO', language),
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
  mode: dark ? 'dark' : 'light',
  onModeChange: jest.fn(),
});
const button = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    n =>
      n.props.accessibilityLabel === label &&
      typeof n.props.onPress === 'function',
  )[0]!;
const text = (tree: Renderer.ReactTestRenderer) =>
  JSON.stringify(tree.toJSON());
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('sign preserves expanded source header, editable seeded PIN, and source field contract', async () => {
  const props = host(),
    onBack = jest.fn(),
    onSign = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <RoBaselinePaymentSign host={props} onBack={onBack} onSign={onSign} />,
    );
  });
  expect(tree.root.findByType(BaselinePageHeader).props).toEqual(
    expect.objectContaining({
      title: 'Sign',
      includeSafeArea: true,
      safeAreaReserve: 12,
      showHelp: false,
    }),
  );
  expect(tree.root.findByType(BaselineTextField).props).toEqual(
    expect.objectContaining({
      label: 'Enter pin code',
      value: '******',
      helperText: 'Be sure that nobody is watching you',
      visualState: 'on-focus',
    }),
  );
  await act(() => tree.root.findByType(TextInput).props.onChangeText(''));
  expect(tree.root.findByType(BaselineTextField).props.value).toBe('');
  expect(tree.root.findByType(PrimaryButton).props.disabled).toBe(false);
  await act(() => button(tree, 'Back').props.onPress());
  expect(onBack).toHaveBeenCalledTimes(1);
  expect(onSign).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});
test('sign completes only after source 840ms simulation and rejects repeated action while authenticating', async () => {
  const onSign = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <RoBaselinePaymentSign
        host={host()}
        onBack={jest.fn()}
        onSign={onSign}
      />,
    );
  });
  await act(() => button(tree, 'Sign').props.onPress());
  expect(tree.root.findByType(PrimaryButton).props.disabled).toBe(true);
  expect(tree.root.findByType(FaceIdOverlay)).toBeDefined();
  await act(() => tree.root.findByType(PrimaryButton).props.onPress());
  await act(() => jest.advanceTimersByTime(359));
  expect(
    tree.root.findAll(n => n.props.testID === 'ro-face-id-scanning'),
  ).not.toHaveLength(0);
  expect(onSign).not.toHaveBeenCalled();
  await act(() => jest.advanceTimersByTime(1));
  expect(
    tree.root.findAll(n => n.props.testID === 'ro-face-id-confirming'),
  ).not.toHaveLength(0);
  await act(() => jest.advanceTimersByTime(150));
  expect(
    tree.root.findAll(n => n.props.testID === 'ro-face-id-check'),
  ).not.toHaveLength(0);
  await act(() => jest.advanceTimersByTime(130));
  expect(
    tree.root.findAll(n => n.props.testID === 'ro-face-id-complete'),
  ).not.toHaveLength(0);
  await act(() => jest.advanceTimersByTime(199));
  expect(onSign).not.toHaveBeenCalled();
  await act(() => jest.advanceTimersByTime(1));
  expect(onSign).toHaveBeenCalledTimes(1);
  expect(tree.root.findAllByType(FaceIdOverlay)).toHaveLength(0);
  await act(() => tree.unmount());
});
test('unmounting the source authentication simulation cancels completion', async () => {
  const onSign = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <RoBaselinePaymentSign
        host={host()}
        onBack={jest.fn()}
        onSign={onSign}
      />,
    );
  });
  await act(() => button(tree, 'Sign').props.onPress());
  await act(() => jest.advanceTimersByTime(200));
  await act(() => tree.unmount());
  await act(() => jest.advanceTimersByTime(1000));
  expect(onSign).not.toHaveBeenCalled();
});
test.each([
  ['en', false],
  ['ro', true],
] as const)(
  'success preserves translated source body, icon and callback (%s)',
  async (language, dark) => {
    const props = host(language, dark),
      onDone = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    await act(() => {
      tree = Renderer.create(
        <RoBaselinePaymentSuccess host={props} onDone={onDone} />,
      );
    });
    expect(text(tree)).toContain(
      props.t(
        'runtime.payments.domesticFlow.successfulPayment',
        'Successful payment',
      ),
    );
    expect(text(tree)).toContain(
      props.t(
        'runtime.payments.domesticFlow.paymentSentToBank',
        'Your payment has been successfully sent to the bank',
      ),
    );
    expect(tree.root.findAllByType(BaselinePageHeader)).toHaveLength(0);
    const body = tree.root.findAll(
      n =>
        n.props.children ===
          props.t(
            'runtime.payments.domesticFlow.paymentSentToBank',
            'Your payment has been successfully sent to the bank',
          ) && n.props.style,
    )[0]!;
    expect(StyleSheet.flatten(body.props.style).lineHeight).toBeUndefined();
    expect(tree.root.findByType(SourceCustomIcon).props).toEqual(
      expect.objectContaining({
        name: 'prime-check',
        size: 64,
        color: sourceColor('var(--uc-green-olive)', dark),
      }),
    );
    expect(
      StyleSheet.flatten(
        tree.root.findByProps({ testID: 'ro-payment-success-check' }).props
          .style,
      ),
    ).toEqual(
      expect.objectContaining({
        width: 100,
        height: 100,
        borderWidth: 6,
        borderRadius: 50,
      }),
    );
    await act(() =>
      button(
        tree,
        props.t('runtime.actions.okGotIt', 'Ok, got it'),
      ).props.onPress(),
    );
    expect(onDone).toHaveBeenCalledTimes(1);
    await act(() => tree.unmount());
  },
);
