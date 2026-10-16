import type { CurrentAdapter } from '../contracts';
import { createElement } from 'react';
import type { CurrentScreenProps } from '../contracts';
import { isPiClassicCompositionContext } from '../baseline/policy';
import RoBaselineAccount from '../baseline/Account';
import RoBaselineCard from '../baseline/Card';
import RoBaselineCardInfo from '../baseline/CardInfo';
import RoBaselineCardOptions from '../baseline/CardOptions';
import RoBaselineAccountInfo from '../baseline/AccountInfo';
import RoBaselineAccountOptions from '../baseline/AccountOptions';
import { RoBaselineTransaction } from '../baseline/Transaction';
import { RoBaselineTransactionsScreen } from '../baseline/TransactionsScreen';
import { RoBaselinePaymentsScreen } from '../baseline/payments/hub/Payments';
import RoBaselinePaymentCreateScreen from '../baseline/payments/domestic/RoBaselinePaymentCreateScreen';
import {
  AccountsScreen,
  AccountScreen,
  AccountInfoScreen,
  AccountOptionsScreen,
} from './Accounts';
import {
  CardsScreen,
  CardScreen,
  CardInfoScreen,
  CardOptionsScreen,
  CardSensitiveDetailsScreen,
} from './Cards';
import { TransactionsScreen } from './Ledger';
import { TransactionScreen } from './Transaction';
import { PaymentsScreen, PaymentCreateScreen } from './Payments';
import { bankingProducts } from './model';
function ResolvedAccountScreen(host: CurrentScreenProps) {
  return createElement(
    isPiClassicCompositionContext(host) ? RoBaselineAccount : AccountScreen,
    host,
  );
}
function ResolvedCardScreen(host: CurrentScreenProps) {
  if (host.bankingPresentation?.sensitiveCard) {
    return createElement(CardSensitiveDetailsScreen, {
      host,
      card: host.bankingPresentation.sensitiveCard,
    });
  }
  return createElement(
    isPiClassicCompositionContext(host) ? RoBaselineCard : CardScreen,
    host,
  );
}
function ResolvedCardInfoScreen(host: CurrentScreenProps) {
  return createElement(
    isPiClassicCompositionContext(host) ? RoBaselineCardInfo : CardInfoScreen,
    host,
  );
}
function ResolvedCardOptionsScreen(host: CurrentScreenProps) {
  return createElement(
    isPiClassicCompositionContext(host)
      ? RoBaselineCardOptions
      : CardOptionsScreen,
    host,
  );
}
function ResolvedAccountInfoScreen(host: CurrentScreenProps) {
  return createElement(
    isPiClassicCompositionContext(host)
      ? RoBaselineAccountInfo
      : AccountInfoScreen,
    host,
  );
}
function ResolvedAccountOptionsScreen(host: CurrentScreenProps) {
  return createElement(
    isPiClassicCompositionContext(host)
      ? RoBaselineAccountOptions
      : AccountOptionsScreen,
    host,
  );
}
function ResolvedTransactionScreen(host: CurrentScreenProps) {
  return createElement(
    isPiClassicCompositionContext(host)
      ? RoBaselineTransaction
      : TransactionScreen,
    host,
  );
}
function ResolvedTransactionsScreen(host: CurrentScreenProps) {
  return createElement(
    isPiClassicCompositionContext(host)
      ? RoBaselineTransactionsScreen
      : TransactionsScreen,
    host,
  );
}
function ResolvedPaymentsScreen(host: CurrentScreenProps) {
  return createElement(
    isPiClassicCompositionContext(host)
      ? RoBaselinePaymentsScreen
      : PaymentsScreen,
    host,
  );
}
function ResolvedPaymentCreateScreen(host: CurrentScreenProps) {
  return createElement(
    isPiClassicCompositionContext(host)
      ? RoBaselinePaymentCreateScreen
      : PaymentCreateScreen,
    host,
  );
}

export const CURRENT_BANKING_ADAPTER: CurrentAdapter = {
  id: 'pi-current-banking',
  screens: {
    accounts: AccountsScreen,
    account: ResolvedAccountScreen,
    'account-info': ResolvedAccountInfoScreen,
    'account-options': ResolvedAccountOptionsScreen,
    cards: CardsScreen,
    card: ResolvedCardScreen,
    'card-info': ResolvedCardInfoScreen,
    'card-options': ResolvedCardOptionsScreen,
    transactions: ResolvedTransactionsScreen,
    transaction: ResolvedTransactionScreen,
    payments: ResolvedPaymentsScreen,
    'payment-create': ResolvedPaymentCreateScreen,
  },
  searchEntries: context => [
    {
      id: 'current-accounts',
      label: 'Accounts',
      keywords: ['accounts', 'balance', 'iban'],
      target: { screen: 'accounts' },
    },
    {
      id: 'current-cards',
      label: 'Cards',
      keywords: ['cards', 'debit', 'credit'],
      target: { screen: 'cards' },
    },
    {
      id: 'current-transactions',
      label: 'Transactions',
      keywords: ['transactions', 'movements', 'history'],
      target: { screen: 'transactions' },
    },
    {
      id: 'current-payments',
      label: 'Payments',
      keywords: ['payment', 'transfer', 'beneficiary'],
      target: { screen: 'payments' },
    },
    {
      id: 'current-payment-new',
      label: 'Domestic payment',
      keywords: ['new payment', 'send money'],
      target: { screen: 'payment-create' },
    },
    {
      id: 'current-payment-templates',
      label: 'Templates',
      keywords: ['beneficiaries', 'templates'],
      target: { screen: 'payments', params: { view: 'templates' } },
    },
    {
      id: 'current-payment-fx',
      label: 'Exchange rates',
      keywords: ['currency', 'exchange', 'rates'],
      target: { screen: 'payments', params: { view: 'exchange-rates' } },
    },
    ...bankingProducts(context)
      .products.filter(
        product =>
          product.type !== 'investment_account' && product.type !== 'meal_card',
      )
      .map(product => ({
        id: `current-banking-${product.id}`,
        label: product.name,
        subtitle: product.accountNumber,
        keywords: [product.type.replace(/_/g, ' '), product.accountNumber],
        target: {
          screen:
            product.type === 'credit_card' || product.type === 'debit_card'
              ? ('card' as const)
              : ('account' as const),
          params: { productId: product.id },
        },
      })),
  ],
};
