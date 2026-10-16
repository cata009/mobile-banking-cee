import {
  FUND_OPTIONS,
  STOCK_OPTIONS,
  calculateFutureGainInvestmentIllustration,
  calculateFutureGainDepositQuote,
  parseFutureGainAmount,
  getFutureGainInvestmentSuggestions,
} from '@/features/investments/future-gain/smartInvestment';
import {
  futureGainEnabled,
  futureGainAvailableBalance,
} from '../src/experiences/pi/current/future-gain/model';
import { createCurrentProducts } from '../src/experiences/pi/current/context';
import { convertCurrency, roundMoney } from '@/data/exchangeRates';
import type { CurrentContext } from '../src/experiences/pi/current/contracts';
const context: CurrentContext = {
  country: 'RS',
  release: 'release-future-rs-future-gain',
  scenario: 'active',
  language: 'en',
  productCounts: {
    accounts: 2,
    debitCards: 1,
    creditCards: 1,
    mealCards: 0,
    deposits: 1,
    savingsAccounts: 1,
    loans: 0,
    mortgages: 0,
    investments: 1,
  },
};
test('only the active Serbia FutureGain context resolves the new experience', () => {
  expect(futureGainEnabled(context)).toBe(true);
  expect(futureGainEnabled({ ...context, country: 'CZ' })).toBe(false);
  expect(futureGainEnabled({ ...context, release: 'release-current' })).toBe(
    false,
  );
  expect(futureGainEnabled({ ...context, scenario: 'inactive' })).toBe(false);
});
test('FutureGain available funds use Source current and AVISTA holdings and actual RS conversion', () => {
  const rs = createCurrentProducts(context).calculateTotalAvailableAmount();
  expect(futureGainAvailableBalance(context, 'EUR')).toBe(
    roundMoney(convertCurrency(rs, 'RSD', 'EUR')),
  );
  expect(futureGainAvailableBalance(context, 'RSD')).toBe(roundMoney(rs));
});
test('Source fund and stock IDs, rates and draft parsing remain exact', () => {
  expect(FUND_OPTIONS.map(option => option.id)).toEqual([
    'balanced-income',
    'climate-focus',
    'sustainable-future',
    'global-dividend',
    'global-growth',
  ]);
  expect(STOCK_OPTIONS[0]?.id).toBe('stoxx-600');
  expect(parseFutureGainAmount('1.000,00')).toBe(1000);
  const result = calculateFutureGainInvestmentIllustration({
    amount: 1000,
    availableBalance: 5000,
    option: FUND_OPTIONS[1]!,
  });
  expect(result).toMatchObject({
    isAmountValid: true,
    potentialReturn: 22.1,
    accumulatedAmount: 1022.1,
    annualReturnRate: 2.21,
  });
  expect(
    calculateFutureGainInvestmentIllustration({
      amount: 5001,
      availableBalance: 5000,
      option: FUND_OPTIONS[1]!,
    }).isAmountValid,
  ).toBe(false);
  expect(getFutureGainInvestmentSuggestions(5100, 'EUR')).toEqual([
    1200, 2500, 3800, 5100,
  ]);
});
test('term-deposit quote preserves 365/360 basis, tax and the external RSD exception', () => {
  expect(
    calculateFutureGainDepositQuote({
      amount: 1000,
      currency: 'EUR',
      fundingSource: 'current',
      tenor: 12,
    }),
  ).toMatchObject({
    grossMaturity: 1023.32,
    tax: 3.5,
    netMaturity: 1019.82,
    isAmountValid: true,
  });
  expect(
    calculateFutureGainDepositQuote({
      amount: 100000,
      currency: 'RSD',
      fundingSource: 'external',
      tenor: 12,
    }),
  ).toMatchObject({ grossInterest: 4500, tax: 0, netMaturity: 104500 });
  expect(
    calculateFutureGainDepositQuote({
      amount: 0,
      currency: 'EUR',
      fundingSource: 'current',
      tenor: 12,
    }).isAmountValid,
  ).toBe(false);
});
