import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { bankingProducts } from '../src/experiences/pi/current/banking/model';
import CardPinFlow from '../src/experiences/pi/current/baseline/pin/CardPinFlow';
import { FaceIdOverlay } from '../src/experiences/pi/current/baseline/FaceIdOverlay';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import { TextInput } from '../src/universal/Typography';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { BaselineBottomSheet } from '../src/universal/BaselineBottomSheet';
import { RoBaselinePaymentSign } from '../src/experiences/pi/current/baseline/payments/confirmation/RoBaselinePaymentConfirmation';
import {
  canSetCardPin,
  isRoBaselinePinAvailable,
} from '@/features/cards/pin/model';

const host: CurrentScreenProps = {
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
  route: { screen: 'card-options' },
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
};

test('PIN flow is limited to active Romanian baseline', () => {
  expect(isRoBaselinePinAvailable('RO', 'release-current', 'active')).toBe(
    true,
  );
  expect(isRoBaselinePinAvailable('CZ', 'release-current', 'active')).toBe(
    false,
  );
  expect(isRoBaselinePinAvailable('RO', 'release-current', 'inactive')).toBe(
    false,
  );
});

test('new PIN must be four digits and match its confirmation', () => {
  expect(canSetCardPin('1985', '1985')).toBe(true);
  expect(canSetCardPin('1985', '1984')).toBe(false);
  expect(canSetCardPin('19a5', '19a5')).toBe(false);
  expect(canSetCardPin('123', '123')).toBe(false);
});

test('view, set, sign and save the selected card PIN', async () => {
  const onSave = jest.fn();
  const onClose = jest.fn();
  const card = bankingProducts(host).cards.find(
    item => item.type === 'credit_card',
  )!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <CardPinFlow
        host={host}
        card={card}
        pin="1985"
        onSave={onSave}
        onClose={onClose}
      />,
    );
  });
  await act(() => tree.root.findByType(FaceIdOverlay).props.onComplete());
  expect(
    tree.root.findByType(BaselineBottomSheet).props.maxHeightOffsetPx,
  ).toBeGreaterThanOrEqual(host.screenTopInset + 8);
  const text = JSON.stringify(tree.toJSON());
  expect(text).not.toContain(card.cardNumber);
  expect(text).toContain(card.cardNumber.slice(-4));
  await act(() =>
    tree.root
      .findByProps({ accessibilityLabel: 'Change your PIN' })
      .props.onPress(),
  );
  const fields = tree.root.findAllByType(BaselineTextField);
  expect(fields).toHaveLength(2);
  expect(fields.every(field => field.props.secureTextEntry)).toBe(true);
  const input = (label: string) =>
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === label)!;
  const button = (label: string) =>
    tree.root
      .findAllByType(PrimaryButton)
      .find(node => node.props.label === label)!;
  expect(input('Choose card PIN').props.secureTextEntry).toBe(true);
  expect(button('Continue').props.disabled).toBe(true);
  await act(() => {
    input('Choose card PIN').props.onChangeText('4567');
    input('Confirm card PIN').props.onChangeText('4568');
  });
  expect(button('Continue').props.disabled).toBe(true);
  await act(() => input('Confirm card PIN').props.onChangeText('4567'));
  expect(button('Continue').props.disabled).toBe(false);
  await act(() => button('Continue').props.onPress());
  expect(tree.root.findByType(RoBaselinePaymentSign)).toBeDefined();
  await act(() => button('Sign').props.onPress());
  expect(onSave).not.toHaveBeenCalled();
  await act(() => tree.root.findByType(FaceIdOverlay).props.onComplete());
  expect(onSave).toHaveBeenCalledWith('4567');
  await act(() => button('Ok, I got it').props.onPress());
  expect(onClose).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});

test('revealed PIN closes after seven seconds', async () => {
  jest.useFakeTimers();
  const onClose = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <CardPinFlow
        host={host}
        card={bankingProducts(host).cards[0]}
        pin="1985"
        onSave={jest.fn()}
        onClose={onClose}
      />,
    );
  });
  await act(() => tree.root.findByType(FaceIdOverlay).props.onComplete());
  await act(() =>
    tree.root
      .findAllByType(PrimaryButton)
      .find(node => node.props.label === 'Show PIN')!
      .props.onPress(),
  );
  await act(() => jest.advanceTimersByTime(7000));
  expect(onClose).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
  jest.useRealTimers();
});
