import { resolvePageHeader, type PageHeaderOptions } from './pageHeader'
export function pageHeaderWeb(options: PageHeaderOptions) {
  const state = resolvePageHeader(options)
  return {
    ...state,
    textColor: state.variant === 'dark' ? 'text-[var(--uc-static-white)]' : 'text-[var(--uc-text)]',
    bgColor: state.backgroundToken === undefined ? 'bg-transparent' : state.backgroundToken === '--uc-app-bg' ? 'bg-[var(--uc-app-bg)]' : 'bg-[var(--uc-surface)]',
    actionClass: 'flex h-[40px] w-[40px] self-center cursor-pointer items-center justify-center',
    actionStyle: { padding: '8px 7.998px 7.997px 7.998px' },
    stickyBgStyle: state.variant === 'dark' ? {
      backgroundColor: `rgba(26, 26, 26, ${state.darkBackgroundOpacity})`,
      backdropFilter: state.blurRadius > 0 ? 'blur(8px)' : 'none',
      WebkitBackdropFilter: state.blurRadius > 0 ? 'blur(8px)' : 'none',
    } : state.variant === 'gray' ? { backgroundColor: 'var(--uc-app-bg)' } : undefined,
  } as const
}
