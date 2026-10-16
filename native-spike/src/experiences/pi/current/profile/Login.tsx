import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { ModalPanel } from '../../../../universal/ModalPanel';
import { isCoAppingAvailable } from '@/app/utils/coAppingAvailability';
import type { CurrentScreenProps } from '../contracts';
import { Button, Copy, Row, useLocalBack } from './Primitives';
import { useProfileTranslation } from './Host';
import FaceIdAnimation from './FaceIdAnimation';
import InactiveBaselinePrelogin from '../baseline/auth/InactiveBaselinePrelogin';
import { SourceLogo } from './SourceLogo';
import { loginBackground } from './assets';
export default function Login(props: CurrentScreenProps) {
  return props.scenario === 'inactive' ? (
    <InactiveBaselinePrelogin {...props} />
  ) : (
    <ActiveLogin {...props} />
  );
}

function ActiveLogin(props: CurrentScreenProps) {
  const t = useProfileTranslation();
  const [other, setOther] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  useLocalBack(() => {
    if (other) setOther(false);
    else {
      setAuthenticating(false);
      props.onBack();
    }
  }, props.isActive);
  return (
    <View
      style={styles.page}
      testID="current-prelogin-active"
    >
      <Image
        source={loginBackground}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="current-login-shade" x1="0" y1="0" x2="0" y2="1">
            <Stop
              offset="0"
              stopColor="#262626"
              stopOpacity={0.7}
            />
            <Stop offset="0.75" stopColor="#262626" stopOpacity={0} />
            <Stop offset="0.95" stopColor="#262626" stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#current-login-shade)" />
      </Svg>
      <View style={styles.content}>
        <View style={styles.header}>
          <SourceLogo />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Language"
            onPress={() => props.onNavigate({ screen: 'language' })}
          >
            <Copy strong color="#ffffff">
              {props.language.toUpperCase()}
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
            onPress={() => setAuthenticating(true)}
            disabled={authenticating}
          />
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
          tokens={props.tokens}
          title={t('preLoginActive.other')}
          visible
          onClose={() => setOther(false)}
        >
          <Row title={t('panel.aboutSmartBanking', 'ABOUT SMART BANKING')} />
          <Row title={t('panel.exchangeRates', 'EXCHANGE RATES')} />
          <Row title={t('panel.findAtmBranches', 'FIND ATM & BRANCHES')} />
          {isCoAppingAvailable(props.country) ? (
            <Row
              title={t('panel.startCoAppingSession')}
              onPress={() => {
                setOther(false);
                props.onNavigate({ screen: 'coapping' });
              }}
            />
          ) : null}
        </ModalPanel>
      ) : null}
      {authenticating && props.isActive ? (
        <FaceIdAnimation
          onComplete={() => {
            setAuthenticating(false);
            props.onNavigate({ screen: 'home' });
          }}
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
    paddingTop:70,
    paddingBottom:10,
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
