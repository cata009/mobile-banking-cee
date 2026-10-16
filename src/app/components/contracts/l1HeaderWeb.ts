import { resolveL1Header, type L1HeaderVariant } from './l1Header'
const webVariants = {
  home: { gutterClass: 'px-[24px]', paddingBottomClass: 'pb-[24px]', titleClass: 'uc-type-h1 text-[var(--uc-text)]' },
  more: { gutterClass: 'px-[16px]', paddingBottomClass: 'pb-[24px]', titleClass: 'uc-type-h1 flex-1 min-w-0 text-[var(--uc-text)]' },
  products: { gutterClass: 'px-[24px]', paddingBottomClass: 'pb-[22px]', titleClass: 'uc-type-n1 flex-1 min-w-0 text-[var(--uc-text)]' },
  payments: { gutterClass: 'px-[20px]', paddingBottomClass: 'pb-[20px]', titleClass: 'uc-type-h1 flex-1 min-w-0 text-[var(--uc-text)]' },
  analytics: { gutterClass: 'px-[24px]', paddingBottomClass: 'pb-[20px]', titleClass: 'uc-type-h1 min-w-0 flex-1 text-[var(--uc-text)]' },
} as const
export function l1HeaderWeb(variant: L1HeaderVariant, gutterClassName?: string) {
  const state = resolveL1Header(variant)
  const web = webVariants[variant]
  return {
    ...state, ...web,
    rootClass: state.backgroundToken ? 'w-full bg-[var(--uc-app-bg)]' : 'w-full',
    contentClass: `${gutterClassName ?? web.gutterClass} ${web.paddingBottomClass}`,
    rowClass: 'flex min-h-[32px] items-start gap-[8px]',
    homeActionsClass: 'flex h-[56px] items-start justify-between px-[24px] pb-[24px]',
    titleStyle: variant === 'products' ? { fontSize: '28px', lineHeight: '36px' } : undefined,
  } as const
}
