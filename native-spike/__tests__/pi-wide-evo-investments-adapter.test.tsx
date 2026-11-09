import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { BaselinePageHeader } from '../src/universal/BaselinePageHeader';
import { ModuleNavigation } from '../src/experiences/pi/cz/evo-2027/investments/ModuleNavigation';
import { FuturePortfolioSwitcher } from '../src/experiences/pi/cz/evo-2027/investments/FuturePortfolioSwitcher';
import { Select } from '../src/universal/Select';
import { nativeDemoRouteFromCzechRoute } from '../src/experiences/pi/cz/evo-2027/controlledRoutes';
import { saveFutureProfile } from '../../src/features/investments/future-overview/session';
import { DEFAULT_FUTURE_PROFILE } from '../../src/features/investments/future-overview/model';
import { CZECH_INVESTMENTS_ADAPTER } from '../src/experiences/pi/cz/evo-2027/investments/adapter';
import { createCzInvestmentSnapshot } from '../src/experiences/pi/cz/evo-2027/investments/model';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeRoute,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';

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

async function mount(
  route: CzechNativeRoute,
  overrides: Partial<CzechNativeScreenProps> = {},
) {
  const Screen = CZECH_INVESTMENTS_ADAPTER.screens[route.screen];
  if (!Screen) throw new Error(`Missing adapter screen: ${route.screen}`);
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<Screen {...czechHost(route)} {...overrides} />);
  });
  return tree;
}

test('Czech adapter opens the Future portfolio with its two-series chart', async () => {
  const tree = await mount({ screen: 'investments' }, { language: 'en' });
  expect(
    tree.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Investment profile' &&
        typeof node.props.onPress === 'function',
    ),
  ).toHaveLength(0);
  expect(
    tree.root.findAll(node => node.props.testID === 'future-portfolio-chart'),
  ).not.toHaveLength(0);
  await act(async () => tree.unmount());
});

test('the actual Evo portfolio route uses the compact header without a second safe area and the Evo dock', async () => {
  const tree = await mount(
    { screen: 'investments' },
    {
      screenTopInset: 54,
      investmentPresentation: { showBottomNavigation: true },
    },
  );
  const header = tree.root.findByType(BaselinePageHeader);
  expect(header.props.title).toBe('Detail portfolia');
  expect(header.props.collapsedTitleProgress).toBe(1);
  expect(header.props.safeAreaReserve).toBe(0);
  const navigation = tree.root.findByType(ModuleNavigation);
  expect(navigation.props.variant).toBe('evo-2027');
  expect(navigation.props.bottomInset).toBe(0);
  await act(async () => tree.unmount());
});

test('Czech adapter forwards investment history to the shared baseline', async () => {
  const tree = await mount({ screen: 'investment-history' });
  expect(
    tree.root.findAll(node =>
      String(node.props.testID ?? '').startsWith('baseline-history-row-'),
    ).length,
  ).toBeGreaterThan(0);
  await act(async () => tree.unmount());
});

test('Czech adapter forwards investment detail to the shared baseline', async () => {
  const security = createCzInvestmentSnapshot(
    DEFAULT_CZECH_COUNTS,
  ).catalog.find(item => item.status === 'active')!;
  const tree = await mount({
    screen: 'investment-detail',
    params: { securityId: security.id },
  });
  expect(
    tree.root.findAll(
      node => node.props.testID === 'investment-field-Product ID',
    ),
  ).not.toHaveLength(0);
  await act(async () => tree.unmount());
});

test('Czech adapter keeps the Robo route in the existing Evo composition', async () => {
  const tree = await mount({ screen: 'robo', params: { view: 'goals' } });
  expect(
    tree.root.findAll(node => node.props.testID === 'cz-goals').length,
  ).toBeGreaterThan(0);
  expect(
    tree.root.findAll(node =>
      String(node.props.accessibilityLabel).startsWith('Změnit portfolio:'),
    ).length,
  ).toBeGreaterThan(0);
  expect(
    tree.root.findAll(
      node => node.props.testID === 'baseline-investment-portfolio-chart',
    ),
  ).toHaveLength(0);
  await act(async () => tree.unmount());
});

async function press(tree: Renderer.ReactTestRenderer, label: string) {
  const control = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0];
  expect(control).toBeDefined();
  await act(async () => control!.props.onPress());
}

test('all five sections retain their navigation and recommendations open a real product', async () => {
  const tree = await mount({ screen: 'investments' }, { language: 'en' });
  for (const [label, id] of [
    ['Explore', 'explore'],
    ['Invest', 'catalog'],
    ['Activity', 'history'],
    ['More', 'more'],
    ['Portfolio', 'portfolio'],
  ]) {
    await press(tree, label!);
    expect(tree.root.findByType(ModuleNavigation).props.value).toBe(id);
  }
  await press(tree, 'Explore');
  await press(tree, 'UniCredit Balanced Income Fund');
  expect(
    tree.root.findAll(
      node => node.props.testID === 'investment-field-Product ID',
    ).length,
  ).toBeGreaterThan(0);
  await press(tree, 'Back');
  expect(tree.root.findByType(ModuleNavigation).props.value).toBe('explore');
  await act(async () => tree.unmount());
});

test('saving a loss-intolerant profile removes incompatible recommendations', async () => {
  const tree = await mount({ screen: 'investments' }, { language: 'en' });
  try {
    await press(tree, 'More');
    await press(tree, 'Investment profile');
    await press(tree, 'Update MiFID questionnaire');
    const choice = tree.root
      .findAllByType(Select)
      .find(
        node =>
          node.props.label ===
          'Can you accept a loss in the value of your investment?',
      )!;
    await act(async () => choice.props.onChange('no'));
    await press(tree, 'Save profile');
    await press(tree, 'Explore');
    expect(
      tree.root.findAll(
        node =>
          node.props.accessibilityLabel === 'UniCredit Balanced Income Fund',
      ),
    ).toHaveLength(0);
    expect(
      tree.root.findAll(
        node =>
          node.props.accessibilityLabel ===
          'Update your investment profile to see compatible ideas.',
      ).length,
    ).toBeGreaterThan(0);
  } finally {
    await act(async () => tree.unmount());
    saveFutureProfile(DEFAULT_FUTURE_PROFILE);
  }
});

test('choosing Portfolio explicitly clears goal resume instead of reopening a remembered goal', async () => {
  const onNavigate = jest.fn(),
    onRoboResumeStateChange = jest.fn();
  const tree = await mount(
    { screen: 'robo', params: { view: 'goals' } },
    { onNavigate, onRoboResumeStateChange },
  );
  await act(async () =>
    tree.root.findByType(FuturePortfolioSwitcher).props.onChange('portfolio'),
  );
  expect(onRoboResumeStateChange).toHaveBeenLastCalledWith(null);
  const target = onNavigate.mock.calls.at(-1)![0];
  expect(nativeDemoRouteFromCzechRoute(target)).toEqual({
    screen: 'investments',
    params: { entry: 'portfolio', initialView: 'portfolio' },
  });
  await act(async () => tree.unmount());
});
