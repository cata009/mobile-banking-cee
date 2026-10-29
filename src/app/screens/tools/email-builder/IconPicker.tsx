import { useMemo, useState } from 'react'
import TextField from '@/app/components/TextField'
import {
  EMAIL_ICON_OPTIONS,
  iconSourceReference,
  resolveEmailIcon,
  selectEmailIcon,
  getEmailIconFamilies,
  getEmailIconVariants,
  type EmailIconKind,
} from '@/features/marketing-email/iconCatalog'
import type { EmailBlock } from '@/features/marketing-email/model'
import { NumberField } from './fields'
import { IconArtwork } from './IconArtwork'

export function IconPicker({
  block,
  update,
}: {
  block: EmailBlock
  update: (edit: (draft: EmailBlock) => void) => void
}) {
  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState('all')
  const [group, setGroup] = useState('all')
  const [sourceKind, setSourceKind] = useState<EmailIconKind | 'all'>('all')
  const [visibleCount, setVisibleCount] = useState(60)
  const selected = resolveEmailIcon(block.icon?.variantId ?? '')
  const families = useMemo(
    () => getEmailIconFamilies({ query, theme, group, source: sourceKind }),
    [query, theme, group, sourceKind],
  )
  const totalFamilies = useMemo(() => getEmailIconFamilies().length, [])
  const variants = selected ? getEmailIconVariants(selected) : []
  const sourceLink = selected ? iconSourceReference(selected.variantId) : undefined
  const resize = (size: number) => {
    if (block.icon) update((b) => selectEmailIcon(b, b.icon!.variantId, size))
  }
  return (
    <div className="email-icon-picker">
      <div className="email-icon-selected" data-icon-theme={selected?.previewTheme ?? selected?.theme}>
        <IconArtwork variantId={block.icon?.variantId ?? ''} size={block.icon?.size ?? 32} />
        <div>
          <strong>{selected?.icon ?? 'Choose an icon'}</strong>
          <small>
            {selected?.state} · {selected?.theme}
          </small>
          <small>{selected?.sourceLabel}</small>
        </div>
      </div>
      <div className="email-size-presets" aria-label="Icon size presets">
        {[16, 24, 32, 48, 64].map((size) => (
          <button key={size} type="button" aria-pressed={block.icon?.size === size} onClick={() => resize(size)}>
            {size} px
          </button>
        ))}
      </div>
      <p className="email-help email-icon-count">
        {totalFamilies} icons · {EMAIL_ICON_OPTIONS.length} variants
      </p>
      <TextField
        label="Search design system icons"
        value={query}
        onChange={(value) => {
          setQuery(value)
          setVisibleCount(60)
        }}
        forceFloatLabel
      />
      <label className="email-field">
        Icon source
        <select
          value={sourceKind}
          onChange={(event) => {
            setSourceKind(event.target.value as EmailIconKind | 'all')
            setGroup('all')
            setVisibleCount(60)
          }}
        >
          <option value="all">All DS sources</option>
          <option value="canonical">Canonical Figma</option>
          <option value="app">Application icons</option>
          <option value="pfm">PFM categories</option>
        </select>
      </label>
      <div className="email-pair">
        <label className="email-field">
          Appearance
          <select
            value={theme}
            onChange={(e) => {
              setTheme(e.target.value)
              setVisibleCount(60)
            }}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="all">All</option>
          </select>
        </label>
        <label className="email-field">
          Collection
          <select
            value={group}
            onChange={(e) => {
              setGroup(e.target.value)
              setVisibleCount(60)
            }}
          >
            <option value="all">All collections</option>
            {[...new Set(EMAIL_ICON_OPTIONS.map((s) => s.group))].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="email-icon-grid" aria-label="Design system icon choices">
        {families.slice(0, visibleCount).map((source) => (
          <button
            type="button"
            key={source.variantId}
            aria-pressed={selected?.familyKey === source.familyKey}
            aria-label={`Choose ${source.icon}, ${source.state}, ${source.theme}`}
            title={`${source.icon} · ${source.state}`}
            data-icon-theme={source.previewTheme ?? source.theme}
            onClick={() => update((b) => selectEmailIcon(b, source.variantId, b.icon?.size ?? 32))}
          >
            <IconArtwork variantId={source.variantId} />
            <span>{source.icon}</span>
            <small>{source.state}</small>
          </button>
        ))}
      </div>
      <p className="email-help">
        Showing {Math.min(visibleCount, families.length)} of {families.length} matching icons
      </p>
      {visibleCount < families.length && (
        <button type="button" className="email-text-button" onClick={() => setVisibleCount((count) => count + 60)}>
          Load more icons
        </button>
      )}
      {!families.length && <p className="email-empty">No icons match your search.</p>}
      <details open>
        <summary>Size & variant</summary>
        <div className="email-stack">
          <NumberField label="Icon size (px)" min={12} max={128} value={block.icon?.size ?? 32} onChange={resize} />
          <label className="email-field">
            Icon variant
            <select
              value={block.icon?.variantId ?? ''}
              onChange={(event) => update((b) => selectEmailIcon(b, event.target.value, b.icon?.size ?? 32))}
            >
              {variants.map((source) => (
                <option key={source.variantId} value={source.variantId}>
                  {source.state}
                </option>
              ))}
            </select>
          </label>
        </div>
      </details>
      <details>
        <summary>Email image & source</summary>
        <div className="email-stack">
          <p className="email-help">
            The canvas uses the original DS source or its existing renderer. For email delivery, add the public image
            URL for this icon. Changing the icon clears previous URLs.
          </p>
          <TextField
            label="Public icon image URL"
            value={block.content.imageUrl}
            forceFloatLabel
            onChange={(v) =>
              update((b) => {
                b.content.imageUrl = v
              })
            }
          />
          <TextField
            label="Dark icon image URL (optional)"
            value={block.content.darkImageUrl}
            forceFloatLabel
            onChange={(v) =>
              update((b) => {
                b.content.darkImageUrl = v
              })
            }
          />
          <TextField
            label="Icon description"
            value={block.content.alt}
            forceFloatLabel
            onChange={(v) =>
              update((b) => {
                b.content.alt = v
              })
            }
          />
          <p className="email-help">
            Source artwork preserves its original colors. Pick the matching variant. PNG assets generally offer wider
            email support than SVG; asset hosting and conversion are not performed here.
          </p>
          {selected && (
            <p className="email-help">
              Implementation: <code>{selected.sourcePath}</code>
            </p>
          )}
          {sourceLink && (
            <a className="email-text-button" href={sourceLink} target="_blank" rel="noreferrer">
              View canonical DS source ↗
            </a>
          )}
        </div>
      </details>
    </div>
  )
}
