import type { ProductsCard } from '@/app/config/productsMenuConfig'

export interface ProductDetailSelection {
  cardId: ProductsCard['id']
  categoryTitle: string
  optionId: string
  title: string
  /** ShopSmart offers use the shared detail route without pretending to be a product option. */
  offerId?: string
  /**
   * Carried from the Evo 2027 shelf so the detail page opens on the same
   * photograph and the same promise the customer just tapped, instead of
   * swapping to a generic illustration.
   */
  heroImage?: string
  heroImagePosition?: string
  headline?: string
  intro?: string
}
