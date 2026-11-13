import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { ONBOARDING_CARD_DETAILS } from '@/features/ro-onboarding/cardDetails';
import { OnboardingSheet } from './OnboardingSheet';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';

export function OnboardingCardCostDetails({
  onClose,
}: {
  onClose: () => void;
}) {
  const link = (label: string, url: string) => (
    <Text
      accessibilityRole="link"
      onPress={() => {
        void Linking.openURL(url);
      }}
      style={s.link}
    >
      {label}
    </Text>
  );
  return (
    <OnboardingSheet
      title="Mastercard Standard"
      onClose={onClose}
      fixedHeight
      maxHeightOffsetPx={24}
      footer={<PrimaryButton label="Ok, Am inteles" onPress={onClose} />}
    >
      <View>
        {ONBOARDING_CARD_DETAILS.map((item, index) => (
          <View key={index} style={s.row}>
            <Text style={s.body}>•</Text>
            <Text style={[s.body, s.grow]}>
              {!!item.heading && <Text style={s.bold}>{item.heading}</Text>}
              {item.body}
              {!!item.href && <>{link('aici', item.href)}.</>}
              {'email' in item && (
                <>
                  {' '}
                  Pentru a accesa acest beneficiu te rugam sa ne trimiti un
                  e-mail la {link(item.email, `mailto:${item.email}`)}.
                </>
              )}
            </Text>
          </View>
        ))}
      </View>
    </OnboardingSheet>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  grow: { flex: 1 },
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.3,
    color: sourceColor('var(--uc-text)'),
  },
  bold: { fontFamily: 'UniCredit-bold' },
  link: { textDecorationLine: 'underline' },
});
