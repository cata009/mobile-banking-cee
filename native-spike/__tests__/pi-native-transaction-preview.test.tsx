import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { getAccountTransactions } from '@/data/accountDetails';
import { createTransactionDetailData } from '@/data/paymentFlow';
import { mockProducts, type Product } from '@/data/products';
import { NATIVE_TRANSACTION_PREVIEW_ADAPTER } from '../src/app/transactionPreviewAdapter';
import { MovementDetail } from '../src/experiences/pi/cz/evo-2027/accounts/Movements';
import { RoBaselineTransaction } from '../src/experiences/pi/current/baseline/Transaction';
import { currentTokens, createCurrentTranslator } from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';

const customAccount: Product = {
  id: 'preview-only-account', type: 'current_account', name: 'Preview account',
  accountNumber: 'CZ990000123456789', balance: 45123.79, currency: 'CZK',
};
const transaction = getAccountTransactions('CZ', 0, 'CZK').find(item => item.type === 'debit' && item.source !== 'card')!;

function host(product: Product | null, evo: boolean): CurrentScreenProps {
  return {
    country: 'CZ', release: evo ? 'release-future-evo-2027' : 'release-current',
    scenario: 'active', language: 'en',
    productCounts: { accounts: 0, debitCards: 0, creditCards: 0, mealCards: 0, deposits: 0, savingsAccounts: 0, loans: 0, mortgages: 0, investments: 0 },
    route: { screen: 'transaction', params: { productId: product?.id ?? '', transactionId: transaction.id, source: 'account' } },
    transactionSelection: { productId: product?.id ?? '', source: 'account', transaction },
    transactionPresentation: { product },
    tokens: currentTokens(), t: createCurrentTranslator('CZ', 'en'),
    amountsHidden: false, screenTopInset: 54, isActive: true,
    onNavigate: jest.fn(), onBack: jest.fn(), onProfile: jest.fn(), onSearch: jest.fn(),
    onAmountsToggle: jest.fn(), onChanged: jest.fn(), onLanguageChange: jest.fn(),
    mode: 'light', onModeChange: jest.fn(),
  };
}

function text(tree: Renderer.ReactTestRenderer): string {
  return JSON.stringify(tree.toJSON());
}

test.each([false, true])('preview renders an explicit unregistered account through the existing Native leaf (Evo=%s)', async evo => {
  const props = host(customAccount, evo);
  const Preview = NATIVE_TRANSACTION_PREVIEW_ADAPTER.screens.transaction!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => { tree = Renderer.create(<Preview {...props} />); });
  const leaf = tree.root.findByType(evo ? MovementDetail : RoBaselineTransaction);
  expect(leaf).toBeDefined();
  const expected = createTransactionDetailData(transaction, 'CZ', customAccount);
  expect(text(tree)).toContain(expected.amount);
  expect(text(tree)).toContain(expected.accountTitle);
  const redo = tree.root.findAll(node => node.props.accessibilityLabel === 'Redo payment' && typeof node.props.onPress === 'function')[0]!;
  await act(() => redo.props.onPress());
  expect(props.onNavigate).toHaveBeenCalledWith(expect.objectContaining({ screen: 'payment-create' }));
  const back = tree.root.findAll(node => node.props.accessibilityLabel === 'Back' && typeof node.props.onPress === 'function')[0]!;
  await act(() => back.props.onPress());
  expect(props.onBack).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});

test.each([false, true])('preview preserves explicit absent product and supplied merchant facts (Evo=%s)', async evo => {
  const props = host(null, evo);
  props.transactionPresentation = { product: null, merchantEnrichment: { cleanMerchantName: 'Caller merchant', location: { label: 'Caller store', address: 'Street 21' }, mcc: '5944 · Jewellery' } };
  const Preview = NATIVE_TRANSACTION_PREVIEW_ADAPTER.screens.transaction!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => { tree = Renderer.create(<Preview {...props} />); });
  expect(text(tree)).toContain('Caller merchant');
  // Source shows location only when a card is identified; an absent product must not invent one.
  expect(text(tree)).not.toContain('Caller store');
  expect(text(tree)).not.toContain('Street 21');
  expect(text(tree)).not.toContain('No transaction selected');
  if (evo) expect(tree.root.findByType(MovementDetail).props.product).toBeNull();
  await act(() => tree.unmount());
});

test.each([false, true])('preview renders supplied merchant location for an explicit card (Evo=%s)', async evo => {
  const fixture = mockProducts.find(item => item.type === 'debit_card');
  if (!fixture || fixture.type !== 'debit_card') throw new Error('Debit card fixture unavailable');
  const card: Product = { ...fixture, id: 'preview-card', currency: 'CZK', linkedAccountId: customAccount.id };
  const props = host(card, evo);
  props.transactionPresentation = { product: card, merchantEnrichment: { cleanMerchantName: 'Caller merchant', location: { label: 'Caller store', address: 'Street 21' } } };
  const Preview = NATIVE_TRANSACTION_PREVIEW_ADAPTER.screens.transaction!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => { tree = Renderer.create(<Preview {...props} />); });
  expect(text(tree)).toContain('Caller store');
  expect(text(tree)).toContain('Street 21');
  await act(() => tree.unmount());
});
