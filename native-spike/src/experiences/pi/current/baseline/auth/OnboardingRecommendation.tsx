import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { verifyRecommendation } from '@/features/ro-onboarding/referral';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { OnboardingSheet } from './OnboardingSheet';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
export function OnboardingRecommendation({
  value,
  onChange,
  onContinue,
}: {
  value: string;
  onChange: (value: string) => void;
  onContinue: () => void;
}) {
  const [invalid, setInvalid] = useState(
    !!value && !verifyRecommendation(value),
  );
  const [info, setInfo] = useState(false);
  return (
    <View style={s.page}>
      <View style={s.content}>
        <Text style={s.body}>
          Did you receive a promotion code from your branch consultant? Please
          enter it now.
        </Text>
        <View>
          <BaselineTextField
            label="Unique Code"
            forceFloatLabel
            value={value}
            onChange={v => {
              setInvalid(false);
              onChange(v);
            }}
            inputMode="numeric"
            maxLength={20}
            errorText={
              invalid ? 'Codul este invalid, te rugăm să reîncerci' : undefined
            }
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Unique code information"
            onPress={() => setInfo(true)}
            style={s.info}
          >
            <SourceCustomIcon
              name="info-circle"
              size={16}
              color={sourceColor('var(--uc-text)')}
            />
          </Pressable>
        </View>
      </View>
      <View style={s.footer}>
        <PrimaryButton
          label="Continuǎ"
          disabled={!value.trim()}
          onPress={() => {
            if (verifyRecommendation(value)) onContinue();
            else setInvalid(true);
          }}
        />
      </View>
      {info && (
        <OnboardingSheet
          title="Unique code"
          onClose={() => setInfo(false)}
          footer={<PrimaryButton label="Ok" onPress={() => setInfo(false)} />}
        >
          <Text style={s.body}>This is how the tooltip opens on mobile</Text>
        </OnboardingSheet>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, justifyContent: 'space-between' },
  content: { gap: 24 },
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    color: sourceColor('var(--uc-text)'),
  },
  footer: { paddingTop: 24, paddingBottom: 10 },
  info: {
    position: 'absolute',
    top: 0,
    left: 76,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
