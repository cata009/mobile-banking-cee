import React, { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ImageSourcePropType,
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
import {
  primeContactScreen,
  type PrimeReferenceScreen,
} from '@/features/prime/reference';
import { PrimeEntryButton } from '../../../../../app/PrimeEntryButton';
import type { PrimeBenefitsCopy } from '@/features/prime/content';
import {
  DuoColumns,
  DuoPane,
  DuoOnlyView,
  useDuoPreview,
  useDuoWide,
} from '../../../../../universal/DuoPreview';

export interface PrimeReferenceControl {
  screen: PrimeReferenceScreen;
  navigate: (screen: PrimeReferenceScreen) => void;
  title?: string;
  background?: React.ReactNode;
  advisor?: { name: string; email: string; photo: ImageSourcePropType };
  standardActive?: boolean;
  hideBrand?: boolean;
  benefitsCopy?: PrimeBenefitsCopy;
}

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
export default function Advisor(
  host: CurrentScreenProps & { reference?: PrimeReferenceControl },
) {
  const duo = useDuoPreview();
  const wide = useDuoWide();
  const reference = host.reference;
  const standardActive = reference?.standardActive === true;
  const [localTab, setLocalTab] = useState<'advisor' | 'benefits'>('advisor');
  const tab = standardActive
    ? 'advisor'
    : reference
      ? reference.screen === 'prime-benefits'
        ? 'benefits'
        : 'advisor'
      : localTab;
  const setTab = (value: 'advisor' | 'benefits') => {
    if (reference)
      reference.navigate(
        value === 'advisor' ? 'prime-advisor' : 'prime-benefits',
      );
    else setLocalTab(value);
  };
  const [progress, setProgress] = useState(0);
  const [localAction, setLocalAction] = useState<'call' | 'email' | null>(null);
  const [preferences, setPreferences] = useState<MailPreferences>(() =>
    reference ? { askEveryTime: true, preferredApp: null } : loadPreferences(),
  );
  const contact = reference ? primeContactScreen(reference.screen) : null;
  const action = reference
    ? contact?.startsWith('call')
      ? 'call'
      : contact
        ? 'email'
        : null
    : localAction;
  const setAction = useCallback(
    (value: 'call' | 'email' | null) => {
      if (!reference) {
        setLocalAction(value);
        return;
      }
      reference.navigate(
        value === 'call'
          ? 'prime-call-confirm'
          : value === 'email'
            ? !preferences.askEveryTime && preferences.preferredApp
              ? 'prime-email-compose'
              : 'prime-email-chooser'
            : 'prime-advisor',
      );
    },
    [reference, preferences.askEveryTime, preferences.preferredApp],
  );
  const dark = host.tokens.background === '#121212';
  const t = host.t;
  const text = (key: string) =>
    key === 'name' && reference?.advisor
      ? reference.advisor.name
      : key === 'emailAddress' && reference?.advisor
        ? reference.advisor.email
        : t(`prime.advisor.${key}`);
  const title =
    reference?.title ?? (standardActive ? 'My advisor' : t('prime.pageTitle'));
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
  }, [host.onBackHandlerChange, action, setAction]);
  const save = (value: MailPreferences) => {
    setPreferences(value);
    if (reference) return;
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
      style={[
        styles.tile,
        standardActive && styles.standardTile,
        sourceOutline,
      ]}
    >
      <View style={styles.centerIcon}>
        <SourceCustomIcon name={icon} size={20} color="white" />
      </View>
      <Text style={styles.tileLabel}>{text(key)}</Text>
    </Pressable>
  );
  return (
    <View style={styles.root}>
      {duo ? null : (reference?.background ?? <PrimeBackground host={host} />)}
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
            title={title}
            onBack={host.onBack}
            variant="dark"
            includeSafeArea
            safeAreaReserve={host.screenTopInset}
            showHelp={false}
            renderLargeTitle={false}
            collapsedTitleProgress={progress}
            hideCollapsedTitleWhenHidden={standardActive || undefined}
            dark={dark}
          />
          {standardActive && (
            <View
              style={[styles.standardUpgrade, { top: host.screenTopInset + 8 }]}
            >
              <PrimeEntryButton
                upgrade
                variant="overlay"
                onPress={() => reference?.navigate('prime-upgrade')}
              />
            </View>
          )}
        </View>
        <View
          style={[
            styles.largeTitle,
            standardActive && styles.standardLargeTitle,
            { opacity: 1 - progress },
          ]}
          aria-hidden={standardActive && progress >= 1 ? true : undefined}
        >
          <Text
            accessibilityRole="header"
            numberOfLines={2}
            style={styles.largeTitleText}
          >
            {title}
          </Text>
        </View>
        {!standardActive && (
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
                          backgroundColor: sourceColor(
                            'var(--uc-surface)',
                            dark,
                          ),
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
        )}
        <View
          style={[styles.body, wide ? { paddingHorizontal: 0 } : undefined]}
        >
          {tab === 'advisor' ? (
            <>
              {!standardActive && (
                <Text
                  style={[
                    styles.intro,
                    wide ? { paddingHorizontal: 24 } : undefined,
                  ]}
                >
                  {text('introText')}
                </Text>
              )}
              <View
                style={[
                  styles.card,
                  standardActive && styles.standardCard,
                  wide ? { padding: 0 } : undefined,
                ]}
              >
                <DuoColumns rowGap={16}>
                  <DuoPane>
                    <DuoOnlyView
                      style={wide ? { padding: 24, gap: 16 } : { gap: 16 }}
                    >
                      <View style={styles.advisorHeader}>
                        <RasterImage
                          source={reference?.advisor?.photo ?? advisorPhoto}
                          accessibilityLabel={text('name')}
                          style={styles.photo}
                        />
                        <View style={styles.nameColumn}>
                          <Text style={styles.strong}>
                            {text('yourAdvisor')}
                          </Text>
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
                              accessibilityRole={
                                reference ? 'button' : undefined
                              }
                              accessibilityLabel={
                                reference ? 'Branch directions' : undefined
                              }
                              onPress={() =>
                                reference?.navigate('prime-directions-handoff')
                              }
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
                    </DuoOnlyView>
                  </DuoPane>
                  <DuoPane>
                    <DuoOnlyView
                      style={wide ? { padding: 24, gap: 16 } : { gap: 16 }}
                    >
                      <View style={styles.tileRow}>
                        {tile('callNow', 'contact-phone', () =>
                          setAction('call'),
                        )}
                        {tile('sendEmail', 'prime-email', () =>
                          setAction('email'),
                        )}
                      </View>
                      <View style={styles.tileRow}>
                        {tile('bookAppointment', 'prime-book-appointment', () =>
                          host.onNavigate({ screen: 'appointments' }),
                        )}
                        {tile('requestCall', 'prime-request-call', () =>
                          host.onNavigate({ screen: 'call-request' }),
                        )}
                      </View>
                      <Text style={styles.availability}>
                        {text('availability')}
                      </Text>
                    </DuoOnlyView>
                  </DuoPane>
                </DuoColumns>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.benefitsHeading}>
                {reference?.benefitsCopy?.heading ??
                  t('prime.benefits.pageTitle')}
              </Text>
              <Text style={styles.intro}>
                {reference?.benefitsCopy?.introduction ??
                  t('prime.benefits.introText')}
              </Text>
              <View style={styles.card}>
                {[1, 2, 3, 4].map(index => (
                  <Pressable
                    key={index}
                    accessibilityRole="button"
                    onPress={() => reference?.navigate('prime-benefit-handoff')}
                    style={
                      reference?.benefitsCopy
                        ? [styles.benefit, styles.referenceBenefit]
                        : styles.benefit
                    }
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
                        {reference?.benefitsCopy?.benefits[index - 1]?.title ??
                          t(`prime.benefits.benefit${index}Title`)}
                      </Text>
                      <Text style={styles.copy}>
                        {reference?.benefitsCopy?.benefits[index - 1]
                          ?.description ??
                          t(`prime.benefits.benefit${index}Description`)}
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
                onPress={() => reference?.navigate('prime-terms-handoff')}
                style={styles.terms}
              >
                <Text style={styles.tabLabel}>
                  {(
                    reference?.benefitsCopy?.termsLabel ??
                    t('prime.benefits.termsConditions')
                  ).toUpperCase()}
                </Text>
              </Pressable>
            </>
          )}
          {!standardActive && !reference?.hideBrand && <PrimeBrand />}
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
          recipient={
            reference?.advisor
              ? { ...reference.advisor, service: false }
              : undefined
          }
          reference={
            reference && contact
              ? {
                  screen: contact,
                  navigate: screen => reference.navigate(`prime-${screen}`),
                }
              : undefined
          }
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  standardUpgrade: {
    position: 'absolute',
    right: 24,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  standardLargeTitle: { paddingHorizontal: 24 },
  standardCard: { borderRadius: 8 },
  standardTile: { borderRadius: 8 },
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
  referenceBenefit: { height: 'auto', minHeight: 80, flexShrink: 0 },
  benefitIcon: { width: 32, height: 32 },
  benefitCopy: { flex: 1, gap: 4, minWidth: 0 },
  terms: { paddingHorizontal: 24, paddingVertical: 8, alignItems: 'center' },
});
