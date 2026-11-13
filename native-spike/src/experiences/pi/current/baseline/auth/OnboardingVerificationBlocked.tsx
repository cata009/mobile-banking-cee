import React from 'react';
import { StyleSheet, View } from 'react-native';
import failed from '@/assets/pi/ro/onboarding/verification-failed.svg';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';

/** Source 9852:63286: terminal verification state, not a retryable inline error. */
export function OnboardingVerificationBlocked({
  resend,
  reason = 'otp',
  onRestart,
  onSupport,
  onClose,
  topInset,
}: {
  resend: boolean;
  reason?: 'otp' | 'password' | 'phone' | 'pin';
  onRestart: () => void;
  onSupport: () => void;
  onClose: () => void;
  topInset: number;
}) {
  return (
    <View style={s.root}>
      <BaselinePageHeader
        title=""
        renderLargeTitle={false}
        showBack={false}
        showHelp={false}
        onBack={onClose}
        includeSafeArea
        safeAreaReserve={topInset}
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
      <View style={[s.message, { paddingTop: 32 }]}>
        <AssetGlyph asset={failed} size={100} />
        <Text accessibilityRole="header" style={s.title}>
          Nu mai poți continua
        </Text>
        <Text style={s.body}>
          {reason === 'pin'
            ? 'Ai introdus PIN-ul greșit de prea multe ori.'
            : reason === 'password'
              ? 'Ai introdus parola greșită de prea multe ori.'
              : reason === 'phone'
                ? 'Ai introdus numărul greșit de prea multe ori.'
                : resend
                  ? 'Ai solicitat de prea multe ori retrimiterea codului OTP.'
                  : 'Ai introdus de prea multe ori un cod OTP incorect.'}
        </Text>
        {reason === 'otp' ? (
          <Text style={[s.body, s.bold]}>Încercări rămase: 0</Text>
        ) : (
          <>
            <Text style={s.body}>Ai atins limita maximă de 3 încercări.</Text>
            <Text style={s.body}>Te rugăm să ne contactezi pentru suport.</Text>
          </>
        )}
      </View>
      <View style={s.footer}>
        <PrimaryButton label="Reincepe fluxul" onPress={onRestart} />
        <PrimaryButton
          label="Vreau Suport"
          variant="secondary"
          onPress={onSupport}
        />
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: sourceColor('var(--uc-surface)') },
  message: { flex: 1, alignItems: 'center', paddingHorizontal: 24, gap: 24 },
  title: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    textAlign: 'center',
    color: sourceColor('var(--uc-text)'),
  },
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    color: sourceColor('var(--uc-text)'),
  },
  bold: { fontFamily: 'UniCredit-bold' },
  footer: { paddingHorizontal: 24, paddingBottom: 34, gap: 8 },
});
