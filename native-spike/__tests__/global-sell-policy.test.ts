import {
  buildInvestmentSecurityCatalog,
  buildInvestmentSecurities,
} from '@/app/config/investmentsPortfolioConfig';
import { deriveProductCategories } from '@/features/products/selectors';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';
import {
  parsePositiveDecimal,
  getInvestmentSellOrderValidation,
} from '@/features/investments/orders/sellOrder';
const products = deriveProductCategories({
  country: 'CZ',
  release: 'release-future-evo-2027',
  resolvedProductCounts: DEFAULT_CZECH_COUNTS,
}).flatMap(category => category.products);
const account = products.find(product => product.type === 'current_account')!;
const security = buildInvestmentSecurityCatalog(
  buildInvestmentSecurities(
    products.filter(product => product.type === 'investment_account'),
    'CZ',
  ),
  'CZ',
).find(item => item.owned && item.status === 'active')!;
test('sell policy refuses overholding units, inactive or unowned securities, and unsupported amount selling', () => {
  const input = {
    security,
    account,
    mode: 'units' as const,
    unitsValue: '1',
    amountValue: '',
  };
  expect(getInvestmentSellOrderValidation(input).canReview).toBe(true);
  expect(
    getInvestmentSellOrderValidation({
      ...input,
      unitsValue: String(security.quantity + 1),
    }).canReview,
  ).toBe(false);
  expect(
    getInvestmentSellOrderValidation({
      ...input,
      security: { ...security, owned: false },
    }).canReview,
  ).toBe(false);
  expect(
    getInvestmentSellOrderValidation({
      ...input,
      security: { ...security, status: 'inactive' },
    }).canReview,
  ).toBe(false);
  expect(
    getInvestmentSellOrderValidation({
      ...input,
      security: { ...security, sellOrderMode: 'units-only' },
      mode: 'amount',
      amountValue: '1',
    }).canReview,
  ).toBe(false);
});
test('CTS limit and comma decimal parsing preserve Source behavior', () => {
  expect(parsePositiveDecimal('1,234567')).toBe(1.234567);
  expect(parsePositiveDecimal('1.2345678')).toBeNull();
  expect(parsePositiveDecimal('-1')).toBeNull();
  const result = getInvestmentSellOrderValidation({
    security: { ...security, sellAmountLimit: 10 },
    account,
    mode: 'amount',
    unitsValue: '',
    amountValue: '11',
  });
  expect(result.amountError).toContain('maximum allowed');
  expect(result.canReview).toBe(false);
});
