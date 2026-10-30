import { deriveProductCategories } from '@/features/products/selectors';
import {
  getAccountTransactionProfileIndex,
  getAccountTransactions,
  getCardTransactions,
} from '@/data/accountDetails';
import { getCountryConfig } from '@/app/registry/countryConfig';
import { createEmptyDomesticPaymentDraft } from '@/data/paymentFlow';
import { getPaymentsMenuForCountry } from '@/app/config/paymentsMenuConfig';
import type { CountryId, ProductCounts } from '@/app/state/demoTypes';
import {
  bankingProducts,
  productTransactions,
  allAccountTransactions,
  paymentDraftValid,
  paymentTemplateDraft,
  accountActions,
} from '../src/experiences/pi/current/banking/model';
import { getPaymentTemplates } from '@/data/paymentTemplates';
import {
  overrideCategory,
  readCategoryOverrides,
} from '../src/experiences/pi/current/banking/categoryOverrides';

test('confirmed transaction category is read by reports only inside the same country and release', () => {
  const context = {
    country: 'CZ' as const,
    release: 'release-current' as const,
  };
  const selection = {
    groupId: 'household',
    groupLabel: 'Household',
    category: 'Home' as const,
    subcategory: 'Rent',
  };
  overrideCategory(context, 'tx-native-category-test', selection);
  expect(readCategoryOverrides(context)['tx-native-category-test']).toEqual(
    selection,
  );
  expect(
    readCategoryOverrides({ ...context, country: 'RO' })[
      'tx-native-category-test'
    ],
  ).toBeUndefined();
  expect(
    readCategoryOverrides({ ...context, release: 'release-future-cz-robo' })[
      'tx-native-category-test'
    ],
  ).toBeUndefined();
});

const counts: ProductCounts = {
  accounts: 2,
  debitCards: 2,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 1,
  mortgages: 1,
  investments: 1,
};
const countries: CountryId[] = [
  'RO',
  'CZ',
  'SK',
  'HU',
  'RS',
  'BA',
  'BA_BL',
  'SI',
];
test.each(countries)(
  '%s banking keeps canonical product IDs, values and account/card ledgers',
  country => {
    const context = {
      country,
      release: 'release-current' as const,
      scenario: 'active' as const,
      language: 'en' as const,
      productCounts: counts,
    };
    const data = bankingProducts(context);
    expect(data.products).toEqual(
      deriveProductCategories({
        country,
        release: context.release,
        resolvedProductCounts: counts,
      }).flatMap(c => c.products),
    );
    const currency = getCountryConfig(country).currency;
    data.accounts.forEach((account, index) =>
      expect(productTransactions(context, account)).toEqual(
        getAccountTransactions(
          country,
          getAccountTransactionProfileIndex(account, index),
          currency,
        ),
      ),
    );
    data.cards.forEach(card => {
      const index =
        card.type === 'debit_card'
          ? Math.max(
              0,
              data.currentAccounts.findIndex(
                a => a.id === card.linkedAccountId,
              ),
            )
          : 0;
      expect(productTransactions(context, card)).toEqual(
        getCardTransactions(country, card, currency, index),
      );
    });
    expect(
      allAccountTransactions(context).every(
        row => row.product.type === 'current_account',
      ),
    ).toBe(true);
    expect(
      getPaymentsMenuForCountry(country).primaryItems.length,
    ).toBeGreaterThan(0);
  },
);
test('Czech baseline draft rejects invalid bank/account checksum and permits empty prefix', () => {
  const empty = createEmptyDomesticPaymentDraft('CZ');
  const valid = {
    ...empty,
    beneficiaryName: 'Jane',
    accountNumber: '2000145399',
    bankCode: '0800',
    amount: '120,50',
  };
  expect(paymentDraftValid('CZ', 'release-current', empty)).toBe(false);
  expect(paymentDraftValid('CZ', 'release-current', valid)).toBe(true);
  expect(
    paymentDraftValid('CZ', 'release-current', { ...valid, bankCode: '9999' }),
  ).toBe(false);
  expect(
    paymentDraftValid('CZ', 'release-current', {
      ...valid,
      accountNumber: '124',
    }),
  ).toBe(false);
});
it.each(['RO', 'HU', 'RS', 'SI', 'SK', 'BA', 'BA_BL', 'IT'] as const)(
  '%s baseline domestic payment needs its single IBAN without Czech account parts',
  country => {
    const empty = createEmptyDomesticPaymentDraft(country);
    const ready = {
      ...empty,
      beneficiaryName: 'Jane Doe',
      accountNumber: `${country}49BACX000009310001`,
      amount: '120,50',
      prefix: '',
      bankCode: '',
    };
    expect(paymentDraftValid(country, 'release-current', empty)).toBe(false);
    expect(paymentDraftValid(country, 'release-current', ready)).toBe(true);
  },
);
test('baseline template uses Source Czech local account extraction and original draft fields elsewhere', () => {
  const template = getPaymentTemplates('CZ')[0]!;
  const draft = paymentTemplateDraft(template, 'CZ', 'release-current');
  const match = template.accountNumber.match(/^CZ\d{2}BACX(\d{6})(\d{6})$/)!;
  expect(draft.prefix).toBe(match[1]);
  expect(draft.accountNumber).toBe(match[2]);
  expect(draft.amount).toBe(template.amount);
  expect(draft.informationForBeneficiary).toBe(template.paymentNote);
});
test('saving, deposit and lending actions preserve baseline active and inert states', () => {
  const context = {
    country: 'RO' as const,
    release: 'release-current' as const,
    scenario: 'active' as const,
    language: 'en' as const,
    productCounts: counts,
  };
  const data = bankingProducts(context);
  expect(
    accountActions(data.accounts.find(a => a.type === 'saving_account')!).map(
      a => a.id,
    ),
  ).not.toContain('add-money');
  expect(
    accountActions(data.accounts.find(a => a.type === 'term_deposit')!).map(
      a => a.id,
    ),
  ).toEqual(['details', 'add-money', 'mcash']);
  expect(
    accountActions(data.accounts.find(a => a.type === 'loan')!).map(a => a.id),
  ).toEqual(['details', 'mcash']);
  expect(
    accountActions(data.currentAccounts[0]!)
      .filter(a => a.active)
      .map(a => a.id),
  ).toEqual(['details', 'options']);
});
