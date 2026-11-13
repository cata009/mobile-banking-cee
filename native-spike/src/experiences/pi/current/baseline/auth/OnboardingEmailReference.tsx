import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SourceLogo } from '../../profile/SourceLogo';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { BaselineNavigationLink } from '../../../../../universal/BaselineNavigationLink';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';

/** Executable bank-message content from the mail reference; the external mail application's chrome is not reproduced. */
export function OnboardingEmailReference({
  onResume,
  onDocument,
}: {
  onResume: () => void;
  onDocument: (name: string) => void;
}) {
  return (
    <View style={s.content}>
      <Text style={s.subject}>
        UniCredit: Please find below your pre-contractual documents
      </Text>
      <SourceLogo
        color={sourceColor('var(--uc-text)')}
        width={140}
        height={24}
      />
      <Text style={s.body}>Dear Mario Rossi,</Text>
      <Text style={s.body}>
        This is the link to resume the process any team if it will be
        interrupted for any reason:
      </Text>
      <PrimaryButton label="Resume the process" onPress={onResume} />
      <Text style={s.body}>
        Also, find below all your{' '}
        <Text style={s.bold}>pre-contractual documents:</Text>
      </Text>
      <Text style={s.bold}>INFORMATIVE SHEETS AND FID</Text>
      {[
        'MY GENIUS CURRENT ACCOUNT',
        'ACCESSORIES SERVICES',
        'DEBIT CARD',
        'MULTICHANNEL BANK',
      ].map(name => (
        <BaselineNavigationLink
          key={name}
          text={name}
          presentation="primary"
          onPress={() => onDocument(name)}
        />
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  content: { gap: 24 },
  subject: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    lineHeight: 32,
    color: sourceColor('var(--uc-text)'),
  },
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    color: sourceColor('var(--uc-text)'),
  },
  bold: { fontFamily: 'UniCredit-bold', color: sourceColor('var(--uc-text)') },
});
