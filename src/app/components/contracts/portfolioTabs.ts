export function resolvePortfolioTabs({ variant = 'underline' }: { variant?: 'underline' | 'chips' } = {}) {
  return {
    chips: variant === 'chips',
    railHeight: 48,
    chipHeight: 34,
    chipGap: 8,
    chipPadding: 12,
    chipFontSize: 14,
    chipLineHeight: 18,
    dragThreshold: 4,
    suppressClickMs: 80,
    underlineLayout: 'scrollable',
    underlineMinTabWidth: 150,
    underlineAriaLabel: 'Investments portfolio tabs',
    underlineTopMargin: false,
    underlineClass: 'bg-[var(--uc-surface)]',
  } as const
}
export function portfolioScrollBehavior(settled: boolean, reduceMotion: boolean) {
  return settled && !reduceMotion ? 'smooth' : 'auto'
}
