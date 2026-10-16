import { resolveMailboxTabs } from './mailboxTabs'
export function mailboxTabsWeb(options: Parameters<typeof resolveMailboxTabs>[0], className = '') {
  const state = resolveMailboxTabs(options)
  return {
    ...state,
    rootClass: `relative ${state.withTopMargin ? 'mt-[22px]' : 'mt-0'} h-[48px] shrink-0 border-b border-[var(--uc-border)] ${state.isScrollable ? 'flex cursor-grab touch-pan-x select-none overflow-x-auto overscroll-x-contain scrollbar-hide active:cursor-grabbing' : 'grid grid-cols-2'} ${className}`,
    tabClass:
      'uc-type-n4-strong relative flex h-full shrink-0 items-center justify-center px-[16px] text-[var(--uc-text)]',
  }
}
