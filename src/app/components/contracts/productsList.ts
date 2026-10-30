import type { ProductCardStackRole, ProductCardVariant } from './productCard'
export function resolveProductListStackRole({
  productIndex,
  productCount,
  isOpen,
  hasTotal,
}: {
  productIndex: number
  productCount: number
  isOpen: boolean
  hasTotal: boolean
}): ProductCardStackRole {
  if (!isOpen || productCount < 2) return 'single'
  if (productIndex === 0) return 'first'
  if (productIndex < productCount - 1 || hasTotal) return 'middle'
  return 'last'
}

export function resolveProductsList({
  productCount,
  isOpen,
  variant = 'legacy',
  showTotal = false,
  hasTotalData = false,
}: {
  productCount: number
  isOpen: boolean
  variant?: ProductCardVariant
  showTotal?: boolean
  hasTotalData?: boolean
}) {
  const evolution = variant === 'evolution'
  return {
    single: productCount === 1,
    evolution,
    showTotal: showTotal && hasTotalData && productCount >= 2,
    gutter: 24,
    gap: evolution ? 0 : 2,
    maxHeight: isOpen ? 2000 : 0,
    opacity: isOpen ? 1 : 0,
    paddingTop: isOpen && !evolution ? 2 : 0,
    shadowHidden: isOpen,
    contentHidden: !isOpen,
    durationMs: 300,
    easing: 'ease-in-out',
    shadowTranslateY: isOpen ? -2 : 0,
  } as const
}
