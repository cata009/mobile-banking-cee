import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import {
  getProductsForCountry,
  hasProductAccordion,
} from '@/app/config/productConfig';
import { isCoAppingAvailable } from '@/app/utils/coAppingAvailability';
import type { CurrentScreenProps } from '../../contracts';
import { SourceLogo } from '../../profile/SourceLogo';
import { loginBackground } from '../../profile/assets';
import { RasterImage } from '../offers/RasterImage';
import { BaselineNavigationLink } from '../../../../../universal/BaselineNavigationLink';
import { BaselinePanelMenuSheet } from '../../../../../universal/BaselinePanelMenuSheet';
import { BaselinePreloginAccordion } from '../../../../../universal/BaselinePreloginAccordion';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import { useDemoViewport } from '../../../../../universal/DemoViewport';

/** Source inactive prelogin composition; activation remains an inert prototype CTA. */
export function InactiveBaselinePrelogin(host: CurrentScreenProps) {
  const [other, setOther] = useState(false);
  const viewport = useDemoViewport();
  const visibility = host.onPrimaryNavigationChange;
  const registerBack = host.onBackHandlerChange;
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const coAppingAvailable = isCoAppingAvailable(host.country);
  const showProductAccordion = hasProductAccordion(host.country);
  const products = getProductsForCountry(host.country).map(product => ({
    ...product,
    title: host.t(`products.${product.id}.title`, product.title),
    description: host.t(
      `products.${product.id}.description`,
      product.description,
    ),
  }));

  useEffect(() => {
    visibility?.(false);
    return () => visibility?.(true);
  }, [visibility]);
  useEffect(() => {
    registerBack?.(() => {
      if (!other) return false;
      setOther(false);
      return true;
    });
    return () => registerBack?.(null);
  }, [registerBack, other]);

  return (
    <View testID="pi-inactive-prelogin" style={s.root}>
      <RasterImage
        accessibilityLabel="Background"
        source={loginBackground}
        style={s.background}
        resizeMode="cover"
      />
      <View style={s.content}>
        <View style={s.header}>
          <SourceLogo />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Language"
            style={s.language}
            onPress={() => host.onNavigate({ screen: 'language' })}
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
        <View style={[s.footer, { gap: showProductAccordion ? 24 : 32 }]}>
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
                  id="inactive-prelogin-bottom"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <Stop offset="0" stopColor="#262626" stopOpacity={0} />
                  <Stop offset="5.95%" stopColor="#262626" />
                </LinearGradient>
              </Defs>
              <Rect
                width="100%"
                height="100%"
                fill="url(#inactive-prelogin-bottom)"
              />
            </Svg>
          )}
          {showProductAccordion ? (
            <BaselinePreloginAccordion
              variant="animated"
              welcomeText={host.t('preLogin.welcome')}
              products={products}
              findOutMoreText={host.t('products.findOutMore')}
              dark={dark}
            />
          ) : (
            <View style={s.staticWelcome}>
              <View style={s.staticHeadings}>
                <Text accessibilityRole="header" style={s.welcome}>
                  {host.t('preLogin.welcome')}
                </Text>
                <Text accessibilityRole="header" style={s.accounts}>
                  {host.t('preLogin.accounts')}
                </Text>
              </View>
              <Text style={s.description}>
                {host.t('preLogin.openAccountDescription')}
              </Text>
              <BaselineNavigationLink
                text={host.t('preLogin.selectYourAccount')}
                chevronSize={32}
              />
            </View>
          )}
          <PrimaryButton
            variant="surface"
            labelSize="18"
            label={host.t('preLogin.activateApplication')}
          />
          <View style={s.navigation}>
            <BaselineNavigationLink
              text={host.t('preLogin.contacts')}
              chevronSize={32}
              onPress={() => {}}
            />
            <BaselineNavigationLink
              text={host.t('preLogin.mtoken')}
              chevronSize={32}
              onPress={() => {}}
            />
            <BaselineNavigationLink
              text={host.t('preLogin.other')}
              chevronSize={32}
              onPress={() => setOther(true)}
            />
          </View>
        </View>
      </View>
      {other ? (
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
                    host.onNavigate({ screen: 'coapping' });
                  }
                : undefined
            }
            onClose={() => setOther(false)}
            dark={dark}
            shadeStyle={Platform.OS === 'web' ? s.webShade : undefined}
            panelStyle={Platform.OS === 'web' ? s.webPanel : undefined}
            handleLayer={
              Platform.OS === 'web' ? (
                <InactiveSourceHandle dark={dark} />
              ) : undefined
            }
          />
        </View>
      ) : null}
    </View>
  );
}

export default InactiveBaselinePrelogin;

function InactiveSourceHandle({ dark }: { dark: boolean }) {
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
  root: { flex: 1, backgroundColor: '#262626' },
  background: { position: 'absolute', inset: 0, width: '100%', height: '100%' },
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
  footer: {
    position: 'relative',
    marginTop: 'auto',
    width: '100%',
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'flex-start',
  },
  staticWelcome: { width: '100%', gap: 16 },
  staticHeadings: { gap: 32 },
  welcome: {
    fontFamily: 'UniCredit-bold',
    fontSize: 38,
    lineHeight: 40,
    letterSpacing: 0.335,
    color: '#fff',
  },
  accounts: {
    fontFamily: 'UniCredit-bold',
    fontSize: 24,
    letterSpacing: 0.267,
    color: '#fff',
  },
  description: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    color: '#fff',
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
