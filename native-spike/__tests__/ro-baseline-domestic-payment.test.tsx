import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import RoBaselinePaymentCreateScreen from '../src/experiences/pi/current/baseline/payments/domestic/RoBaselinePaymentCreateScreen';
import {
  bankingProducts,
  productTransactions,
} from '../src/experiences/pi/current/banking/model';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import { ToggleButton } from '../src/universal/ToggleButton';
import { FaceIdOverlay } from '../src/experiences/pi/current/baseline/FaceIdOverlay';
import {
  createEmptyDomesticPaymentDraft,
  createRedoDomesticPaymentDraft,
  createTemplateDomesticPaymentDraft,
  formatDraftAmount,
} from '@/data/paymentFlow';
import { getPaymentTemplates } from '@/data/paymentTemplates';

function host(extra: Partial<CurrentScreenProps> = {}): CurrentScreenProps {
  return {
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: {
      accounts: 2,
      debitCards: 2,
      creditCards: 1,
      mealCards: 0,
      deposits: 1,
      savingsAccounts: 1,
      loans: 1,
      mortgages: 1,
      investments: 1,
    },
    route: { screen: 'payment-create' },
    tokens: currentTokens(),
    t: createCurrentTranslator('RO', 'en'),
    amountsHidden: false,
    screenTopInset: 54,
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
    ...extra,
  };
}
async function render(props = host()) {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<RoBaselinePaymentCreateScreen {...props} />);
  });
  return { tree, props };
}
const fields = (tree: Renderer.ReactTestRenderer) =>
  tree.root.findAllByType(BaselineTextField);
const action = (tree: Renderer.ReactTestRenderer) =>
  tree.root.findByType(PrimaryButton);
