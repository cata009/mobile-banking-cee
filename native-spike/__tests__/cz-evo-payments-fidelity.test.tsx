import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import PaymentFlow from '../src/experiences/pi/cz/evo-2027/payments/PaymentFlow';
import PaymentsScreen from '../src/experiences/pi/cz/evo-2027/payments/PaymentsScreen';
import { getFrequentBeneficiaries } from '@/data/paymentsHub';
import { Select } from '../src/universal/Select';

const propsFor = (
  screen: CzechNativeScreenProps['route']['screen'],
  params?: Record<string, string>,
): CzechNativeScreenProps => ({
  route: { screen, params },
  scenario: 'active',
  productCounts: DEFAULT_CZECH_COUNTS,
  amountsHidden: false,
  onBack: jest.fn(),
  onNavigate: jest.fn(),
  onSearch: jest.fn(),
  onProfile: jest.fn(),
  onAmountsToggle: jest.fn(),
  onChanged: jest.fn(),
});
const press = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root
    .findAll(
      n =>
        n.props.accessibilityLabel === label &&
        typeof n.props.onPress === 'function',
    )[0]!
    .props.onPress();
const amount = (tree: Renderer.ReactTestRenderer) =>
  tree.root
    .findAllByType(TextInput)
    .find(n => n.props.accessibilityLabel === 'Amount')!;

test('Source calculator operators evaluate decimal precedence and preserve amount on review Back', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <PaymentFlow
        {...propsFor('payment-create', {
          beneficiaryId: getFrequentBeneficiaries('CZ')[0]!.id,
        })}
      />,
    );
  });
  await act(() => amount(tree).props.onChangeText('10,5'));
  await act(() => press(tree, '×'));
  await act(() => press(tree, '2'));
  await act(() => press(tree, '+'));
  await act(() => press(tree, '3'));
  await act(() => press(tree, '='));
  expect(amount(tree).props.value).toBe('24');
  await act(() => press(tree, 'Review transfer'));
  await act(() => press(tree, 'Back'));
  expect(amount(tree).props.value).toBe('24');
  expect(amount(tree).props.keyboardType).toBe('decimal-pad');
  await act(() => tree.unmount());
});

test('Source keypad handles initial decimal, caps decimals and disables equals for incomplete expressions', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <PaymentFlow
        {...propsFor('payment-create', {
          beneficiaryId: getFrequentBeneficiaries('CZ')[0]!.id,
        })}
      />,
    );
  });
  for (const key of ['Decimal separator', '1', '2', '3'])
    await act(() => press(tree, key));
  expect(amount(tree).props.value).toBe('0,12');
  await act(() => press(tree, '+'));
  const equals = tree.root.findAll(
    n =>
      n.props.accessibilityLabel === '=' &&
      typeof n.props.onPress === 'function',
  )[0]!;
  expect(equals.props.disabled).toBe(true);
  await act(() => press(tree, 'Delete digit'));
  expect(amount(tree).props.value).toBe('0,12');
  await act(() => tree.unmount());
});

test('changing recipient country clears stale Source amount and bank metadata', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <PaymentFlow
        {...propsFor('payment-create', {
          beneficiaryId: getFrequentBeneficiaries('CZ')[0]!.id,
        })}
      />,
    );
  });
  await act(() => amount(tree).props.onChangeText('120,5'));
  await act(() => press(tree, 'Edit beneficiary'));
  const country = tree.root
    .findAllByType(Select)
    .find(n => n.props.label === 'Recipient country')!;
  await act(() => country.props.onChange('US'));
  expect(
    tree.root
      .findAllByType(TextInput)
      .find(n => n.props.accessibilityLabel === 'Bank name')!.props.value,
  ).toBe('');
  await act(() => country.props.onChange('CZ'));
  const first = tree.root
    .findAllByType(TextInput)
    .find(n => n.props.accessibilityLabel === 'Account number')!;
  await act(() => first.props.onChangeText('123456'));
  await act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(n => n.props.accessibilityLabel === 'Bank code')!
      .props.onChangeText('2700'),
  );
  await act(() => press(tree, 'Continue'));
  expect(amount(tree).props.value).toBe('');
  await act(() => tree.unmount());
});

test('hub uses Source recipient row hierarchy and QR action without inventing payment execution', async () => {
  const props = propsFor('payments');
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<PaymentsScreen {...props} />);
  });
  const json = JSON.stringify(tree.toJSON());
  expect(json).toContain('You sent');
  expect(json).toContain('Recipients');
  expect(json).not.toContain('RECENT PAYMENTS');
  await act(() => press(tree, 'Scan a QR code'));
  expect(JSON.stringify(tree.toJSON())).toContain('simulation');
  expect(props.onNavigate).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});

test('currency selection follows Source matching payer and clears stale recipient account and amount', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <PaymentFlow
        {...propsFor('payment-create', {
          beneficiaryId: getFrequentBeneficiaries('CZ')[0]!.id,
        })}
      />,
    );
  });
  await act(() => amount(tree).props.onChangeText('250'));
  await act(() => press(tree, 'Edit beneficiary'));
  await act(() =>
    tree.root
      .findAllByType(Select)
      .find(n => n.props.label === 'Payment currency')!
      .props.onChange('EUR'),
  );
  expect(
    tree.root
      .findAllByType(TextInput)
      .find(n => n.props.accessibilityLabel === 'IBAN')!.props.value,
  ).toBe('');
  await act(() =>
    tree.root
      .findAllByType(Select)
      .find(n => n.props.label === 'Payment currency')!
      .props.onChange('CZK'),
  );
  await act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(n => n.props.accessibilityLabel === 'Account number')!
      .props.onChangeText('123456'),
  );
  await act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(n => n.props.accessibilityLabel === 'Bank code')!
      .props.onChangeText('2700'),
  );
  await act(() => press(tree, 'Continue'));
  expect(amount(tree).props.value).toBe('');
  const payer = tree.root
    .findAllByType(Select)
    .find(n => n.props.label === 'From account')!;
  expect(
    payer.props.items.find(
      (item: { value: string; label: string }) =>
        item.value === payer.props.value,
    ).label,
  ).toContain('CZK');
  await act(() => tree.unmount());
});
