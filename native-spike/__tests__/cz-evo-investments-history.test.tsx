import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { InvestmentHistory } from '../src/experiences/pi/cz/evo-2027/investments/History';
import type { InvestmentHistoryTransaction } from '@/app/config/investmentsPortfolioConfig';
const rows: InvestmentHistoryTransaction[] = [
  {
    id: 'recent-source',
    date: '2020-12-30T12:00:00Z',
    title: 'Recent bond',
    amount: 100,
    currency: 'CZK',
    type: 'BUY',
    tone: 'positive',
  },
  {
    id: 'old-source',
    date: '2019-01-01T12:00:00Z',
    title: 'Older bond',
    amount: 90,
    currency: 'CZK',
    type: 'SELL',
    tone: 'negative',
  },
];
function press(tree: Renderer.ReactTestRenderer, label: string) {
  const item = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0]!;
  expect(item).toBeDefined();
  act(() => {
    item.props.onPress();
  });
}
describe('native canonical investment history', () => {
  it('anchors date presets to the latest Source row and applies search/filters/details', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <InvestmentHistory
          onBack={jest.fn()}
          transactions={rows}
          orders={[]}
          allDatesByDefault={false}
        />,
      );
    });
    expect(
      tree.root.findAll(
        node => node.props.testID === 'cz-history-row-recent-source',
      ).length,
    ).toBeGreaterThan(0);
    expect(
      tree.root.findAll(
        node => node.props.testID === 'cz-history-row-old-source',
      ),
    ).toHaveLength(0);
    press(tree, 'Filters');
    press(tree, 'Period');
    press(tree, 'All time');
    press(tree, 'Apply filters');
    expect(
      tree.root.findAll(
        node => node.props.testID === 'cz-history-row-old-source',
      ).length,
    ).toBeGreaterThan(0);
    act(() =>
      tree.root
        .findAllByType(TextInput)
        .find(node => node.props.accessibilityLabel === 'Search history')!
        .props.onChangeText('Older'),
    );
    expect(
      tree.root.findAll(
        node => node.props.testID === 'cz-history-row-recent-source',
      ),
    ).toHaveLength(0);
    press(tree, 'Open Older bond history details');
    expect(
      tree.root.findAll(node => node.props.testID === 'cz-history-detail')
        .length,
    ).toBeGreaterThan(0);
    act(() => tree.unmount());
  });
});