async function change(
  tree: Renderer.ReactTestRenderer,
  label: string,
  value: string,
) {
  await act(() =>
    fields(tree)
      .find(f => f.props.label === label)!
      .props.onChange(value),
  );
}
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('empty RO draft preserves Source figures, editable payer and mandatory legacy prefix', async () => {
  const { tree, props } = await render();
  const draft = createEmptyDomesticPaymentDraft(
    'RO',
    bankingProducts(props).products[0],
  );
  expect(fields(tree)[0]?.props.value).toBe(draft.payerAccountNumber);
  expect(fields(tree)[0]!.props.helperText2).toBe('300.020,00 RON');
  expect(action(tree).props.disabled).toBe(true);
  for (const [label, value] of [
    ['Beneficiary', 'Alice'],
    ['Account number (mandatory)', 'abc'],
    ['Bank code (mandatory)', 'bank'],
    ['Amount limit', 'word'],
  ])
    await change(tree, label!, value!);
  expect(action(tree).props.disabled).toBe(true);
  await change(tree, 'Prefix', 'arbitrary');
  expect(action(tree).props.disabled).toBe(false);
  expect(fields(tree).some(f => f.props.label === 'Due date')).toBe(false);
  expect(fields(tree).some(f => f.props.trailingIconAction)).toBe(false);
  await change(tree, 'Account number', 'custom payer');
  await act(() => action(tree).props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('custom payer');
  expect(JSON.stringify(tree.toJSON())).toContain('word RON');
  await act(() => tree.unmount());
});

test('redo uses selected Source transaction and retains edits across review back', async () => {
  const props = host(),
    product = bankingProducts(props).currentAccounts[1]!,
    transaction = productTransactions(props, product).find(t => t.amount < 0)!;
  props.route = {
    screen: 'payment-create',
    params: { productId: product.id, transactionId: transaction.id },
  };
  const expected = createRedoDomesticPaymentDraft(transaction, 'RO', product);
  const { tree } = await render(props);
  expect(
    fields(tree).find(f => f.props.label === 'Beneficiary')?.props.value,
  ).toBe(expected.beneficiaryName);
  expect(
    fields(tree).find(f => f.props.label === 'Amount limit')!.props.value,
  ).toBe(expected.amount);
  expect(action(tree).props.disabled).toBe(true);
  await change(tree, 'Prefix', '19');
  await change(tree, 'Amount limit', '1 234,56');
  await act(() => action(tree).props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain(
    formatDraftAmount({ ...expected, amount: '1234,56' }),
  );
  const back = tree.root.findAll(
    n =>
      n.props.accessibilityLabel === 'Back' &&
      typeof n.props.onPress === 'function',
  )[0]!;
  await act(() => back.props.onPress());
  expect(
    fields(tree).find(f => f.props.label === 'Amount limit')!.props.value,
  ).toBe('1234,56');
  await act(() => tree.unmount());
});

test('template selection retains canonical amount and note; signing waits for Source FaceID timing', async () => {
  const props = host(),
    selection = getPaymentTemplates('RO')[0]!,
    product = bankingProducts(props).products[0]!;
  props.route = {
    screen: 'payment-create',
    params: { selectionId: selection.id },
  };
  const expected = createTemplateDomesticPaymentDraft(selection, 'RO', product),
    { tree } = await render(props);
  expect(
    fields(tree).find(f => f.props.label === 'Beneficiary')?.props.value,
  ).toBe(expected.beneficiaryName);
  expect(
    fields(tree).find(f => f.props.label === 'Information for beneficiary')!
      .props.value,
  ).toBe(expected.informationForBeneficiary);
  await change(tree, 'Prefix', '19');
  await act(() => action(tree).props.onPress());
  const save = tree.root.findByType(ToggleButton);
  await act(() => save.props.onToggle(true));
  expect(props.onChanged).not.toHaveBeenCalled();
  await act(() => action(tree).props.onPress());
  expect(fields(tree)[0]!.props.value).toBe('******');
  await act(() => action(tree).props.onPress());
  expect(tree.root.findAllByType(FaceIdOverlay)).toHaveLength(1);
  await act(() => jest.advanceTimersByTime(839));
  expect(action(tree).props.disabled).toBe(true);
  await act(() => jest.advanceTimersByTime(1));
  expect(JSON.stringify(tree.toJSON())).toContain('Successful payment');
  await act(() => action(tree).props.onPress());
  expect(props.onNavigate).toHaveBeenLastCalledWith({ screen: 'payments' });
  expect(props.onChanged).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});

test('host Back consumes review, sign and success steps; remounted review resets its local template toggle', async () => {
  const register = jest.fn();
  const props = host({ onBackHandlerChange: register });
  props.route = {
    screen: 'payment-create',
    params: { selectionId: getPaymentTemplates('RO')[0]!.id },
  };
  const { tree } = await render(props);
  const localBack = () => register.mock.calls.at(-1)![0] as () => boolean;
  expect(register).toHaveBeenCalledWith(expect.any(Function));
  expect(localBack()()).toBe(false);
  await change(tree, 'Prefix', '19');
  await act(() => action(tree).props.onPress());
  await act(() => tree.root.findByType(ToggleButton).props.onToggle(true));
  expect(tree.root.findByType(ToggleButton).props.checked).toBe(true);
  await act(() => action(tree).props.onPress());
  await act(() => expect(localBack()()).toBe(true));
  expect(tree.root.findByType(ToggleButton).props.checked).toBe(false);
  await act(() => expect(localBack()()).toBe(true));
  expect(fields(tree).find(f => f.props.label === 'Prefix')!.props.value).toBe(
    '19',
  );
  expect(localBack()()).toBe(false);
  await act(() => action(tree).props.onPress());
  await act(() => action(tree).props.onPress());
  await act(() => action(tree).props.onPress());
  await act(() => jest.advanceTimersByTime(840));
  expect(JSON.stringify(tree.toJSON())).toContain('Successful payment');
  await act(() => expect(localBack()()).toBe(true));
  expect(fields(tree)[0]!.props.value).toBe('******');
  await act(() => tree.unmount());
  expect(register).toHaveBeenLastCalledWith(null);
});
