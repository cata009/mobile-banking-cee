import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import PfmScreen from '../src/experiences/pi/cz/evo-2027/pfm/PfmScreen';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';

const props: CzechNativeScreenProps = {
  route: { screen: 'pfm' },
  scenario: 'active',
  productCounts: DEFAULT_CZECH_COUNTS,
  amountsHidden: false,
  onBack: jest.fn(),
  onNavigate: jest.fn(),
  onProfile: jest.fn(),
  onSearch: jest.fn(),
  onAmountsToggle: jest.fn(),
  onChanged: jest.fn(),
};

test('spending summary presents net cashflow before proportional flows and retains analysis actions', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<PfmScreen {...props} />);
  });
  const card = tree.root.findByProps({ testID: 'cz-pfm-summary-card' });
  const ids = card
    .findAll(node =>
      ['cz-pfm-net', 'cz-pfm-income'].includes(node.props.testID),
    )
    .map(node => node.props.testID);
  expect(ids.indexOf('cz-pfm-net')).toBeLessThan(ids.indexOf('cz-pfm-income'));
  expect(
    card.findAll(
      node =>
        node.props.testID === 'cz-pfm-flow-bar' &&
        typeof node.type === 'string',
    ),
  ).toHaveLength(2);
  expect(
    card.findAllByProps({ accessibilityLabel: 'Analyse money in' }).length,
  ).toBeGreaterThan(0);
  expect(
    card.findAllByProps({ accessibilityLabel: 'Analyse money out' }).length,
  ).toBeGreaterThan(0);
  await act(() => tree.unmount());
});
