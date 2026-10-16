import React, { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type ViewStyle,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { isCoAppingAvailable } from '@/app/utils/coAppingAvailability';
import type { CurrentScreenProps } from '../../contracts';
import { SourceLogo } from '../../profile/SourceLogo';
import { loginBackground } from '../../profile/assets';
import FaceIdAnimation from '../../profile/FaceIdAnimation';
import { RasterImage } from '../offers/RasterImage';
import { BaselineNavigationLink } from '../../../../../universal/BaselineNavigationLink';
import { BaselinePanelMenuSheet } from '../../../../../universal/BaselinePanelMenuSheet';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import { useDemoViewport } from '../../../../../universal/DemoViewport';

/** Source activated-app prelogin, including its inert links and local login demonstration. */
export default function Login(host: CurrentScreenProps) {
  const [other, setOther] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const viewport = useDemoViewport();
  const window = useWindowDimensions();
  const visibility = host.onPrimaryNavigationChange;
  const registerBack = host.onBackHandlerChange;
  const onNavigate = host.onNavigate;
  const coAppingAvailable = isCoAppingAvailable(host.country);
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  useEffect(() => {
    visibility?.(false);
    return () => visibility?.(true);
  }, [visibility]);
  useEffect(() => {
    registerBack?.(() => {
      if (!other && !authenticating) return false;
      setOther(false);
      setAuthenticating(false);
      return true;
    });
    return () => registerBack?.(null);
  }, [registerBack, other, authenticating]);
  const complete = useCallback(() => {
    setAuthenticating(false);
    onNavigate({ screen: 'home' });
  }, [onNavigate]);
  return (
    <View
      testID="ro-prelogin-active"
      style={[s.root, Platform.OS === 'web' && s.webRoot]}
    >
      <RasterImage
        accessibilityLabel="Background"
        source={loginBackground}
        style={s.background}
        resizeMode="cover"
      />
      {Platform.OS === 'web' ? (
        React.createElement('div', {
          style: {
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '75vh',
            zIndex: 10,
            pointerEvents: 'none',
            background:
              'linear-gradient(180deg, color-mix(in srgb, #262626 70%, transparent) 0%, color-mix(in srgb, #262626 0%, transparent) 100%)',
          },
        })
      ) : (
        <View
          pointerEvents="none"
          style={[s.topGradient, { height: window.height * 0.75 }]}
        >
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="ro-login-top" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#262626" stopOpacity={0.7} />
                <Stop offset="1" stopColor="#262626" stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#ro-login-top)" />
          </Svg>
        </View>
      )}
      <View style={s.content}>
        <View style={s.header}>
          <SourceLogo />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Language"
            style={s.language}
            onPress={() => onNavigate({ screen: 'language' })}
          >
            <Text style={s.languageLabel}>{host.language.toUpperCase()}</Text>
            <View
              style={[
                s.languageUnderline,
                { backgroundColor: sourceColor('var(--uc-surface)', dark) },
              ]}
            />
          </Pressable>
        </View>
        <View style={s.titleContainer}>
          <Text accessibilityRole="header" style={s.title}>
            {host.t('preLoginActive.title')}
          </Text>
          <Text style={s.subtitle}>{host.t('preLoginActive.subtitle')}</Text>
        </View>
        <View style={s.footer}>
          {Platform.OS === 'web' ? (
            React.createElement('div', {
              style: {
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background:
                  'linear-gradient(180deg, color-mix(in srgb, #262626 0%, transparent) 0%, #262626 5.95%)',
              },
            })
          ) : (
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Defs>
                <LinearGradient
                  id="ro-login-bottom"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <Stop offset="0" stopColor="#262626" stopOpacity={0} />
                  <Stop offset="5.95%" stopColor="#262626" />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#ro-login-bottom)" />
            </Svg>
          )}
          <PrimaryButton
            variant="surface"
            labelSize="16"
            label={host.t('preLoginActive.loginButton')}
            onPress={() => setAuthenticating(true)}
          />
          <View style={s.navigation}>
            <BaselineNavigationLink
              text={host.t('preLoginActive.contacts')}
              chevronSize={32}
              onPress={() => {}}
            />
            <BaselineNavigationLink
              text={host.t('preLoginActive.mtoken')}
              chevronSize={32}
              onPress={() => {}}
            />
            <BaselineNavigationLink
              text={host.t('preLoginActive.other')}
              chevronSize={32}
              onPress={() => setOther(true)}
            />
          </View>
        </View>
      </View>
      {other && (
        <View style={s.other}>
          <BaselinePanelMenuSheet
            height={viewport.height}
            aboutSmartBanking={host.t('panel.aboutSmartBanking')}
            exchangeRates={host.t('panel.exchangeRates')}
            findAtmBranches={host.t('panel.findAtmBranches')}
            startCoAppingSession={
              coAppingAvailable
                ? host.t('panel.startCoAppingSession')
                : undefined
            }
            onStartCoApping={
              coAppingAvailable
                ? () => {
                    setOther(false);
                    onNavigate({ screen: 'coapping' });
                  }
                : undefined
            }
            onClose={() => setOther(false)}
            dark={dark}
            shadeStyle={Platform.OS === 'web' ? s.webShade : undefined}
            panelStyle={Platform.OS === 'web' ? s.webPanel : undefined}
            handleLayer={
              Platform.OS === 'web' ? <SourceHandle dark={dark} /> : undefined
            }
          />
        </View>
      )}
      {authenticating && host.isActive && (
        <FaceIdAnimation onComplete={complete} />
      )}
    </View>
  );
}

function SourceHandle({ dark }: { dark: boolean }) {
  const arm = (right: boolean) =>
    React.createElement(
      'div',
      {
        key: String(right),
        style: {
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          top: '16%',
          bottom: '9.75%',
          left: right ? '41.95%' : '4.45%',
          right: right ? '4.45%' : '41.95%',
        },
      },
      React.createElement(
        'div',
        {
          style: {
            flex: 'none',
            height: 5,
            width: 21,
            rotate: right ? '-20deg' : '20deg',
          },
        },
        React.createElement('div', {
          style: {
            backgroundColor: sourceColor('var(--uc-border-muted)', dark),
            borderRadius: 4,
            width: '100%',
            height: '100%',
          },
        }),
      ),
    );
  return React.createElement(
    'div',
    {
      style: {
        position: 'absolute',
        height: 16,
        width: 40,
        top: 0,
        left: 'calc(50% + 0.5px)',
        translate: '-50%',
      },
    },
    arm(false),
    arm(true),
  );
}

const webShade = { backdropFilter: 'blur(5.939px)' } as unknown as ViewStyle;
const s = StyleSheet.create({
  webRoot: { WebkitFontSmoothing: 'antialiased' } as unknown as ViewStyle,
  root: { flex: 1, backgroundColor: '#262626' },
  background: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
  topGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    zIndex: 10,
  },
  content: { ...StyleSheet.absoluteFill, zIndex: 20 },
  header: {
    paddingTop: 70,
    paddingHorizontal: 24,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  language: { justifyContent: 'center', alignItems: 'flex-end', gap: 1 },
  languageLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    color: '#fff',
    textAlign: 'right',
  },
  languageUnderline: { height: 1, width: '100%' },
  titleContainer: { marginTop: 24, paddingHorizontal: 24, gap: 8 },
  title: {
    fontFamily: 'UniCredit-bold',
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: 0.335,
    color: '#fff',
  },
  subtitle: { fontFamily: 'UniCredit-regular', fontSize: 18, color: '#fff' },
  footer: {
    marginTop: 'auto',
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 24,
    alignItems: 'flex-start',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  other: { ...StyleSheet.absoluteFill, zIndex: 50, alignItems: 'center' },
  webPanel: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: 375,
    transform: 'translateX(-50%)',
  } as unknown as ViewStyle,
  webShade,
});
