import type { ProductsCardId } from '@/app/config/productsMenuConfig'

/** Caller-supplied product content; actions stay on the event side of the boundary. */
export interface NativeProductDetailPresentation {
  title: string
  cardId?: ProductsCardId
  optionId?: string
  actionLabel?: string
  includeSafeArea?: boolean
  heroImage?: string
  heroImagePosition?: string
  headline?: string
  intro?: string
}
