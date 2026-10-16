import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import Investments from '../src/experiences/pi/current/investments/Investments';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import {
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import { BaselineInvestmentHistory } from '../src/experiences/pi/current/investments/baseline/flows/History';
import { CzRoboOverview } from '../src/experiences/pi/current/investments/baseline/overview/CzRoboOverview';
import { BaselineInvestmentCatalog } from '../src/experiences/pi/current/investments/baseline/catalog/Catalog';
import { BaselineInvestmentFunds } from '../src/experiences/pi/current/investments/baseline/catalog/Funds';
import { BaselineInvestmentPendingOrders } from '../src/experiences/pi/current/investments/baseline/flows/PendingOrders';
import { BaselineMailboxTabs } from '../src/universal/BaselineMailboxTabs';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import type { NativeInvestmentHistoryOverrides } from '@/features/demo-native/contracts';

function host(extra: Partial<CurrentScreenProps> = {}): CurrentScreenProps {
  return {
    country: 'CZ',
    release: 'release-future-cz-robo',
    scenario: 'active',
    language: 'en',
    productCounts: {
      accounts: 2,
      debitCards: 1,
      creditCards: 1,
      mealCards: 0,
      deposits: 1,
      savingsAccounts: 1,
      loans: 1,
      mortgages: 1,
      investments: 1,
    },
    route: {
      screen: 'investments',
      params: { entry: 'history', tab: 'transactions' },
    },
    tokens: currentTokens(),
    t: createCurrentTranslator('CZ', 'en'),
    amountsHidden: false,
    screenTopInset: 48,
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

async function mount(props: CurrentScreenProps) {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<Investments {...props} />);
  });
  return tree;
}

test('CZ Robo goal history uses the provided transaction DTOs, flags, tab and callback', async () => {
  const base = host();
  const snapshot = createCurrentInvestmentSnapshot(base);
  const transactions = [
    { ...snapshot.transactions[0]!, id: 'goal-only-transaction' },
  ];
  const orders = [{ ...snapshot.orders[0]!, id: 'goal-only-order' }];
  const historyOverrides: NativeInvestmentHistoryOverrides = {
    transactions,
    orders,
    initialTab: 'orders',
    hideAllTimeDateOption: true,
    hideCurrencyFilter: true,
    approvalCount: 2,
  };
  const onInvestmentHistoryTabChange = jest.fn();
  const onInvestmentHistoryToApprove = jest.fn();
  const props = host({
    route: {
      screen: 'investments',
      params: { entry: 'history', tab: 'orders' },
    },
    investmentHistoryOverrides: historyOverrides,
    onInvestmentHistoryTabChange,
    onInvestmentHistoryToApprove,
  });
  const tree = await mount(props);
  const history = tree.root.findByType(BaselineInvestmentHistory);

  expect(history.props.transactions).toEqual(transactions);
  expect(history.props.orders).toEqual(orders);
  expect(history.props.initialTab).toBe('orders');
  expect(history.props.hideAllTimeDateOption).toBe(true);
  expect(history.props.hideCurrencyFilter).toBe(true);
  expect(history.props.approvalCount).toBe(2);
  expect(typeof history.props.onToApprove).toBe('function');
  expect(typeof history.props.onTabChange).toBe('function');
  const approvalAction = history.findByProps({
    accessibilityLabel: '2 orders need your approval',
  });
  await act(async () => approvalAction.props.onPress());
  expect(onInvestmentHistoryToApprove).toHaveBeenCalledTimes(1);
  await act(async () => history.props.onTabChange('transactions'));
  expect(onInvestmentHistoryTabChange).toHaveBeenCalledWith('transactions');
  await act(async () => tree.unmount());
});

test('CZ Robo Activity keeps the Source title, history data and approval options', async () => {
  const props = host({
    release: 'release-current',
    route: { screen: 'investments', params: { entry: 'history' } },
    investmentPresentation: {
      roboAdvisorEnabled: true,
      showBottomNavigation: true,
      bottomInset: 24,
    },
  });
  const tree = await mount(props);
  const history = tree.root.findByType(BaselineInvestmentHistory);

  expect(history.props.titleOverride).toBe('Activity');
  expect(history.props.closeModuleButton).toBe(true);
  expect(history.props.approvalCount).toBe(20);
  expect(history.props.initialTab).toBe('transactions');
  expect(history.props.allDatesByDefault).toBe(false);
  expect(history.props.transactions).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: 'trx-catalog-climate-focus-2026-05-12' }),
    ]),
  );
  await act(async () => tree.unmount());
});

test('Robo presentation renders the Source module overview and maps its footer destinations', async () => {
  const onNavigate = jest.fn();
  const tree = await mount(
    host({
      release: 'release-current',
      route: { screen: 'investments', params: { entry: 'portfolio' } },
      investmentPresentation: {
        roboAdvisorEnabled: true,
        showBottomNavigation: true,
        bottomInset: 24,
      },
      activeFeatures: ['fx_czRoboAdvisor'],
      onNavigate,
    }),
  );
  const overview = tree.root.findByType(CzRoboOverview);

  expect(overview.props.state.periodId).toBe('max');
  expect(overview.props.host.investmentPresentation).toEqual({
    roboAdvisorEnabled: true,
    showBottomNavigation: true,
    bottomInset: 24,
  });
  expect(overview.props.host.activeFeatures).toEqual(['fx_czRoboAdvisor']);
  await act(async () => overview.props.onModuleSelect('explore'));
  expect(tree.root.findByType(BaselineInvestmentFunds)).toBeDefined();
  await act(async () =>
    tree.root.findByType(BaselineInvestmentFunds).props.onBack(),
  );

  const restoredOverview = tree.root.findByType(CzRoboOverview);
  await act(async () => restoredOverview.props.onModuleSelect('catalog'));
  const catalog = tree.root.findByType(BaselineInvestmentCatalog);
  expect(catalog.props.securities).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ sourceProductName: 'Investment goals' }),
    ]),
  );
  await act(async () =>
    tree.root.findByType(BaselineInvestmentCatalog).props.onBack(),
  );
  const portfolioOverview = tree.root.findByType(CzRoboOverview);
  await act(async () => portfolioOverview.props.onModuleSelect('history'));
  expect(onNavigate).toHaveBeenCalledWith({
    screen: 'investments',
    params: { entry: 'history' },
  });
  await act(async () => portfolioOverview.props.onModuleSelect('more'));
  expect(onNavigate).toHaveBeenCalledWith({ screen: 'profile' });
  await act(async () => tree.unmount());
});

test('returning from Robo approvals restores Activity on the Orders tab', async () => {
  const onNavigate = jest.fn();
  const props = host({
    release: 'release-current',
    route: { screen: 'investments', params: { entry: 'history' } },
    investmentPresentation: { showBottomNavigation: true },
    onNavigate,
  });
  const tree = await mount(props);
  const history = tree.root.findByType(BaselineInvestmentHistory);

  await act(async () => history.props.onToApprove());
  expect(onNavigate).toHaveBeenCalledWith({
    screen: 'investments',
    params: { entry: 'approvals' },
  });
  await act(async () =>
    tree.update(
      <Investments
        {...props}
        route={{ screen: 'investments', params: { entry: 'approvals' } }}
      />,
    ),
  );
  expect(tree.root.findByType(BaselineInvestmentPendingOrders)).toBeDefined();
  await act(async () => tree.update(<Investments {...props} />));

  expect(
    tree.root
      .findByType(BaselineInvestmentHistory)
      .findByType(BaselineMailboxTabs).props.activeTabId,
  ).toBe('orders');
  await act(async () => tree.unmount());
});
