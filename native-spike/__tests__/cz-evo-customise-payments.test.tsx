import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import PaymentsScreen from '../src/experiences/pi/cz/evo-2027/payments/PaymentsScreen';
import { SourceBottomSheet } from '../src/universal/SourceBottomSheet';
import { ToggleButton } from '../src/universal/ToggleButton';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
const props: CzechNativeScreenProps = {
  route: { screen: 'payments' },
  scenario: 'active',
  productCounts: DEFAULT_CZECH_COUNTS,
  amountsHidden: false,
  onBack: jest.fn(),
  onNavigate: jest.fn(),
  onSearch: jest.fn(),
  onProfile: jest.fn(),
  onAmountsToggle: jest.fn(),
  onChanged: jest.fn(),
};
const button = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    n =>
      n.props.accessibilityLabel === label &&
      typeof n.props.onPress === 'function',
  )[0]!;
test('customisation uses the approved bottom sheet, toggles and save control', async () => {
  jest.useFakeTimers();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<PaymentsScreen {...props} />);
  });
  await act(() => button(tree, 'Customise payments').props.onPress());
  expect(tree.root.findByType(SourceBottomSheet).props.title).toBe(
    'Customise payments',
  );
  expect(tree.root.findByType(SourceBottomSheet).props.footer).toBeDefined();
  expect(tree.root.findAllByType(ToggleButton)).toHaveLength(9);
  expect(
    tree.root
      .findAllByType(PrimaryButton)
      .some(n => n.props.label === 'Save layout'),
  ).toBe(true);
  expect(JSON.stringify(tree.toJSON())).toContain('payments for the grid');
  await act(() => {
    jest.advanceTimersByTime(300);
  });
  await act(() => tree.unmount());
  jest.useRealTimers();
});
