import type { ProductCardVariant, ProductCardStyle } from './productCard'
export function resolveTotalRow({
  variant = 'legacy',
  productStyle = 'pi',
}: { variant?: ProductCardVariant; productStyle?: ProductCardStyle } = {}) {
  const evolution = variant === 'evolution'
  return {
    variant,
    evolution,
    productStyle,
    width: evolution ? 327 : undefined,
    padding: evolution ? 16 : 0,
    gap: 4,
    bottomRadius: evolution ? 4 : 0,
    backgroundToken: evolution ? (productStyle === 'sme' ? '--uc-neutral-200' : '--uc-surface-raised') : undefined,
    textToken: '--uc-text',
    titleFontSize: 18,
    titleLineHeight: evolution ? 20 : 'normal',
    amountFontSize: 20,
    amountLineHeight: evolution ? 20 : 'normal',
    decimalsFontSize: 14,
    decimalsLineHeight: evolution ? 16 : 'normal',
  } as const
}
