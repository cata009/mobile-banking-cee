import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import Investments from '../src/experiences/pi/current/investments/Investments';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import {
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { BaselineInvestmentOverview } from '../src/experiences/pi/current/investments/baseline/overview';
import { BaselineInvestmentHistory } from '../src/experiences/pi/current/investments/baseline/flows/History';
import { BaselineInvestmentInstrument } from '../src/experiences/pi/current/investments/baseline/flows/Instrument';
import { BaselineInvestmentBuyOrder } from '../src/experiences/pi/current/investments/baseline/flows/BuyOrder';
import { BaselineInvestmentFunds } from '../src/experiences/pi/current/investments/baseline/catalog/Funds';
import { CzInvestmentsScreen } from '../src/experiences/pi/cz/evo-2027/investments/InvestmentsScreen';
import { ClassicPortfolio } from '../src/experiences/pi/cz/evo-2027/investments/ClassicPortfolio';
import { createCzechInvestmentHost } from '../src/experiences/pi/cz/evo-2027/investments/hostAdapter';
import { baselineCzRoboSession } from '../src/experiences/pi/current/investments/RoboSession';
import { readCzRoboGoals } from '../src/experiences/pi/cz/evo-2027/robo/session';
import {
  buildInvestmentDistributionItems,
  getInvestmentDistributionGroupKey,
} from '@/app/config/investmentsPortfolioConfig';

function host(extra: Partial<CurrentScreenProps> = {}): CurrentScreenProps {
  return {
    country: 'RO',
    release: 'release-current',
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
    route: { screen: 'investments' },
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

test('current Czech goal updates use the baseline session without modifying Evo goals', async () => {
  const onRoboResumeStateChange = jest.fn();
  const props = host({
    country: 'CZ',
    release: 'release-future-cz-robo',
    route: { screen: 'investments', params: { view: 'goals' } },
    onRoboResumeStateChange,
  });
  const before = readCzRoboGoals();
  const tree = await render(props);
  const goal = {
    ...baselineCzRoboSession.readGoals()[0]!,
    name: 'Baseline ownership test',
  };
  await act(() =>
    tree.root.findByType(CzInvestmentsScreen).props.onGoalUpdated(goal),
  );
  expect(
    baselineCzRoboSession.readGoals().find(item => item.id === goal.id)?.name,
  ).toBe(goal.name);
  expect(readCzRoboGoals()).toEqual(before);
  expect(props.onChanged).toHaveBeenCalledTimes(1);
  expect(onRoboResumeStateChange).toHaveBeenCalledWith({ view: 'goals' });
  await act(() => tree.unmount());
  baselineCzRoboSession.reset();
});

test('CZ Robo classic routes use the shared portfolio adapter while Robo resume routes stay in Evo', async () => {
  const classic = host({
    country: 'CZ',
    release: 'release-future-cz-robo',
  });
  const classicTree = await render(classic);
  const classicPortfolio = classicTree.root.findByType(ClassicPortfolio);
  expect(classicPortfolio.props.release).toBe('release-future-cz-robo');
  expect(classicPortfolio.props.host.route.screen).toBe('investments');
  expect(
    classicTree.root.findAllByType(BaselineInvestmentOverview),
  ).toHaveLength(1);
  await act(() => classicTree.unmount());

  const history = host({
    country: 'CZ',
    release: 'release-future-cz-robo',
    route: { screen: 'investments', params: { entry: 'history' } },
  });
  const historyTree = await render(history);
  expect(
    historyTree.root.findByType(ClassicPortfolio).props.host.route.screen,
  ).toBe('investment-history');
  expect(historyTree.root.findByType(BaselineInvestmentHistory)).toBeDefined();
  await act(() => historyTree.unmount());

  const goalId = baselineCzRoboSession.readGoals()[0]!.id;
  const onRoboResumeStateChange = jest.fn();
  const resume = host({
    country: 'CZ',
    release: 'release-future-cz-robo',
    route: {
      screen: 'investments',
      params: { robo_view: 'detail', robo_goal: goalId },
    },
    onRoboResumeStateChange,
  });
  const resumeTree = await render(resume);
  expect(
    resumeTree.root.findByType(CzInvestmentsScreen).props.initialGoal?.id,
  ).toBe(goalId);
  expect(resumeTree.root.findAllByType(ClassicPortfolio)).toHaveLength(0);
  expect(onRoboResumeStateChange).toHaveBeenCalledWith({
    view: 'detail',
    goalId,
  });
  await act(() => resumeTree.unmount());
});

test('Current to Czech host bridge preserves request DTOs, callbacks, and route params', () => {
  const requests = {
    buy: { requestId: 8, securityId: 'climate-focus' },
    funds: { requestId: 9, collectionId: 'balanced' as const },
    detail: {
      requestId: 10,
      securityId: 'climate-focus',
      futureGainSimulatorState: {
        securityId: 'climate-focus',
        amountInput: '1.000',
        currency: 'RSD' as const,
      },
    },
  };
  const onInvestmentBuyRequestConsumed = jest.fn();
  const onInvestmentSecuritySelected = jest.fn();
  const onInvestmentReturnToSimulator = jest.fn();
  const onRoboResumeStateChange = jest.fn();
  const onBackHandlerChange = jest.fn();
  const props = host({
    country: 'CZ',
    release: 'release-future-cz-robo',
    investmentRequests: requests,
    onInvestmentBuyRequestConsumed,
    onInvestmentSecuritySelected,
    onInvestmentReturnToSimulator,
    onRoboResumeStateChange,
    onBackHandlerChange,
  });
  const route = {
    screen: 'robo' as const,
    params: {
      robo_view: 'detail',
      robo_goal: 'goal-housing',
      entry: 'portfolio',
    },
  };
  const czechHost = createCzechInvestmentHost(props, route);

  expect(czechHost.route).toEqual(route);
  expect(czechHost.investmentRequests).toBe(requests);
  expect(czechHost.onInvestmentBuyRequestConsumed).toBe(
    onInvestmentBuyRequestConsumed,
  );
  expect(czechHost.onInvestmentSecuritySelected).toBe(
    onInvestmentSecuritySelected,
  );
  expect(czechHost.onInvestmentReturnToSimulator).toBe(
    onInvestmentReturnToSimulator,
  );
  expect(czechHost.onRoboResumeStateChange).toBe(onRoboResumeStateChange);
  expect(czechHost.onBackHandlerChange).toBe(onBackHandlerChange);
});

test('CZ Robo classic host consumes buy, funds, and detail requests through Baseline', async () => {
  const props = host({
    country: 'CZ',
    release: 'release-future-cz-robo',
    onInvestmentBuyRequestConsumed: jest.fn(),
    onInvestmentReturnToSimulator: jest.fn(),
  });
  const snapshot = createCurrentInvestmentSnapshot(props);
  const security = snapshot.catalog.find(item => item.status === 'active')!;
  props.investmentRequests = {
    buy: { requestId: 77, securityId: security.id },
  };
  const buyTree = await render(props);
  expect(buyTree.root.findByType(BaselineInvestmentBuyOrder)).toBeDefined();
  expect(props.onInvestmentBuyRequestConsumed).toHaveBeenCalledWith(77);
  await act(() => buyTree.unmount());

  props.investmentRequests = {
    funds: { requestId: 78, collectionId: 'balanced' },
  };
  const fundsTree = await render(props);
  expect(
    fundsTree.root.findByType(BaselineInvestmentFunds).props.initialCollection,
  ).toBe('balanced');
  await act(() => fundsTree.unmount());

  const simulatorState = {
    securityId: 'sustainable-future',
    amountInput: '1.000,50',
    currency: 'RSD' as const,
  };
  props.investmentRequests = {
    detail: {
      requestId: 79,
      securityId: 'sustainable-future',
      futureGainSimulatorState: simulatorState,
    },
  };
  const detailTree = await render(props);
  const instrument = detailTree.root.findByType(BaselineInvestmentInstrument);
  expect(instrument.props.security.id).toBe('sustainable-future');
  await act(() => instrument.props.onBack());
  expect(props.onInvestmentReturnToSimulator).toHaveBeenCalledWith(
    simulatorState,
  );
  await act(() => detailTree.unmount());
});
async function render(props: CurrentScreenProps) {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<Investments {...props} />);
  });
  return tree;
}
const content = (tree: Renderer.ReactTestRenderer) =>
  tree.root
    .findAll(
      node => typeof node.type === 'string' && String(node.type) === 'Text',
    )
    .map(node =>
      node.children.filter(value => typeof value === 'string').join(''),
    )
    .join('\n');
