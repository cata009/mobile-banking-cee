import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BaselinePageHeader } from '../../../../../../universal/BaselinePageHeader';
import { BaselineTextField } from '../../../../../../universal/BaselineTextField';
import { PrimaryButton } from '../../../../../../universal/PrimaryButton';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../../universal/Typography';
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
  const text = sourceColor('var(--uc-text)', dark);
  const olive = sourceColor('var(--uc-green-olive)', dark);
  return (
    <View
      testID="ro-payment-success"
      style={[
        styles.screen,
        { backgroundColor: sourceColor('var(--uc-surface)', dark) },
      ]}
    >
      <View style={styles.successHeading}>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: text }]}
        >
          {host.t(
            'runtime.payments.domesticFlow.successfulPayment',
            'Successful payment',
          )}
        </Text>
      </View>
      <View style={styles.successBody}>
        <View style={styles.checkPosition}>
          <View
            testID="ro-payment-success-check"
            style={[styles.check, { borderColor: olive }]}
          >
            <SourceCustomIcon name="prime-check" size={64} color={olive} />
          </View>
        </View>
        <Text style={[styles.message, { color: text }]}>
          {host.t(
            'runtime.payments.domesticFlow.paymentSentToBank',
            'Your payment has been successfully sent to the bank',
          )}
        </Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton
          label={host.t('runtime.actions.okGotIt', 'Ok, got it')}
          onPress={onDone}
          dark={dark}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, width: '100%', overflow: 'hidden' },
  signBody: { flex: 1, minHeight: 0, paddingHorizontal: 24, paddingTop: 150 },
  footer: { paddingHorizontal: 24, paddingBottom: 42 },
  successHeading: { paddingHorizontal: 24, paddingTop: 84 },
  title: { fontFamily: 'UniCredit-bold', fontSize: 28 },
  successBody: { flex: 1, minHeight: 0, paddingHorizontal: 24 },
  checkPosition: { alignItems: 'center', paddingTop: 58 },
  check: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Source uc-type-n4 overrides the utility leading-[22px] with normal font metrics.
  message: { fontFamily: 'UniCredit-regular', fontSize: 16, paddingTop: 58 },
});
