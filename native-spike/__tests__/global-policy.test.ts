import {
  getEvoPaymentReadiness,
  isValidEvoPaymentTemplate,
} from '@/features/accounts-payments/evoPaymentPolicy';
import { getPaymentTemplates } from '@/data/paymentTemplates';
import {
  filterEvoTransactions,
  EMPTY_EVO_TRANSACTION_FILTERS,
} from '@/features/accounts-payments/evoTransactionFilters';
import {
  getEvoDepositPresentation,
  EVO_HOME_INSURANCE_POLICIES,
} from '@/features/products/evoHome';
import {
  getProductDetailContent,
  getProductDetailImageKey,
  getProductApplyLabel,
} from '@/features/products/evoProductDetail';
import {
  getApp2027ActivityTransactions,
  getApp2027AccountActivityRows,
} from '@/features/products/evoAccountActivity';
import { getAccountTransactions } from '@/data/accountDetails';
import { deriveProductCategories } from '@/features/products/selectors';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';
import type { DomesticPaymentDraft } from '@/data/paymentFlow';

const products = deriveProductCategories({
  country: 'CZ',
  release: 'release-future-evo-2027',
  resolvedProductCounts: DEFAULT_CZECH_COUNTS,
}).flatMap(category => category.products);
const payer = products.find(
  product => product.type === 'current_account' && product.currency === 'CZK',
)!;
function draft(
  patch: Partial<DomesticPaymentDraft> = {},
): DomesticPaymentDraft {
  return {
    entry: 'new',
    payerAccountName: payer.name,
    payerAccountNumber: payer.accountNumber,
    payerBalance: '',
    beneficiaryName: 'Jan Novák',
    prefix: '',
    accountNumber: '12345',
    bankCode: '2700',
    bankName: '',
    amount: '100',
    currency: 'CZK',
    instantPayment: true,
    dueDate: '2026-10-13',
    expressPayment: false,
    informationForBeneficiary: '',
    informationForMe: '',
    recipientCountry: 'CZ',
    ...patch,
  };
}
test('CZ recipient policy preserves Source syntax without new checksum restrictions', () => {
  expect(getEvoPaymentReadiness({ draft: draft(), payer })).toMatchObject({
    recipientValid: true,
    amountValid: true,
    canUseInstantPayment: true,
    amount: 100,
    exceedsBalance: false,
    route: 'cz-domestic',
  });
  expect(
    getEvoPaymentReadiness({ draft: draft({ beneficiaryName: 'Jan' }), payer })
      .recipientValid,
  ).toBe(false);
  expect(
    getEvoPaymentReadiness({
      draft: draft({ recipientEmail: 'invalid' }),
      payer,
    }).recipientValid,
  ).toBe(false);
  expect(
    getEvoPaymentReadiness({
      draft: draft({ amount: `${payer.balance + 1}` }),
      payer,
    }).amountValid,
  ).toBe(false);
  expect(
    getEvoPaymentReadiness({ draft: draft({ amount: '1+' }), payer })
      .amountValid,
  ).toBe(false);
});
test('transaction filters retain signed amount search, absolute limits and Source date-preset no-op', () => {
  const transactions = getAccountTransactions('CZ', 0, 'CZK');
  const args = {
    transactions,
    search: '',
    filters: EMPTY_EVO_TRANSACTION_FILTERS,
    currency: 'CZK',
    accountNumber: payer.accountNumber,
  };
  expect(filterEvoTransactions(args)).toEqual(transactions);
  expect(
    filterEvoTransactions({
      ...args,
      filters: { ...args.filters, datePreset: 'last-week' },
    }),
  ).toEqual(transactions);
  expect(
    filterEvoTransactions({
      ...args,
      filters: {
        ...args.filters,
        amountFrom: '100,00',
        transactionType: 'Outgoing',
      },
    }).every(item => Math.abs(item.amount) >= 100 && item.type === 'debit'),
  ).toBe(true);
  expect(
    filterEvoTransactions({
      ...args,
      filters: { ...args.filters, accountNumber: 'absent' },
    }),
  ).toEqual([]);
});
test('product detail policy preserves option/card/fallback precedence and insurance CTA', () => {
  expect(getProductDetailContent('saving-account').heading).toBe(
    'Keep money aside while staying flexible',
  );
  expect(getProductDetailContent('unknown', 'unknown', 'Custom').heading).toBe(
    'Learn more about Custom',
  );
  expect(getProductDetailImageKey('saving-account', 'insurance')).toBe(
    'activate-account',
  );
  expect(getProductDetailImageKey(null, 'insurance')).toBe('travel-insurance');
  expect(getProductApplyLabel('insurance')).toBe('Get a quote');
  expect(getProductApplyLabel('account')).toBe('Start application');
});
test('deposit and curated activity remain the exact Source fixtures', () => {
  expect(getEvoDepositPresentation({ ...payer, id: 'term-2' })).toMatchObject({
    annualRate: 0.052,
    daysToMaturity: 72,
    termDays: 184,
  });
  expect(EVO_HOME_INSURANCE_POLICIES.map(item => item.coverAmount)).toEqual([
    500000, 2400000,
  ]);
  expect(getApp2027ActivityTransactions('CZ').map(item => item.id)).toEqual([
    'app-2027-salary',
    'app-2027-mcdonalds',
    'app-2027-spotify',
  ]);
  expect(getApp2027AccountActivityRows('CZ', payer, 0)).toHaveLength(2);
});

test('template edit preserves Source text gates without adding an amount parser', () => {
  const template = getPaymentTemplates('CZ')[0];
  expect(
    isValidEvoPaymentTemplate({
      ...template,
      accountNumber: '123456',
      bankCode: '2700',
      amount: 'abc',
    }),
  ).toBe(true);
  expect(isValidEvoPaymentTemplate({ ...template, title: 'a' })).toBe(false);
  expect(
    isValidEvoPaymentTemplate({ ...template, accountNumber: '12345' }),
  ).toBe(false);
});
