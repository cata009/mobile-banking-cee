import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import {
  getMoreCardsForCountry,
  type MoreCardType,
} from '@/app/config/moreCardsConfig';
import { getDocumentsCountForCountry } from '@/app/config/documentsConfig';
import type { CurrentScreenProps } from '../../contracts';
import { BaselineL1Header } from '../../../../../universal/BaselineL1Header';
import {
  BaselineHeaderActionButton,
  BaselineHeaderActionRail,
} from '../../../../../universal/BaselineHeaderActions';
import { sourceColor } from '../../../../../universal/sourceColor';
import { BaselineMoreCard } from '../../../../../universal/BaselineMoreCard';
import Logout from './Logout';
import Tutorials from './Tutorials';

const labels: Record<MoreCardType, { key: string; fallback: string }> = {
  contacts: { key: 'contacts', fallback: 'Contacts' },
  documents: { key: 'documents', fallback: 'Documents' },
  settings: { key: 'settings', fallback: 'Settings' },
  'gdpr-consent': { key: 'gdprConsent', fallback: 'GDPR Consent' },
  'third-party-consent': {
    key: 'thirdPartyConsent',
    fallback: 'Third party consent',
  },
  'digital-activities': {
    key: 'digitalActivities',
    fallback: 'Digital activities',
  },
  'my-requests': { key: 'myRequests', fallback: 'My requests' },
  tutorial: { key: 'tutorial', fallback: 'Tutorials' },
};

/** Source MoreScreen composition. The application host owns the primary navigation. */
export default function More(host: CurrentScreenProps) {
  const [overlay, setOverlay] = useState<'logout' | 'tutorials' | null>(null);
  const [width, setWidth] = useState(375);
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const onPrimaryNavigationChange = host.onPrimaryNavigationChange;
  useEffect(() => {
    onPrimaryNavigationChange?.(overlay !== 'logout');
    return () => onPrimaryNavigationChange?.(true);
  }, [onPrimaryNavigationChange, overlay]);
  useEffect(() => {
    const register = host.onBackHandlerChange;
    register?.(() => {
      if (!overlay) return false;
      setOverlay(null);
      return true;
    });
    return () => register?.(null);
  }, [host.onBackHandlerChange, overlay]);
  const openCard = (card: MoreCardType) => {
    if (card === 'contacts' || card === 'documents' || card === 'settings')
      host.onNavigate({ screen: card });
    else if (card === 'tutorial') setOverlay('tutorials');
  };
  return (
    <View
      style={[
        s.root,
        Platform.OS === 'web' && s.webRoot,
        { backgroundColor: host.tokens.background },
      ]}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
    >
      <View testID="ro-more-top-reserve" style={s.topReserve} />
      <NativeMoreHeader host={host} onLogout={() => setOverlay('logout')} />
      <ScrollView
        style={[s.scroll, Platform.OS === 'web' && s.webScroll]}
        contentContainerStyle={s.grid}
        showsVerticalScrollIndicator={false}
      >
        {getMoreCardsForCountry(host.country).map(card => (
          <RoMoreCard
            key={card}
            card={card}
            title={host.t(
              `more.cards.${labels[card].key}`,
              labels[card].fallback,
            )}
            width={(width - 47) / 2}
            dark={dark}
            badgeCount={
              card === 'documents'
                ? getDocumentsCountForCountry(host.country)
                : undefined
            }
            onPress={() => openCard(card)}
          />
        ))}
      </ScrollView>
      {overlay === 'logout' && (
        <Logout
          host={host}
          onClose={() => setOverlay(null)}
          onConfirm={() => host.onNavigate({ screen: 'prelogin' })}
        />
      )}
      {overlay === 'tutorials' && (
        <Tutorials host={host} onClose={() => setOverlay(null)} />
      )}
    </View>
  );
}

/** Shared Native header composition for the customer More screen and isolated previews. */
export function NativeMoreHeader({
  host,
  onLogout,
  actionVariant = 'country',
  messageCount = 0,
}: {
  host: CurrentScreenProps;
  onLogout?: () => void;
  actionVariant?: 'default' | 'country';
  messageCount?: number;
}) {
  const usesBosniaHeaderActions =
    actionVariant === 'country' &&
    (host.country === 'BA' || host.country === 'BA_BL');
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  return (
    <BaselineL1Header
      variant="more"
      title={host.t('more.title', 'More')}
      dark={dark}
      actions={
        <BaselineHeaderActionRail>
          {usesBosniaHeaderActions ? (
            <BaselineHeaderActionButton
              icon="contact-phone"
              label="Contact phone"
              dark={dark}
              onPress={() => host.onNavigate({ screen: 'contacts' })}
            />
          ) : (
            <BaselineHeaderActionButton
              icon="profile"
              label="Profile"
              dark={dark}
            />
          )}
          <BaselineHeaderActionButton
            icon="messages"
            label="Messages"
            dark={dark}
            badgeCount={messageCount}
            onPress={() => host.onNavigate({ screen: 'messages' })}
          />
          {!usesBosniaHeaderActions && (
            <BaselineHeaderActionButton
              icon="logout"
              label="Logout"
              dark={dark}
              onPress={onLogout}
            />
          )}
        </BaselineHeaderActionRail>
      }
    />
  );
}

/** The shared card contract supplies geometry; retain Source img stretching in RNWeb. */
export function RoMoreCard({
  card,
  title,
  width,
  dark,
  onPress,
  badgeCount,
}: {
  card: MoreCardType;
  title: string;
  width: number;
  dark: boolean;
  onPress: () => void;
  badgeCount?: number;
}) {
  return (
    <BaselineMoreCard
      variant={card}
      title={title}
      width={width}
      dark={dark}
      onPress={onPress}
      badgeCount={badgeCount}
    />
  );
}

const s = StyleSheet.create({
  webRoot: { WebkitFontSmoothing: 'antialiased' } as unknown as ViewStyle,
  root: { flex: 1 },
  topReserve: { height: 54 },
  scroll: { flex: 1 },
  webScroll: { transform: 'none' },
  grid: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 80,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 15,
    rowGap: 16,
  },
});
