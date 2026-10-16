import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { BaselineInvestmentFrame } from '../src/experiences/pi/current/investments/baseline/Frame';
import { BaselineInvestmentSellOrder } from '../src/experiences/pi/current/investments/baseline/flows/SellOrder';
import { BaselineInvestmentSuccess } from '../src/experiences/pi/current/investments/baseline/flows/Signing';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { FaceIdOverlay } from '../src/experiences/pi/current/baseline/FaceIdOverlay';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import { ToggleButton } from '../src/universal/ToggleButton';

function host(
  country: CurrentScreenProps['country'] = 'RO',
): CurrentScreenProps {
  return {
    country,
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
    route: { screen: 'investments' },
    tokens: currentTokens(),
    t: createCurrentTranslator(country, 'en'),
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
}

const field = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root
    .findAllByType(BaselineTextField)
    .find(node => node.props.label === label)!;

const button = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root
    .findAllByType(PrimaryButton)
    .find(node => node.props.label === label)!;

const globalGrowth = (p: CurrentScreenProps) =>
  createCurrentInvestmentSnapshot(p).catalog.find(
    security =>
      security.title === 'Global Growth Portfolio' &&
      security.owned &&
      security.status === 'active',
  )!;

test('sell order keeps Source detail geometry and masks portfolio quantity', async () => {
  const p = host();
  p.amountsHidden = true;
  const snapshot = createCurrentInvestmentSnapshot(p);
  const security = snapshot.catalog.find(
    item =>
      item.title === 'Global Growth Portfolio' &&
      item.owned &&
      item.status === 'active',
  )!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <BaselineInvestmentSellOrder
        host={p}
        security={security}
        accounts={snapshot.accounts}
        onBack={p.onBack}
        onComplete={jest.fn()}
      />,
    );
  });

  const product = tree.root.findByProps({ testID: 'investment-field-Product' });
  expect(StyleSheet.flatten(product.props.style)).toEqual(
    expect.objectContaining({
      minHeight: 80,
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
      gap: 4,
    }),
  );
  expect(field(tree, 'Portfolio account').props.helperText).toBe(
    'You own *,*** PCS',
  );

  const units = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Units' &&
      typeof node.props.onPress === 'function',
  )[0]!;
  expect(StyleSheet.flatten(units.props.style)).toEqual(
    expect.objectContaining({
      height: 24,
      minWidth: 68,
      borderRadius: 4,
      borderWidth: 1,
      paddingHorizontal: 10,
    }),
  );
  await act(() => tree.unmount());
});

test('sell validation and terms gating retain the order draft through review Back', async () => {
  const p = host();
  const snapshot = createCurrentInvestmentSnapshot(p);
  const security = globalGrowth(p);
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <BaselineInvestmentSellOrder
        host={p}
        security={security}
        accounts={snapshot.accounts}
        onBack={p.onBack}
        onComplete={jest.fn()}
      />,
    );
  });

  expect(button(tree, 'Next').props.disabled).toBe(true);
  await act(() =>
    field(tree, 'Number of units you want to sell').props.onChange(
      String(security.quantity + 1),
    ),
  );
  expect(field(tree, 'Number of units you want to sell').props.errorText).toBeTruthy();
  expect(button(tree, 'Next').props.disabled).toBe(true);

  await act(() =>
    field(tree, 'Number of units you want to sell').props.onChange('1'),
  );
  await act(() => button(tree, 'Next').props.onPress());
  expect(tree.root.findByType(BaselineInvestmentFrame).props.title).toBe(
    'Review Data',
  );
  expect(JSON.stringify(tree.toJSON())).toContain('1 PCS');

  const terms = () =>
    tree.root
      .findAllByType(ToggleButton)
      .find(node => node.props.ariaLabel === 'Accept terms and conditions')!;
  expect(button(tree, 'Sell').props.disabled).toBe(true);
  await act(() => terms().props.onToggle(true));
  expect(button(tree, 'Sell').props.disabled).toBe(false);

  await act(() => tree.root.findByType(BaselineInvestmentFrame).props.onBack());
  expect(field(tree, 'Number of units you want to sell').props.value).toBe('1');
  await act(() => button(tree, 'Next').props.onPress());
  expect(tree.root.findByType(BaselineInvestmentFrame).props.title).toBe(
    'Review Data',
  );
  expect(button(tree, 'Sell').props.disabled).toBe(false);
  await act(() => tree.unmount());
});

test('signed sell completes from Done and uses the Source success body line box', async () => {
  const p = host();
  const snapshot = createCurrentInvestmentSnapshot(p);
  const security = globalGrowth(p);
  const complete = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <BaselineInvestmentSellOrder
        host={p}
        security={security}
        accounts={snapshot.accounts}
        onBack={p.onBack}
        onComplete={complete}
      />,
    );
  });

  await act(() =>
    field(tree, 'Number of units you want to sell').props.onChange('1'),
  );
  await act(() => button(tree, 'Next').props.onPress());
  await act(() =>
    tree.root
      .findAllByType(ToggleButton)
      .find(node => node.props.ariaLabel === 'Accept terms and conditions')!
      .props.onToggle(true),
  );
  await act(() => button(tree, 'Sell').props.onPress());

  expect(field(tree, 'Enter PIN to sign the order').props.value).toBe('******');
  expect(field(tree, 'Enter PIN to sign the order').props.helperText).toBe(
    'Authorize your sell order securely',
  );
  await act(() => button(tree, 'Sign order').props.onPress());
  expect(button(tree, 'Sign order').props.disabled).toBe(true);
  expect(complete).not.toHaveBeenCalled();

  await act(() => tree.root.findByType(FaceIdOverlay).props.onComplete());
  expect(tree.root.findByProps({ testID: 'baseline-investment-success' })).toBeTruthy();
  expect(complete).not.toHaveBeenCalled();
  const body = tree.root
    .findAll(
      node =>
        node.props.children ===
          'Your order to sell Global Growth Portfolio has been accepted. You can follow its status in Investments History.' &&
        node.props.style,
    )
    .at(-1)!;
  expect(StyleSheet.flatten(body.props.style)).toEqual(
    expect.objectContaining({ fontSize: 16, lineHeight: 22, paddingTop: 58 }),
  );

  await act(() => button(tree, 'Back to investments').props.onPress());
  expect(complete).toHaveBeenCalledTimes(1);
  expect(complete).toHaveBeenCalledWith({
    quantity: 1,
    amount: 115.42,
    currency: 'EUR',
  });
  await act(() => tree.unmount());
});

test('standalone investment success matches Source normal n4 line height', async () => {
  const p = host();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <BaselineInvestmentSuccess
        host={p}
        body="Source normal body"
        onDone={jest.fn()}
      />,
    );
  });
  const body = tree.root
    .findAll(node => node.props.children === 'Source normal body' && node.props.style)
    .at(-1)!;
  expect(StyleSheet.flatten(body.props.style).lineHeight).toBe(22);
  await act(() => tree.unmount());
});
