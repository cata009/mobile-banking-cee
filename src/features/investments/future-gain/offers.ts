import type { ProductsOffer } from '@/app/config/productsMenuConfig'
import { isFutureGainAvailable } from './model'

export const FUTURE_GAIN_SMART_INVESTMENT_OFFER: ProductsOffer = {
  id: 'future-gain-smart-investment',
  title: 'Check smart\ninvestment',
  description: 'Explore investment opportunities',
  colorFamily: 'yellow',
  lightVersion: false,
}

/** Original RS Future Gain shelf composition, shared by all active renderers. */
export function getFutureGainProductOffers(
  context: Parameters<typeof isFutureGainAvailable>[0],
  offers: readonly ProductsOffer[],
): ProductsOffer[] {
  if (!isFutureGainAvailable(context)) return [...offers]
  return [
    {
      ...offers[0],
      id: 'future-gain-products-for-you',
      title: 'Products for you!',
      description: 'Portfolio insights from clients with similar ages and monthly income.',
      colorFamily: 'green',
      lightVersion: false,
    },
    FUTURE_GAIN_SMART_INVESTMENT_OFFER,
  ]
}
