import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';

const countries = ['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'] as const;
const releases = [
  'release-current',
  'release-v1',
  'release-v2',
  'release-v3',
  'release-v4',
] as const;
const contexts = countries.flatMap(country =>
  releases.map(release => [country, release] as const),
);

describe('baseline investment account choices match the reference portfolio', () => {
  it.each(contexts)(
    'uses active security accounts in Source order for %s at %s',
    (country, release) => {
      const snapshot = createCurrentInvestmentSnapshot({
        country,
        release,
        productCounts: { ...DEFAULT_VISIBLE_PRODUCT_OVERRIDES },
      });
      const expected = new Map();
      snapshot.securities
        .filter(security => security.status === 'active')
        .forEach(security => {
          expected.set(security.securityAccountId, {
            id: security.securityAccountId,
            name: security.securityAccountName,
            currency: security.securityAccountCurrency,
          });
        });
      expect(snapshot).toHaveProperty('securityAccounts', [
        ...expected.values(),
      ]);
      expect(
        snapshot.accounts.every(account => account.type === 'current_account'),
      ).toBe(true);
    },
  );
});
