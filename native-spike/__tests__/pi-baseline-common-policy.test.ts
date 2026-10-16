import { COUNTRIES } from '@/app/registry/demoConfig';
import {
  PI_BASELINE_COUNTRIES,
  isPiBaselineContext,
} from '../src/experiences/pi/current/baseline/policy';

describe('common PI current baseline eligibility', () => {
  it('uses the canonical CEE countries, keeping Italy Mobile First separate', () => {
    expect(PI_BASELINE_COUNTRIES).toEqual(
      COUNTRIES.filter(country => country !== 'IT'),
    );
    expect(PI_BASELINE_COUNTRIES).toEqual([
      'RO',
      'CZ',
      'SK',
      'HU',
      'RS',
      'BA',
      'BA_BL',
      'SI',
    ]);
  });

  it.each(COUNTRIES)(
    'selects only the active current baseline for %s',
    country => {
      expect(
        isPiBaselineContext({
          country,
          release: 'release-current',
          scenario: 'active',
        }),
      ).toBe(country !== 'IT');
      expect(
        isPiBaselineContext({
          country,
          release: 'release-current',
          scenario: 'inactive',
        }),
      ).toBe(false);
      expect(
        isPiBaselineContext({
          country,
          release: 'release-future-evo-2027',
          scenario: 'active',
        }),
      ).toBe(false);
      expect(
        isPiBaselineContext({
          country,
          release: 'release-future-cz-robo',
          scenario: 'active',
        }),
      ).toBe(false);
    },
  );
});
