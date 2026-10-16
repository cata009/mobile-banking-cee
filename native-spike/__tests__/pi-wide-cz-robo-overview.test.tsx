import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import type { BaselineInvestmentOverviewProps } from '../src/experiences/pi/current/investments/baseline/contracts';
import {
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { BaselinePageHeader } from '../src/universal/BaselinePageHeader';
import { BaselineInvestmentPortfolioChart } from '../src/experiences/pi/current/investments/baseline/overview/PortfolioChart';
import { CzRoboOverview } from '../src/experiences/pi/current/investments/baseline/overview/CzRoboOverview';

type ModuleSection = 'portfolio' | 'explore' | 'catalog' | 'history' | 'more';
type CzRoboOverviewProps = BaselineInvestmentOverviewProps & {
  onModuleSelect: (section: ModuleSection) => void;
};

function overviewProps(
  country: CurrentScreenProps['country'] = 'CZ',
): CzRoboOverviewProps {
  const host: CurrentScreenProps = {
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
    mode: 'light',
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
  };

  return {
    host,
    snapshot: createCurrentInvestmentSnapshot(host),
    state: { tabId: 'performance', periodId: 'max', sortId: 'max-value' },
    onStateChange: jest.fn(),
    onOpenSecurity: jest.fn(),
    onOpenDistribution: jest.fn(),
    onOpenCatalog: jest.fn(),
    onOpenHistory: jest.fn(),
    onOpenApprovals: jest.fn(),
    onModuleSelect: jest.fn(),
  };
}

function render(props: CzRoboOverviewProps) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<CzRoboOverview {...props} />);
  });
  return tree;
}

const button = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    node =>
      node.props.accessibilityRole === 'button' &&
      node.props.accessibilityLabel === label,
  )[0]!;

const trees: Renderer.ReactTestRenderer[] = [];
afterEach(() => {
  act(() => trees.forEach(tree => tree.unmount()));
  trees.length = 0;
});

function renderTracked(props: CzRoboOverviewProps) {
  const tree = render(props);
  trees.push(tree);
  return tree;
}

test('CZ Robo overview uses Source level-one shell and routes its module navigation', async () => {
  const props = overviewProps(),
    tree = renderTracked(props);

  expect(JSON.stringify(tree.toJSON())).toContain('Portfolio details');
  expect(tree.root.findByType(BaselinePageHeader).props).toMatchObject({
    variant: 'gray',
    backIconName: 'close-flow',
    backLabel: 'Back to mobile banking',
    renderLargeTitle: false,
    hideCollapsedTitleWhenHidden: true,
    showHelp: true,
  });
  expect(tree.root.findByType(BaselineInvestmentPortfolioChart).props).toMatchObject({
    edgeToEdge: true,
    tightBottomPadding: true,
    czRoboPresentation: true,
  });
  expect(
    tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'tab' &&
        typeof node.props.onPress === 'function',
    ),
  ).toHaveLength(5);

  await act(() => button(tree, 'Explore').props.onPress());
  await act(() => button(tree, 'Invest').props.onPress());
  await act(() => button(tree, 'Activity').props.onPress());
  expect(props.onModuleSelect).toHaveBeenNthCalledWith(1, 'explore');
  expect(props.onModuleSelect).toHaveBeenNthCalledWith(2, 'catalog');
  expect(props.onModuleSelect).toHaveBeenNthCalledWith(3, 'history');
});

test('CZ Robo allocation and security actions reuse the baseline state contract', async () => {
  const props = overviewProps(),
    tree = renderTracked(props),
    security = props.snapshot.securities.find(item => item.status === 'active')!;

  const currencyTab = tree.root.findAll(
    node =>
      node.props.accessibilityRole === 'tab' &&
      node.props.accessibilityLabel === 'CURRENCY' &&
      typeof node.props.onPress === 'function',
  )[0]!;
  await act(() => currencyTab.props.onPress());
  expect(props.onStateChange).toHaveBeenCalledWith({ tabId: 'currency' });

  await act(() =>
    button(tree, 'Sort securities. Current sort: MAX VALUE').props.onPress(),
  );
  const minValueOption = tree.root.findAll(
    node =>
      node.props.accessibilityRole === 'radio' &&
      node.props.accessibilityLabel === 'MIN VALUE',
  )[0]!;
  await act(() => minValueOption.props.onPress());
  expect(props.onStateChange).toHaveBeenCalledWith({ sortId: 'min-value' });

  await act(() => button(tree, security.title).props.onPress());
  expect(props.onOpenSecurity).toHaveBeenCalledWith(security.id);
});
