import { resolveMoreCard } from './moreCard'
export function moreCardWeb(options: Parameters<typeof resolveMoreCard>[0]) {
  const state = resolveMoreCard(options)
  return {
    ...state,
    buttonClass:
      state.variant === 'base'
        ? 'relative h-[120px] w-full overflow-hidden rounded-[8px] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]'
        : 'relative h-[120px] w-full cursor-pointer overflow-hidden rounded-[8px] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]',
    titleClass:
      state.variant === 'base'
        ? 'uc-type-h2 text-[var(--uc-text)] text-left whitespace-pre-wrap z-10 relative'
        : "font-['UniCredit:Bold',sans-serif] text-[18px] text-[var(--uc-text)] leading-[normal] text-left whitespace-pre-wrap z-10 relative",
    badgeClass:
      state.variant === 'base'
        ? 'uc-type-n5-strong block leading-none text-[var(--uc-static-white)]'
        : "font-['UniCredit:Bold',sans-serif] text-[var(--uc-static-white)] text-[14px] leading-none block",
    badgeStyle: state.variant === 'base' ? undefined : { fontWeight: 700 },
  } as const
}
