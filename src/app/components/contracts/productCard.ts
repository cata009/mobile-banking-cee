export type ProductCardVariant = 'legacy' | 'evolution'
export type ProductCardStyle = 'pi' | 'sme'
export type ProductCardStackRole = 'single' | 'first' | 'middle' | 'last'
export interface ProductCardOptions {
  variant?: ProductCardVariant
  productStyle?: ProductCardStyle
  stackRole?: ProductCardStackRole
  leadingVisual?: 'currency' | 'card'
  actionCount?: number
  hasFooter?: boolean
  interactive?: boolean
}
/** Presentation only: amounts, privacy strings and actions are supplied by owners. */
export function resolveProductCard({
  variant = 'legacy',
  productStyle = 'pi',
  stackRole = 'single',
  leadingVisual = 'currency',
  actionCount = 0,
  hasFooter = false,
  interactive = false,
}: ProductCardOptions = {}) {
  const evolution = variant === 'evolution'
  return {
    variant,
    productStyle,
    stackRole,
    leadingVisual,
    evolution,
    interactive,
    actionLimit: 4,
    hasActions: evolution && actionCount > 0,
    hasFooter: evolution && hasFooter,
    radius: 8,
    topRadius: stackRole === 'last' || stackRole === 'middle' ? 0 : 8,
    bottomRadius: stackRole === 'first' || stackRole === 'middle' ? 0 : 8,
    hasSeparator: evolution && (stackRole === 'middle' || stackRole === 'last'),
    gap: evolution ? (actionCount > 0 ? 32 : hasFooter ? 16 : 8) : 4,
    padding: 16,
    backgroundToken: evolution && productStyle === 'sme' ? '--uc-neutral-200' : '--uc-surface-raised',
    titleFontSize: 18,
    titleLineHeight: evolution ? 20 : 'normal',
    titleWeight: evolution ? 700 : 400,
    subtitleFontSize: 14,
    subtitleLineHeight: evolution ? 16 : 'normal',
    subtitleWeight: evolution ? 400 : 700,
    amountFontSize: evolution ? 24 : 20,
    amountLineHeight: evolution ? 28 : 'normal',
    leadingWidth: evolution && leadingVisual === 'card' ? 64 : 32,
    leadingHeight: evolution && leadingVisual === 'card' ? 40 : 32,
    textToken: '--uc-text',
    titleToken: evolution ? '--uc-primary-k0' : '--uc-text',
    hoverOpacity: interactive ? 0.9 : 1,
  } as const
}
