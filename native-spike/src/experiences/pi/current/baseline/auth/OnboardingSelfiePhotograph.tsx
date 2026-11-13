import React from 'react';
import { StyleSheet, View } from 'react-native';
import centerPhoto from '@/assets/pi/ro/onboarding/selfie-center-source.png';
import smilePhoto from '@/assets/pi/ro/onboarding/selfie-smile-source.png';
import { RasterImage } from '../offers/RasterImage';
import type { SelfiePhase } from './OnboardingSelfieCapture';
import { useDemoViewport } from '../../../../../universal/DemoViewport';
import { IDENTIFICATION_PROVIDER_COLORS as provider } from '@/features/ro-onboarding/providerPresentation';

/** User-approved photographic crop: source pixels above y=194 never enter this viewport. */
export function OnboardingSelfiePhotograph({ phase }: { phase: SelfiePhase }) {
  const viewport = useDemoViewport();
  const scale = viewport.width / 375;
  const left = 0;
  return (
    <View pointerEvents="none" style={s.viewport}>
      <RasterImage
        source={{
          uri:
            phase === 'center' || phase === 'error' ? centerPhoto : smilePhoto,
        }}
        resizeMode="cover"
        style={{
          position: 'absolute',
          width: 375 * scale,
          height: 667 * scale,
          top: -194 * scale,
          left,
        }}
      />
      {(phase === 'center' || phase === 'smile') && (
        <View
          style={{
            position: 'absolute',
            left: left + 76 * scale,
            top: 40 * scale,
            width: 224 * scale,
            height: 306 * scale,
            borderWidth: 3 * scale,
            borderColor: provider.captureGuide,
            borderRadius: '50%',
          }}
        />
      )}
    </View>
  );
}
const s = StyleSheet.create({
  viewport: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
});
