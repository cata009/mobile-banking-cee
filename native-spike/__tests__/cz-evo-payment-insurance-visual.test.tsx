import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, TextInput } from 'react-native';
import Home from '../src/experiences/pi/cz/evo-2027/home/Home';
import PaymentFlow from '../src/experiences/pi/cz/evo-2027/payments/PaymentFlow';
import { Page } from '../src/experiences/pi/cz/evo-2027/accounts/Primitives';
import { Select } from '../src/universal/Select';
import { SourceBottomSheet } from '../src/universal/SourceBottomSheet';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import { createEmptyDomesticPaymentDraft } from '@/data/paymentFlow';
const props: CzechNativeScreenProps = {
  route: { screen: 'home', params: { tab: 'insurance' } },
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
const press = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0]!;
test('insurance policy cards have the white surface of the product cards', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<Home {...props} />);
  });
  expect(
    StyleSheet.flatten(press(tree, 'Open Genius Protect').props.style)
      .backgroundColor,
  ).toBe('#ffffff');
  await act(() => tree.unmount());
});
test('payment form restores white page, labelled pickers, recipient tabs and local account fields', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <PaymentFlow
        {...props}
        route={{ screen: 'payment-create' }}
        paymentFlow={{
          step: 'create',
          draft: createEmptyDomesticPaymentDraft('CZ'),
        }}
      />,
    );
  });
  expect(
    StyleSheet.flatten(tree.root.findByType(Page).props.style).backgroundColor,
  ).toBe('#ffffff');
  expect(tree.root.findByType(Page).props.headerBackground).toBe('#ffffff');
  expect(tree.root.findByType(Page).props.footer).toBeDefined();
  const inputs = () =>
    tree.root
      .findAllByType(TextInput)
      .map(node => node.props.accessibilityLabel);
  expect(inputs()).toContain('Account number');
  expect(inputs()).not.toContain('IBAN');
  const country = tree.root
    .findAllByType(Select)
    .find(node => node.props.label === 'Recipient country');
  expect(country?.props.renderTrigger).toEqual(expect.any(Function));
  await act(() => press(tree, 'Recipient country').props.onPress());
  expect(tree.root.findAllByType(SourceBottomSheet).length).toBe(1);
  await act(() => press(tree, 'Close').props.onPress());
  expect(press(tree, 'Individual').props.accessibilityState.selected).toBe(
    true,
  );
  await act(() => press(tree, 'Business').props.onPress());
  expect(inputs()).toContain('Business name');
  await act(() => tree.unmount());
});

test('choosing the already selected default country keeps entered account details', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <PaymentFlow
        {...props}
        route={{ screen: 'payment-create' }}
        paymentFlow={{
          step: 'create',
          draft: createEmptyDomesticPaymentDraft('CZ'),
        }}
      />,
    );
  });
  const account = () =>
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Account number')!;
  await act(() => account().props.onChangeText('123456789'));
  const country = tree.root
    .findAllByType(Select)
    .find(node => node.props.label === 'Recipient country')!;
  await act(() => country.props.onChange('CZ'));
  expect(account().props.value).toBe('123456789');
  await act(() => tree.unmount());
});

test('the country picker searches its options and applies the chosen country', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <PaymentFlow
        {...props}
        route={{ screen: 'payment-create' }}
        paymentFlow={{
          step: 'create',
          draft: createEmptyDomesticPaymentDraft('CZ'),
        }}
      />,
    );
  });
  await act(() => press(tree, 'Recipient country').props.onPress());
  const search = tree.root
    .findAllByType(TextInput)
    .find(node => node.props.accessibilityLabel === 'Search countries')!;
  await act(() => search.props.onChangeText('germ'));
  expect(press(tree, 'Germany')).toBeDefined();
  expect(
    tree.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Austria' &&
        typeof node.props.onPress === 'function',
    ),
  ).toHaveLength(0);
  await act(() => press(tree, 'Germany').props.onPress());
  expect(press(tree, 'Recipient country').props.accessibilityValue.text).toBe(
    'Germany',
  );
  await act(() => tree.unmount());
});

test('switching back to individual restores the entered personal recipient name', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <PaymentFlow
        {...props}
        route={{ screen: 'payment-create' }}
        paymentFlow={{
          step: 'create',
          draft: createEmptyDomesticPaymentDraft('CZ'),
        }}
      />,
    );
  });
  const input = (label: string) =>
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === label)!;
  await act(() => input('First name(s)').props.onChangeText('Jane'));
  await act(() => input('Last name(s)').props.onChangeText('Doe'));
  await act(() => press(tree, 'Business').props.onPress());
  await act(() => input('Business name').props.onChangeText('Company'));
  await act(() => press(tree, 'Individual').props.onPress());
  await act(() => press(tree, 'Business').props.onPress());
  expect(input('Business name').props.value).toBe('Jane Doe');
  await act(() => tree.unmount());
});
