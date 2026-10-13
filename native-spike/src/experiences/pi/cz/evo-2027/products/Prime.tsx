import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../../../../universal/Typography';
import {
  Header,
  ActionButton,
  Tabs,
  ModalPanel,
} from '../../../../../universal/controls';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { CZ_TRANSLATIONS } from '@/translations/CZ';
import hero from '@/assets/6f8736f05a24b87b9ef5508cfd9021e9a466bf48.png';
import advisor from '@/assets/e693dd6eed452da6c4cda0e69dbdd3f45039c9f2.png';
import type { CzechNativeScreenProps } from '../contracts';
import { evoTokens } from '../home/tokens';
import { Glyph, textStyles } from '../home/Primitives';

const tokens = {
  ...evoTokens,
  background: '#101b28',
  surface: '#26343f',
  text: '#ffffff',
  muted: '#d7d7d7',
  border: '#52606c',
  accent: '#ffffff',
  inverse: '#101b28',
};
const body = {
  ...textStyles.body,
  color: tokens.text,
  fontSize: 16,
  lineHeight: 22,
};
export default function Prime(host: CzechNativeScreenProps) {
  const { onChromeChange } = host;
  const copy = CZ_TRANSLATIONS[host.language ?? 'en'].prime;
  const [tab, setTab] = useState<'advisor' | 'benefits'>('advisor');
  const [action, setAction] = useState<'call' | 'email' | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    onChromeChange?.({
      backgroundColor: tokens.background,
      barStyle: 'light-content',
    });
    return () => onChromeChange?.();
  }, [onChromeChange]);
  const open = async (uri: string) => {
    try {
      await Linking.openURL(uri);
      setAction(null);
    } catch {
      setError('This device cannot open the selected contact app.');
    }
  };
  const benefits = [
    [copy.benefits.benefit1Title, copy.benefits.benefit1Description],
    [copy.benefits.benefit2Title, copy.benefits.benefit2Description],
    [copy.benefits.benefit3Title, copy.benefits.benefit3Description],
    [copy.benefits.benefit4Title, copy.benefits.benefit4Description],
  ];
  return (
    <View style={[s.root, { paddingTop: host.screenTopInset ?? 0 }]}>
      <View pointerEvents="none" style={s.background}>
        <AssetGlyph asset={hero} width={560} height={760} fit="cover" />
      </View>
      <Header
        tokens={tokens}
        variant="current"
        title={copy.pageTitle}
        onBack={host.onBack}
        backIcon={<Glyph name="back" size={16} color={tokens.text} />}
      />
      <ScrollView contentContainerStyle={s.content}>
        <Tabs
          tokens={tokens}
          value={tab}
          variant="current"
          label="Prime"
          items={[
            { value: 'advisor', label: copy.tabYourAdvisor },
            { value: 'benefits', label: copy.tabYourBenefits },
          ]}
          onChange={setTab}
        />
        {tab === 'advisor' ? (
          <>
            <Text style={body}>{copy.advisor.introText}</Text>
            <View style={s.panel}>
              <View style={s.advisor}>
                <AssetGlyph
                  asset={advisor}
                  width={96}
                  height={96}
                  fit="cover"
                />
                <View style={sourceStyles.flex1gap6}>
                  <Text style={[body, textStyles.strong]}>
                    {copy.advisor.yourAdvisor}
                  </Text>
                  <Text
                    style={[
                      body,
                      textStyles.strong,
                      sourceStyles.fontSize24lineHeight28,
                    ]}
                  >
                    {copy.advisor.name}
                  </Text>
                </View>
              </View>
              {[
                [copy.advisor.phoneNumber, copy.advisor.phone],
                [copy.advisor.email, copy.advisor.emailAddress],
                [copy.advisor.branchName, copy.advisor.branch],
                [copy.advisor.branchAddress, copy.advisor.address],
              ].map(([label, value]) => (
                <View key={label} style={sourceStyles.gap4}>
                  <Text
                    style={[
                      body,
                      [sourceStyles.fontSize14, { color: tokens.muted }],
                    ]}
                  >
                    {label}
                  </Text>
                  <Text style={[body, textStyles.strong]}>{value}</Text>
                </View>
              ))}
              <ActionButton
                tokens={tokens}
                label={copy.advisor.callNow}
                onPress={() => {
                  setError('');
                  setAction('call');
                }}
              />
              <ActionButton
                tokens={tokens}
                label={copy.advisor.sendEmail}
                onPress={() => {
                  setError('');
                  setAction('email');
                }}
              />
            </View>
            <View style={sourceStyles.gap12}>
              <ActionButton
                tokens={tokens}
                label={copy.advisor.bookAppointment}
                onPress={() => host.onNavigate({ screen: 'appointments' })}
              />
              <ActionButton
                tokens={tokens}
                label={copy.advisor.requestCall}
                onPress={() => host.onNavigate({ screen: 'call-request' })}
              />
            </View>
            <Text style={[body, { color: tokens.muted }]}>
              {copy.advisor.availability}
            </Text>
          </>
        ) : (
          <>
            <Text
              style={[
                body,
                textStyles.strong,
                sourceStyles.fontSize24lineHeight28,
              ]}
            >
              {copy.benefits.pageTitle}
            </Text>
            <Text style={body}>{copy.benefits.introText}</Text>
            <View style={s.panel}>
              {benefits.map(([title, description]) => (
                <View key={title} style={sourceStyles.gap6}>
                  <Text style={[body, textStyles.strong]}>✓ {title}</Text>
                  <Text style={body}>{description}</Text>
                </View>
              ))}
            </View>
            <Text style={[body, sourceStyles.textAligncenter]}>
              {copy.benefits.termsConditions}
            </Text>
            <Text
              style={[
                body,
                textStyles.strong,
                sourceStyles.fontSize32lineHeight38textAligncenter,
              ]}
            >
              Prime
            </Text>
          </>
        )}
      </ScrollView>
      <ModalPanel
        tokens={tokens}
        title={
          action === 'call' ? copy.advisor.callNow : copy.advisor.sendEmail
        }
        visible={action !== null}
        onClose={() => setAction(null)}
      >
        {action && (
          <View style={sourceStyles.gap16}>
            <Text style={body}>
              {action === 'call'
                ? copy.advisor.phone
                : copy.advisor.emailAddress}
            </Text>
            {error && <Text style={body}>{error}</Text>}
            <ActionButton
              tokens={tokens}
              label={action === 'call' ? 'Open phone app' : 'Open email app'}
              onPress={() => {
                open(
                  action === 'call'
                    ? `tel:${copy.advisor.phone.replace(/\s/g, '')}`
                    : `mailto:${copy.advisor.emailAddress}`,
                );
              }}
            />
          </View>
        )}
      </ModalPanel>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.background },
  background: { position: 'absolute', top: 0, left: 0, right: 0, opacity: 0.3 },
  content: {
    padding: 24,
    gap: 24,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingBottom: 32,
  },
  panel: {
    padding: 16,
    gap: 24,
    borderRadius: 16,
    backgroundColor: '#ffffff1a',
  },
  advisor: { flexDirection: 'row', alignItems: 'center', gap: 16 },
});

const sourceStyles = StyleSheet.create({
  flex1gap6: { flex: 1, gap: 6 },
  fontSize24lineHeight28: { fontSize: 24, lineHeight: 28 },
  gap4: { gap: 4 },
  fontSize14: { fontSize: 14 },
  gap12: { gap: 12 },
  gap6: { gap: 6 },
  textAligncenter: { textAlign: 'center' },
  fontSize32lineHeight38textAligncenter: {
    fontSize: 32,
    lineHeight: 38,
    textAlign: 'center',
  },
  gap16: { gap: 16 },
});
