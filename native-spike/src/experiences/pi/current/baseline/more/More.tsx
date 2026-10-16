import React, { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ImageStyle,
  type ViewStyle,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import {
  getMoreCardsForCountry,
  type MoreCardType,
} from '@/app/config/moreCardsConfig';
import { getDocumentsCountForCountry } from '@/app/config/documentsConfig';
import { resolveMoreCard } from '@/app/components/contracts/moreCard';
import type { CurrentScreenProps } from '../../contracts';
import { moreAssets } from '../../profile/assets';
import { BaselineL1Header } from '../../../../../universal/BaselineL1Header';
import {
  BaselineHeaderActionButton,
  BaselineHeaderActionRail,
} from '../../../../../universal/BaselineHeaderActions';
import { sourceColor } from '../../../../../universal/sourceColor';
import { Text } from '../../../../../universal/Typography';
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
      <NativeMoreHeader
        host={host}
        onLogout={() => setOverlay('logout')}
      />
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
  const c = resolveMoreCard({ variant: card, badgeCount });
  const [hovered, setHovered] = useState(false);
  const color = (value: string) => sourceColor(value, dark);
  const gradient = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 120"><defs><linearGradient id="card"><stop offset="0" stop-color="${color(
    'var(--uc-app-bg)',
  )}"/><stop offset="1" stop-color="${color(
    'var(--uc-neutral-400)',
  )}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#card)"/></svg>`;
  const artStyle: ViewStyle = {
    position: 'absolute',
    top: c.image.top,
    right: c.image.right,
    bottom: c.image.bottom,
    left: c.image.left,
    overflow: 'hidden',
  };
  const image = moreAssets[card];
  const imageUri =
    typeof image === 'number'
      ? Image.resolveAssetSource(image)?.uri
      : Array.isArray(image)
      ? image[0]?.uri
      : 'uri' in image
      ? image.uri
      : undefined;
  const cardStyle = {
    width,
    height: c.height,
    borderRadius: c.radius,
    opacity: hovered ? c.hoverOpacity : 1,
  };
  const raster =
    Platform.OS === 'web' ? (
      React.createElement('img', {
        src: imageUri,
        alt: '',
        decoding: 'async',
        loading: 'eager',
        draggable: false,
        style: {
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          maxWidth: 'none',
        },
      })
    ) : (
      <Image
        source={image}
        resizeMode="stretch"
        style={StyleSheet.absoluteFill as ImageStyle}
      />
    );
  return (
    <Pressable
      testID={`ro-more-card-${card}`}
      accessibilityRole="button"
      accessibilityLabel={
        c.badgeText === null ? title : `${title} ${c.badgeText}`
      }
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[s.card, cardStyle]}
    >
      <View style={StyleSheet.absoluteFill}>
        <SvgXml xml={gradient} width={width} height={c.height} />
      </View>
      {card === 'gdpr-consent' && Platform.OS === 'web' ? (
        React.createElement('div', {
          style: {
            ...artStyle,
            backgroundImage: `url('${imageUri}')`,
            backgroundSize: '61.60000091791153px 62.90000093728304px',
            backgroundPosition: 'top left',
          } as React.CSSProperties,
        })
      ) : (
        <View
          pointerEvents="none"
          style={[
            artStyle,
            card === 'third-party-consent' && s.thirdPartyFrame,
          ]}
        >
          {card === 'gdpr-consent' ? (
            Array.from(
              { length: Math.ceil((width * 0.6158) / 61.60000091791153) * 2 },
              (_, index) => {
                const columns = Math.ceil((width * 0.6158) / 61.60000091791153);
                return (
                  <Image
                    key={index}
                    source={image}
                    resizeMode="stretch"
                    style={[
                      s.tile,
                      {
                        left: (index % columns) * 61.60000091791153,
                        top: Math.floor(index / columns) * 62.90000093728304,
                      },
                    ]}
                  />
                );
              },
            )
          ) : card === 'third-party-consent' ? (
            <View
              testID="ro-more-third-party-artwork"
              style={s.thirdPartyArtwork}
            >
              <View style={[StyleSheet.absoluteFill, s.rasterClip]}>
                {raster}
              </View>
            </View>
          ) : (
            raster
          )}
        </View>
      )}
      <View style={s.titleContainer}>
        <Text style={[s.title, { color: color('var(--uc-text)') }]}>
          {title}
        </Text>
      </View>
      {c.badgeText !== null && (
        <View style={s.badge}>
          <View
            style={[
              s.badgeCorner,
              { backgroundColor: color('var(--uc-brand)') },
            ]}
          />
          <View style={s.badgeNumber}>
            <Text
              testID="ro-more-documents-badge"
              style={[s.badgeText, { color: color('var(--uc-static-white)') }]}
            >
              {c.badgeText}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
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
  card: { position: 'relative', overflow: 'hidden' },
  thirdPartyFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  thirdPartyArtwork: {
    width: 151,
    height: 158.373,
    flexShrink: 0,
    transform: [{ rotate: '-156deg' }, { scaleY: -1 }],
  },
  rasterClip: { overflow: 'hidden' },
  titleContainer: {
    position: 'absolute',
    inset: 0,
    padding: 16,
    alignItems: 'flex-start',
  },
  title: { fontFamily: 'UniCredit-bold', fontSize: 18, textAlign: 'left' },
  badge: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 32,
    height: 32,
    zIndex: 20,
  },
  badgeCorner: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 30,
    height: 30,
    borderBottomLeftRadius: 30,
  },
  badgeNumber: { position: 'absolute', right: 7, top: 4 },
  badgeText: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 14,
  },
  tile: {
    position: 'absolute',
    width: 61.60000091791153,
    height: 62.90000093728304,
  },
});
