export type MoreCardVariant =
  | 'base'
  | 'contacts'
  | 'documents'
  | 'settings'
  | 'gdpr-consent'
  | 'third-party-consent'
  | 'digital-activities'
  | 'my-requests'
  | 'tutorial'
const images = {
  base: { top: '50%', right: '0%', bottom: '0%', left: '50%' },
  contacts: { top: '36.67%', right: '-2.62%', bottom: '0%', left: '52.69%' },
  documents: { top: '46.67%', right: '-9.15%', bottom: '-13.33%', left: '35.98%' },
  settings: { top: '47.86%', right: '-30.03%', bottom: '-29.17%', left: '42.2%' },
  'gdpr-consent': { top: '50%', right: '-0.24%', bottom: '-35.83%', left: '38.66%' },
  'third-party-consent': { top: '15.28%', right: '-37.87%', bottom: '-87.03%', left: '14.48%' },
  'digital-activities': { top: '56.42%', right: '-46.69%', bottom: '-46.75%', left: '49.96%' },
  'my-requests': { top: '37.22%', right: '0%', bottom: '-6.36%', left: '29.88%' },
  tutorial: { top: '38.33%', right: '0%', bottom: '0%', left: '51.83%' },
} as const
export function resolveMoreCard({ variant, badgeCount }: { variant: MoreCardVariant; badgeCount?: number }) {
  return {
    variant,
    height: 120,
    radius: 8,
    padding: 16,
    hoverOpacity: variant === 'base' ? 0.9 : 0.8,
    titleFontSize: 18,
    titleLineHeight: 'normal',
    badgeText:
      (variant === 'base' || variant === 'documents') && badgeCount !== undefined && badgeCount > 0
        ? badgeCount > 99
          ? '99'
          : badgeCount
        : null,
    image: {
      ...images[variant],
      repeatTile: variant === 'gdpr-consent' ? { width: 61.60000091791153, height: 62.90000093728304 } : undefined,
      transform: variant === 'third-party-consent' ? 'rotate(-156deg) scaleY(-1)' : undefined,
    },
    background: 'var(--pi-menu-card-bg, linear-gradient(90deg, var(--uc-app-bg) 0%, var(--uc-neutral-400) 100%))',
  } as const
}
