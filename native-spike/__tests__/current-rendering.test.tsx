import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { BackHandler } from 'react-native';
import { Money, Page } from '../src/experiences/pi/current/Primitives';
import { currentTokens } from '../src/experiences/pi/current/context';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
const host: CurrentScreenProps = {
  country: 'RO',
  release: 'release-current',
  scenario: 'active',
  language: 'en',
  productCounts: DEFAULT_CZECH_COUNTS,
  route: { screen: 'pfm' },
  tokens: currentTokens(),
  t: key => key,
  amountsHidden: false,
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
test('PFM money retains expense sign in visible and hidden balances', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<Money host={host} amount={-120} currency="RON" />);
  });
  expect(
    tree.root
      .findAll(node => typeof node.props.accessibilityLabel === 'string')
      .map(node => node.props.accessibilityLabel)
      .some(label => label.startsWith('-120')),
  ).toBe(true);
  await act(() =>
    tree.update(
      <Money
        host={{ ...host, amountsHidden: true }}
        amount={-120}
        currency="RON"
      />,
    ),
  );
  expect(
    tree.root
      .findAll(node => typeof node.props.accessibilityLabel === 'string')
      .map(node => node.props.accessibilityLabel)
      .some(label => label.startsWith('-') && !label.includes('120')),
  ).toBe(true);
  await act(() => tree.unmount());
});
test('common Page routes hardware Back to current local subview and releases its handler when inactive', async () => {
  const listeners: Array<() => boolean> = [];
  const remove = jest.fn();
  const spy = jest
    .spyOn(BackHandler, 'addEventListener')
    .mockImplementation((_type, handler) => {
      listeners.push(handler as () => boolean);
      return { remove };
    });
  const localBack = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <Page host={{ ...host, onBack: localBack }} title="Category">
        Category details
      </Page>,
    );
  });
  expect(listeners).toHaveLength(1);
  await act(() => {
    expect(listeners[0]()).toBe(true);
  });
  expect(localBack).toHaveBeenCalledTimes(1);
  await act(() =>
    tree.update(
      <Page
        host={{ ...host, isActive: false, onBack: localBack }}
        title="Category"
      >
        Category details
      </Page>,
    ),
  );
  expect(remove).toHaveBeenCalled();
  await act(() => tree.unmount());
  spy.mockRestore();
});
