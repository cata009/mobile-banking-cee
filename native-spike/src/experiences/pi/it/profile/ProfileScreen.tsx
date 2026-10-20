import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { ItalyNativeScreenProps } from '../contracts';
import { initializeProfileComposition } from '@/experiences/pi/it/mobile-first/profileComposition';
import {
  Page,
  ProfileActive,
  ProfileHelp,
  ProfileChrome,
  Copy,
  type Route,
  type ScreenNavigation,
} from './Primitives';
import Hub from './Hub';
import Personal from './Personal';
import Contacts from './Contacts';
import Identity from './Identity';
import Settings from './Settings';
import Documents from './Documents';
import Communications from './Communications';
import Bank from './Bank';
import Support from './Support';
import Branches from './Branches';
import Extras from './Extras';
import Notification from './Notification';

/** Search metadata preserves precise topic identity until its canonical target includes the ID. */
export function initialProfileRoute(
  props: Pick<ItalyNativeScreenProps, 'target' | 'searchEntry'>,
): Route {
  if (props.target.kind !== 'profile') return { area: 'hub' };
  const { area, id } = props.target;
  if (id) return { area, id };
  const entry = props.searchEntry?.id ?? '';
  for (const [prefix, exactArea] of [
    ['profile:setting:', 'settings'],
    ['profile:branch:', 'branches'],
    ['profile:support:', 'support'],
  ] as const)
    if (entry.startsWith(prefix))
      return { area: exactArea, id: entry.slice(prefix.length) };
  return { area };
}
export default function ProfileScreen(props: ItalyNativeScreenProps) {
  const route = initialProfileRoute(props);
  return <ProfileSession key={`${route.area}:${route.id ?? ''}`} {...props} />;
}
function ProfileSession(props: ItalyNativeScreenProps) {
  const [routes, setRoutes] = useState<Route[]>(() => {
    initializeProfileComposition();
    const first = initialProfileRoute(props);
    return first.area === 'hub' ? [first] : [{ area: 'hub' }, first];
  });
  const close = props.onBack;
  const navigate = useCallback(
    (route: Route) => {
      if (route.area === 'investments') {
        props.onNavigate({ kind: 'investments' });
        return;
      }
      if (route.area === 'pfm') {
        props.onNavigate({ kind: 'pfm', tab: 'Bilancio familiare' });
        return;
      }
      if (['accounts', 'cards', 'loans', 'insurance'].includes(route.area)) {
        const category =
          route.area === 'insurance'
            ? 'Polizze assicurative'
            : route.area === 'accounts'
            ? 'Conti'
            : route.area === 'cards'
            ? 'Carte'
            : 'Mutui e Prestiti';
        props.onNavigate({ kind: 'category', category });
        return;
      }
      if (route.area === 'hub') setRoutes([{ area: 'hub' }]);
      else setRoutes(current => [...current, route]);
    },
    [props],
  );
  const back = useCallback(() => {
    if (routes.length > 1) setRoutes(current => current.slice(0, -1));
    else close();
  }, [routes.length, close]);
  return (
    <ProfileChrome.Provider
      value={{
        onChange: props.onChromeChange,
        topInset: props.screenTopInset ?? 0,
      }}
    >
      <ProfileHelp.Provider value={() => navigate({ area: 'support' })}>
        <View style={styles.page}>
          {routes.map((route, index) => {
            const visible = index === routes.length - 1;
            if (!visible) return null;
            const common: ScreenNavigation = {
              route,
              onBack: back,
              onClose:
                initialProfileRoute(props).area === 'hub' &&
                route.area !== 'hub'
                  ? () => navigate({ area: 'hub' })
                  : close,
              onNavigate: navigate,
              onChanged: props.onChanged,
              bankAdvisorKind: props.bankAdvisorKind,
            };
            const Screen =
              route.area === 'hub'
                ? Hub
                : route.area === 'personal'
                ? Personal
                : route.area === 'contacts'
                ? Contacts
                : route.area === 'identity'
                ? Identity
                : route.area === 'settings' || route.area === 'security'
                ? Settings
                : route.area === 'documents'
                ? Documents
                : route.area === 'communications'
                ? Communications
                : route.area === 'bank' || route.area === 'appointments'
                ? Bank
                : route.area === 'support'
                ? Support
                : route.area === 'branches'
                ? Branches
                : route.area === 'notification'
                ? Notification
                : [
                    'persona',
                    'token',
                    'apps',
                    'promotions',
                    'partner',
                  ].includes(route.area)
                ? Extras
                : null;
            return (
              <ProfileActive.Provider
                key={`${index}:${route.area}:${route.id ?? ''}`}
                value={visible && props.isActive !== false}
              >
                <View
                  testID={
                    visible ? 'native-profile-active' : 'native-profile-hidden'
                  }
                  style={[styles.page, !visible && styles.hidden]}
                  accessibilityElementsHidden={!visible}
                  importantForAccessibility={
                    visible ? 'auto' : 'no-hide-descendants'
                  }
                >
                  {Screen ? (
                    <Screen {...common} />
                  ) : (
                    <Page title="Profilo" onBack={back} onClose={close}>
                      <Copy>La sezione selezionata non è disponibile.</Copy>
                    </Page>
                  )}
                </View>
              </ProfileActive.Provider>
            );
          })}
        </View>
      </ProfileHelp.Provider>
    </ProfileChrome.Provider>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1 },
  hidden: { display: 'none' },
});
