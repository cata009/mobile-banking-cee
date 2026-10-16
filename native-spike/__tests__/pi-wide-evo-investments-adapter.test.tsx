import React from 'react';
import Renderer, { act } from 'react-test-renderer';
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

async function mount(route: CzechNativeRoute) {
  const Screen = CZECH_INVESTMENTS_ADAPTER.screens[route.screen];
  if (!Screen) throw new Error(`Missing adapter screen: ${route.screen}`);
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<Screen {...czechHost(route)} />);
  });
  return tree;
}

test('Czech adapter forwards classic portfolio to the shared baseline', async () => {
  const tree = await mount({ screen: 'investments' });
  expect(
    tree.root.findAll(
      node => node.props.testID === 'baseline-investment-portfolio-chart',
    ),
  ).not.toHaveLength(0);
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
  expect(JSON.stringify(tree.toJSON())).toContain('Your goals list');
  expect(
    tree.root.findAll(
      node => node.props.testID === 'baseline-investment-portfolio-chart',
    ),
  ).toHaveLength(0);
  await act(async () => tree.unmount());
});
