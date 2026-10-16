import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import type { CurrentScreenProps } from '../../contracts';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import { RasterImage } from '../offers/RasterImage';
import { advisorPhoto } from '../../profile/assets';
import PrimeBrand from './PrimeBrand';
import PrimeBackground from './PrimeBackground';
import PrimeContact, { type MailPreferences } from './PrimeContact';

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
    /* Source default for unavailable demo storage. */
  }
  return { askEveryTime: true, preferredApp: null };
}

/** Source PrimeScreen uses one scrolling title, a pinned dark toolbar and local contact overlays. */
export default function Advisor(host: CurrentScreenProps) {
  const [tab, setTab] = useState<'advisor' | 'benefits'>('advisor');
  const [progress, setProgress] = useState(0);
  const [action, setAction] = useState<'call' | 'email' | null>(null);
  const [preferences, setPreferences] = useState(loadPreferences);
  const dark = host.tokens.background === '#121212';
  const t = host.t;
  const text = (key: string) => t(`prime.advisor.${key}`);
  const sourceOutline =
    Platform.OS === 'web'
      ? ({
          outlineColor: `color-mix(in oklab, ${host.tokens.accent} 50%, transparent)`,
          color: host.tokens.text,
        } as unknown as import('react-native').ViewStyle)
      : undefined;
  useEffect(() => {
    const register = host.onBackHandlerChange;
    register?.(() => {
      if (action === null) return false;
      setAction(null);
      return true;
    });
    return () => register?.(null);
  }, [host.onBackHandlerChange, action]);
  const save = (value: MailPreferences) => {
    setPreferences(value);
    try {
      globalThis.localStorage?.setItem(preferenceKey, JSON.stringify(value));
    } catch {
      /* Source session fallback. */
    }
  };
  const tile = (key: string, icon: string, onPress: () => void) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={text(key)}
      onPress={onPress}
      style={[styles.tile, sourceOutline]}
    >
      <View style={styles.centerIcon}>
        <SourceCustomIcon name={icon} size={20} color="white" />
      </View>
      <Text style={styles.tileLabel}>{text(key)}</Text>
    </Pressable>
  );
  return (
    <View style={styles.root}>
      <PrimeBackground host={host} />
      <ScrollView
        stickyHeaderIndices={[0]}
        style={Platform.OS === 'web' ? styles.webScroll : undefined}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={event =>
          setProgress(
            Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 48)),
          )
        }
      >
        <View
          style={
            Platform.OS === 'web' && progress > 0
              ? styles.headerBlur
              : undefined
          }
        >
          <BaselinePageHeader
            title={t('prime.pageTitle')}
            onBack={host.onBack}
            variant="dark"
            includeSafeArea
            safeAreaReserve={host.screenTopInset}
            showHelp={false}
            renderLargeTitle={false}
            collapsedTitleProgress={progress}
            dark={dark}
          />
        </View>
        <View style={[styles.largeTitle, { opacity: 1 - progress }]}>
          <Text
            accessibilityRole="header"
            numberOfLines={2}
            style={styles.largeTitleText}
          >
            {t('prime.pageTitle')}
          </Text>
        </View>
        <View style={styles.tabs}>
          {(['advisor', 'benefits'] as const).map(value => {
            const label = t(
              value === 'advisor'
                ? 'prime.tabYourAdvisor'
                : 'prime.tabYourBenefits',
            );
            const selected = value === tab;
            const labelStyle = {
              color: selected ? host.tokens.text : '#ffffff',
            };
            return (
              <Pressable
                key={value}
                accessibilityRole="tab"
                accessibilityLabel={label}
                accessibilityState={{ selected }}
                onPress={() => setTab(value)}
                style={[
                  styles.tab,
                  selected
                    ? {
                        backgroundColor: sourceColor('var(--uc-surface)', dark),
                      }
                    : styles.inactiveTab,
                ]}
              >
                <Text style={[styles.tabLabel, labelStyle]}>
                  {label.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.body}>
          {tab === 'advisor' ? (
            <>
              <Text style={styles.intro}>{text('introText')}</Text>
              <View style={styles.card}>
                <View style={styles.advisorHeader}>
                  <RasterImage
                    source={advisorPhoto}
                    accessibilityLabel={text('name')}
                    style={styles.photo}
                  />
                  <View style={styles.nameColumn}>
                    <Text style={styles.strong}>{text('yourAdvisor')}</Text>
                    <Text style={styles.copy}>{text('name')}</Text>
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
                      <Text style={styles.strong}>{text(key)}</Text>
                      <Text style={styles.copy}>
                        {text(
                          ['phone', 'emailAddress', 'branch', 'address'][
                            index
                          ]!,
                        )}
                      </Text>
                    </View>
                    {key === 'branchAddress' && (
                      <Pressable
                        onPress={() => {}}
                        style={styles.directionIcon}
                      >
                        <SourceCustomIcon
                          name="prime-direction"
                          size={20}
                          color="white"
                        />
                      </Pressable>
                    )}
                  </View>
                ))}
                <View style={styles.tileRow}>
                  {tile('callNow', 'contact-phone', () => setAction('call'))}
                  {tile('sendEmail', 'prime-email', () => setAction('email'))}
                </View>
                <View style={styles.tileRow}>
                  {tile('bookAppointment', 'prime-book-appointment', () =>
                    host.onNavigate({ screen: 'appointments' }),
                  )}
                  {tile('requestCall', 'prime-request-call', () =>
                    host.onNavigate({ screen: 'call-request' }),
                  )}
                </View>
                <Text style={styles.availability}>{text('availability')}</Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.benefitsHeading}>
                {t('prime.benefits.pageTitle')}
              </Text>
              <Text style={styles.intro}>{t('prime.benefits.introText')}</Text>
              <View style={styles.card}>
                {[1, 2, 3, 4].map(index => (
                  <Pressable
                    key={index}
                    accessibilityRole="button"
                    onPress={() => {}}
                    style={styles.benefit}
                  >
                    <View style={styles.benefitIcon}>
                      <SourceCustomIcon
                        name="prime-check"
                        size={20}
                        color="white"
                      />
                    </View>
                    <View style={styles.benefitCopy}>
                      <Text style={styles.strong}>
                        {t(`prime.benefits.benefit${index}Title`)}
                      </Text>
                      <Text style={styles.copy}>
                        {t(`prime.benefits.benefit${index}Description`)}
                      </Text>
                    </View>
                    <View style={styles.centerIcon}>
                      <SourceCustomIcon
                        name="chevron-link"
                        size={32}
                        color="white"
                      />
                    </View>
                  </Pressable>
                ))}
              </View>
              <Pressable
                testID="ro-prime-terms"
                accessibilityRole="button"
                onPress={() => {}}
                style={styles.terms}
              >
                <Text style={styles.tabLabel}>
                  {t('prime.benefits.termsConditions').toUpperCase()}
                </Text>
              </Pressable>
            </>
          )}
          <PrimeBrand />
        </View>
      </ScrollView>
      {action && (
        <PrimeContact
          key={action}
          host={host}
          action={action}
          preferences={preferences}
          onPreferences={save}
          onClose={() => setAction(null)}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  headerBlur: {
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  } as unknown as import('react-native').ViewStyle,
  root: {
    flex: 1,
    ...(Platform.OS === 'web'
      ? ({
          transform: 'translateZ(0)',
          // Keep contact shadows in the same phone-sized paint surface as Source.
          overflow: 'hidden',
          textRendering: 'optimizeLegibility',
          fontSynthesis: 'none',
          WebkitFontSmoothing: 'antialiased',
        } as object)
      : {}),
  },
  webScroll: { transform: 'none', zIndex: 10 },
  scrollContent: { paddingBottom: 24 },
  largeTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  largeTitleText: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    color: '#ffffff',
    flexShrink: 1,
  },
  tabs: {
    marginTop: 24,
    paddingHorizontal: 24,
    gap: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 4 },
  inactiveTab: { borderWidth: 1, borderColor: '#ffffff' },
  tabLabel: { fontFamily: 'UniCredit-bold', fontSize: 14, color: '#ffffff' },
  body: {
    ...(Platform.OS === 'web'
      ? ({ zIndex: 'auto' } as unknown as import('react-native').ViewStyle)
      : {}),
    marginTop: 24,
    paddingHorizontal: 24,
    gap: 24,
  },
  intro: { fontFamily: 'UniCredit-regular', fontSize: 18, color: '#ffffff' },
  card: {
    ...(Platform.OS === 'web'
      ? ({ zIndex: 'auto' } as unknown as import('react-native').ViewStyle)
      : {}),
    padding: 16,
    borderRadius: 16,
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    ...(Platform.OS === 'web'
      ? ({
          background: 'color-mix(in srgb, #ffffff 10%, transparent)',
        } as unknown as import('react-native').ViewStyle)
      : {}),
  },
  advisorHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  photo: { width: 64, height: 64, borderRadius: 100 },
  nameColumn: { flex: 1, gap: 4, minWidth: 0 },
  strong: { fontFamily: 'UniCredit-bold', fontSize: 16, color: '#ffffff' },
  copy: { fontFamily: 'UniCredit-regular', fontSize: 16, color: '#ffffff' },
  pairRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  pair: { flex: 1, gap: 4, paddingVertical: 8, minWidth: 0 },
  directionIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  centerIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  tile: {
    flex: 1,
    height: 124,
    minHeight: 124,
    minWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 4,
    paddingVertical: 24,
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    ...(Platform.OS === 'web'
      ? ({
          background: 'color-mix(in srgb, #ffffff 10%, transparent)',
        } as unknown as import('react-native').ViewStyle)
      : {}),
  },
  tileLabel: {
    flex: 1,
    minHeight: 1,
    maxWidth: 79,
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  availability: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  benefitsHeading: {
    fontFamily: 'UniCredit-bold',
    fontSize: 24,
    color: '#ffffff',
  },
  benefit: {
    width: '100%',
    height: 80,
    paddingVertical: 24,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  benefitIcon: { width: 32, height: 32 },
  benefitCopy: { flex: 1, gap: 4, minWidth: 0 },
  terms: { paddingHorizontal: 24, paddingVertical: 8, alignItems: 'center' },
});
