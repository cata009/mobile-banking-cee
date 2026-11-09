import { authorizeDemo } from '../test-support/cz-evo-investmentsHelpers';
import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Header } from '../src/universal/Header';
import { CzInvestmentsScreen } from '../src/experiences/pi/cz/evo-2027/investments';
import { CZECH_INVESTMENTS_ADAPTER } from '../src/experiences/pi/cz/evo-2027/investments/adapter';
import { createCzInvestmentSnapshot } from '../src/experiences/pi/cz/evo-2027/investments/model';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';
import { ModuleNavigation } from '../src/experiences/pi/cz/evo-2027/investments/ModuleNavigation';
import { FuturePortfolioSwitcher } from '../src/experiences/pi/cz/evo-2027/investments/FuturePortfolioSwitcher';
import { Copy, czInvestmentTokens } from '../src/experiences/pi/cz/evo-2027/investments/Primitives';
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures';

function press(tree: Renderer.ReactTestRenderer, label: string) {
  const control = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0]!;
  expect(control).toBeDefined();
  expect(control.props.disabled).not.toBe(true);
  act(() => control.props.onPress());
}
function input(tree: Renderer.ReactTestRenderer, label: string, value: string) {
  act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === label)!
      .props.onChangeText(value),
  );
}
describe('CZ Evo native investments', () => {
  it('labels the Goals switcher as CZ Robo', () => {
    const displayLabel = { displayLabel: 'CZ Robo' };
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <FuturePortfolioSwitcher
          {...displayLabel}
          tokens={czInvestmentTokens}
          language="en"
          value="goals"
          goals={INITIAL_CZ_ROBO_GOALS}
          onChange={jest.fn()}
        />,
      );
    });
    const trigger = tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'button' &&
        typeof node.props.onPress === 'function',
    )[0]!;
    expect(trigger.props.accessibilityLabel).toBe('Switch portfolio: CZ Robo');
    expect(JSON.stringify(tree.toJSON())).toContain('CZ Robo');
    act(() => tree.unmount());
  });

  it('renders the instrument Sell action with a dark outline and label', () => {
    const model = createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS);
    const security = model.catalog.find(
      item => item.title === 'CEE Government Bond Fund',
    )!;
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <CzInvestmentsScreen snapshot={model} onBack={jest.fn()} />,
      );
    });

    press(tree, 'Invest');
    press(tree, `${security.title}, ${security.productId}`);
    const sell = tree.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Sell' &&
        typeof node.props.onPress === 'function',
    )[0]!;
    const sellStyle = sell.props.style as (
      state: { pressed: boolean },
    ) => StyleProp<ViewStyle>;
    expect(StyleSheet.flatten(sellStyle({ pressed: false }))).toMatchObject({
      borderWidth: 1,
      borderColor: '#262626',
    });
    const label = sell.findAll(
      node => node.props.children === 'Sell' && node.props.style,
    )[0]!;
    expect(StyleSheet.flatten(label.props.style)?.color).toBe('#262626');
    act(() => tree.unmount());
  });

  it('uses a compact centered portfolio title and the Evo navigation treatment', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <CzInvestmentsScreen
          snapshot={createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS)}
          onBack={jest.fn()}
        />,
      );
    });
    const header = tree.root.findByType(Header);
    expect(header.props.title).toBe('Portfolio details');
    expect(header.props.collapsedTitleProgress).toBe(1);
    expect(header.props.renderLargeTitle).toBe(false);
    expect(
      tree.root
        .findAllByType(Copy)
        .filter(node => node.props.children === 'Portfolio details'),
    ).toHaveLength(0);
    act(() => tree.unmount());

    act(() => {
      tree = Renderer.create(
        <ModuleNavigation
          value="portfolio"
          variant="evo-2027"
          onChange={jest.fn()}
        />,
      );
    });
    const [reserve, bar] = tree.root.findAllByType(View);
    expect(StyleSheet.flatten(reserve.props.style)).toMatchObject({
      paddingTop: 0,
      backgroundColor: 'transparent',
    });
    expect(StyleSheet.flatten(bar.props.style)).toMatchObject({
      borderColor: 'rgba(255,255,255,0.70)',
      backgroundColor: 'rgba(246,247,247,0.62)',
    });
    expect(
      tree.root
        .findAll(
          node =>
            node.props.accessibilityRole === 'tab' &&
            typeof node.props.onPress === 'function',
        )
        .map(node => node.props.accessibilityLabel),
    ).toEqual(['Portfolio', 'Explore', 'Invest', 'Activity', 'More']);
    act(() => tree.unmount());
  });
  it('opens a canonical instrument, validates units and completes the native demo buy journey', async () => {
    const model = createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS);
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <CzInvestmentsScreen snapshot={model} onBack={jest.fn()} />,
      );
    });
    press(tree, 'Invest');
    const security = model.catalog.find(item => item.status === 'active')!;
    press(tree, `${security.title}, ${security.productId}`);
    press(tree, 'Buy');
    input(tree, 'Quantity', '1.5');
    expect(
      tree.root.findAll(
        node =>
          node.props.accessibilityLabel === 'Next' &&
          typeof node.props.onPress === 'function',
      )[0]!.props.disabled,
    ).toBe(true);
    input(tree, 'Quantity', '1');
    press(tree, 'Next');
    expect(
      tree.root.findAll(
        node =>
          node.props.accessibilityLabel === 'Buy' &&
          typeof node.props.onPress === 'function',
      )[0]!.props.disabled,
    ).toBe(true);
    press(tree, 'Accept terms and conditions');
    press(tree, 'Buy');
    await authorizeDemo(tree, 'Sign order');
    expect(
      tree.root.findAll(node => node.props.testID === 'cz-buy-success').length,
    ).toBeGreaterThan(0);
    press(tree, 'Back to investments');
    expect(
      tree.root.findAll(node => node.props.testID === 'cz-investment-portfolio')
        .length,
    ).toBeGreaterThan(0);
    act(() => tree.unmount());
  });
  it('provides real catalog navigation from an empty portfolio', () => {
    const model = createCzInvestmentSnapshot({
      ...DEFAULT_CZECH_COUNTS,
      investments: 0,
    });
    expect(model.securities).toEqual([]);
    expect(model.performance.totalValue).toBe(0);
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <CzInvestmentsScreen snapshot={model} onBack={jest.fn()} />,
      );
    });
    press(tree, 'Invest');
    expect(
      tree.root.findAll(node => node.props.testID === 'cz-investment-catalog')
        .length,
    ).toBeGreaterThan(0);
    act(() => tree.unmount());
  });
  it('registers working native routes and search destinations using Source IDs', () => {
    expect(Object.keys(CZECH_INVESTMENTS_ADAPTER.screens)).toEqual([
      'investments',
      'investment-history',
      'investment-detail',
      'robo',
    ]);
    const entries = CZECH_INVESTMENTS_ADAPTER.searchEntries!({
      scenario: 'active',
      productCounts: DEFAULT_CZECH_COUNTS,
    });
    expect(entries.length).toBeGreaterThan(3);
    for (const entry of entries)
      expect(
        CZECH_INVESTMENTS_ADAPTER.screens[entry.target.screen],
      ).toBeDefined();
    const catalogIds = createCzInvestmentSnapshot(
      DEFAULT_CZECH_COUNTS,
    ).catalog.map(item => item.id);
    for (const entry of entries.filter(
      item => item.target.screen === 'investment-detail',
    ))
      expect(catalogIds).toContain(entry.target.params!.securityId);
  });
});
