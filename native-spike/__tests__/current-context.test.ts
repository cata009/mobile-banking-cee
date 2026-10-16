import {
  createCurrentProducts,
  createCurrentTranslator,
  currentFeature,
} from '../src/experiences/pi/current/context';
import { deriveProductCategories } from '@/features/products/selectors';
import { createProductFormatters } from '@/features/products/formatters';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';

test.each(['RO', 'CZ', 'SK', 'HU', 'RS', 'BA', 'BA_BL', 'SI'] as const)(
  'baseline %s uses its canonical country products and totals without Evo fixtures',
  country => {
    const context = {
      country,
      release: 'release-current' as const,
      productCounts: DEFAULT_CZECH_COUNTS,
    };
    const expected = deriveProductCategories({
      country,
      release: context.release,
      resolvedProductCounts: context.productCounts,
    });
    const actual = createCurrentProducts(context);
    expect(actual.categories).toEqual(expected);
    expect(actual.calculateTotalAvailable()).toEqual(
      createProductFormatters(
        expected,
        country,
        context.release,
      ).calculateTotalAvailable(),
    );
    expect(
      actual.products.find(p => p.type === 'current_account')?.accountNumber,
    ).toMatch(new RegExp(`^${country === 'BA_BL' ? 'BA' : country}`));
  },
);
test('zero counts remain zero and do not substitute default products', () => {
  const products = createCurrentProducts({
    country: 'RO',
    release: 'release-current',
    productCounts: Object.fromEntries(
      Object.keys(DEFAULT_CZECH_COUNTS).map(key => [key, 0]),
    ) as typeof DEFAULT_CZECH_COUNTS,
  });
  expect(products.products).toEqual([]);
});
test('translations and release features use selected country and actual release axes', () => {
  expect(createCurrentTranslator('RO', 'ro')('navigation.home')).not.toBe(
    createCurrentTranslator('CZ', 'cs')('navigation.home'),
  );
  expect(
    currentFeature(
      { country: 'RO', release: 'release-current', scenario: 'active' },
      'fx_cardsRedesign',
    ),
  ).toBe(false);
  expect(
    currentFeature(
      { country: 'RO', release: 'release-v2', scenario: 'active' },
      'fx_cardsRedesign',
    ),
  ).toBe(true);
  expect(
    currentFeature(
      { country: 'HU', release: 'release-v2', scenario: 'active' },
      'fx_cardsRedesign',
    ),
  ).toBe(false);
  expect(
    currentFeature(
      { country: 'RO', release: 'release-v2', scenario: 'inactive' },
      'fx_cardsRedesign',
    ),
  ).toBe(false);
});