const button = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    node =>
      typeof node.props.onPress === 'function' &&
      node.props.accessibilityLabel === label,
  )[0]!;
const press = async (tree: Renderer.ReactTestRenderer, label: string) => {
  expect(button(tree, label)).toBeDefined();
  await act(() => button(tree, label).props.onPress());
};

test.each(['RO', 'CZ'] as const)(
  '%s validates chat buy intent and enters review with explicit terms acceptance',
  async country => {
    const props = host({
      country,
      release: country === 'CZ' ? 'release-future-evo-2027' : 'release-current',
      amountsHidden: true,
    });
    const snapshot = createCurrentInvestmentSnapshot(props);
    const security = snapshot.catalog.find(item => item.status === 'active')!;
    props.route.params = {
      view: 'buy',
      securityId: security.id,
      quantity: '4',
      accountId: snapshot.accounts[1]!.id,
      frequency: 'one-off',
      executionTiming: 'next-business-day',
    };
    const tree = await render(props);
    expect(content(tree)).toContain('Review Data');
    expect(content(tree)).toContain('Next business day');
    expect(content(tree)).toContain(snapshot.accounts[1]!.name);
    // Classic Current routes use the Source Baseline privacy contract in both markets.
    expect(content(tree)).toContain('4 PCS');
    expect(button(tree, 'Buy').props.disabled).toBe(true);
    await press(tree, 'Back');
    expect(content(tree)).toContain('One off BUY Order');
    await act(() => tree.unmount());
  },
);

