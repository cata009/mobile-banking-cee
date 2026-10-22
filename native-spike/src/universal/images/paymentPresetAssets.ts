import type { ImageSourcePropType } from 'react-native';
import type { PaymentHeroPreset } from '@/app/components/contracts/paymentHero';

export const paymentPresetAssets: Readonly<
  Record<PaymentHeroPreset, ImageSourcePropType>
> = {
  'payments-1': require('../../../../screenshots/payments1.png'),
  'payments-2': require('../../../../screenshots/payments2.png'),
  'payments-3': require('../../../../screenshots/payments3.png'),
  'payments-4': require('../../../../screenshots/payments4.png'),
  'payments-5': require('../../../../screenshots/payments5.png'),
  'payments-6': require('../../../../screenshots/payments6.png'),
  'payments-7': require('../../../../screenshots/payments7.png'),
  'payments-8': require('../../../../screenshots/payments8.png'),
  'payments-9': require('../../../../screenshots/payments9.png'),
};
