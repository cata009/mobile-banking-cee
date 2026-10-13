import { authorizeDemo } from '../test-support/cz-evo-investmentsHelpers';
import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { CzInvestmentsScreen } from '../src/experiences/pi/cz/evo-2027/investments';
import { CZECH_INVESTMENTS_ADAPTER } from '../src/experiences/pi/cz/evo-2027/investments/adapter';
import { createCzInvestmentSnapshot } from '../src/experiences/pi/cz/evo-2027/investments/model';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';

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
