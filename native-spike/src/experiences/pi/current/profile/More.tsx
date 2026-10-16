import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  getMoreCardsForCountry,
  type MoreCardType,
} from '@/app/config/moreCardsConfig';
import { getDocumentsCountForCountry } from '@/app/config/documentsConfig';
import type { CurrentScreenProps } from '../contracts';
import { Copy, Confirm, useCurrentTokens } from './Primitives';
import { useProfileTranslation } from './Host';
import { MoreArtwork } from './MoreArtwork';
import Tutorials from './Tutorials';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { MainNavigationHeader } from '../../../../universal/MainNavigationHeader';
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
export default function More(props: CurrentScreenProps) {
  const t = useProfileTranslation(),
    tokens = useCurrentTokens();
  const [logout, setLogout] = useState(false),
    [tutorialsOpen, setTutorialsOpen] = useState(false),
    [width, setWidth] = useState(375);
  const navigate = (card: MoreCardType) => {
    if (card === 'contacts' || card === 'documents' || card === 'settings')
      props.onNavigate({ screen: card });
    else if (card === 'tutorial') setTutorialsOpen(true);
  };
  return (
    <View
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
      style={[
        styles.page,
        {
          backgroundColor: tokens.background,
        },
      ]}
    >
      <View style={styles.header}>
        <MainNavigationHeader
          tokens={tokens}
          items={[]}
          value="more"
          onChange={() => {}}
          label="More"
          actionsRowHeight={32}
          actionsPaddingHorizontal={0}
          actionsAlignItems="flex-start"
          brand={
            <Copy strong size={28} lineHeight={31}>
              {t('more.title', 'More')}
            </Copy>
          }
          actions={
            <View style={fidelityStyles.s0}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  props.country === 'BA' || props.country === 'BA_BL'
                    ? 'Contact phone'
                    : 'Profile'
                }
                onPress={() => {
                  if (props.country === 'BA' || props.country === 'BA_BL')
                    props.onNavigate({ screen: 'contacts' });
                }}
                style={styles.action}
              >
                <SourceCustomIcon
                  name={
                    props.country === 'BA' || props.country === 'BA_BL'
                      ? 'contact-phone'
                      : 'header-profile'
                  }
                  size={24}
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
                  size={24}
                  color={tokens.text}
                />
              </Pressable>
              {props.country !== 'BA' && props.country !== 'BA_BL' ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Logout"
                  onPress={() => setLogout(true)}
                  style={styles.action}
                >
                  <SourceCustomIcon
                    name="logout"
                    size={24}
                    color={tokens.text}
                  />
                </Pressable>
              ) : null}
            </View>
          }
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
      >
        {getMoreCardsForCountry(props.country).map(card => (
          <Pressable
            key={card}
            testID={`current-more-card-${card}`}
            accessibilityRole="button"
            accessibilityLabel={t(`more.cards.${keys[card]}`)}
            onPress={() => navigate(card)}
            style={[styles.card, { width: (width - 47) / 2 }]}
          >
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient id={`card-${card}`} x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={tokens.background} />
                  <Stop
                    offset="1"
                    stopColor={
                      tokens.text === '#262626' ? '#cccccc' : '#666666'
                    }
                  />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill={`url(#card-${card})`} />
            </Svg>
            <MoreArtwork card={card} cardWidth={(width - 47) / 2} />
            <View style={styles.label}>
              <Copy strong size={18}>
                {t(`more.cards.${keys[card]}`)}
              </Copy>
            </View>
            {card === 'documents' ? (
              <View style={styles.badge}>
                <Copy strong size={14} color="#ffffff">
                  {getDocumentsCountForCountry(props.country)}
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
      {tutorialsOpen ? (
        <Tutorials {...props} onBack={() => setTutorialsOpen(false)} />
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  page: { paddingTop: 54, flex: 1 },
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
