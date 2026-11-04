import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BaselinePageHeader } from '../../../../../../universal/BaselinePageHeader';
import { BaselineStandardSuccess } from '../../../../../../universal/BaselineStandardSuccess';
import { BaselineTextField } from '../../../../../../universal/BaselineTextField';
import { PrimaryButton } from '../../../../../../universal/PrimaryButton';
import { sourceColor } from '../../../../../../universal/sourceColor';
import type { CurrentScreenProps } from '../../../contracts';
import { FaceIdOverlay } from '../../FaceIdOverlay';

/** Source PaymentSignScreen: editable seeded PIN and its 840ms demo authentication. */
export function RoBaselinePaymentSign({
  host,
  onBack,
  onSign,
}: {
  host: CurrentScreenProps;
  onBack: () => void;
  onSign: () => void;
}) {
  const [pin, setPin] = useState('******');
  const [authenticating, setAuthenticating] = useState(false);
  useEffect(() => {
    if (!host.isActive) setAuthenticating(false);
  }, [host.isActive]);
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const title = host.t('runtime.actions.sign', 'Sign');
  return (
    <View
      testID="ro-payment-sign"
      style={[
        styles.screen,
        { backgroundColor: sourceColor('var(--uc-surface)', dark) },
      ]}
    >
      <BaselinePageHeader
        title={title}
        onBack={onBack}
        includeSafeArea
        showHelp={false}
        safeAreaReserve={host.screenTopInset}
        dark={dark}
      />
      <View style={styles.signBody}>
        <BaselineTextField
          label={host.t(
            'runtime.payments.domesticFlow.enterPinCode',
            'Enter pin code',
          )}
          value={pin}
          onChange={setPin}
          helperText={host.t(
            'runtime.payments.domesticFlow.pinPrivacyHint',
            'Be sure that nobody is watching you',
          )}
          visualState="on-focus"
          dark={dark}
        />
      </View>
      <View style={styles.footer}>
        <PrimaryButton
          label={title}
          disabled={authenticating || !host.isActive}
          dark={dark}
          onPress={() => {
            if (!authenticating && host.isActive) setAuthenticating(true);
          }}
        />
      </View>
      {authenticating && host.isActive ? (
        <FaceIdOverlay
          success={sourceColor('var(--uc-green-success)', dark)}
          onComplete={() => {
            setAuthenticating(false);
            if (host.isActive) onSign();
          }}
        />
      ) : null}
    </View>
  );
}

/** Source PaymentSuccessScreen leaves lifecycle clearing/navigation to its parent. */
export function RoBaselinePaymentSuccess({
  host,
  onDone,
}: {
  host: CurrentScreenProps;
  onDone: () => void;
}) {
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  return (
    <BaselineStandardSuccess
      testID="ro-payment-success"
      checkTestID="ro-payment-success-check"
      title={host.t(
        'runtime.payments.domesticFlow.successfulPayment',
        'Successful payment',
      )}
      message={host.t(
        'runtime.payments.domesticFlow.paymentSentToBank',
        'Your payment has been successfully sent to the bank',
      )}
      actionLabel={host.t('runtime.actions.okGotIt', 'Ok, got it')}
      onDone={onDone}
      dark={dark}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, width: '100%', overflow: 'hidden' },
  signBody: { flex: 1, minHeight: 0, paddingHorizontal: 24, paddingTop: 150 },
  footer: { paddingHorizontal: 24, paddingBottom: 42 },
});
