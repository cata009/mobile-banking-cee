import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import PaymentFlow, {
  initialPaymentDraft,
} from '../src/experiences/pi/cz/evo-2027/payments/PaymentFlow';
import Transfer from '../src/experiences/pi/cz/evo-2027/payments/Transfer';
import SavingsAddMoney from '../src/experiences/pi/cz/evo-2027/payments/SavingsAddMoney';
import {
  czechProducts,
  baseAccountMovements,
  accountMovements,
} from '../src/experiences/pi/cz/evo-2027/accounts/source';
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
        typeof n.props.onPress === 'function' &&
        n.props.accessibilityLabel === label,
    )[0]!
    .props.onPress();
const input = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root
    .findAllByType(TextInput)
    .find(n => n.props.accessibilityLabel === label)!;
test('pooled primary ledger redo resolves the original Source transaction excluded by curated detail', () => {
  const products = czechProducts(DEFAULT_CZECH_COUNTS),
    payer = products.find(p => p.type === 'current_account')!;
  const curatedIds = new Set(accountMovements(payer, products).map(t => t.id));
  const original = baseAccountMovements(payer, products).find(
    t => t.status === 'Booked' && !curatedIds.has(t.id),
  )!;
  expect(original).toBeDefined();
  const draft = initialPaymentDraft(
    propsFor('payment-create', {
      productId: payer.id,
      transactionId: original.id,
    }),
  );
  expect(draft?.beneficiaryName).toBe(original.label);
});
test('explicit missing payer never silently falls back to another account', () => {
  expect(
    initialPaymentDraft(propsFor('payment-create', { productId: 'missing' })),
  ).toBeNull();
});
test('saved CZ beneficiary enters amount with native decimal keyboard, keeps draft on review Back', async () => {
  const person = getFrequentBeneficiaries('CZ')[0]!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <PaymentFlow
        {...propsFor('payment-create', { beneficiaryId: person.id })}
      />,
    );
  });
  expect(input(tree, 'Amount').props.keyboardType).toBe('decimal-pad');
  await act(() => input(tree, 'Amount').props.onChangeText('120,50'));
  await act(() => press(tree, 'Review transfer'));
  expect(JSON.stringify(tree.toJSON())).toContain('120,50');
  await act(() => press(tree, 'Back'));
  expect(input(tree, 'Amount').props.value).toBe('120,50');
  await act(() => tree.unmount());
});
test('native amount stage never places raw text under View (Android runtime invariant)', async () => {
  const person = getFrequentBeneficiaries('CZ')[0]!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <PaymentFlow
        {...propsFor('payment-create', { beneficiaryId: person.id })}
      />,
    );
  });
  const raw: string[] = [];
  const visit = (
    node:
      | Renderer.ReactTestRendererJSON
      | Renderer.ReactTestRendererJSON[]
      | null,
  ) => {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    for (const child of node.children ?? []) {
      if (typeof child === 'string') {
        if (/View/.test(node.type) && child.length > 0) raw.push(child);
      } else visit(child);
    }
  };
  visit(tree.toJSON());
  expect(raw).toEqual([]);
  await act(() => tree.unmount());
});
test.each(['US', 'CN'])(
  'foreign %s recipient stage has no raw View text',
  async country => {
    let tree!: Renderer.ReactTestRenderer;
    await act(() => {
      tree = Renderer.create(<PaymentFlow {...propsFor('payment-create')} />);
    });
    const select = tree.root
      .findAllByType(Select)
      .find(n => n.props.label === 'Recipient country')!;
    await act(() => select.props.onChange(country));
    const raw: string[] = [];
    const visit = (
      node:
        | Renderer.ReactTestRendererJSON
        | Renderer.ReactTestRendererJSON[]
        | null,
    ) => {
      if (!node) return;
      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }
      for (const child of node.children ?? []) {
        if (typeof child === 'string') {
          if (/View/.test(node.type) && child.length > 0) raw.push(child);
        } else visit(child);
      }
    };
    visit(tree.toJSON());
    expect(raw).toEqual([]);
    await act(() => tree.unmount());
  },
);
test('signing unavailable biometric cannot complete or emit demo payment receipt', async () => {
  const person = getFrequentBeneficiaries('CZ')[0]!,
    complete = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <PaymentFlow
        {...propsFor('payment-create', { beneficiaryId: person.id })}
        ports={{ authenticate: async () => 'unavailable' }}
        onDemoPayment={complete}
      />,
    );
  });
  await act(() => input(tree, 'Amount').props.onChangeText('100'));
  await act(() => press(tree, 'Review transfer'));
  await act(() => press(tree, 'Continue to sign'));
  await act(() => press(tree, 'Sign'));
  expect(JSON.stringify(tree.toJSON())).toContain(
    'Biometric verification unavailable',
  );
  expect(complete).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});
test('internal transfer swaps canonical FX quote and retains native amount input', async () => {
  const products = czechProducts(DEFAULT_CZECH_COUNTS),
    source = products.find(
      p => p.type === 'current_account' && p.currency === 'CZK',
    )!,
    destination = products.find(
      p => p.type === 'current_account' && p.currency === 'EUR',
    )!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <Transfer
        {...propsFor('payments', {
          sourceAccountId: source.id,
          destinationAccountId: destination.id,
        })}
      />,
    );
  });
  await act(() => input(tree, 'Amount').props.onChangeText('2428,40'));
  await act(() => press(tree, 'Swap accounts'));
  expect(input(tree, 'Amount').props.value).toBe('100');
  expect(input(tree, 'Amount').props.keyboardType).toBe('decimal-pad');
  await act(() => tree.unmount());
});
test('saving Add money retains Source demo completion without changing owned balances', async () => {
  const products = czechProducts(DEFAULT_CZECH_COUNTS),
    saving = products.find(
      (p): p is import('@/data/products').SavingAccount =>
        p.type === 'saving_account',
    )!,
    sources = products.filter(
      (p): p is import('@/data/products').CurrentAccount =>
        p.type === 'current_account',
    );
  const before = JSON.stringify(czechProducts(DEFAULT_CZECH_COUNTS));
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <SavingsAddMoney
        savingAccount={saving}
        sourceAccounts={sources}
        onBack={jest.fn()}
      />,
    );
  });
  await act(() => input(tree, 'Amount').props.onChangeText('120,50'));
  await act(() => press(tree, 'Add money'));
  expect(JSON.stringify(tree.toJSON())).toContain('Money added');
  expect(JSON.stringify(czechProducts(DEFAULT_CZECH_COUNTS))).toBe(before);
  await act(() => tree.unmount());
});
