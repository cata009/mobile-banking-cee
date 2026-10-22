import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { PaymentHeroPreset } from '@/app/components/contracts/paymentHero';
import {
  resolvePaymentPreset,
  type PaymentImageAlignment,
} from '@/app/components/contracts/paymentImagePresets';
import { paymentPresetAssets } from './images/paymentPresetAssets';
import {
  resolvePaymentImage,
  type PaymentImageVariant,
} from '@/app/components/contracts/imageArtwork';
import { BaselineImageArtwork } from './images/BaselineImageArtwork';

export type BaselinePaymentImageProps = { ariaLabel?: string } & (
  | {
      variant: PaymentImageVariant;
      asset: string | number;
      width?: number;
      preset?: never;
      alignment?: never;
    }
  | {
      preset?: PaymentHeroPreset;
      asset?: never;
      alignment?: PaymentImageAlignment;
      variant?: never;
      width?: never;
    }
);

/** Payment artwork only; the owning hero card provides text and actions. */
export function BaselinePaymentImage({
  variant,
  width,
  ariaLabel,
  preset,
  alignment,
  asset,
}: BaselinePaymentImageProps = {}) {
  if (!variant) {
    const selectedPreset = preset ?? 'payments-1';
    const { resizeMode, ...geometry } = resolvePaymentPreset(
      selectedPreset,
      alignment,
    );
    return (
      <View
        accessible={Boolean(ariaLabel)}
        accessibilityLabel={ariaLabel}
        accessibilityRole={ariaLabel ? 'image' : undefined}
        accessibilityElementsHidden={!ariaLabel}
        importantForAccessibility={ariaLabel ? 'yes' : 'no-hide-descendants'}
        style={styles.canvas}
      >
        <Image
          source={paymentPresetAssets[selectedPreset]}
          resizeMode={resizeMode}
          accessible={false}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[styles.image, geometry]}
        />
      </View>
    );
  }
  return (
    <BaselineImageArtwork
      artwork={resolvePaymentImage({ variant, width })}
      asset={asset}
      ariaLabel={ariaLabel}
    />
  );
}

const styles = StyleSheet.create({
  canvas: { width: 137, height: 120 },
  image: { position: 'absolute' },
});
