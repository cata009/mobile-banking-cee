import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { RadioButton } from '../../../../../universal/RadioButton';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';

const REASONS = [
  'NU AM TIMP ACUM',
  'M-AM RĂZGÂNDIT',
  'NU AM TIMP ACUM',
  'ESTE PREA COMPLICAT PENTRU MINE',
  'AM NEVOIE DE MAI MULTE INFORMAȚII',
  'ALT MOTIV',
];
export function OnboardingExitSurvey({
  topInset,
  onClose,
  initialOther = false,
}: {
  topInset: number;
  onClose: () => void;
  initialOther?: boolean;
}) {
  const [reason, setReason] = useState<number | null>(initialOther ? 5 : null);
  const [other, setOther] = useState(initialOther ? 'I will be back' : '');
  return (
    <View style={s.root}>
      <BaselinePageHeader
        title="Ne pare rău să te vedem plecând!"
        showBack={false}
        showHelp={false}
        includeSafeArea
        safeAreaReserve={topInset}
        largeTitleGutter={24}
        onBack={onClose}
        rightActionIcon={
          <SourceCustomIcon
            name="close-flow"
            size={20}
            color={sourceColor('var(--uc-text)')}
          />
        }
        rightActionLabel="Închide"
        onRightActionPress={onClose}
      />
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.body}>
          Ajută-ne să devenim mai buni! Care sunt motivele pentru care ai decis
          să închei procesul?
        </Text>
        <View style={s.options}>
          {REASONS.map((label, index) => (
            <View key={index}>
              <RadioButton
                label={label}
                selected={reason === index}
                onPress={() => setReason(index)}
                paddingHorizontal={4}
                labelStyle={s.label}
              />
              {index === 5 && reason === 5 && (
                <View style={s.other}>
                  <BaselineTextField
                    label="Introdu motivul tau"
                    forceFloatLabel
                    value={other}
                    onChange={setOther}
                    maxLength={500}
                  />
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={s.footer}>
        <PrimaryButton
          label="Închide fluxul"
          disabled={reason === null || (reason === 5 && !other.trim())}
          onPress={onClose}
        />
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: sourceColor('var(--uc-surface)') },
  content: { padding: 24, gap: 24 },
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    color: sourceColor('var(--uc-text)'),
  },
  options: { marginTop: 0 },
  label: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 20,
    color: sourceColor('var(--uc-text)'),
  },
  other: { paddingLeft: 40, paddingTop: 8 },
  footer: { paddingHorizontal: 24, paddingBottom: 34, paddingTop: 16 },
});
