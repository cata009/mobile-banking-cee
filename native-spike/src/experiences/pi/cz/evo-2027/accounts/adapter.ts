import React from 'react';
import type { CzechNativeAdapter, CzechNativeScreenProps } from '../contracts';
import AccountScreen from './AccountScreen';
import TransactionsScreen from './TransactionsScreen';
import CardScreen from '../cards/CardScreen';
import PaymentsScreen from '../payments/PaymentsScreen';
import PaymentFlow from '../payments/PaymentFlow';
import { czechAccountsSearchEntries } from './searchEntries';
function TransactionScreen(props: CzechNativeScreenProps) {
  return React.createElement(
    props.route.params?.cardId ? CardScreen : AccountScreen,
    props,
  );
}
export const CZECH_ACCOUNTS_ADAPTER: CzechNativeAdapter = {
  id: 'cz-evo-accounts-cards-payments',
  screens: {
    accounts: AccountScreen,
    account: AccountScreen,
    'account-info': AccountScreen,
    'account-options': AccountScreen,
    transactions: TransactionsScreen,
    transaction: TransactionScreen,
    cards: CardScreen,
    card: CardScreen,
    'card-info': CardScreen,
    'card-options': CardScreen,
    payments: PaymentsScreen,
    'payment-create': PaymentFlow,
  },
  searchEntries: czechAccountsSearchEntries,
};
export type { CzechCardPorts } from '../cards/CardScreen';
export type {
  CzechPaymentPorts,
  CzechPaymentReceipt,
} from '../payments/PaymentFlow';
export type { CzechTransferReceipt } from '../payments/Transfer';
