import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Bars } from '../src/experiences/pi/cz/evo-2027/pfm/Charts';
import PfmScreen from '../src/experiences/pi/cz/evo-2027/pfm/PfmScreen';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
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
const button = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0]!;
test('bar chart shows a monetary scale, honors hidden balances and lets a bucket be selected', async () => {
  const toggle = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  const bars = [
    { key: 'one', label: '1', caption: 'Week 1', total: 1000 },
    { key: 'two', label: '2', caption: 'Week 2', total: 250 },
  ];
  await act(() => {
    tree = Renderer.create(
      <Bars
        bars={bars}
        selected={null}
        onToggle={toggle}
        currency="CZK"
        hidden={false}
      />,
    );
  });
  expect(JSON.stringify(tree.toJSON())).toContain('CZK');
  expect(
    tree.root.findAll(
      node =>
        node.props.testID === 'cz-pfm-axis-tick' &&
        typeof node.type === 'string',
    ),
  ).toHaveLength(5);
  await act(() => button(tree, 'Select Week 1 1').props.onPress());
  expect(toggle).toHaveBeenCalledWith('one');
  await act(() =>
    tree.update(
      <Bars
        bars={bars}
        selected="one"
        onToggle={toggle}
        currency="CZK"
        hidden
      />,
    ),
  );
  expect(JSON.stringify(tree.toJSON())).not.toContain('2K CZK');
  await act(() => tree.unmount());
});
test('analysis uses the original icon toggle and preserves both chart interactions', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<PfmScreen {...props} />);
  });
  await act(() => button(tree, 'Analyse money out').props.onPress());
  const names = tree.root
    .findAllByType(SourceCustomIcon)
    .map(n => n.props.name);
  expect(names).toEqual(
    expect.arrayContaining(['analytics-donut-toggle', 'analytics-bars-toggle']),
  );
  await act(() => button(tree, 'Bars').props.onPress());
  expect(
    tree.root.findAll(
      node =>
        node.props.testID === 'cz-pfm-axis-tick' &&
        typeof node.type === 'string',
    ),
  ).toHaveLength(5);
  await act(() => button(tree, 'Donut').props.onPress());
  expect(
    tree.root.findAllByProps({ testID: 'cz-pfm-donut-marker' }).length,
  ).toBeGreaterThan(0);
  await act(() => tree.unmount());
});
