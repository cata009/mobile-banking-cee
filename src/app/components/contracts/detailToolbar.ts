export type DetailToolbarVariant = 'account' | 'card'
export interface DetailToolbarOptions { variant: DetailToolbarVariant; progress: number; hasHelpCallback?: boolean }
/** Local Account/Card toolbar intentionally differs from PageHeader defaults and clamping. */
export function resolveDetailToolbar({ variant, progress, hasHelpCallback = false }: DetailToolbarOptions) {
  return {
    variant, progress, translateY: (1 - progress) * 6,
    showHelp: variant === 'card' || hasHelpCallback,
    sticky: true, zIndex: 30, safeAreaFallback: 54, toolbarHeight: 48,
    actionSize: 40, glyphSize: 20, paddingHorizontal: 8, paddingTop: 8,
    backgroundToken: '--uc-app-bg', textToken: '--uc-text', titleFontSize: 16, titleFontWeight: 700, titleLineHeight: 'normal',
    backIcon: 'back-heavy', helpIcon: 'help-circle', backLabel: 'Back', helpLabel: 'Help',
  } as const
}
