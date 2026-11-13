import React from 'react';
import { StyleSheet, View } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import { MortgageReimbursementFlow } from '../src/experiences/pi/current/baseline/MortgageReimbursementFlow';
import { bankingProducts, productTransactions } from '../src/experiences/pi/current/banking/model';
import { currentTokens, createCurrentTranslator } from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { BaselineNavigationRow } from '../src/universal/BaselineNavigationRow';
import { BaselineStandardSuccess } from '../src/universal/BaselineStandardSuccess';
import { RoBaselinePaymentSign } from '../src/experiences/pi/current/baseline/payments/confirmation/RoBaselinePaymentConfirmation';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { AccountMcashFlow } from '../src/experiences/pi/current/baseline/AccountMcashFlow';
import { BaselineAmountField } from '../src/universal/BaselineAmountField';
import { BaselineDropdownField } from '../src/universal/BaselineDropdownField';
import { BaselineBottomSheet } from '../src/universal/BaselineBottomSheet';
import type { Mortgage } from '../../src/data/products';
import { accountConvention } from '../../src/features/accounts-payments/roAccountConvention';
import { RoBaselineTransactions } from '../src/experiences/pi/current/baseline/Transactions';
import { RoBaselineTransactionFilters } from '../src/experiences/pi/current/baseline/TransactionFilters';
import { EMPTY_ACCOUNT_TRANSACTION_FILTERS } from '../../src/features/accounts-payments/evoTransactionFilters';
import { BaselineSearchBar } from '../src/universal/BaselineSearchBar';
import { BaselineHomeBody } from '../src/experiences/pi/current/baseline/Body';
import { BaselineProductCard } from '../src/universal/BaselineProductCard';
import RoBaselineAccountInfo from '../src/experiences/pi/current/baseline/AccountInfo';
import { BaselineAccountInfoField } from '../src/universal/BaselineAccountInfoField';

it('keeps Oferta STAR+ scoped to Romanian current accounts', () => {
  expect(accountConvention('RO', 'current_account')).toBe('Oferta STAR+');
  expect(accountConvention('RO', 'saving_account')).toBeUndefined();
  expect(accountConvention('CZ', 'current_account')).toBeUndefined();
});

it('shows the same convention on Romanian home account cards and account details', () => {
  let home!: Renderer.ReactTestRenderer;
  let details!: Renderer.ReactTestRenderer;
  const account = bankingProducts(host).currentAccounts[0]!;
  act(() => { home = Renderer.create(<BaselineHomeBody host={host} />); });
  const cards = home.root.findAllByType(BaselineProductCard);
  const card = cards.find(item => item.props.accountNumber === account.accountNumber)!;
  expect(card.props.thirdLine).toBe('Oferta STAR+');
  expect(cards.filter(item => item.props.thirdLine === 'Oferta STAR+')).toHaveLength(bankingProducts(host).currentAccounts.length);
  act(() => { details = Renderer.create(<RoBaselineAccountInfo {...host} route={{ screen: 'account-info', params: { accountId: account.id } }} />); });
  const expand = details.root.findAll(node => node.props.accessibilityLabel === 'Show more' && typeof node.props.onPress === 'function')[0];
  act(() => expand.props.onPress());
  expect(details.root.findAllByType(BaselineAccountInfoField).some(field => field.props.subtitle === card.props.thirdLine)).toBe(true);
  act(() => { home.unmount(); details.unmount(); });
});

it('opens, applies and removes account-style filters for card transactions', () => {
  const card = bankingProducts(host).cards[0]!;
  let tree!: Renderer.ReactTestRenderer;
  act(() => { tree = Renderer.create(<RoBaselineTransactions host={host} kind="card" product={card} transactions={productTransactions(host, card)} query="" onQueryChange={() => {}} onTransaction={() => {}} />); });
  act(() => tree.root.findByType(BaselineSearchBar).props.onFilterClick());
  expect(tree.root.findByType(RoBaselineTransactionFilters)).toBeTruthy();
  act(() => tree.root.findByType(RoBaselineTransactionFilters).props.onApply({ ...EMPTY_ACCOUNT_TRANSACTION_FILTERS, keyword: 'no matching transaction 87654' }));
  expect(tree.root.findByType(BaselineSearchBar).props.filtersActive).toBe(true);
  expect(JSON.stringify(tree.toJSON())).toContain('No transactions found');
  act(() => tree.root.findByType(BaselineSearchBar).props.onRemoveFilters());
  expect(tree.root.findByType(BaselineSearchBar).props.filtersActive).toBe(false);
  act(() => tree.unmount());
});

