import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import {
  DuoPreviewProvider,
  DuoLocalViewportProvider,
} from '../src/universal/DuoPreview';
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

test('groups income and spending categories only when the Duo content area is wide', async () => {
  const renderScreen = (portrait: boolean) => {
    const width = portrait ? 669 : 867;
    return (
      <DuoPreviewProvider
        value={{
          width: portrait ? 669 : 951,
          height: portrait ? 951 : 669,
          rightInset: portrait ? 0 : 84,
          referenceWidth: 375,
        }}
      >
        <DuoLocalViewportProvider
          value={{ width, height: portrait ? 951 : 669, left: 0, top: 0 }}
        >
          <PfmScreen {...props} />
        </DuoLocalViewportProvider>
      </DuoPreviewProvider>
    );
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(renderScreen(false));
  });
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'cz-pfm-category-columns' }).props.style,
    ).flexDirection,
  ).toBe('row');
  await act(() => tree.update(renderScreen(true)));
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'cz-pfm-category-columns' }).props.style,
    ).flexDirection,
  ).not.toBe('row');
  expect(
    tree.root.findAllByProps({ accessibilityLabel: 'Analyse money in' }).length,
  ).toBeGreaterThan(0);
  await act(() => tree.unmount());
});

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
