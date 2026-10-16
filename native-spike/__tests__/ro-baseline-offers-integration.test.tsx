import type React from 'react';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { CURRENT_HOME_ADAPTER } from '../src/experiences/pi/current/adapter';
import Products from '../src/experiences/pi/current/products/Products';
import Detail from '../src/experiences/pi/current/products/Detail';
import RoProducts from '../src/experiences/pi/current/baseline/offers/Products';
import RoDetail from '../src/experiences/pi/current/baseline/offers/Detail';

it.each([
  ['RO', 'release-current', 'active', true],
  ['CZ', 'release-current', 'active', true],
  ['IT', 'release-current', 'active', false],
  ['RO', 'release-future-evo-2027', 'active', false],
  ['RO', 'release-current', 'inactive', false],
] as const)(
  'isolates Offers and product detail migration to %s/%s/%s',
  (country, release, scenario, baseline) => {
    for (const screen of ['products', 'product-detail'] as const) {
      const host = {
        country,
        release,
        scenario,
        route: {
          screen,
          params: {
            cardId: 'cards',
            optionId: 'virtual-card',
            title: 'Virtual card',
          },
        },
      } as unknown as CurrentScreenProps;
      const renderer = CURRENT_HOME_ADAPTER.screens[screen]!;
      const element = (
        renderer as (
          props: CurrentScreenProps,
        ) => React.ReactElement<CurrentScreenProps>
      )(host);
      expect(element.type).toBe(
        screen === 'products'
          ? baseline
            ? RoProducts
            : Products
          : baseline
          ? RoDetail
          : Detail,
      );
      expect(element.props.route.params).toEqual(host.route.params);
    }
  },
);
