import { FUTURE_GAIN_SMART_INVESTMENT_OFFER } from '@/features/investments/future-gain/offers';
import { SourceOfferCard } from '../products/SourceCards';


export function FutureGainBanner({
  onPress,
  dark = false,
}: {
  onPress: () => void;
  dark?: boolean;
}) {
  return <SourceOfferCard offer={FUTURE_GAIN_SMART_INVESTMENT_OFFER} onPress={onPress} dark={dark} />;
}
