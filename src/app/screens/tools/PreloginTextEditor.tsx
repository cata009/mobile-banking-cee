import { useId, useState } from 'react'
import { getProductsForCountry, hasProductAccordion } from '@/app/config/productConfig'
import type { CountryId } from '@/app/state/demoTypes'
import type { PreloginTextField } from './preloginTextFields'
import type { PreviewCheck } from './preloginReadability'
import { SelectionChip } from './toolsUi'

export function PreloginTextEditor({
  fields,
  overrides,
  onChange,
  onReset,
  country,
  expandedProduct,
  onExpandedProductChange,
  checks,
}: {
  fields: readonly PreloginTextField[]
  overrides: Readonly<Record<string, string>>
  onChange: (key: string, value: string) => void
  onReset: () => void
  country: CountryId
  expandedProduct: string
  onExpandedProductChange: (id: string) => void
  checks: readonly PreviewCheck[]
}) {
  const [group, setGroup] = useState<'active' | 'inactive'>('active')
  const id = useId()
  const inputClass =
    'mt-[5px] w-full rounded-[5px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[8px] py-[7px] text-[13px] font-normal text-[var(--uc-text)] focus-visible:outline-2 focus-visible:outline-[var(--uc-action)]'
  return (
    <div className="mt-[14px]">
      <div className="flex flex-wrap items-center gap-[6px]">
        <SelectionChip active={group === 'active'} onClick={() => setGroup('active')}>
          Active texts
        </SelectionChip>
        <SelectionChip active={group === 'inactive'} onClick={() => setGroup('inactive')}>
          Inactive texts
        </SelectionChip>
      </div>
      <p className="mt-[10px] text-[12px] leading-[17px] text-[var(--uc-text-muted)]">
        Edits apply only to this country and language in this browser.
      </p>
      <button
        type="button"
        onClick={onReset}
        disabled={Object.keys(overrides).length === 0}
        className="mt-[8px] text-[12px] font-bold text-[var(--uc-action)] disabled:opacity-40"
      >
        Reset texts
      </button>
      {group === 'inactive' && hasProductAccordion(country) && (
        <label htmlFor={`${id}-expanded`} className="mt-[12px] block text-[12px] font-bold text-[var(--uc-text)]">
          Expanded product
          <select
            id={`${id}-expanded`}
            className={inputClass}
            value={expandedProduct || getProductsForCountry(country)[0]?.id}
            onChange={(event) => onExpandedProductChange(event.target.value)}
          >
            {getProductsForCountry(country).map((product) => (
              <option key={product.id} value={product.id}>
                {product.title}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="mt-[14px] max-h-[540px] space-y-[14px] overflow-y-auto pr-[4px]">
        {fields
          .filter((field) => field.group === group)
          .map((field) => {
            const value = overrides[field.key] ?? field.value
            const overflow = checks.find((check) => check.key === field.key && check.overflow)
            const fieldId = `${id}-${field.key}`
            return (
              <div key={field.key}>
                <label htmlFor={fieldId} className="block text-[12px] font-bold text-[var(--uc-text)]">
                  {field.label}
                  {field.multiline ? (
                    <textarea
                      aria-label={field.label}
                      id={fieldId}
                      value={value}
                      rows={field.key.endsWith('description') || field.key.endsWith('Description') ? 3 : 2}
                      className={`${inputClass} resize-y`}
                      onChange={(event) => onChange(field.key, event.target.value)}
                    />
                  ) : (
                    <input
                      aria-label={field.label}
                      id={fieldId}
                      type="text"
                      value={value}
                      className={inputClass}
                      onChange={(event) => onChange(field.key, event.target.value)}
                    />
                  )}
                </label>
                <p className="mt-[3px] text-[11px] text-[var(--uc-text-muted)]">
                  {Array.from(value).length} characters{overrides[field.key] !== undefined ? ' · Edited' : ''}
                </p>
                {overflow && (
                  <p className="mt-[3px] text-[11px] leading-[16px] text-[var(--uc-orange-main)]">
                    Text extends beyond the available area. Shorten it or check another device.
                  </p>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
