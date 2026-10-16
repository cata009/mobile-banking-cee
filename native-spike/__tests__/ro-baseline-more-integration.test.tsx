import type React from 'react';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { CURRENT_PROFILE_ADAPTER } from '../src/experiences/pi/current/profile/adapter';
import More from '../src/experiences/pi/current/profile/More';
import Settings, {
  Language,
} from '../src/experiences/pi/current/profile/Settings';
import Documents from '../src/experiences/pi/current/profile/Documents';
import Messages from '../src/experiences/pi/current/profile/Messages';
import Contacts from '../src/experiences/pi/current/profile/Contacts';
import RoMore from '../src/experiences/pi/current/baseline/more/More';
import RoSettings from '../src/experiences/pi/current/baseline/more/Settings';
import RoLanguage from '../src/experiences/pi/current/baseline/more/Language';
import RoDocuments from '../src/experiences/pi/current/baseline/more/Documents';
import RoMessages from '../src/experiences/pi/current/baseline/more/Messages';
import RoContacts from '../src/experiences/pi/current/baseline/more/Contacts';
it.each([
  ['RO', 'release-current', 'active', true],
  ['CZ', 'release-current', 'active', true],
  ['IT', 'release-current', 'active', false],
  ['RO', 'release-future-evo-2027', 'active', false],
  ['RO', 'release-current', 'inactive', false],
] as const)(
  'isolates More family to %s/%s/%s',
  (country, release, scenario, baseline) => {
    for (const [screen, legacy, modern] of [
      ['profile', More, RoMore],
      ['settings', Settings, RoSettings],
      ['language', Language, RoLanguage],
      ['documents', Documents, RoDocuments],
      ['messages', Messages, RoMessages],
      ['contacts', Contacts, RoContacts],
    ] as const) {
      const host = {
        country,
        release,
        scenario,
        route: { screen },
      } as unknown as CurrentScreenProps;
      const component = CURRENT_PROFILE_ADAPTER.screens[screen]! as (
        props: CurrentScreenProps,
      ) => React.ReactElement<{
        children: React.ReactElement<CurrentScreenProps>;
      }>;
      const element = component(host).props.children;
      expect(element.type).toBe(baseline ? modern : legacy);
      expect(element.props.route).toBe(host.route);
    }
  },
);
