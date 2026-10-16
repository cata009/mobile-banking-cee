import type React from 'react';
import { COUNTRIES } from '@/app/registry/demoConfig';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { CURRENT_HOME_ADAPTER } from '../src/experiences/pi/current/adapter';
import { CURRENT_BANKING_ADAPTER } from '../src/experiences/pi/current/banking/adapter';
import { CURRENT_PROFILE_ADAPTER } from '../src/experiences/pi/current/profile/adapter';
import Home from '../src/experiences/pi/current/Home';
import BaselineHome from '../src/experiences/pi/current/baseline/Home';
import BaselineAccount from '../src/experiences/pi/current/baseline/Account';
import BaselineCard from '../src/experiences/pi/current/baseline/Card';
import BaselineProducts from '../src/experiences/pi/current/baseline/offers/Products';
import BaselineMore from '../src/experiences/pi/current/baseline/more/More';
import BaselineSettings from '../src/experiences/pi/current/baseline/more/Settings';
import BaselineDocuments from '../src/experiences/pi/current/baseline/more/Documents';
import BaselinePfm from '../src/experiences/pi/current/baseline/spending/PfmScreen';
import { RoBaselinePaymentsScreen } from '../src/experiences/pi/current/baseline/payments/hub/Payments';
import BaselinePaymentCreate from '../src/experiences/pi/current/baseline/payments/domestic/RoBaselinePaymentCreateScreen';

type Element = React.ReactElement<{ children?: React.ReactElement }>;
function resolve(renderer: unknown, props: CurrentScreenProps): Element {
  return (renderer as (host: CurrentScreenProps) => Element)(props);
}

describe('real adapters select shared PI Baseline renderers', () => {
  it.each(COUNTRIES.filter(country => country !== 'IT'))(
    'reuses the RO pilot composition for %s',
    country => {
      const host = {
        country,
        release: 'release-current',
        scenario: 'active',
        route: { screen: 'home' },
      } as CurrentScreenProps;
      expect(resolve(Home, host).type).toBe(BaselineHome);
      for (const [screen, renderer] of [
        ['account', BaselineAccount],
        ['card', BaselineCard],
        ['payments', RoBaselinePaymentsScreen],
        ['payment-create', BaselinePaymentCreate],
      ] as const) {
        const owner = { ...host, route: { screen } };
        const selected = resolve(
          CURRENT_BANKING_ADAPTER.screens[screen],
          owner,
        );
        expect(selected.type).toBe(renderer);
        expect(selected.props).toMatchObject(owner);
      }
      expect(resolve(CURRENT_HOME_ADAPTER.screens.products, host).type).toBe(
        BaselineProducts,
      );
      expect(resolve(CURRENT_HOME_ADAPTER.screens.pfm, host).type).toBe(
        BaselinePfm,
      );
      for (const [screen, renderer] of [
        ['profile', BaselineMore],
        ['settings', BaselineSettings],
        ['documents', BaselineDocuments],
      ] as const) {
        const owner = { ...host, route: { screen } };
        const selected = resolve(CURRENT_PROFILE_ADAPTER.screens[screen], owner)
          .props.children!;
        expect(selected.type).toBe(renderer);
        expect(selected.props).toMatchObject(owner);
      }
    },
  );

  it.each([
    ['IT', 'release-current', 'active'],
    ['CZ', 'release-future-evo-2027', 'active'],
    ['RS', 'release-future-rs-my-banker', 'active'],
    ['RO', 'release-current', 'inactive'],
  ] as const)(
    'preserves separate composition for %s/%s/%s',
    (country, release, scenario) => {
      const host = {
        country,
        release,
        scenario,
        route: { screen: 'account' },
      } as CurrentScreenProps;
      expect(resolve(Home, host).type).not.toBe(BaselineHome);
      expect(
        resolve(CURRENT_BANKING_ADAPTER.screens.account, host).type,
      ).not.toBe(BaselineAccount);
      expect(
        resolve(CURRENT_HOME_ADAPTER.screens.products, host).type,
      ).not.toBe(BaselineProducts);
      expect(
        resolve(CURRENT_PROFILE_ADAPTER.screens.profile, host).props.children!
          .type,
      ).not.toBe(BaselineMore);
    },
  );
});
