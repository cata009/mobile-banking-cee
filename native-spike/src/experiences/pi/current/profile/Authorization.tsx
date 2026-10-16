import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SourceTextField } from './SourceTextField';
import type { CurrentScreenProps } from '../contracts';
import { ProfileHost, translateProfile } from './Host';
import { Button, Page, s } from './Primitives';
import FaceIdAnimation from './FaceIdAnimation';
export interface AuthorizationProps {
  host: CurrentScreenProps;
  title: string;
  onBack: () => void;
  onDone: () => void;
  actionLabel?: string;
}
function Content({
  host,
  title,
  onBack,
  onDone,
  actionLabel = 'Sign',
}: AuthorizationProps) {
  const [pin, setPin] = useState('******');
  const [authenticating, setAuthenticating] = useState(false);
  const back = () => {
    setAuthenticating(false);
    onBack();
  };
  return (
    <Page
      title={title}
      onBack={back}
      active={host.isActive}
      showHelp={false}
      topInset={host.screenTopInset}
      footerStyle={styles.footer}
      overlay={
        authenticating && host.isActive ? (
          <FaceIdAnimation
            onComplete={() => {
              setAuthenticating(false);
              onDone();
            }}
          />
        ) : null
      }
      footer={
        <Button
          label={actionLabel}
          onPress={() => setAuthenticating(true)}
          disabled={authenticating}
        />
      }
    >
      <View style={[s.pad, styles.pin]}>
        <SourceTextField
          label={translateProfile(
            host,
            'paymentFlow.sign.enterPin',
            'Enter pin code',
          )}
          value={pin}
          onChange={setPin}
          visualState="on-focus"
          helperText={translateProfile(
            host,
            'paymentFlow.sign.pinHelper',
            'Be sure that nobody is watching you',
          )}
          inputProps={{
            secureTextEntry: false,
            keyboardType: 'default',
            autoCorrect: false,
            autoCapitalize: 'none',
            textContentType: 'none',
          }}
        />
      </View>
    </Page>
  );
}
export function Authorization(props: AuthorizationProps) {
  return (
    <ProfileHost host={props.host}>
      <Content {...props} />
    </ProfileHost>
  );
}
export default Authorization;
const styles = StyleSheet.create({
  pin: { paddingTop: 150 },
  footer: { paddingTop: 0, paddingBottom: 42 },
});
