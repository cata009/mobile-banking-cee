import { bankingProducts } from '../src/experiences/pi/current/banking/model';
import { mockProducts, type ProductCategory } from '@/data/products';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';

const card = mockProducts.find(product => product.type === 'credit_card')!;
const categories: ProductCategory[] = [{ key: 'cards', title: 'Provided cards', products: [card] }];
const context = {
  country: 'CZ', release: 'release-current',
  productCounts: { accounts: 0, debitCards: 0, creditCards: 0, mealCards: 0, deposits: 0, savingsAccounts: 0, loans: 0, mortgages: 0, investments: 0 },
  bankingPresentation: { productCategories: categories },
} as const;

test('Native details consume the exact Source product identities and figures, without regenerating from counts', () => {
  const result = bankingProducts(context);
  expect(result.products).toEqual([card]);
  expect(result.cards[0]).toEqual(card);
  expect(result.categories).toEqual(categories);
  expect(result.accounts).toHaveLength(0);
});

test('an explicitly empty Source list stays empty even when demo counts are nonzero', () => {
  const result = bankingProducts({ ...context, productCounts: { ...context.productCounts, creditCards: 3 }, bankingPresentation: { productCategories: [] } });
  expect(result.products).toEqual([]);
  expect(result.cards).toEqual([]);
});

test('session credit limits are applied to the provided card identity through the canonical policy', () => {
  if (card.type !== 'credit_card') throw new Error('Credit card fixture unavailable');
  const host: Pick<CurrentScreenProps, 'country' | 'release' | 'productCounts' | 'bankingPresentation' | 'creditLimitOverrides'> = { ...context, creditLimitOverrides: { [card.id]: card.creditLimit + 5000 } };
  const actual = bankingProducts(host).cards[0];
  expect(actual?.id).toBe(card.id);
  expect(actual?.type === 'credit_card' && actual.creditLimit).toBe(card.creditLimit + 5000);
  expect(actual?.type === 'credit_card' && actual.availableCredit).toBe(card.availableCredit + 5000);
});
