import React from 'react';
import { StyleSheet, View } from 'react-native';
import { OnboardingSheet } from './OnboardingSheet';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
export function OnboardingProgressSheet({
  stage,
  onClose,
}: {
  stage: number;
  onClose: () => void;
}) {
  return (
    <OnboardingSheet
      title="Pasii"
      onClose={onClose}
      footer={<PrimaryButton label="Ok, I got it" onPress={onClose} />}
    >
      <View style={s.steps}>
        <View style={s.track} />
        {[
          'Date de contact',
          'Confirmarea identitatii',
          'Informatii suplimentare',
          'Personalizarea produsului',
          'Semnarea contractului',
          'Activarea Mobile Banking',
        ].map((label, index) => (
          <View key={label} style={[s.row, index === 5 && s.last]}>
            <View style={[s.number, index + 1 <= stage && s.current]}>
              {index + 1 < stage ? (
                <SourceCustomIcon
                  name="check"
                  size={14}
                  color={sourceColor('var(--uc-static-white)')}
                />
              ) : (
                <Text style={[s.index, index + 1 === stage && s.currentText]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text style={[s.label, index + 1 <= stage && s.activeLabel]}>
              {label}
            </Text>
          </View>
        ))}
      </View>
    </OnboardingSheet>
  );
}
const s = StyleSheet.create({
  steps: { marginTop: 24 },
  track: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 21,
    borderRadius: 10,
    backgroundColor: sourceColor('var(--uc-surface-muted)'),
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, height: 64 },
  last: { height: 21 },
  number: {
    width: 21,
    height: 21,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: sourceColor('var(--uc-text-muted)'),
    backgroundColor: sourceColor('var(--uc-surface-muted)'),
  },
  current: {
    borderColor: sourceColor('var(--uc-text)'),
    backgroundColor: sourceColor('var(--uc-text)'),
  },
  index: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    color: sourceColor('var(--uc-text-muted)'),
  },
  currentText: { color: sourceColor('var(--uc-static-white)') },
  label: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 21,
    textTransform: 'uppercase',
    color: sourceColor('var(--uc-text-muted)'),
  },
  activeLabel: { color: sourceColor('var(--uc-text)') },
});
