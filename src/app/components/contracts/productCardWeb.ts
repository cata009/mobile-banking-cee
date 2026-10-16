import { resolveProductCard, type ProductCardOptions } from './productCard'
export function productCardWeb(options: ProductCardOptions = {}) {
  const state = resolveProductCard(options)
  return {
    ...state,
    radiusClass:
      state.stackRole === 'first'
        ? 'rounded-t-[8px]'
        : state.stackRole === 'last'
          ? 'rounded-b-[8px]'
          : state.stackRole === 'middle'
            ? 'rounded-none'
            : 'rounded-[8px]',
    gapClass: state.gap === 32 ? 'gap-[32px]' : state.gap === 16 ? 'gap-[16px]' : 'gap-[8px]',
    leadingClass: state.leadingVisual === 'card' ? 'h-[40px] w-[64px]' : 'size-[40px]',
  }
}
