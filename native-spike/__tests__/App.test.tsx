/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<App />);
  });
  await ReactTestRenderer.act(() => tree.unmount());
});

test('cold native entry opens the global selector without a portal password', async () => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<App />);
    await Promise.resolve();
    await Promise.resolve();
  });
  expect(
    tree.root.findAll(node => node.props?.testID === 'demo-choice-italy')
      .length,
  ).toBeGreaterThan(0);
  expect(
    tree.root.findAll(
      node =>
        typeof node.props?.accessibilityLabel === 'string' &&
        /password|parola/i.test(node.props.accessibilityLabel),
    ),
  ).toHaveLength(0);
  await ReactTestRenderer.act(() => tree.unmount());
});

test('the global selector still opens the frozen Italy composition on its real axes', async () => {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<App showSelectorControl />);
    await Promise.resolve();
    await Promise.resolve();
  });
  const press = async (label: string) => {
    await ReactTestRenderer.act(async () => {
      tree.root
        .findAll(
          node =>
            node.props.accessibilityLabel === label &&
            typeof node.props.onPress === 'function',
        )[0]
        .props.onPress();
      await Promise.resolve();
    });
  };
  await press('Italia, Mobile First');
  await press('Deschide demo');
  expect(
    tree.root.findAll(node => node.props.accessibilityLabel === 'Cerca').length,
  ).toBeGreaterThan(0);
  await press('Demo selector');
  expect(
    tree.root.findAll(node => node.props.testID === 'demo-choice-italy')
      .length,
  ).toBeGreaterThan(0);
  await ReactTestRenderer.act(() => tree.unmount());
});
