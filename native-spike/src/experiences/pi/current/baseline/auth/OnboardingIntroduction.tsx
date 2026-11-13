import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import hero from '@/assets/pi/ro/onboarding/introduction.png';
import individual from '@/assets/pi/ro/onboarding/individual.svg';
import customer from '@/assets/pi/ro/onboarding/new-customer.svg';
import identity from '@/assets/pi/ro/onboarding/identity-card.svg';
import phone from '@/assets/pi/ro/onboarding/phone.svg';
import email from '@/assets/pi/ro/onboarding/email.svg';
import { RasterImage } from '../offers/RasterImage';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { OnboardingSectionDivider as BaselineSectionDivider } from './OnboardingSectionDivider';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';

/** Source frame 10164:109267: approved primitives and original Figma assets. */
export function OnboardingIntroduction({
  onRecommendation,
  recommended = false,
}: {
  onRecommendation: () => void;
  recommended?: boolean;
}) {
  return (
    <View style={s.content}>
      <Text style={s.body}>
        {recommended
          ? 'Because we know how important your time is, now get your current account in Lei with a debit card and Mobile Banking attached, 100% online.'
          : 'Pentru ca stim cat de important este timpul tau, obtine acum contul tau curent (Lei/EUR), cu card de debit si Mobile Banking atasat, 100% online.'}
      </Text>
      <View style={s.photo}>
        <RasterImage source={{ uri: hero }} style={s.hero} resizeMode="cover" />
      </View>
      <BaselineSectionDivider
        title={recommended ? 'WHAT YOU WILL NEED' : 'DE CE VEI AVEA NEVOIE'}
        width={327}
      />
      {[
        [
          individual,
          recommended ? 'MINIMUM AGE OF 18 YEARS' : 'VARSTA MINIMA DE 18 Ani',
        ],
        [
          customer,
          recommended
            ? 'BE A NEW UNICREDIT BANK CUSTOMER'
            : 'SA FII UN NOU CLIENT UNICREDIT BANK',
        ],
        [
          identity,
          recommended
            ? 'VALID IDENTITY CARD ISSUED BY THE ROMANIAN STATE'
            : 'CARTE DE IDENTITATE (CLASICA) VALABILA ELIBERATA DE STATUL ROMAN',
        ],
        [
          phone,
          recommended
            ? 'YOUR ROMANIAN MOBILE PHONE NUMBER'
            : 'NUMARUL TAU ROMANESC DE TELEFON',
        ],
        [
          email,
          recommended
            ? 'ACCESS TO YOUR E-MAIL ADDRESS'
            : 'ACCESS LA ADRESA TA DE MAIL',
        ],
      ].map(([asset, label]) => (
        <View key={label} style={s.row}>
          <AssetGlyph asset={asset} size={24} />
          <Text style={s.requirement}>{label}</Text>
        </View>
      ))}
      <Pressable
        accessibilityRole="button"
        onPress={onRecommendation}
        style={s.recommendation}
      >
        <Text style={s.recommendationLabel}>
          {recommended
            ? 'I RECEIVED A RECOMMENDATION'
            : 'AM COD DE RECOMANDARE'}
        </Text>
        <SourceCustomIcon
          name="chevron-right"
          size={24}
          color={sourceColor('var(--uc-text)')}
        />
      </Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  content: { gap: 24 },
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    color: sourceColor('var(--uc-text)'),
  },
  photo: { height: 121, borderRadius: 6, overflow: 'hidden' },
  hero: {
    position: 'absolute',
    width: '113.82%',
    maxWidth: '113.82%',
    height: 130,
    left: '-6.98%',
    top: -5,
  },
  row: { minHeight: 40, flexDirection: 'row', gap: 16, alignItems: 'center' },
  requirement: {
    flex: 1,
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    color: sourceColor('var(--uc-text)'),
  },
  recommendation: {
    marginTop: 8,
    minHeight: 40,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  recommendationLabel: {
    flex: 1,
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 24,
    color: sourceColor('var(--uc-text)'),
  },
});
