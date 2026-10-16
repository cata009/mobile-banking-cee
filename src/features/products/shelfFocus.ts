import type { ProductsCardId } from '@/app/config/productsMenuConfig'

export interface ProductsShelfFocusRequest {
  requestId: number
  cardId?: ProductsCardId | null
}
