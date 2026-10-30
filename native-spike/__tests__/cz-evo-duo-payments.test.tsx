import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import PaymentsScreen from '../src/experiences/pi/cz/evo-2027/payments/PaymentsScreen';
import PaymentFlow from '../src/experiences/pi/cz/evo-2027/payments/PaymentFlow';
import { SearchField } from '../src/universal/SearchField';
import { Page } from '../src/experiences/pi/cz/evo-2027/accounts/Primitives';

let mockDuo:
  | {
      width: number;
      height: number;
      rightInset: number;
      referenceWidth: number;
    }
  | undefined;
let mockLocal:
  | { width: number; height: number; left: number; top: number }
  | undefined;
jest.mock('../src/universal/DuoPreview', () => ({
  ...jest.requireActual('../src/universal/DuoPreview'),
  DuoOnlyView: (
    props: React.ComponentProps<typeof import('react-native').View>,
  ) => require('react').createElement(require('react-native').View, props),
  useDuoPreview: () => mockDuo,
  useDuoLocalViewport: () => mockLocal,
}));

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
  screenTopInset: 12,
};

afterEach(() => {
  mockDuo = undefined;
  mockLocal = undefined;
});

test('Duo wide Payments places choices beside recipients and keeps the search when resizing', async () => {
  mockDuo = { width: 951, height: 669, rightInset: 84, referenceWidth: 375 };
  mockLocal = { width: 867, height: 669, left: 0, top: 0 };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<PaymentsScreen {...props} />);
  });
  const content = () =>
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'evo-payments-columns' }).props.style,
    );
  expect(content().flexDirection).toBe('row');
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'evo-payments-actions' }).props.style,
    ).width,
  ).toBe(401.5);
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'evo-payments-recipients' }).props.style,
    ).width,
  ).toBe(401.5);
  await act(() => tree.root.findByType(SearchField).props.onChange('Alice'));
  mockDuo = { width: 466, height: 678, rightInset: 84, referenceWidth: 375 };
  mockLocal = { width: 382, height: 678, left: 0, top: 0 };
  await act(() => tree.update(<PaymentsScreen {...props} />));
  expect(content()?.flexDirection).toBeUndefined();
  expect(tree.root.findByType(SearchField).props.value).toBe('Alice');
  await act(() => tree.unmount());
});

test('ordinary phone Payments remains linear and wide Duo bounds the payment form', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<PaymentsScreen {...props} />);
  });
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'evo-payments-hub-scroll' }).props
        .contentContainerStyle,
    ).flexDirection,
  ).toBeUndefined();
  await act(() => tree.unmount());
  mockDuo = { width: 669, height: 951, rightInset: 0, referenceWidth: 375 };
  mockLocal = { width: 669, height: 951, left: 0, top: 0 };
  await act(() => {
    tree = Renderer.create(
      <PaymentFlow {...props} route={{ screen: 'payment-create' }} />,
    );
  });
  expect(
    StyleSheet.flatten(tree.root.findByType(Page).props.style),
  ).toMatchObject({ width: '100%', maxWidth: 640, alignSelf: 'center' });
  await act(() => tree.unmount());
});
