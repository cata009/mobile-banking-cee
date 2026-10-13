import { CZECH_NATIVE_ADAPTERS } from '../src/app/czechAdapters';
import {
  composeCzechAdapters,
  searchCzechEntries,
} from '../src/app/czechNavigation';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';
import { deriveProductCategories } from '@/features/products/selectors';
import { PRODUCT_SHELF_CATEGORIES } from '@/app/config/productsShelfConfig';
import { getFrequentBeneficiaries } from '@/data/paymentsHub';
import { getPaymentTemplates } from '@/data/paymentTemplates';
import { createCzInvestmentSnapshot } from '../src/experiences/pi/cz/evo-2027/investments/model';

test('the frozen Czech composition registers every integrated area once', () => {
  expect(CZECH_NATIVE_ADAPTERS).toHaveLength(4);
  const { screens } = composeCzechAdapters(CZECH_NATIVE_ADAPTERS);
  for (const screen of [
    'home',
    'pfm',
    'products',
    'product-detail',
    'account',
    'card',
    'payments',
    'payment-create',
    'investments',
    'investment-history',
    'investment-detail',
    'robo',
    'profile',
    'settings',
    'documents',
    'messages',
    'contacts',
    'support',
    'call-request',
    'login',
  ])
    expect(Object.keys(screens)).toContain(screen);
});
test('global Search targets implemented screens and exact Source entities across all areas', () => {
  const composition = composeCzechAdapters(CZECH_NATIVE_ADAPTERS);
  const entries = composition.searchEntries({
    scenario: 'active',
    productCounts: DEFAULT_CZECH_COUNTS,
  });
  expect(entries.length).toBeGreaterThan(20);
  expect(new Set(entries.map(entry => entry.id)).size).toBe(entries.length);
  const products = new Set(
    deriveProductCategories({
      country: 'CZ',
      release: 'release-future-evo-2027',
      resolvedProductCounts: DEFAULT_CZECH_COUNTS,
    })
      .flatMap(category => category.products)
      .map(product => product.id),
  );
  const shelf = new Set(
    PRODUCT_SHELF_CATEGORIES.flatMap(category => category.items).map(
      item => item.id,
    ),
  );
  const securities = new Set(
    createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS).catalog.map(
      security => security.id,
    ),
  );
  const beneficiaries = new Set(
    getFrequentBeneficiaries('CZ').map(person => person.id),
  );
  const templates = new Set(
    getPaymentTemplates('CZ').map(template => template.id),
  );
  for (const entry of entries) {
    expect(composition.screens[entry.target.screen]).toBeDefined();
    const params = entry.target.params;
    if (params?.productId) expect(products.has(params.productId)).toBe(true);
    if (params?.cardId) expect(products.has(params.cardId)).toBe(true);
    if (params?.itemId) expect(shelf.has(params.itemId)).toBe(true);
    if (params?.securityId)
      expect(securities.has(params.securityId)).toBe(true);
    if (params?.beneficiaryId)
      expect(beneficiaries.has(params.beneficiaryId)).toBe(true);
    if (params?.templateId) expect(templates.has(params.templateId)).toBe(true);
  }
  for (const term of [
    'account',
    'card',
    'payment',
    'investment',
    'documents',
    'settings',
  ])
    expect(searchCzechEntries(entries, term).length).toBeGreaterThan(0);
});
