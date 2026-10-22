import { useState } from 'react'
import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import { getNativeDesignSystemPreview } from '@/features/demo-native/designSystemPreview'
import { getCatalogCompositionSource } from '@/app/components/contracts/catalogCompositions'

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
        <label className="mb-4 flex items-center gap-3 text-[13px] text-[var(--uc-text)]">
          Variant
          <select
            id={selectorIds[componentId] ?? `${componentId.split('.').pop()}-variant-select`}
            aria-label="Native variant"
            value={selected}
            onChange={(event) => {
              if (definition.variants.includes(event.target.value)) setSelection(event.target.value)
            }}
            className="uc-select h-[36px] rounded border border-[var(--uc-border)] bg-[var(--uc-surface)] px-3"
          >
            {definition.variants.map((id) => (
              <option key={id} value={id}>
                {getCatalogCompositionSource(id)?.name ?? id}
              </option>
            ))}
          </select>
        </label>
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
