import type { ImageSourcePropType } from 'react-native';
import type { PaymentHeroPreset } from '@/app/components/contracts/paymentHero';
import p1 from '../../../../screenshots/payments1.png';
import p2 from '../../../../screenshots/payments2.png';
import p3 from '../../../../screenshots/payments3.png';
import p4 from '../../../../screenshots/payments4.png';
import p5 from '../../../../screenshots/payments5.png';
import p6 from '../../../../screenshots/payments6.png';
import p7 from '../../../../screenshots/payments7.png';
import p8 from '../../../../screenshots/payments8.png';
import p9 from '../../../../screenshots/payments9.png';

export const paymentPresetAssets: Readonly<
  Record<PaymentHeroPreset, ImageSourcePropType>
> = {
  'payments-1': { uri: p1 },
  'payments-2': { uri: p2 },
  'payments-3': { uri: p3 },
  'payments-4': { uri: p4 },
  'payments-5': { uri: p5 },
  'payments-6': { uri: p6 },
  'payments-7': { uri: p7 },
  'payments-8': { uri: p8 },
  'payments-9': { uri: p9 },
};
