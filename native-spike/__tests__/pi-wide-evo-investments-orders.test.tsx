import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import { buildInvestmentBuyOrderQuote } from '@/features/investments/orders/buyOrder';
import { getInvestmentSellOrderValidation } from '@/features/investments/orders/sellOrder';
import type { ComponentType } from 'react';
import { BuyOrder } from '../src/experiences/pi/cz/evo-2027/investments/BuyOrder';
import { SellOrder } from '../src/experiences/pi/cz/evo-2027/investments/SellOrder';
import {
  CzInvestmentsScreen,
  type CzInvestmentsScreenProps,
} from '../src/experiences/pi/cz/evo-2027/investments';
import { createCzInvestmentSnapshot } from '../src/experiences/pi/cz/evo-2027/investments/model';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeRoute,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';

const InvestmentsScreenWithClassicHost = CzInvestmentsScreen as ComponentType<
  CzInvestmentsScreenProps & { classicHost?: CzechNativeScreenProps }
>;

function control(tree: Renderer.ReactTestRenderer, label: string) {
  const node = tree.root.findAll(
    item =>
      item.props.accessibilityLabel === label &&
      typeof item.props.onPress === 'function',
  )[0];
  expect(node).toBeDefined();
  return node!;
}

function press(tree: Renderer.ReactTestRenderer, label: string) {
  act(() => control(tree, label).props.onPress());
}

function input(tree: Renderer.ReactTestRenderer, label: string, value: string) {
  act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === label)!
      .props.onChangeText(value),
  );
}

function copy(tree: Renderer.ReactTestRenderer) {
  return JSON.stringify(tree.toJSON());
}

function czechHost(route: CzechNativeRoute): CzechNativeScreenProps {
  return {
    route,
    scenario: 'active',
    bankingScenario: 'retail-single-account',
    language: 'cs',
    mode: 'light',
    productCounts: DEFAULT_CZECH_COUNTS,
    amountsHidden: false,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onSearch: jest.fn(),
    onProfile: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
    onBackHandlerChange: jest.fn(),
  };
}

async function mount(element: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(element);
  });
  return tree;
}

test('CZ Evo buy and sell review amounts follow the canonical Source FX quote policies', () => {
  const snapshot = createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS);
  const buyCase = snapshot.catalog
    .filter(security => security.status === 'active')
    .flatMap(security =>
      snapshot.accounts
        .filter(account => account.currency !== security.instrumentCurrency)
        .map(account => ({ security, account })),
    )
    .find(({ security, account }) =>
      buildInvestmentBuyOrderQuote(security, account, 1).hasSufficientBalance,
    );
  expect(buyCase).toBeDefined();
  if (!buyCase) return;

  const buyQuote = buildInvestmentBuyOrderQuote(
    buyCase.security,
    buyCase.account,
    1,
  );
  let buyTree!: Renderer.ReactTestRenderer;
  act(() => {
    buyTree = Renderer.create(
      <BuyOrder
        security={buyCase.security}
        accounts={[buyCase.account]}
        onBack={jest.fn()}
        onComplete={jest.fn()}
      />,
    );
  });
  input(buyTree, 'Quantity', '1');
  press(buyTree, 'Next');
  expect(copy(buyTree)).toContain(
    formatInvestmentMoney(buyQuote.productAmount, 'CZ', buyQuote.productCurrency),
  );
  expect(copy(buyTree)).toContain(
    formatInvestmentMoney(buyQuote.debitAmount, 'CZ', buyQuote.accountCurrency),
  );
  act(() => buyTree.unmount());

  const sellCase = snapshot.catalog
    .filter(
      security =>
        security.status === 'active' &&
        security.owned &&
        security.quantity > 0,
    )
    .flatMap(security =>
      snapshot.accounts
        .filter(account => account.currency !== security.instrumentCurrency)
        .map(account => ({ security, account })),
    )[0];
  expect(sellCase).toBeDefined();
  if (!sellCase) return;

  const quantity = Number(Math.min(sellCase.security.quantity, 0.25).toFixed(6));
  const unitsValue = String(quantity);
  const sellValidation = getInvestmentSellOrderValidation({
    security: sellCase.security,
    account: sellCase.account,
    mode: 'units',
    unitsValue,
    amountValue: '',
  });
  expect(sellValidation.canReview).toBe(true);
  expect(sellValidation.quote).not.toBeNull();
  let sellTree!: Renderer.ReactTestRenderer;
  act(() => {
    sellTree = Renderer.create(
      <SellOrder
        security={sellCase.security}
        accounts={[sellCase.account]}
        onBack={jest.fn()}
        onComplete={jest.fn()}
      />,
    );
  });
  input(sellTree, 'Number of units', unitsValue);
  press(sellTree, 'Next');
  expect(copy(sellTree)).toContain(
    formatInvestmentMoney(
      sellValidation.quote!.productAmount,
      'CZ',
      sellCase.security.instrumentCurrency,
    ),
  );
  expect(copy(sellTree)).toContain(
    formatInvestmentMoney(
      sellValidation.quote!.accountAmount,
      'CZ',
      sellCase.account.currency,
    ),
  );
  act(() => sellTree.unmount());
});