test.each([
  { quantity: '0' },
  { quantity: '999999999' },
  { frequency: 'monthly' },
  { accountId: 'unknown' },
  { executionTiming: 'never' },
])(
  'invalid buy intent %j stays editable without entering review',
  async invalid => {
    const props = host();
    const snapshot = createCurrentInvestmentSnapshot(props);
    props.route.params = {
      view: 'buy',
      securityId: snapshot.catalog[0]!.id,
      quantity: '4',
      accountId: snapshot.accounts[0]!.id,
      frequency: 'one-off',
      executionTiming: 'today',
      ...invalid,
    };
    const tree = await render(props);
    expect(content(tree)).toContain('One off BUY Order');
    expect(content(tree)).not.toContain('Review Data');
    await act(() => tree.unmount());
  },
);

test('Czech Robo composition keeps the exact search security intent', async () => {
  const props = host({ country: 'CZ', release: 'release-future-evo-2027' });
  const security = createCurrentInvestmentSnapshot(props).catalog.find(
    item => item.id === 'climate-focus',
  )!;
  props.route.params = { securityId: security.id };
  const tree = await render(props);
  expect(button(tree, 'Buy')).toBeDefined();
  expect(content(tree)).toContain(security.productId);
  await act(() => tree.unmount());
});

test('CZ classic fund collection host Back returns to portfolio and then releases ownership', async () => {
  const register = jest.fn();
  const props = host({
    country: 'CZ',
    release: 'release-future-evo-2027',
    route: { screen: 'investments', params: { collection: 'balanced' } },
    onBackHandlerChange: register,
  });
  const tree = await render(props);
  expect(tree.root.findByType(BaselineInvestmentFunds)).toBeDefined();
  const back = register.mock.calls.at(-1)![0];
  await act(() => expect(back()).toBe(true));
  expect(tree.root.findByType(BaselineInvestmentOverview)).toBeDefined();
  expect(props.onBack).not.toHaveBeenCalled();
  await act(() => expect(back()).toBe(false));
  expect(props.onBack).not.toHaveBeenCalled();
  await act(() => tree.update(<Investments {...props} isActive={false} />));
  expect(register.mock.calls.at(-1)![0]).toBeNull();
  await act(() => tree.unmount());
});

