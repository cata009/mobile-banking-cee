import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BaselineNpsStars } from '../../../../../universal/BaselineFeedbackProgress';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import { RadioButton } from '../../../../../universal/RadioButton';
export function OnboardingRating({
  value,
  comment,
  onRating,
  onComment,
  improvement,
}: {
  value: number;
  comment: string;
  onRating: (value: number) => void;
  onComment: (value: string) => void;
  improvement?: { value: string; onChange: (value: string) => void };
}) {
  return (
    <View style={s.content}>
      <Text style={s.label}>Acordă un calificativ experienței</Text>
      <BaselineNpsStars value={value} onChange={onRating} description="" />
      <BaselineTextField
        label="Comentariul tau asupra experientei"
        value={comment}
        onChange={onComment}
        maxLength={1000}
      />
      {improvement && value > 0 && value <= 3 && (
        <View style={s.content}>
          <Text style={[s.label, { fontSize: 18, lineHeight: 24 }]}>
            Cum putem imbunatati fluxul?
          </Text>
          {[
            'Durata fluxului',
            'Timpul de raspuns',
            'Numarul informatii solicitate',
            'Informatii mai clare',
            'Alt motiv',
          ].map(reason => (
            <RadioButton
              key={reason}
              label={reason}
              selected={improvement.value === reason}
              onPress={() => improvement.onChange(reason)}
              paddingHorizontal={0}
              style={{ paddingVertical: 0, minHeight: 32, gap: 2 }}
              labelStyle={{
                fontFamily: 'UniCredit-regular',
                fontSize: 18,
                lineHeight: 24,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  content: { gap: 24 },
  label: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    color: sourceColor('var(--uc-text)'),
  },
});
