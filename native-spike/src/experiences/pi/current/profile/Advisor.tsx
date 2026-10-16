import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { CurrentScreenProps } from '../contracts';
import { Header } from '../../../../universal/controls';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import {
  Copy,
  useCurrentTokens,
  useLocalBack,
  useSourceColors,
} from './Primitives';
import { advisorPhoto } from './assets';
import { useProfileTranslation } from './Host';
import PrimeContact, { type MailPreferences } from './PrimeContact';
import PrimeBackground from './PrimeBackground';
import PrimeBrand from './PrimeBrand';
const preferenceKey = 'uc-prime-mail-preferences-v1';
function loadPreferences(): MailPreferences {
  try {
    const raw: unknown = JSON.parse(
      globalThis.localStorage?.getItem(preferenceKey) ?? 'null',
    );
    if (raw && typeof raw === 'object') {
      const value = raw as Record<string, unknown>;
      return {
        askEveryTime:
          typeof value.askEveryTime === 'boolean' ? value.askEveryTime : true,
        preferredApp:
          value.preferredApp === 'gmail' || value.preferredApp === 'mail'
            ? value.preferredApp
            : null,
      };
    }
  } catch {
    /* Source defaults. */
  }
  return { askEveryTime: true, preferredApp: null };
}
export default function Advisor(host: CurrentScreenProps) {
  const t = useProfileTranslation(),
    tokens = useCurrentTokens(),
    color = useSourceColors();
  const [tab, setTab] = useState<'advisor' | 'benefits'>('advisor'),
    [action, setAction] = useState<'call' | 'email' | null>(null),
    [preferences, setPreferences] = useState(loadPreferences),
    [progress, setProgress] = useState(0);
  useLocalBack(host.onBack, host.isActive && action === null);
  const save = (value: MailPreferences) => {
    setPreferences(value);
    try {
      globalThis.localStorage?.setItem(preferenceKey, JSON.stringify(value));
    } catch {
      /* Source session fallback. */
    }
  };
  const text = (key: string, fallback?: string) =>
    t(`prime.advisor.${key}`, fallback);
  const name = text('name', 'David Novak');
  const actionTile = (key: string, icon: string, onPress: () => void) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={text(key)}
      onPress={onPress}
      style={styles.tile}
    >
      <View style={styles.iconSlot}>
        <SourceCustomIcon name={icon} size={24} color="white" />
      </View>
      <View style={styles.tileLabel}>
        <Copy
          strong
          size={14}
          lineHeight={15.5}
          color="white"
          textAlign="center"
        >
          {text(key)}
        </Copy>
      </View>
    </Pressable>
  );
  return (
    <View style={styles.page}>
      <PrimeBackground />
      <View style={{ paddingTop: host.screenTopInset }}>
        <Header
          tokens={{ ...tokens, background: 'transparent', text: 'white' }}
          variant="current"
          title={t('prime.pageTitle')}
          collapsedTitleProgress={progress}
          collapsedTitleOpacity={progress}
          renderLargeTitle={false}
          onBack={host.onBack}
          backIcon={
            <SourceCustomIcon name="back-heavy" size={24} color="white" />
          }
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        onScroll={event =>
          setProgress(
            Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 48)),
          )
        }
        scrollEventThrottle={16}
      >
        <View style={[styles.title, { opacity: 1 - progress }]}>
          <Copy strong size={28} lineHeight={31} color="white">
            {t('prime.pageTitle')}
          </Copy>
        </View>
        <View style={styles.tabs}>
          {(['advisor', 'benefits'] as const).map(value => (
            <Pressable
              key={value}
              accessibilityRole="tab"
              accessibilityLabel={t(
                value === 'advisor'
                  ? 'prime.tabYourAdvisor'
                  : 'prime.tabYourBenefits',
              )}
              accessibilityState={{ selected: tab === value }}
              onPress={() => setTab(value)}
              style={[
                styles.tab,
                tab === value ? styles.activeTab : styles.inactiveTab,
                {
                  backgroundColor:
                    tab === value ? color('--uc-surface') : undefined,
                },
              ]}
            >
              <Copy
                strong
                size={14}
                lineHeight={15.5}
                color={tab === value ? color('--uc-text') : 'white'}
              >
                {t(
                  value === 'advisor'
                    ? 'prime.tabYourAdvisor'
                    : 'prime.tabYourBenefits',
                ).toUpperCase()}
              </Copy>
            </Pressable>
          ))}
        </View>
        <View style={styles.body}>
          {tab === 'advisor' ? (
            <>
              <Copy size={18} lineHeight={20} color="white">
                {text('introText')}
              </Copy>
              <View testID="source-prime-advisor-card" style={styles.card}>
                <View style={styles.advisorHeader}>
                  <Image
                    accessibilityLabel={name}
                    source={advisorPhoto}
                    style={styles.photo}
                  />
                  <View style={styles.nameColumn}>
                    <Copy strong color="white" lineHeight={17.5}>
                      {text('yourAdvisor')}
                    </Copy>
                    <Copy color="white" lineHeight={17.5}>
                      {name}
                    </Copy>
                  </View>
                </View>
                {(
                  [
                    'phoneNumber',
                    'email',
                    'branchName',
                    'branchAddress',
                  ] as const
                ).map((key, index) => (
                  <View key={key} style={styles.pairRow}>
                    <View style={styles.pair}>
                      <Copy strong color="white" lineHeight={17.5}>
                        {text(key)}
                      </Copy>
                      <Copy color="white" lineHeight={17.5}>
                        {text(
                          ['phone', 'emailAddress', 'branch', 'address'][index],
                        )}
                      </Copy>
                    </View>
                    {key === 'branchAddress' ? (
                      <Pressable style={styles.iconSlot}>
                        <SourceCustomIcon
                          name="prime-direction"
                          size={24}
                          color="white"
                        />
                      </Pressable>
                    ) : null}
                  </View>
                ))}
                <View style={styles.tileRow}>
                  {actionTile('callNow', 'contact-phone', () =>
                    setAction('call'),
                  )}
                  {actionTile('sendEmail', 'prime-email', () =>
                    setAction('email'),
                  )}
                </View>
                <View style={styles.tileRow}>
                  {actionTile('bookAppointment', 'prime-book-appointment', () =>
                    host.onNavigate({ screen: 'appointments' }),
                  )}
                  {actionTile('requestCall', 'prime-request-call', () =>
                    host.onNavigate({ screen: 'call-request' }),
                  )}
                </View>
                <View style={styles.availability}>
                  <Copy size={14} lineHeight={15.5} color="white">
                    {text('availability')}
                  </Copy>
                </View>
              </View>
            </>
          ) : (
            <>
              <Copy strong size={24} lineHeight={26.5} color="white">
                {t('prime.benefits.pageTitle')}
              </Copy>
              <Copy size={18} lineHeight={20} color="white">
                {t('prime.benefits.introText')}
              </Copy>
              <View style={styles.card}>
                {[1, 2, 3, 4].map(index => (
                  <Pressable key={index} style={styles.benefit}>
                    <View style={styles.iconSlot}>
                      <SourceCustomIcon
                        name="prime-check"
                        size={24}
                        color="white"
                      />
                    </View>
                    <View style={styles.pair}>
                      <Copy strong color="white" lineHeight={17.5}>
                        {t(`prime.benefits.benefit${index}Title`)}
                      </Copy>
                      <Copy color="white" lineHeight={17.5}>
                        {t(`prime.benefits.benefit${index}Description`)}
                      </Copy>
                    </View>
                    <View style={styles.iconSlot}>
                      <SourceCustomIcon
                        name="chevron-link"
                        size={24}
                        color="white"
                      />
                    </View>
                  </Pressable>
                ))}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('prime.benefits.termsConditions')}
                style={styles.terms}
              >
                <Copy strong size={14} lineHeight={15.5} color="white">
                  {t('prime.benefits.termsConditions').toUpperCase()}
                </Copy>
              </Pressable>
            </>
          )}
          <PrimeBrand />
        </View>
      </ScrollView>
      {action ? (
        <PrimeContact
          key={action}
          host={host}
          action={action}
          preferences={preferences}
          onPreferences={save}
          onClose={() => setAction(null)}
        />
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: 'black' },
  scroll: { paddingBottom: 24 },
  title: { paddingHorizontal: 16, paddingVertical: 8 },
  tabs: {
    paddingHorizontal: 24,
    marginTop: 24,
    gap: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activeTab: { borderWidth: 0 },
  inactiveTab: { borderWidth: 1, backgroundColor: 'transparent' },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderColor: 'white',
  },
  body: { marginTop: 24, paddingHorizontal: 24, gap: 24 },
  card: {
    padding: 16,
    borderRadius: 16,
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  advisorHeader: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  photo: { width: 64, height: 64, borderRadius: 32 },
  nameColumn: { flex: 1, gap: 4, justifyContent: 'center' },
  pairRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  pair: { flex: 1, gap: 4, paddingVertical: 8 },
  iconSlot: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  tile: {
    flex: 1,
    minHeight: 124,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 4,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  tileLabel: { maxWidth: 79, minHeight: 28, alignItems: 'center' },
  availability: { alignItems: 'center' },
  benefit: {
    minHeight: 80,
    paddingVertical: 24,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  terms: { paddingHorizontal: 24, paddingVertical: 8, alignItems: 'center' },
});
