import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BaselinePageHeader } from '../universal/BaselinePageHeader';
import { PrimaryButton } from '../universal/PrimaryButton';
import Svg, { Path } from 'react-native-svg';
import { Text } from '../universal/Typography';
import { RasterImage } from '../experiences/pi/current/baseline/offers/RasterImage';
import PrimeBrand from '../experiences/pi/current/baseline/more/PrimeBrand';
import type { CurrentScreenProps } from '../experiences/pi/current/contracts';
import { upgradePhoto } from './primeReferenceAssets';

const benefits = [
  ['GET TAYLOR MADE OFFERS', 'Meet your advisor in person and check new products for you. Take time to discuss your plans, ask questions and explore the options that fit your everyday banking needs.'],
  ['REQUEST A CONSULTATION', 'Book a call, send a message or book an appointment for all your needs. Choose the way you prefer to talk and prepare the topics you would like to discuss with your advisor.'],
  ['GET SUPPORT ANYTIME', 'Drop a mail or call your advisor to get in contact whenever you need it. Keep your questions together and talk through the next steps with someone who understands your banking needs.'],
] as const;

/** My Advisor 7526:17925, preserving source copy, photograph and native DS controls. */
export function PrimeUpgrade({ host, onCall }: { host: CurrentScreenProps; onCall: () => void }) {
  const [progress, setProgress] = useState(0);
  return (
    <View style={s.page}>
      <ScrollView testID="prime-upgrade-scroll" style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]} scrollEventThrottle={16} onScroll={event => setProgress(Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 48)))}>
        <View style={s.toolbar}>
          <BaselinePageHeader title="Prime by UniCredit" variant="dark" includeSafeArea safeAreaReserve={host.screenTopInset} onBack={host.onBack} showHelp={false} renderLargeTitle={false} collapsedTitleProgress={progress} hideCollapsedTitleWhenHidden />
        </View>
        <View style={[s.largeTitle, { opacity: 1 - progress }]} aria-hidden={progress >= 1}>
          <Text accessibilityRole="header" style={s.title}>Prime by UniCredit</Text>
        </View>
        <View style={s.photoSlot}>
          <RasterImage source={upgradePhoto} accessibilityLabel="UniCredit advisor meeting a customer" style={s.photo} />
        </View>
        <View style={s.intro}>
          <View style={s.brand}><PrimeBrand /></View>
          <Text style={s.copy}>{'Do you need a taylor made customer care?\nDo you want your bank to be always by your side?'}</Text>
          <Text style={[s.copy, s.strong]}>Prime is the service for you:</Text>
        </View>
        <View style={s.benefits}>
          {benefits.map(([title, description]) => (
            <View key={title} style={s.benefit}>
              <View style={s.check}>
                {/* Original My Advisor 7526:17970 artwork has its own 24px bounds. */}
                <Svg width={24} height={24} viewBox="0 0 24 24" aria-hidden>
                  <Path d="M17.3708 7.09252C18.9245 5.63583 21.4428 5.63583 22.9966 7.09252L10.2813 19L0.996582 10.311C2.54964 8.85499 5.06864 8.85499 6.62239 10.311L10.2813 13.7251L17.3708 7.09252Z" fillRule="evenodd" clipRule="evenodd" fill="white" />
                </Svg>
              </View>
              <View style={s.benefitCopy}>
                <Text style={[s.detail, s.strong]}>{title}</Text>
                <Text style={s.detail}>{description}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={s.footer}>
        <PrimaryButton label="Call us to get it now" variant="surface" onPress={onCall} dark={false} />
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#262626' }, scroll: { flex: 1 }, content: { paddingBottom: 20 },
  toolbar: { backgroundColor: '#262626' }, largeTitle: { paddingHorizontal: 24, paddingVertical: 8 },
  title: { fontFamily: 'UniCredit-bold', fontSize: 28, color: '#ffffff' },
  photoSlot: { marginHorizontal: 24, marginTop: 8, height: 160, borderRadius: 8, overflow: 'hidden' },
  photo: { position: 'absolute', left: -9, top: -2, width: '103.36%', height: 166, borderRadius: 8 },
  intro: { paddingHorizontal: 26, gap: 24, marginTop: 16 }, brand: { alignSelf: 'flex-start' },
  copy: { fontFamily: 'UniCredit-regular', fontSize: 18, color: '#ffffff' }, strong: { fontFamily: 'UniCredit-bold' },
  benefits: { marginTop: 24 }, benefit: { minHeight: 80, flexDirection: 'row', alignItems: 'center', gap: 16, paddingLeft: 16, paddingRight: 12, paddingVertical: 12 },
  check: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }, benefitCopy: { flex: 1, gap: 4, minWidth: 0 },
  detail: { fontFamily: 'UniCredit-regular', fontSize: 16, color: '#ffffff' },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 30, backgroundColor: '#262626' },
});
