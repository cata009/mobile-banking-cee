import { resolvePaymentHero, type PaymentHeroPreset } from './paymentHero'

export type PaymentImageAlignment = 'right-bottom' | 'center'

// Existing classic RN placement, extracted without changing the source assets or crops.
const alignedBounds: Partial<Record<PaymentHeroPreset, { width: number; height: number }>> = {
  'payments-1': { width: 105, height: 104 },
  'payments-2': { width: (137 * 92) / 103, height: 92 },
  'payments-3': { width: (87 * 104) / 120, height: 104 },
  'payments-4': { width: (110 * 104) / 120, height: 104 },
  'payments-5': { width: (66 * 104) / 120, height: 104 },
  'payments-9': { width: 118, height: (120 * 118) / 137 },
}

export function resolvePaymentPreset(preset: PaymentHeroPreset, alignment: PaymentImageAlignment = 'right-bottom') {
  const slot = resolvePaymentHero({ title: '', imageVariant: preset }).image
  return {
    ...slot,
    ...(alignment === 'right-bottom' ? alignedBounds[preset] : undefined),
    resizeMode: alignment === 'right-bottom' ? ('stretch' as const) : ('contain' as const),
  }
}
