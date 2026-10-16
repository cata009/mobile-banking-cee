import { resolveSearchBar, type SearchBarOptions } from './searchBar'
export function searchBarWeb(options: SearchBarOptions) {
  const state = resolveSearchBar(options)
  const fieldGround =
    state.fieldSurface === 'raised'
      ? 'bg-[var(--uc-surface)] shadow-[inset_0_0_0_1px_var(--uc-border-muted)]'
      : 'bg-[var(--uc-app-bg)]'
  const innerFieldGround = state.paddedField ? 'bg-transparent' : fieldGround
  const fieldHeight = state.comfortableField ? 'h-[40px]' : 'h-[32px]'
  return { ...state, fieldGround, innerFieldGround, fieldHeight }
}
