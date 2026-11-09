/**
 * Key-value row: a label and its value ("Street: Main 1", "Total to pay: 120 RON").
 * Metadata only: no UI imports.
 *
 * - `inline`: label on the left in muted text, value on the right in bold, optional rule below. Summaries,
 *   limits, policy facts.
 * - `stacked`: bold uppercase label above a muted value. Confirmation and review lines.
 */
export type KeyValueLayout = 'inline' | 'stacked'
export type KeyValueSize = 'compact' | 'regular'

export interface KeyValueRowOptions {
  layout?: KeyValueLayout
  /** compact = 14 px text (flows), regular = 16 px text (app screens). */
  size?: KeyValueSize
  /** A bigger, bolder value (a total, a new limit). Inline layout only. */
  emphasis?: boolean
  /** Regular-weight value (summary tables) instead of the bold default. */
  plainValue?: boolean
  /** Rule under an inline row. */
  divider?: boolean
  paddingVertical?: number
}

export function resolveKeyValueRow({
  layout = 'inline',
  size = 'regular',
  emphasis = false,
  plainValue = false,
  divider = true,
  paddingVertical = 10,
}: KeyValueRowOptions = {}) {
  const stacked = layout === 'stacked'
  const base = size === 'compact' ? 14 : 16
  return {
    layout,
    size,
    stacked,
    labelSize: stacked ? 14 : base,
    labelBold: stacked,
    labelUppercase: stacked,
    labelToken: stacked ? '--uc-text' : '--uc-text-muted',
    valueSize: stacked ? 16 : emphasis ? (size === 'compact' ? 16 : 24) : base,
    valueBold: !stacked && (emphasis || !plainValue),
    valueToken: stacked ? '--uc-text-muted' : '--uc-text',
    gap: stacked ? 2 : 16,
    paddingVertical,
    dividerToken: '--uc-border',
    showDivider: !stacked && divider,
  } as const
}
