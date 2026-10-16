/** The shipped PageHeader geometry; distinct from local account/card and L1 headers. */
export type PageHeaderVariant = 'light' | 'dark' | 'transparent' | 'gray'
export interface PageHeaderOptions {
  variant?: PageHeaderVariant
  showHelp?: boolean
  showBack?: boolean
  compact?: boolean
  renderLargeTitle?: boolean
  collapsedTitleProgress?: number
  includeSafeArea?: boolean
  hideCollapsedTitleWhenHidden?: boolean
}
export function resolvePageHeader({ variant = 'light', showHelp = true, showBack = true, compact = false, renderLargeTitle = true, collapsedTitleProgress = 0, includeSafeArea = false, hideCollapsedTitleWhenHidden = false }: PageHeaderOptions) {
  const titleProgress = Math.min(1, Math.max(0, collapsedTitleProgress))
  return {
    variant, showHelp, showBack, includeSafeArea, titleProgress,
    largeTitleOpacity: 1 - titleProgress,
    collapsedTitleTranslateY: (1 - titleProgress) * 6,
    shouldRenderLargeTitle: renderLargeTitle && !(compact && titleProgress >= 0.999),
    collapsedTitleHidden: hideCollapsedTitleWhenHidden && titleProgress === 0,
    darkBackgroundOpacity: titleProgress * 0.95,
    blurRadius: titleProgress > 0 ? 8 : 0,
    actionSize: 40, toolbarHeight: 48, toolbarPaddingHorizontal: 8, toolbarPaddingTop: 8,
    safeAreaFallback: 54, largeTitlePaddingHorizontal: 16, largeTitlePaddingVertical: 8,
    leadingGap: 12, largeTitleLines: 2,
    iconColor: variant === 'dark' ? 'white' : 'var(--uc-text)',
    textToken: variant === 'dark' ? '--uc-static-white' : '--uc-text',
    backgroundToken: variant === 'dark' || variant === 'transparent' ? undefined : variant === 'gray' ? '--uc-app-bg' : '--uc-surface',
    titleTypography: { fontSize: 28, lineHeight: 'normal', fontWeight: 700 },
    collapsedTypography: { fontSize: 16, lineHeight: 'normal', fontWeight: 700 },
    headerSubtitleTypography: { fontSize: 12, lineHeight: 16 },
  } as const
}
