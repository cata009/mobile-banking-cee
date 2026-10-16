import { resolveCarouselIndicator } from './carouselIndicator'
export function carouselIndicatorWeb(options: Parameters<typeof resolveCarouselIndicator>[0]) {
  const state = resolveCarouselIndicator(options)
  return {
    ...state,
    inactiveClass: state.inverse ? 'bg-[rgb(var(--uc-static-white-rgb)_/_0.55)]' : 'bg-[var(--uc-text-muted)]',
    backdropStyle: state.blur === undefined ? undefined : { backdropFilter: `blur(${state.blur}px)` },
  }
}
