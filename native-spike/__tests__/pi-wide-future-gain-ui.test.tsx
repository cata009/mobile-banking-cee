import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { CURRENT_FUTURE_GAIN_ADAPTER } from '../src/experiences/pi/current/future-gain/adapter';
import { FutureGainBanner } from '../src/experiences/pi/current/future-gain/FutureGainBanner';
import { Simulator } from '../src/experiences/pi/current/future-gain/Simulator';
import { TermDeposit } from '../src/experiences/pi/current/future-gain/TermDeposit';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { BaselineAmountField } from '../src/universal/BaselineAmountField';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';

function host(extra: Partial<CurrentScreenProps> = {}): CurrentScreenProps {
  return {
    country: 'RS',
    release: 'release-future-rs-future-gain',
    scenario: 'active',
    language: 'en',
    productCounts: {
      accounts: 2,
      debitCards: 1,
      creditCards: 1,
      mealCards: 0,
      deposits: 1,
      savingsAccounts: 1,
      loans: 0,
      mortgages: 0,
      investments: 1,
    },
    route: { screen: 'smart-investment' },
    tokens: currentTokens(),
    t: createCurrentTranslator('RS', 'en'),
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

async function render(element: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(element);
  });
  return tree;
}

test('Future Gain banner preserves the Source offer copy and press contract', async () => {
  const onPress = jest.fn();
  const tree = await render(<FutureGainBanner onPress={onPress} dark />);
  const card = tree.root.findByProps({
    testID: 'source-offer-future-gain-smart-investment',
  });

  expect(card.props.accessibilityLabel).toBe('Check smart investment');
  await act(() => card.props.onPress());
  expect(onPress).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});

test('smart investment overview retains Source option risk labels and balance control', async () => {
  const current = host();
  const Screen = CURRENT_FUTURE_GAIN_ADAPTER.screens['smart-investment']!;
  const tree = await render(<Screen {...current} />);
  const rendered = JSON.stringify(tree.toJSON());

  expect(rendered).toContain('Term Deposits');
  expect(rendered).toContain('LOW RISK');
  expect(rendered).toContain('Investment Funds');
  expect(rendered).toContain('MEDIUM RISK');
  expect(rendered).toContain('Stocks');
  expect(rendered).toContain('HIGH RISK');
  expect(
    tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'button' &&
        node.props.accessibilityLabel ===
          'Select currency. Available balance in EUR',
    ).length,
  ).toBeGreaterThan(0);
  expect(
    tree.root
      .findAllByType(SourceCustomIcon)
      .some(icon => icon.props.name === 'chevron-down'),
  ).toBe(true);
  await act(() => tree.unmount());
});

test('fund simulator keeps Source field labels, selection affordance, and balance helper', async () => {
  const current = host();
  const tree = await render(
    <Simulator host={current} kind="fund" onBack={current.onBack} />,
  );

  const selectedFund = tree.root
    .findAllByType(BaselineTextField)
    .find(field => field.props.label === 'Fund')!;
  expect(selectedFund.props.label).toBe('Fund');
  expect(selectedFund.props.ariaLabel).toBe(
    'Selected fund: UniCredit Balanced Income Fund',
  );
  expect(selectedFund.props.trailingIconAction.ariaLabel).toBe('Change fund');

  const amount = tree.root.findByType(BaselineAmountField);
  expect(amount.props.label).toBe('Investment Amount');
  expect(amount.props.ariaLabel).toBe('Investment amount in EUR');
  expect(amount.props.currencyLabel).toBe('Currency');
  expect(amount.props.helperText).toContain('Available balance');
  expect(amount.props.helperText2).toBeUndefined();
  await act(() => tree.unmount());
});

test('term deposit retains Source opportunity copy and amount-field labels', async () => {
  const current = host();
  const tree = await render(
    <TermDeposit host={current} onBack={current.onBack} />,
  );
  const rendered = JSON.stringify(tree.toJSON());

  expect(rendered).toContain('Missed investment opportunity');
  expect(rendered).toContain('left uninvested after monthly expenses');
  expect(rendered).toContain('for a 12M deposit');
  expect(rendered).toContain(
    'Choose your deposit type, currency, amount, and term to see the expected interest and return.',
  );

  const amount = tree.root.findByType(BaselineAmountField);
  expect(amount.props.label).toBe('Amount to deposit');
  expect(amount.props.ariaLabel).toBe('Amount to deposit in EUR');
  expect(amount.props.currencyLabel).toBe('Currency');
  expect(amount.props.helperText).toBe('Available balance');
  expect(amount.props.helperText2).toContain(' EUR');
  expect(tree.root.findAllByType(TextInput).length).toBeGreaterThan(0);
  await act(() => tree.unmount());
});

test('term-deposit callback keeps the Source note limit and completes locally', async () => {
  const current = host();
  const Screen = CURRENT_FUTURE_GAIN_ADAPTER.screens['smart-investment']!;
  const tree = await render(<Screen {...current} />);
  const press = (label: string) =>
    tree.root.findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )[0]!;

  await act(() => press('Term Deposits').props.onPress());
  await act(() => press('Request offer').props.onPress());
  await act(() => press('Request a callback').props.onPress());
  const note = tree.root
    .findAllByType(TextInput)
    .find(input => input.props.accessibilityLabel === 'Additional notes')!;
  expect(note.props.maxLength).toBe(500);

  await act(() => press('Continue').props.onPress());
  await act(() => press('Done').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Term Deposits');
  expect(current.onNavigate).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});