const host = { country: 'RO', release: 'release-current', scenario: 'active', language: 'en', productCounts: {accounts: 2, debitCards: 2, creditCards: 1, mealCards: 0, deposits: 1, savingsAccounts: 1, loans: 1, mortgages: 1, investments: 1}, route: {screen: 'account'}, tokens: currentTokens(), t: createCurrentTranslator('RO', 'en'), amountsHidden: false, screenTopInset: 54, isActive: true, onNavigate: jest.fn(), onBack: jest.fn(), onProfile: jest.fn(), onSearch: jest.fn(), onAmountsToggle: jest.fn(), onChanged: jest.fn(), onLanguageChange: jest.fn(), mode: 'light', onModeChange: jest.fn() } as CurrentScreenProps;

it('keeps consent and sign-in before the standard success screen', () => {
  const mortgage = bankingProducts(host).accounts.find(product => product.type === 'mortgage') as Mortgage;
  let tree!: Renderer.ReactTestRenderer;
  act(() => { tree = Renderer.create(<MortgageReimbursementFlow host={host} mortgage={mortgage} onClose={() => {}} />); });
  act(() => tree.root.findByType(PrimaryButton).props.onPress());
  const radios = tree.root.findAll(node => node.props.accessibilityRole === 'radio' && node.props.accessibilityLabel === 'PARTIAL');
  const unselected = radios[0].findAllByType(View).find(node => StyleSheet.flatten(node.props.style)?.width === 48)!;
  expect(StyleSheet.flatten(unselected.props.style).borderWidth ?? 0).toBe(0);
  const inactiveCheck = unselected.findByType(SourceCustomIcon);
  expect(inactiveCheck.props.name).toBe('prime-check');
  expect(inactiveCheck.props.size).toBe(22);
  expect(inactiveCheck.props.color).toBe(host.tokens.text);
  act(() => radios[0].props.onPress());
  const partialChoice = tree.root.findAll(node => node.props.accessibilityRole === 'radio' && node.props.accessibilityLabel === 'DECREASE MONTHLY INSTALLMENT')[0];
  expect(partialChoice.findByType(SourceCustomIcon).props.color).toBe(host.tokens.text);
  const totalChoice = tree.root.findAll(node => node.props.accessibilityRole === 'radio' && node.props.accessibilityLabel === 'TOTAL')[0];
  act(() => totalChoice.props.onPress());
  expect(tree.root.findByType(BaselineBottomSheet).props.padding).toBe(24);
  expect(tree.root.findAllByType(SourceCustomIcon).some(icon => icon.props.name === 'prime-check')).toBe(true);
  const terms = tree.root.findByType(BaselineNavigationRow);
  expect(tree.root.findByType(PrimaryButton).props.disabled).toBe(true);
  act(() => terms.props.onToggle(true));
  expect(tree.root.findByType(PrimaryButton).props.disabled).toBe(false);
  act(() => tree.root.findByType(PrimaryButton).props.onPress());
  const sign = tree.root.findByType(RoBaselinePaymentSign);
  expect(tree.root.findAllByType(BaselineStandardSuccess)).toHaveLength(0);
  act(() => sign.props.onBack());
  expect(tree.root.findByType(PrimaryButton).props.disabled).toBe(false);
  act(() => tree.root.findByType(PrimaryButton).props.onPress());
  act(() => tree.root.findByType(RoBaselinePaymentSign).props.onSign());
  expect(tree.root.findByType(BaselineStandardSuccess)).toBeTruthy();
  act(() => tree.unmount());
});

it('uses the standard amount field and scrollable full-height mCash sheets', () => {
  const accounts = bankingProducts(host).accounts;
  let tree!: Renderer.ReactTestRenderer;
  act(() => { tree = Renderer.create(<AccountMcashFlow host={host} accounts={accounts} initialAccountId={accounts.find(a => a.type === 'current_account')!.id} onClose={() => {}} />); });
  expect(tree.root.findByType(BaselineAmountField).props.helperText).toBe('Please enter only multiple of 10');
  expect(tree.root.findByType(BaselineDropdownField).props.paddingLeft).toBe(0);
  expect(tree.root.findByType(BaselineBottomSheet).props.fixedHeight).toBe(true);
  act(() => tree.root.findByType(PrimaryButton).props.onPress());
  const sheets = tree.root.findAllByType(BaselineBottomSheet);
  expect(sheets.at(-1)?.props.fixedHeight).toBe(true);
  act(() => tree.unmount());
});
