import React, { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FormField } from '../../../../../universal/FormField';
import {
  Button,
  Confirm,
  Copy,
  Page,
  s,
  useCurrentTokens,
} from '../profile/Primitives';
import { useDemoAuthorization } from './features/useDemoAuthorization';

export interface AuthorizationProps {
  onSign: () => void;
  onBack: () => void;
  title?: string;
  pinLabel?: string;
  pinHelper?: string;
  actionLabel?: string;
  screenTopInset?: number;
  isActive?: boolean;
}
/** Source standard-sign is a demonstration, not a PIN credential service. Device authentication is real only when the native port reports success. */
export function Authorization({
  onSign,
  onBack,
  title = 'Sign',
  pinLabel = 'Enter pin code',
  pinHelper = 'Be sure that nobody is watching you',
  actionLabel = 'Sign',
  screenTopInset = 0,
  isActive = true,
}: AuthorizationProps) {
  const tokens = useCurrentTokens();
  const [pin, setPin] = useState('******');
  const auth = useDemoAuthorization({
    onCancelled: () => setPin('******'),
    onComplete: () => {
      setPin('');
      onSign();
    },
    title,
    isActive,
  });
  const back = useCallback(() => {
    auth.cancel();
    setPin('******');
    onBack();
  }, [auth, onBack]);
  return (
    <Page
      title={title}
      onBack={back}
      topInset={screenTopInset}
      active={isActive}
      footer={
        <Button
          label={actionLabel}
          onPress={auth.sign}
          disabled={auth.busy || auth.available === null || auth.completed}
        />
      }
    >
      <View style={[s.pad, styles.pin]}>
        <FormField
          tokens={tokens}
          label={pinLabel}
          value={pin}
          onChange={setPin}
          inputProps={{
            secureTextEntry: true,
            keyboardType: 'number-pad',
            autoCorrect: false,
            autoCapitalize: 'none',
            maxLength: 12,
            textContentType: 'none',
          }}
        />
        <Copy size={14}>{pinHelper}</Copy>
        {auth.error ? <Copy color="#e2001a">{auth.error}</Copy> : null}
      </View>
      {auth.demo ? (
        <Confirm
          title="Demo authorization"
          body="Device biometrics are unavailable. Continue this simulated banking operation explicitly. No Face ID verification is performed."
          onCancel={auth.closeDemo}
          onConfirm={auth.finish}
          confirmLabel="Continue demo"
          cancelLabel="Cancel"
        />
      ) : null}
    </Page>
  );
}
const styles = StyleSheet.create({ pin: { paddingTop: 150 } });
