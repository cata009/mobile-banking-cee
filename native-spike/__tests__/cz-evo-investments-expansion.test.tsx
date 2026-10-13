import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { OrderDocuments } from '../src/experiences/pi/cz/evo-2027/investments/OrderDocuments';
import { createCzInvestmentSnapshot } from '../src/experiences/pi/cz/evo-2027/investments/model';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';

const security = createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS).catalog[0]!;
function press(tree: Renderer.ReactTestRenderer, label: string) {
  const node = tree.root.findAll(
    item =>
      item.props.accessibilityLabel === label &&
      typeof item.props.onPress === 'function',
  )[0];
  expect(node).toBeDefined();
  act(() => node!.props.onPress());
}
function copy(tree: Renderer.ReactTestRenderer) {
  return JSON.stringify(tree.toJSON());
}
describe('CZ Source investment document disclosure parity', () => {
  it('exposes the Source cost scenario controls and preserves selected view and horizon', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(<OrderDocuments security={security} />);
    });
    press(tree, 'Ex-Ante cost information');
    expect(copy(tree)).toContain('TRANSACTION FEE');
    expect(copy(tree)).toContain('NET INVESTMENT AMOUNT');
    expect(copy(tree)).toContain('Stress scenario');
    press(tree, 'percent');
    expect(copy(tree)).toContain('113%');
    press(tree, '3Y');
    expect(
      tree.root.findAll(
        node =>
          node.props.accessibilityLabel === '3Y' &&
          node.props.accessibilityState?.selected === true,
      ).length,
    ).toBeGreaterThan(0);
    press(tree, 'Ex-Ante cost information');
    press(tree, 'Ex-Ante cost information');
    expect(copy(tree)).toContain('113%');
    act(() => tree.unmount());
  });
  it('shows all Source document entries and evaluation statements without inventing a PDF action', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(<OrderDocuments security={security} />);
    });
    press(tree, 'Product documents');
    expect(copy(tree)).toContain('Investment Advisory Report');
    expect(copy(tree)).toContain(
      'Official fund objectives, terms and conditions',
    );
    press(tree, 'Important information');
    expect(copy(tree)).not.toContain('Investment Advisory Report');
    expect(copy(tree)).toContain('Limit utilisation');
    expect(copy(tree)).toContain('58,87%');
    expect(copy(tree)).toContain(
      'subject matter of the order is suitable for him',
    );
    expect(copy(tree)).not.toContain('View Important information');
    act(() => tree.unmount());
  });
});
