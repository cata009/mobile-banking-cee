import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { ToggleButton } from '../src/universal/ToggleButton';
import { CURRENT_FUTURE_GAIN_ADAPTER } from '../src/experiences/pi/current/future-gain/adapter';
import {
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import type {
  CurrentScreenProps,
  CurrentScreen,
} from '../src/experiences/pi/current/contracts';
import { FUTURE_GAIN_PEER_GOALS } from '@/features/investments/future-gain/peerInsights';
const counts = {
  accounts: 2,
  debitCards: 1,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 0,
  mortgages: 0,
  investments: 1,
};
async function render(
  screen: CurrentScreen,
  extra: Partial<CurrentScreenProps> = {},
) {
  const props: CurrentScreenProps = {
    country: 'RS',
    release: 'release-future-rs-future-gain',
    scenario: 'active',
    language: 'en',
    productCounts: counts,
    route: { screen },
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
  const Component = CURRENT_FUTURE_GAIN_ADAPTER.screens[screen]!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<Component {...props} />);
  });
  return { tree, props };
}
const press = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    node =>
      typeof node.props.onPress === 'function' &&
      node.props.accessibilityLabel === label,
  )[0]!;
const field = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root
    .findAllByType(TextInput)
    .find(node => node.props.accessibilityLabel === label)!;
test('fund illustration hands exact Source ID and draft back to the RS investment catalog', async () => {
  const { tree, props } = await render('smart-investment', {
    route: {
      screen: 'smart-investment',
      params: {
        view: 'fund',
        securityId: 'climate-focus',
        amountInput: '1000',
        currency: 'EUR',
      },
    },
  });
  expect(JSON.stringify(tree.toJSON())).toContain(
    'onemarkets Climate Focus Fund',
  );
  expect(JSON.stringify(tree.toJSON())).toContain('22,10');
  await act(() => press(tree, 'Explore more').props.onPress());
  expect(props.onNavigate).toHaveBeenCalledWith({
    screen: 'investments',
    params: {
      securityId: 'climate-focus',
      futureGainAmountInput: '1000',
      futureGainCurrency: 'EUR',
      futureGainReturn: 'smart-investment',
    },
  });
  await act(() =>
    field(tree, 'Investment amount in EUR').props.onChangeText('999999999'),
  );
  expect(press(tree, 'Explore more').props.disabled).toBe(true);
  await act(() => tree.unmount());
});
test('deposit Source funding clears the amount and callback returns a completed request', async () => {
  const { tree } = await render('smart-investment');
  await act(() => press(tree, 'Term Deposits').props.onPress());
  await act(() => press(tree, 'External bank account').props.onPress());
  expect(field(tree, 'Amount to deposit in EUR').props.value).toBe('');
  expect(press(tree, 'Request offer').props.disabled).toBe(true);
  await act(() =>
    field(tree, 'Amount to deposit in EUR').props.onChangeText('1000'),
  );
  expect(JSON.stringify(tree.toJSON())).toContain('1.032,44');
  await act(() => press(tree, 'Request offer').props.onPress());
  await act(() => press(tree, 'Request a callback').props.onPress());
  await act(() =>
    field(tree, 'Additional notes').props.onChangeText(
      'Please contact me tomorrow',
    ),
  );
  await act(() => press(tree, 'Continue').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Request received');
  await act(() => tree.unmount());
});
test('peer insights requires consent, preserves Source goal IDs and opens the correct product simulator', async () => {
  const { tree } = await render('peer-insights');
  expect(press(tree, 'Next').props.disabled).toBe(true);
  const toggle = tree.root.findAllByType(ToggleButton)[0]!;
  await act(() => toggle.props.onToggle(true));
  await act(() => press(tree, 'Next').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('36 - 45');
  for (const goal of FUTURE_GAIN_PEER_GOALS) {
    await act(() => press(tree, goal.title).props.onPress());
    expect(JSON.stringify(tree.toJSON())).toContain(goal.sectionTitle);
  }
  const saving = FUTURE_GAIN_PEER_GOALS.find(goal => goal.id === 'saving')!;
  await act(() => press(tree, `Open ${saving.products[0]!.title} simulator`).props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('DEPOSIT CALCULATION');
  await act(() => press(tree, 'Request offer').props.onPress());
  await act(() => press(tree, 'Continue').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain(
    'Your offer request is ready in this demo. No request has been sent.',
  );
  await act(() => tree.unmount());
});
test('FutureGain does not expose actionable entries outside its RS release', async () => {
  const { tree, props } = await render('smart-investment', {
    country: 'RO',
    release: 'release-current',
  });
  expect(press(tree, 'Investment Funds')).toBeUndefined();
  expect(CURRENT_FUTURE_GAIN_ADAPTER.searchEntries?.(props)).toEqual([]);
  await act(() => tree.unmount());
});

test.each(
  FUTURE_GAIN_PEER_GOALS.flatMap(goal =>
    goal.products.map(product => ({ goal, product })),
  ),
)(
  '$product.id opens its canonical simulator and retains the selected goal when returning',
  async ({ goal, product }) => {
    const { tree } = await render('peer-insights');
    await act(() =>
      tree.root.findAllByType(ToggleButton)[0]!.props.onToggle(true),
    );
    await act(() => press(tree, 'Next').props.onPress());
    await act(() => press(tree, goal.title).props.onPress());
    await act(() => press(tree, `Open ${product.title} simulator`).props.onPress());
    const expected =
      product.simulator === 'credit-card' ? 'Credit Card' : product.title;
    expect(JSON.stringify(tree.toJSON())).toContain(expected);
    if (product.simulator === 'credit-card') {
      await act(() => press(tree, 'Mastercard Platinum').props.onPress());
      await act(() => press(tree, 'Call us for offer').props.onPress());
      expect(JSON.stringify(tree.toJSON())).toContain(
        'No call is started in this demo.',
      );
      await act(() => press(tree, 'OK').props.onPress());
    } else {
      expect(JSON.stringify(tree.toJSON())).toContain(
        'Indicative demo estimate. The final offer may differ.',
      );
    }
    await act(() => press(tree, 'Back').props.onPress());
    expect(JSON.stringify(tree.toJSON())).toContain(goal.sectionTitle);
    await act(() => tree.unmount());
  },
);

test('changing simulator currency is staged until confirmation and cancel keeps the original draft', async () => {
  const { tree } = await render('smart-investment', {
    route: {
      screen: 'smart-investment',
      params: {
        view: 'fund',
        securityId: 'climate-focus',
        amountInput: '1000',
        currency: 'EUR',
      },
    },
  });
  await act(() =>
    press(tree, 'Change currency, currently EUR').props.onPress(),
  );
  await act(() => press(tree, 'USD').props.onPress());
  expect(field(tree, 'Investment amount in EUR').props.value).toBe('1000');
  await act(() => press(tree, 'Close').props.onPress());
  expect(field(tree, 'Investment amount in EUR').props.value).toBe('1000');
  await act(() =>
    press(tree, 'Change currency, currently EUR').props.onPress(),
  );
  await act(() => press(tree, 'USD').props.onPress());
  await act(() => press(tree, 'OK').props.onPress());
  expect(field(tree, 'Investment amount in USD').props.value).toBe('1.163,70');
  await act(() => tree.unmount());
});
