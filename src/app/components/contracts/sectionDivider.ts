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
}

export function resolveSectionDivider({
  variant = 'section',
  count,
  countAlign = 'inline',
  secondaryText,
}: SectionDividerOptions = {}) {
  const light = variant.startsWith('light-')
  const large = variant === 'large-title' || variant === 'large-two-line-title'
  const twoLine =
    variant === 'small-two-line-title-data' || variant === 'medium-two-line-title' || variant === 'action-date-checkbox'
  const tone =
    variant === 'small-title-data' || variant === 'small-two-line-title-data' || variant === 'section'
      ? '--uc-text-muted'
      : variant === 'action-date' || variant === 'light-date'
        ? '--uc-action'
        : '--uc-text'
  return {
    variant,
    light,
    large,
    twoLine,
    hasLine: !large,
    width: variant === 'section' ? undefined : light ? 343 : 375,
    height: light ? (variant === 'light-small-title-data' ? 20 : 24) : undefined,
    minHeight: variant === 'section' || light || large ? undefined : twoLine ? 51 : 36,
    paddingHorizontal: variant === 'section' ? 0 : light ? 8 : variant === 'with-counter' ? 16 : 24,
    paddingVertical: variant === 'section' || light || large ? 0 : 8,
    gap: variant === 'section' ? 8 : 4,
    fontSize: large ? 20 : 14,
    fontWeight: 700,
    titleToken: tone,
    lineHeight: variant === 'section' ? 'normal' : large ? 20 : 14,
    backgroundToken: !light && variant !== 'section' ? '--uc-surface' : undefined,
    lineToken: '--uc-border',
    lineMarginTop: variant === 'section' ? 8 : 0,
    alignCountToEnd: countAlign === 'end',
    hasCount: typeof count === 'number',
    checkbox: variant === 'action-date-checkbox',
    rightText: variant === 'with-counter' && typeof count === 'number' ? String(count) : secondaryText,
  } as const
}
