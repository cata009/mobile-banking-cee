/**
 * Status tag: a small rounded label with an optional dot that states a condition ("Active", "Expires soon",
 * "Expired", "Not verified"). Metadata only: no UI imports.
 *
 * The tag is tinted: text and dot take the tone colour, the fill is that colour mixed into the surface.
 */
export type StatusTagTone = 'positive' | 'warning' | 'negative' | 'neutral'

const TONES = {
  positive: { colorToken: '--uc-green-status', tintPercent: 12 },
  warning: { colorToken: '--uc-orange-deep', tintPercent: 12 },
  negative: { colorToken: '--uc-status-red', tintPercent: 10 },
  neutral: { colorToken: '--uc-text-muted', tintPercent: 0 },
} as const

export function resolveStatusTag({ tone = 'neutral', dot = true }: { tone?: StatusTagTone; dot?: boolean } = {}) {
  const spec = TONES[tone]
  return {
    tone,
    showDot: dot,
    textToken: spec.colorToken,
    dotToken: spec.colorToken,
    /** Neutral sits on the muted surface instead of a tint. */
    fillToken: tone === 'neutral' ? '--uc-surface-muted' : spec.colorToken,
    tintPercent: spec.tintPercent,
    mixInto: '--uc-surface',
    radius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 6,
    dotSize: 6,
    fontSize: 12,
    lineHeight: 16,
  } as const
}
