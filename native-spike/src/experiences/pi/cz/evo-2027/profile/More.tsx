import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  getMoreCardsForCountry,
  type MoreCardType,
} from '@/app/config/moreCardsConfig';
import { getDocumentsCountForCountry } from '@/app/config/documentsConfig';
import type { CzechNativeScreenProps } from '../contracts';
import { Copy, Confirm, useCurrentTokens } from './Primitives';
import { useCzechTranslation } from './features/preferences';
import { moreAssets } from './assets';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { MainNavigationHeader } from '../../../../../universal/MainNavigationHeader';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
const keys: Record<MoreCardType, string> = {
  contacts: 'contacts',
  documents: 'documents',
  settings: 'settings',
  'gdpr-consent': 'gdprConsent',
  'third-party-consent': 'thirdPartyConsent',
  'digital-activities': 'digitalActivities',
  'my-requests': 'myRequests',
  tutorial: 'tutorial',
};
export default function More(props: CzechNativeScreenProps) {
  const t = useCzechTranslation(),
    tokens = useCurrentTokens();
  const [logout, setLogout] = useState(false),
    [width, setWidth] = useState(375);
  const navigate = (card: MoreCardType) => {
    if (card === 'contacts' || card === 'documents' || card === 'settings')
      props.onNavigate({ screen: card });
    else if (card === 'tutorial')
      props.onNavigate({ screen: 'support', params: { area: 'tutorials' } });
  };
  return (
    <View
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      style={[
        styles.page,
        {
          backgroundColor: tokens.surface,
          paddingTop: props.screenTopInset ?? 0,
        },
      ]}
    >
      <View style={styles.header}>
        <MainNavigationHeader
          tokens={{ ...tokens, background: tokens.surface }}
          items={[]}
          value="more"
          onChange={() => {}}
          label="More"
          actionsRowHeight={32}
          actionsPaddingHorizontal={0}
          brand={
            <Copy strong size={28}>
              {t('more.title', 'More')}
            </Copy>
          }
          actions={
            <View style={fidelityStyles.s0}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Profile"
                onPress={() => {}}
                style={styles.action}
              >
                <SourceCustomIcon
                  name="header-profile"
                  size={20}
                  color={tokens.text}
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Messages"
                onPress={() => props.onNavigate({ screen: 'messages' })}
                style={styles.action}
              >
                <SourceCustomIcon
                  name="header-messages"
                  size={20}
                  color={tokens.text}
                />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Logout"
                onPress={() => setLogout(true)}
                style={styles.action}
              >
                <SourceCustomIcon name="logout" size={20} color={tokens.text} />
              </Pressable>
            </View>
          }
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      >
        {getMoreCardsForCountry('CZ').map(card => (
          <Pressable
            key={card}
            testID={`cz-more-card-${card}`}
            accessibilityRole="button"
            accessibilityLabel={t(`more.cards.${keys[card]}`)}
            onPress={() => navigate(card)}
            style={[styles.card, { width: (width - 47) / 2 }]}
          >
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id={`card-${card}`} x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={tokens.surface} />
                  <Stop
                    offset="1"
                    stopColor={
                      tokens.text === '#262626' ? '#cccccc' : '#454545'
                    }
                  />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill={`url(#card-${card})`} />
            </Svg>
            <Image
              source={moreAssets[card]}
              style={styles.art}
              resizeMode="contain"
            />
            <View style={styles.label}>
              <Copy strong size={18}>
                {t(`more.cards.${keys[card]}`)}
              </Copy>
            </View>
            {card === 'documents' ? (
              <View style={styles.badge}>
                <Copy strong size={14} color="#ffffff">
                  {getDocumentsCountForCountry('CZ')}
                </Copy>
              </View>
            ) : null}
          </Pressable>
        ))}
      </ScrollView>
      {logout ? (
        <Confirm
          title={t(
            'runtime.dialogs.logoutMessage',
            'Are you sure you want to leave Mobile Banking?',
          )}
          onCancel={() => setLogout(false)}
          onConfirm={() => {
            setLogout(false);
            props.onNavigate({ screen: 'login' });
          }}
          confirmLabel={t('runtime.actions.okGotIt', 'OK')}
          cancelLabel={t('runtime.dialogs.cancel', 'Cancel')}
        />
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1 },
  grow: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 24 },
  action: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 15,
    rowGap: 16,
  },
  card: {
    height: 120,
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#e5e5e5',
  },
  art: { position: 'absolute', bottom: 0, right: 0, width: '45%', height: 54 },
  label: { padding: 16 },
  badge: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 30,
    height: 30,
    borderBottomLeftRadius: 30,
    backgroundColor: '#e2001a',
    paddingTop: 4,
    paddingLeft: 15,
  },
});

const fidelityStyles = StyleSheet.create({
  s0: { flexDirection: 'row', gap: 8 },
});
