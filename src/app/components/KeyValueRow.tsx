import { resolveKeyValueRow, type KeyValueRowOptions } from './contracts/keyValueRow'

interface KeyValueRowProps extends KeyValueRowOptions {
  label: string
  value: string
  /** Render as a definition-list pair (dt/dd); use it inside a <dl>. */
  definition?: boolean
  /** Keep the value on one line (a long number or code). */
  nowrap?: boolean
  /** Layout only (margins). Keep visual styling out of here. */
  className?: string
}

const sizeClass = (size: number) =>
  size === 24 ? 'text-[24px] leading-[28px]' : size === 16 ? 'uc-type-n4' : 'uc-type-n5'

/**
 * The Design System key-value row. Colors follow the text and border tokens, so it changes with the
 * single color source (src/app/registry/colorTokens.ts) in light and dark.
 */
export default function KeyValueRow({
  label,
  value,
  definition = false,
  nowrap = false,
  className,
  ...options
}: KeyValueRowProps) {
  const row = resolveKeyValueRow(options)
  const Label = definition ? 'dt' : 'p'
  const Value = definition ? 'dd' : 'p'
  const labelClass = `${sizeClass(row.labelSize)} ${row.labelBold ? 'font-bold' : ''} ${row.labelUppercase ? 'uppercase' : ''} text-[var(${row.labelToken})]`
  const valueClass = `${sizeClass(row.valueSize)} ${row.valueBold ? 'font-bold' : ''} text-[var(${row.valueToken})] ${nowrap ? 'whitespace-nowrap' : ''}`

  if (row.stacked) {
    return (
      <div className={className} style={{ paddingTop: row.paddingVertical + 8 }} data-ds-label="KeyValueRow">
        <Label className={labelClass}>{label}</Label>
        <Value className={valueClass} style={{ paddingTop: row.gap }}>
          {value}
        </Value>
      </div>
    )
  }
  return (
    <div
      className={`flex items-start justify-between ${row.showDivider ? 'border-b border-[var(--uc-border)]' : ''} ${className ?? ''}`}
      style={{
        gap: row.gap,
        paddingTop: row.paddingVertical,
        paddingBottom: row.paddingVertical,
      }}
      data-ds-label="KeyValueRow"
    >
      <Label className={`shrink-0 ${labelClass}`}>{label}</Label>
      <Value className={`min-w-0 text-right ${valueClass}`}>{value}</Value>
    </div>
  )
}
