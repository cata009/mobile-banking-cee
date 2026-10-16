import { resolveProductMenuCard, resolveProductOfferCard, resolveShopsmartOfferCard } from './marketingCard'
const menuClasses = {
  account: { standard: 'bottom-[-2px] right-0 h-[92px] w-[72px]', compact: 'bottom-[-2px] right-0 h-[60px] w-[48px]' },
  cards: { standard: 'bottom-0 right-0 h-[70px] w-[78px]', compact: 'bottom-0 right-0 h-[48px] w-[64px]' },
  'mortgages-loans': { standard: 'bottom-0 right-0 h-[74px] w-[78px]', compact: 'bottom-0 right-0 h-[48px] w-[56px]' },
  insurance: {
    standard: 'bottom-[-2px] right-[-2px] h-[76px] w-[72px]',
    compact: 'bottom-[-2px] right-[-2px] h-[50px] w-[54px]',
  },
  'investments-savings': {
    standard: 'bottom-[-2px] right-0 h-[100px] w-[58px]',
    compact: 'bottom-[-2px] right-0 h-[66px] w-[44px]',
  },
  'market-hedging': {
    standard: 'bottom-[-1px] right-0 h-[74px] w-[76px]',
    compact: 'bottom-[-1px] right-0 h-[50px] w-[58px]',
  },
  shopsmart: {
    standard: 'bottom-[-1px] right-0 h-[74px] w-[74px]',
    compact: 'bottom-[-1px] right-0 h-[50px] w-[58px]',
  },
  'partner-offers': {
    standard: 'bottom-[-1px] right-0 h-[78px] w-[70px]',
    compact: 'bottom-[-1px] right-0 h-[52px] w-[56px]',
  },
} as const
export function productMenuCardWeb(options: Parameters<typeof resolveProductMenuCard>[0]) {
  const state = resolveProductMenuCard(options)
  return {
    ...state,
    imagePlacement:
      menuClasses[options.id as keyof typeof menuClasses]?.[state.variant] ??
      (state.compact ? 'bottom-0 right-0 h-[50px] w-[58px]' : 'bottom-0 right-0 h-[74px] w-[78px]'),
  } as const
}
export const productOfferCardWeb = resolveProductOfferCard
export function shopsmartOfferCardWeb(options: Parameters<typeof resolveShopsmartOfferCard>[0]) {
  const state = resolveShopsmartOfferCard(options)
  return {
    ...state,
    pillClass:
      state.pillTone === 'white'
        ? 'bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-[0_0_4px_rgba(0,0,0,0.25)]'
        : 'bg-[var(--uc-action-strong)] text-[var(--uc-static-white)] shadow-[0_0_4px_rgba(0,0,0,0.25)]',
  } as const
}
