import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import Pfm from '../src/experiences/pi/current/analytics/Pfm';
import { currentTokens } from '../src/experiences/pi/current/context';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {BaselineCashFlowChart} from '../src/experiences/pi/current/baseline/spending/charts';
import {formatMoneyNumber} from '@/app/registry/countryConfig';
const host: CurrentScreenProps = {
  country: 'RO',
  release: 'release-current',
  scenario: 'active',
  language: 'en',
  productCounts: DEFAULT_CZECH_COUNTS,
  route: { screen: 'pfm' },
  tokens: currentTokens(),
  t: key => key,
  amountsHidden: true,
  screenTopInset: 24,
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
test('legacy PFM retains the unchanged Source cash-flow privacy behavior', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<Pfm {...host} />);
  });
  const charts = tree.root.findAllByType(BaselineCashFlowChart);
  expect(charts.length).toBeGreaterThan(0);
  const displayed=formatMoneyNumber(charts[0].props.summary.incomeTotal,host.country);
  expect(JSON.stringify(tree.toJSON())).toContain(displayed);
  await act(() => tree.unmount());
});
