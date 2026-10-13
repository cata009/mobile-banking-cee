import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { ModalPanel } from '../../../../../universal/ModalPanel';
import type { CzechNativeScreenProps } from '../contracts';
import {
  Button,
  Confirm,
  Copy,
  Row,
  useCurrentTokens,
  useLocalBack,
} from '../profile/Primitives';
import {
  useCzechPreferences,
  useCzechTranslation,
} from '../profile/features/preferences';
import { useDemoAuthorization } from './features/useDemoAuthorization';
import { loginBackground } from './assets';
import { SourceLogo } from '../profile/SourceLogo';
export default function Login(props: CzechNativeScreenProps) {
  const { onChromeChange, isActive } = props;
  useEffect(() => {
    if (isActive === false) return;
    onChromeChange?.({
      backgroundColor: '#262626',
      navigationBackgroundColor: '#262626',
      barStyle: 'light-content',
    });
    return () => onChromeChange?.();
  }, [onChromeChange, isActive]);
  const t = useCzechTranslation(),
    tokens = useCurrentTokens(),
    { language } = useCzechPreferences();
  const [other, setOther] = useState(false);
  const auth = useDemoAuthorization({
    title: t('preLoginActive.loginButton'),
    onComplete: () => props.onNavigate({ screen: 'home' }),
    isActive: props.isActive,
  });
  useLocalBack(() => {
    if (auth.demo) auth.closeDemo();
    else if (other) setOther(false);
    else {
      auth.cancel();
      props.onBack();
    }
  }, props.isActive !== false);
  return (
    <View style={styles.page}>
      <Image
        source={loginBackground}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="login-shade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#262626" stopOpacity={0.7} />
            <Stop offset="0.75" stopColor="#262626" stopOpacity={0} />
            <Stop offset="0.95" stopColor="#262626" stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#login-shade)" />
      </Svg>
      <View style={[styles.content, { paddingTop: props.screenTopInset ?? 0 }]}>
        <View style={styles.header}>
          <SourceLogo />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Language"
            onPress={() => props.onNavigate({ screen: 'language' })}
          >
            <Copy strong color="#ffffff">
              {language.toUpperCase()}
            </Copy>
          </Pressable>
        </View>
        <View style={styles.title}>
          <Copy
            strong
            size={38}
            lineHeight={40}
            letterSpacing={0.335}
            color="#ffffff"
          >
            {t('preLoginActive.title')}
          </Copy>
          <Copy size={18} color="#ffffff">
            {t('preLoginActive.subtitle')}
          </Copy>
        </View>
        <View style={styles.footer}>
          <Button
            label={t('preLoginActive.loginButton')}
            onPress={auth.sign}
            disabled={auth.busy || auth.available === null || auth.completed}
          />
          {auth.error ? <Copy color="#ffffff">{auth.error}</Copy> : null}
          <View style={styles.nav}>
            {(['contacts', 'mtoken', 'other'] as const).map(key => (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={t(`preLoginActive.${key}`)}
                onPress={key === 'other' ? () => setOther(true) : () => {}}
              >
                <Copy strong size={14} color="#ffffff">
                  {t(`preLoginActive.${key}`)}
                </Copy>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
      {other ? (
        <ModalPanel
          tokens={tokens}
          title={t('preLoginActive.other')}
          visible
          onClose={() => setOther(false)}
        >
          <Row title={t('panel.about', 'ABOUT SMART BANKING')} />
          <Row title={t('panel.exchangeRates', 'EXCHANGE RATES')} />
          <Row title={t('panel.findAtm', 'FIND ATM')} />
          <Copy size={14}>
            Co-Apping is not yet available in this native release.
          </Copy>
        </ModalPanel>
      ) : null}
      {auth.demo ? (
        <Confirm
          title="Demo authorization"
          body="Device biometrics are unavailable. Continue the demo explicitly. No Face ID verification is performed."
          onCancel={auth.closeDemo}
          onConfirm={auth.finish}
          confirmLabel="Continue demo"
          cancelLabel="Cancel"
        />
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#262626' },
  content: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { marginTop: 24, paddingHorizontal: 24, gap: 8 },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 24,
    backgroundColor: '#262626',
  },
  nav: { flexDirection: 'row', justifyContent: 'space-between' },
});