test('CZ Evo investments route renders the shared Source Current baseline portfolio', async () => {
  const tree = await mount(
    <InvestmentsScreenWithClassicHost
      snapshot={createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS)}
      onBack={jest.fn()}
      classicHost={czechHost({ screen: 'investments' })}
    />,
  );

  expect(
    tree.root.findAll(
      node => node.props.testID === 'baseline-investment-portfolio-chart',
    ),
  ).not.toHaveLength(0);
  expect(
    tree.root.findAll(node => node.props.testID === 'cz-investment-portfolio'),
  ).toHaveLength(0);
  await act(async () => tree.unmount());
});

test('Source buy request enters the baseline order and is consumed once', async () => {
  const snapshot = createCurrentInvestmentSnapshot({
    country: 'CZ',
    release: 'release-future-evo-2027',
    productCounts: DEFAULT_CZECH_COUNTS,
    bankingScenario: 'retail-single-account',
  });
  const buyCase = snapshot.catalog
    .filter(security => security.status === 'active')
    .flatMap(security =>
      snapshot.accounts
        .filter(account => account.currency !== security.instrumentCurrency)
        .map(account => ({ security, account })),
    )
    .find(({ security, account }) =>
      buildInvestmentBuyOrderQuote(security, account, 1).hasSufficientBalance,
    );
  expect(buyCase).toBeDefined();
  if (!buyCase) return;

  const host = czechHost({ screen: 'investments' });
  const onInvestmentBuyRequestConsumed = jest.fn();
  host.investmentRequests = {
    buy: {
      requestId: 73,
      securityId: buyCase.security.id,
      draft: {
        quantity: 1,
        accountId: buyCase.account.id,
        frequency: 'one-off',
        executionTiming: 'today',
      },
    },
  };
  host.onInvestmentBuyRequestConsumed = onInvestmentBuyRequestConsumed;
  const tree = await mount(
    <InvestmentsScreenWithClassicHost
      snapshot={createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS)}
      onBack={jest.fn()}
      classicHost={host}
    />,
  );

  expect(copy(tree)).toContain('Review Data');
  expect(onInvestmentBuyRequestConsumed).toHaveBeenCalledTimes(1);
  expect(onInvestmentBuyRequestConsumed).toHaveBeenCalledWith(73);
  await act(async () => tree.unmount());
});

test('Source investment-history route opens baseline history rows', async () => {
  const host = czechHost({ screen: 'investment-history' });
  const tree = await mount(
    <InvestmentsScreenWithClassicHost
      snapshot={createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS)}
      onBack={jest.fn()}
      initialView="history"
      classicHost={host}
    />,
  );

  expect(
    tree.root.findAll(node =>
      String(node.props.testID ?? '').startsWith('baseline-history-row-'),
    ).length,
  ).toBeGreaterThan(0);
  await act(async () => tree.unmount());
});

test('Source investment-detail route opens the shared baseline instrument', async () => {
  const sourceSnapshot = createCurrentInvestmentSnapshot({
    country: 'CZ',
    release: 'release-future-evo-2027',
    productCounts: DEFAULT_CZECH_COUNTS,
    bankingScenario: 'retail-single-account',
  });
  const security = sourceSnapshot.catalog.find(
    item => item.status === 'active',
  )!;
  const host = czechHost({
    screen: 'investment-detail',
    params: { securityId: security.id },
  });
  const tree = await mount(
    <InvestmentsScreenWithClassicHost
      snapshot={createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS)}
      onBack={jest.fn()}
      initialSecurityId={security.id}
      classicHost={host}
    />,
  );

  expect(
    tree.root.findAll(node => node.props.testID === 'investment-field-Product ID'),
  ).not.toHaveLength(0);
  expect(copy(tree)).toContain(security.productId);
  await act(async () => tree.unmount());
});

test('Robo goals stay in the Evo investments composition when the classic host is present', async () => {
  const host = czechHost({ screen: 'robo', params: { view: 'goals' } });
  const tree = await mount(
    <InvestmentsScreenWithClassicHost
      snapshot={createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS)}
      onBack={jest.fn()}
      initialView="goals"
      classicHost={host}
    />,
  );

  expect(copy(tree)).toContain('Your goals list');
  expect(
    tree.root.findAll(
      node => node.props.testID === 'baseline-investment-portfolio-chart',
    ),
  ).toHaveLength(0);
  await act(async () => tree.unmount());
});
