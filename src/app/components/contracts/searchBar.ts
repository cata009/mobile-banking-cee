export const ACCOUNT_SEARCH_BAR_SOURCE = {
  schema: 'codex-figma-component-spec/v1',
  sourceNodeIds: {
    activeRemoveFilters: '1517:12655',
  },
  dimensions: {
    activeRemoveFilters: {
      width: 375,
      height: 63,
      searchHeight: 36,
      iconSlot: 32,
    },
  },
} as const
export interface SearchBarOptions {
  searchValue?: string
  filtersActive?: boolean
  showRemoveFiltersAction?: boolean
  showTrailingAction?: boolean
  fieldSurface?: 'muted' | 'raised'
  fieldSize?: 'compact' | 'comfortable'
  fieldPadding?: 'none' | '8'
  trailingIcon?: string
}
export function resolveSearchBar({
  searchValue = '',
  filtersActive = false,
  showRemoveFiltersAction = true,
  showTrailingAction = true,
  fieldSurface = 'muted',
  fieldSize = 'compact',
  fieldPadding = 'none',
  trailingIcon,
}: SearchBarOptions = {}) {
  const hasSearchValue = searchValue.trim().length > 0
  const showRemoveFilters = showRemoveFiltersAction && filtersActive && !hasSearchValue
  const paddedField = fieldPadding === '8' && !showRemoveFilters
  const comfortableField = fieldSize === 'comfortable'
  return {
    hasSearchValue,
    showRemoveFilters,
    paddedField,
    comfortableField,
    fieldSurface,
    fieldHeightPx: comfortableField ? 40 : 32,
    innerHeight: showRemoveFilters ? 36 : comfortableField ? 40 : 32,
    iconSlot: showRemoveFilters ? 32 : comfortableField ? 40 : 32,
    minimumHeight: showRemoveFilters ? 63 : paddedField ? 48 : comfortableField ? 40 : 32,
    trailingVisible: showTrailingAction || hasSearchValue,
    trailingAction: hasSearchValue ? 'clear' : 'filter',
    trailingIcon: hasSearchValue ? 'clear-results' : (trailingIcon ?? 'filters'),
    trailingPressed: !hasSearchValue && !trailingIcon && filtersActive ? true : undefined,
    inputFontSize: 14,
    radius: 10,
  } as const
}