test('baseline direct fund collection uses the host Back handler and returns to portfolio', async () => {
  const register = jest.fn();
  const props = host({
    route: { screen: 'investments', params: { collection: 'balanced' } },
    onBackHandlerChange: register,
  });
  const tree = await render(props);
  expect(content(tree)).toContain('Balanced funds');
  await act(() => register.mock.calls.at(-1)![0]());
  expect(tree.root.findByType(BaselineInvestmentOverview)).toBeDefined();
  expect(props.onBack).not.toHaveBeenCalled();
  await act(() => tree.update(<Investments {...props} isActive={false} />));
  expect(register.mock.calls.at(-1)![0]).toBeNull();
  await act(() => tree.unmount());
});

test('baseline distribution group opens only its canonical holdings and keeps amounts private', async () => {
  const props = host({ amountsHidden: true });
  const snapshot = createCurrentInvestmentSnapshot(props);
  const group = buildInvestmentDistributionItems(
    snapshot.securities.filter(
      item => item.status === 'active' && item.localValue > 0,
    ),
    'currency',
  )[0]!;
  const tree = await render(props);
  await act(() =>
    tree.root
      .findByType(BaselineInvestmentOverview)
      .props.onStateChange({ tabId: 'currency' }),
  );
  await act(() =>
    tree.root
      .findByType(BaselineInvestmentOverview)
      .props.onOpenDistribution('currency', group),
  );
  expect(content(tree)).toContain(group.label);
  for (const security of snapshot.securities.filter(
    item => item.status === 'active' && item.localValue > 0,
  )) {
    if (getInvestmentDistributionGroupKey(security, 'currency') === group.id)
      expect(content(tree)).toContain(security.title);
    else expect(content(tree)).not.toContain(security.title);
  }
  expect(content(tree)).toContain('****');
  expect(content(tree)).not.toContain(
    String(snapshot.securities[0]!.localValue),
  );
  await act(() => tree.unmount());
});

test('RS FutureGain detail request returns to the exact simulator state', async () => {
  const simulatorState = {
    securityId: 'sustainable-future',
    amountInput: '1.000,50',
    currency: 'RSD' as const,
  };
  const onInvestmentReturnToSimulator = jest.fn();
  const props = host({
    country: 'RS',
    release: 'release-future-rs-future-gain',
    onInvestmentReturnToSimulator,
    investmentRequests: {
      detail: {
        requestId: 301,
        securityId: simulatorState.securityId,
        futureGainSimulatorState: simulatorState,
      },
    },
  });
  const tree = await render(props);
  const instrument = tree.root.findByType(BaselineInvestmentInstrument);
  expect(instrument.props.security.id).toBe(simulatorState.securityId);
  await act(() => instrument.props.onBack());
  expect(onInvestmentReturnToSimulator).toHaveBeenCalledWith(simulatorState);
  await act(() => tree.unmount());
});

test.each(['BTC', 'RON'])(
  'RS FutureGain rejects unsupported return currency %s',
  async currency => {
    const props = host({
      country: 'RS',
      release: 'release-future-rs-future-gain',
      route: {
        screen: 'investments',
        params: {
          securityId: 'climate-focus',
          futureGainAmountInput: '1000',
          futureGainCurrency: currency,
          futureGainReturn: 'smart-investment',
        },
      },
    });
    const tree = await render(props);
    expect(content(tree)).not.toContain('Buy securities');
    expect(props.onNavigate).not.toHaveBeenCalled();
    await act(() => tree.unmount());
  },
);
