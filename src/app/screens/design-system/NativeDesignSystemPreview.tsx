import { useState } from 'react'
import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import { getNativeDesignSystemPreview } from '@/features/demo-native/designSystemPreview'
import { implementedVariantLabel } from './variantLabels'

const selectorIds: Readonly<Record<string, string>> = {
  'accounts.transaction-row': 'account-transaction-row-variant-select',
  'messages.mailbox-tabs': 'messages-mailbox-tabs-variant-select',
  'ui.pill-sorting': 'pill-sorting-state-select',
  'shell.page-header': 'page-header-variant-select',
  'cards.card-component': 'card-variant-select',
}

/** Uses the established screen bridge and the exact native leaf used by customer screens. */
export function NativeDesignSystemPreview({
  componentId,
  variantId,
  initialVariantId,
  themeMode = 'light',
}: {
  componentId: string
  variantId?: string
  initialVariantId?: string
  themeMode?: 'light' | 'dark'
}) {
  const [selection, setSelection] = useState<string | undefined>(initialVariantId)
  const definition = getNativeDesignSystemPreview(componentId, variantId)
  if (!definition) return null
  const selected =
    variantId ?? (selection && definition.variants.includes(selection) ? selection : definition.variants[0])
  const appearance =
    definition.themeModes && !definition.themeModes.includes(themeMode)
      ? (definition.themeModes[0] ?? themeMode)
      : themeMode
  return (
    <div
      className="flex w-full flex-col gap-4"
      data-native-ds-component={componentId}
      data-native-ds-variant={selected}
    >
      {!variantId && definition.controls !== 'internal' && definition.variants.length > 1 ? (
        <VariantPicker
          componentId={componentId}
          id={selectorIds[componentId] ?? `${componentId.split('.').pop()}-variant-select`}
          variants={definition.variants}
          selected={selected ?? ''}
          onSelect={(value) => {
            if (definition.variants.includes(value)) setSelection(value)
          }}
        />
      ) : null}
      <div className="w-full max-w-[375px]">
        <NativeScreenPreview
          route={{ screen: 'payments' }}
          snapshot={{
            mode: appearance,
            screenTopInset: 0,
            bottomInset: 0,
            componentPreview: { kind: 'design-system', componentId, variantId: selected, dark: appearance === 'dark' },
          }}
        />
      </div>
    </div>
  )
}

const LONG_VARIANT_LIST = 20

/**
 * Moves through a component's variants. Previous and next step through the set in order; the counter
 * shows position; long sets get a filter so the list stays short.
 */
export function VariantPicker({
  componentId,
  id,
  variants,
  selected,
  onSelect,
  label = 'Variant',
}: {
  componentId: string
  label?: string
  id: string
  variants: readonly string[]
  selected: string
  onSelect: (value: string) => void
}) {
  const [query, setQuery] = useState('')
  const labelOf = (variant: string) => implementedVariantLabel(componentId, variant)
  const index = Math.max(0, variants.indexOf(selected))
  const needle = query.trim().toLowerCase()
  const shown = variants.filter(
    (variant) => variant === selected || !needle || labelOf(variant).toLowerCase().includes(needle),
  )
  const stepTo = (next: number) => {
    const target = variants[next]
    if (target) onSelect(target)
  }
  return (
    <div className="ds-variant-picker">
      {label ? <span className="ds-variant-picker-label">{label}</span> : null}
      {variants.length > LONG_VARIANT_LIST ? (
        <input
          type="search"
          className="ds-variant-search"
          aria-label="Filter native variants"
          placeholder="Filter variants"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      ) : null}
      <div className="ds-variant-stepper">
        <button
          type="button"
          aria-label="Previous variant"
          disabled={index === 0}
          onClick={() => stepTo(index - 1)}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3.5 5.5 8 10 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <select
          id={id}
          aria-label="Native variant"
          value={selected}
          onChange={(event) => onSelect(event.target.value)}
          className="uc-select ds-variant-select"
        >
          {shown.map((variant) => (
            <option key={variant} value={variant}>
              {labelOf(variant)}
            </option>
          ))}
        </select>
        <button
          type="button"
          aria-label="Next variant"
          disabled={index >= variants.length - 1}
          onClick={() => stepTo(index + 1)}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <span className="ds-variant-count">
        {index + 1} / {variants.length}
      </span>
    </div>
  )
}
