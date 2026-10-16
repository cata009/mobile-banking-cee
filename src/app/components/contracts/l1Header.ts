/** Geometry from the shipped L1 wrappers; action composition stays with each feature. */
export type L1HeaderVariant = 'home' | 'more' | 'products' | 'payments' | 'analytics'
const variants = {
  home: { gutter: 24, paddingBottom: 24, lineHeight: 'normal', rootTag: 'div', backgroundToken: undefined, splitActionsAndTitle: true },
  more: { gutter: 16, paddingBottom: 24, lineHeight: 'normal', rootTag: 'div', backgroundToken: undefined, splitActionsAndTitle: false },
  products: { gutter: 24, paddingBottom: 22, lineHeight: 36, rootTag: 'div', backgroundToken: '--uc-app-bg', splitActionsAndTitle: false },
  payments: { gutter: 20, paddingBottom: 20, lineHeight: 'normal', rootTag: 'div', backgroundToken: '--uc-app-bg', splitActionsAndTitle: false },
  analytics: { gutter: 24, paddingBottom: 20, lineHeight: 'normal', rootTag: 'header', backgroundToken: '--uc-app-bg', splitActionsAndTitle: false },
} as const
export function resolveL1Header(variant: L1HeaderVariant) {
  return { variant, ...variants[variant], titleFontSize: 28, titleFontWeight: 700, titleToken: '--uc-text', actionSize: 32, rowMinHeight: 32, rowGap: 8, actionsHeight: 56 } as const
}
