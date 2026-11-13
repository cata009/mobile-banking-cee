import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../../universal/Typography';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { sourceColor } from '../../../../../universal/sourceColor';
import { OnboardingSelfiePhotograph } from './OnboardingSelfiePhotograph';
import { useDemoViewport } from '../../../../../universal/DemoViewport';
import { IDENTIFICATION_PROVIDER_COLORS as provider } from '@/features/ro-onboarding/providerPresentation';
export type SelfiePhase = 'center' | 'smile' | 'waiting' | 'error';
/** Provider controls are executable; the photographic preview is a separate slot. */
export function OnboardingSelfieCapture({
  phase,
  remaining,
  topInset,
  preview,
  onCapture,
  onRetry,
  onClose,
}: {
  phase: SelfiePhase;
  remaining: number;
  topInset: number;
  preview?: React.ReactNode;
  onCapture: () => void;
  onRetry: () => void;
  onClose: () => void;
}) {
  const viewport = useDemoViewport();
  return (
    <View style={s.root}>
      <View
        style={[s.toolbar, { paddingTop: topInset, height: topInset + 43 }]}
      >
        <Text style={s.toolbarTitle}>ONBOARDING</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Închide identificarea"
          onPress={onClose}
          style={s.close}
        >
          <SourceCustomIcon
            name="close-flow"
            size={20}
            color={sourceColor('var(--uc-static-white)')}
          />
        </Pressable>
      </View>
      <Text accessibilityRole="header" style={s.title}>
        Record a selfie video
      </Text>
      {(phase === 'center' || phase === 'smile') && (
        <View style={s.status}>
          <View
            style={[
              s.dot,
              {
                backgroundColor:
                  phase === 'center' ? provider.positioning : provider.smile,
              },
            ]}
          />
          <Text style={s.statusLabel}>
            {phase === 'center'
              ? 'Please center your face in the oval'
              : 'Please smile in the camera.'}
          </Text>
        </View>
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          phase === 'center' ? 'Confirm face in oval' : 'Capture smile'
        }
        disabled={phase === 'waiting' || phase === 'error'}
        onPress={onCapture}
        style={[s.preview, { height: (473 * viewport.width) / 375 }]}
      >
        {preview ?? <OnboardingSelfiePhotograph phase={phase} />}
        {phase === 'waiting' && (
          <ActivityIndicator
            accessibilityLabel="Processing identification"
            color={sourceColor('var(--uc-static-white)')}
            size="large"
          />
        )}
      </Pressable>
      {phase === 'error' && (
        <View style={s.overlay}>
          <View accessibilityRole="alert" style={s.alert}>
            <Text style={s.errorTitle}>Recognition failed</Text>
            <Text style={s.errorText}>
              Unfortunately it was not possible to process you picture.{'\n'}
              Please follow precisely the steps presented on the screen.{'\n\n'}
              You have {remaining} attempts left.
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Try Again"
              onPress={onRetry}
              style={s.retry}
            >
              <Text style={s.retryText}>Try Again</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: provider.background },
  toolbar: {
    minHeight: 63,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingBottom: 12,
  },
  toolbarTitle: {
    fontFamily: 'UniCredit-bold',
    letterSpacing: 1.5,
    fontSize: 14,
    color: sourceColor('var(--uc-static-white)'),
  },
  close: {
    position: 'absolute',
    right: 16,
    bottom: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    color: sourceColor('var(--uc-static-white)'),
    marginHorizontal: 24,
    marginTop: 28,
  },
  status: {
    height: 32,
    borderRadius: 18,
    marginHorizontal: 24,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: sourceColor('var(--uc-static-white)') + '33',
    paddingHorizontal: 12,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    color: sourceColor('var(--uc-static-white)'),
  },
  preview: {
    marginTop: 17,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  oval: {
    width: 224,
    height: 306,
    borderWidth: 3,
    borderColor: provider.captureGuide,
    borderRadius: 140,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: sourceColor('var(--uc-static-black)') + '33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alert: {
    width: 270,
    paddingTop: 20,
    borderRadius: 14,
    backgroundColor: provider.alertSurface,
    overflow: 'hidden',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: sourceColor('var(--uc-static-black)'),
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 32,
    color: sourceColor('var(--uc-static-black)'),
  },
  retry: {
    borderTopWidth: 1,
    borderTopColor: provider.alertDivider,
    padding: 12,
    alignItems: 'center',
  },
  retryText: { color: provider.alertAction, fontSize: 18 },
});
