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
import { FaceIdOverlay } from '../../../current/baseline/FaceIdOverlay';
import { ModalPortal } from '../../../../../universal/ModalPortal';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { sourceColor } from '../../../../../universal/sourceColor';
import faceIdAsset from '@/assets/mobile-first/it/profile/settings/face-id.svg';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';

export interface AuthorizationProps {
  onSign: () => void;
  onBack: () => void;
  title?: string;
  pinLabel?: string;
  pinHelper?: string;
  actionLabel?: string;
  pinTopSpacing?: number;
  pinFocused?: boolean;
  screenTopInset?: number;
  isActive?: boolean;
  demoPresentation?: 'confirmation' | 'face-id';
  canonicalControls?: boolean;
}
/** Source standard-sign is a demonstration, not a PIN credential service. Device authentication is real only when the native port reports success. */
export function Authorization({
  onSign,
  onBack,
  title = 'Sign',
  pinLabel = 'Enter pin code',
  pinHelper = 'Be sure that nobody is watching you',
  actionLabel = 'Sign',
  pinTopSpacing = 150,
  pinFocused = false,
  screenTopInset = 0,
  isActive = true,
  demoPresentation = 'confirmation',
  canonicalControls = false,
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
      titleGutter={canonicalControls ? 24 : undefined}
      footer={
        canonicalControls ? (
          <PrimaryButton
            label={actionLabel}
            onPress={auth.sign}
            disabled={
              auth.busy ||
              auth.demo ||
              auth.available === null ||
              auth.completed
            }
          />
        ) : (
          <Button
            label={actionLabel}
            onPress={auth.sign}
            disabled={
              auth.busy ||
              auth.demo ||
              auth.available === null ||
              auth.completed
            }
          />
        )
      }
    >
      <View
        testID="authorization-pin-field"
        style={[s.pad, styles.pin, { paddingTop: pinTopSpacing }]}
      >
        <FormField
          tokens={tokens}
          label={pinLabel}
          value={pin}
          onChange={setPin}
          containerStyle={pinFocused ? styles.focusedField : undefined}
          labelStyle={
            pinFocused
              ? [styles.focusedLabel, { color: tokens.accent }]
              : undefined
          }
          inputProps={{
            secureTextEntry: true,
            keyboardType: 'number-pad',
            autoCorrect: false,
            autoCapitalize: 'none',
            maxLength: 12,
            textContentType: 'none',
            style: pinFocused
              ? {
                  height: 24,
                  minHeight: 24,
                  paddingVertical: 0,
                  fontSize: 20,
                  lineHeight: 24,
                  borderColor: tokens.accent,
                }
              : undefined,
          }}
        />
        <Copy
          size={pinFocused ? 13 : 14}
          lineHeight={pinFocused ? 16 : undefined}
          letterSpacing={pinFocused ? 0.3 : undefined}
          color={pinFocused ? tokens.muted : undefined}
        >
          {pinHelper}
        </Copy>
        {auth.error ? <Copy color="#e2001a">{auth.error}</Copy> : null}
      </View>
      {auth.demo && demoPresentation === 'face-id' ? (
        <ModalPortal
          transparent
          visible
          animationType="none"
          onRequestClose={auth.cancel}
        >
          <View
            style={StyleSheet.absoluteFill}
            accessibilityLabel="Simulated Face ID"
          >
            <FaceIdOverlay
              onComplete={auth.finish}
              glyph={
                <AssetGlyph
                  asset={faceIdAsset}
                  size={72}
                  tintColor={sourceColor('var(--uc-green-success)')}
                />
              }
            />
          </View>
        </ModalPortal>
      ) : auth.demo ? (
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
const styles = StyleSheet.create({
  pin: { paddingTop: 150 },
  focusedField: { width: 295, gap: 4, marginBottom: 0 },
  focusedLabel: { fontSize: 14, lineHeight: 16 },
});
