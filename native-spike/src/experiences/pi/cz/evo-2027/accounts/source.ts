import { createCurrentProducts } from '../../../current/context';
import type { ProductCounts } from '@/app/state/demoTypes';
import {
  getAccountTransactions,
  getAccountTransactionProfileIndex,
  getCardTransactions,
} from '@/data/accountDetails';
import {
  isAccountDetailProduct,
  type CreditCard,
  type DebitCard,
  type Product,
} from '@/data/products';
import { getApp2027ActivityTransactions } from '@/features/products/evoAccountActivity';
import type { NativeBankingPresentation } from '@/features/demo-native/bankingPresentation';
export const czechProducts = (counts: ProductCounts, presentation?: NativeBankingPresentation): Product[] =>
  createCurrentProducts({
    country: 'CZ',
    release: 'release-future-evo-2027',
    productCounts: counts,
    bankingPresentation: presentation,
  }).products;
export const accountProducts = (products: Product[]) =>
  products.filter(isAccountDetailProduct);
export const cardProducts = (products: Product[]): (DebitCard | CreditCard)[] =>
  products.filter(
    (p): p is DebitCard | CreditCard =>
      p.type === 'debit_card' || p.type === 'credit_card',
  );
export function baseAccountMovements(product: Product, products: Product[]) {
  const accountIndex = accountProducts(products).findIndex(
    p => p.id === product.id,
  );
  return getAccountTransactions(
    'CZ',
    getAccountTransactionProfileIndex(product, accountIndex),
    'CZK',
  );
}
export function accountMovements(product: Product, products: Product[]) {
  const base = baseAccountMovements(product, products),
    index = accountProducts(products).findIndex(p => p.id === product.id);
  if (
    product.type !== 'current_account' ||
    getAccountTransactionProfileIndex(product, index) !== 0
  )
    return base;
  const curated = getApp2027ActivityTransactions('CZ'),
    labels = new Set(curated.map(tx => tx.label));
  return [
    ...curated,
    ...base.filter(tx => tx.status === 'Booked' && !labels.has(tx.label)),
  ];
}
export function cardMovements(
  card: DebitCard | CreditCard,
  products: Product[],
) {
  const accountIndex =
    card.type === 'debit_card'
      ? Math.max(
          0,
          products
            .filter(p => p.type === 'current_account')
            .findIndex(p => p.id === card.linkedAccountId),
        )
      : 0;
  return getCardTransactions('CZ', card, 'CZK', accountIndex);
}
