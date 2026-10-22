export const SECTION_HEADING_DIVIDER_SOURCE = {
  schema: 'codex-figma-component-spec/v1',
  sourceNodeIds: {
    menigaDivider: '1058:22303',
    smallTitleData: '1058:22304',
    smallTwoLineTitleData: '8747:15008',
    mediumTitle: '8747:15016',
    withCounter: '8747:15028',
    mediumTwoLineTitle: '8747:15036',
    largeTitle: '1058:22317',
    largeTwoLineTitle: '1058:22319',
    actionDate: '8747:15049',
    nameAction: '8747:15057',
    actionDateCheckbox: '8747:15065',
    lightTitle: '1517:3674',
    lightDate: '1517:3679',
    lightSmallTitleData: '1517:3683',
  },
  dimensions: {
    defaultWidth: 375,
    lightRestyleWidth: 343,
    lineHeight: 1,
  },
} as const

/** Existing section/meniga layouts. Pure metadata: no platform runtime imports. */
export type SectionHeadingDividerVariant =
  | 'section'
  | 'small-title-data'
  | 'small-two-line-title-data'
  | 'medium-title'
  | 'with-counter'
  | 'medium-two-line-title'
  | 'large-title'
  | 'large-two-line-title'
  | 'action-date'
  | 'name-action'
  | 'action-date-checkbox'
  | 'light-title'
  | 'light-date'
  | 'light-small-title-data'

export interface SectionDividerOptions {
  variant?: SectionHeadingDividerVariant
  count?: number
  countAlign?: 'inline' | 'end'
  secondaryText?: string
  width?: number
}

/** Optional controlled behavior; selection/business policy belongs to the caller. */
export interface SectionDividerInteractions {
  onAction?: () => void
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

export function resolveSectionDivider({
  variant = 'section',
  count,
  countAlign = 'inline',
  secondaryText,
  width,
}: SectionDividerOptions = {}) {
  const light = variant.startsWith('light-')
  const large = variant === 'large-title' || variant === 'large-two-line-title'
  const twoLine =
    variant === 'small-two-line-title-data' || variant === 'medium-two-line-title' || variant === 'action-date-checkbox'
  const tone =
    variant === 'small-title-data' ||
    variant === 'small-two-line-title-data' ||
    variant === 'light-small-title-data' ||
    variant === 'section'
      ? '--uc-text-muted'
      : variant === 'action-date' || variant === 'light-date'
        ? '--uc-action'
        : '--uc-text'
  return {
    variant,
    // Dates/actions remain readable text rather than navigation headings.
    titleRole:
      variant === 'light-date' || variant === 'action-date' || variant === 'action-date-checkbox'
        ? undefined
        : ('header' as const),
    light,
    large,
    twoLine,
    hasLine: !large,
    width: variant === 'section' ? undefined : (width ?? (light ? 343 : 375)),
    height: light ? (variant === 'light-small-title-data' ? 20 : 24) : undefined,
    minHeight:
      variant === 'section' || light || large ? undefined : variant === 'action-date-checkbox' ? 53 : twoLine ? 51 : 36,
    paddingHorizontal: variant === 'section' ? 0 : light ? 8 : variant === 'with-counter' ? 16 : 24,
    paddingVertical: variant === 'section' || light || large ? 0 : 8,
    gap: variant === 'section' ? 8 : 4,
    rowGap: large ? 0 : light || variant === 'section' ? 8 : variant === 'action-date-checkbox' ? 13.5 : 29,
    rowMinHeight: variant === 'action-date-checkbox' ? 32 : twoLine ? 30 : 15,
    outerPaddingLeft: variant === 'light-small-title-data' ? 0.5 : 0,
    outerPaddingRight: variant === 'light-small-title-data' ? 0.5 : light ? 1 : 0,
    ruleLeft: variant === 'light-date' ? -1 : 0,
    ruleRight: variant === 'light-date' ? 1 : 0,
    secondaryMinWidth:
      variant === 'light-title'
        ? 13
        : variant === 'light-small-title-data'
          ? 70
          : variant === 'small-title-data' || variant === 'small-two-line-title-data'
            ? 86
            : variant === 'with-counter'
              ? 16
              : variant === 'action-date' || variant === 'action-date-checkbox'
                ? 146
                : variant === 'name-action'
                  ? 50
                  : undefined,
    fontSize: large ? 20 : 14,
    fontWeight: 700,
    titleToken: tone,
    lineHeight: variant === 'section' ? 'normal' : large ? 22 : 15,
    backgroundToken: !light && variant !== 'section' ? '--uc-surface' : undefined,
    lineToken: '--uc-border',
    lineMarginTop: variant === 'section' ? 8 : 0,
    alignCountToEnd: countAlign === 'end',
    hasCount: typeof count === 'number',
    checkbox: variant === 'action-date-checkbox',
    primaryAction: variant === 'action-date',
    secondaryAction: variant === 'name-action',
    secondaryToken: variant === 'name-action' ? '--uc-action' : '--uc-text',
    secondaryAlign:
      variant === 'with-counter' ||
      variant === 'action-date' ||
      variant === 'action-date-checkbox' ||
      variant === 'name-action'
        ? ('left' as const)
        : ('right' as const),
    rightText: variant === 'with-counter' && typeof count === 'number' ? String(count) : secondaryText,
  } as const
}
