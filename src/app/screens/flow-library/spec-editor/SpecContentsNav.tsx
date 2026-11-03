import { Fragment, useEffect, useMemo, useState } from 'react'

/** One entry in a specification's contents list; children are nested under it. */
export interface SpecContentsItem {
  id: string
  label: string
  number?: string
  children?: SpecContentsItem[]
}

/**
 * The contents list of a specification document. The section the reader is in is
 * highlighted as they scroll, so the list doubles as a position marker rather than
 * a set of links that look identical.
 */
export default function SpecContentsNav({
  items,
  onSelect,
  allOpen,
  onToggleAll,
  label = 'Specification contents',
}: {
  items: SpecContentsItem[]
  onSelect(id: string): void
  /** Shown only when the document has collapsible sections. */
  allOpen?: boolean
  onToggleAll?: () => void
  label?: string
}) {
  const ids = useMemo(() => items.flatMap((item) => [item.id, ...(item.children ?? []).map((child) => child.id)]), [items])
  const activeId = useActiveSection(ids)

  return (
    <nav aria-label={label} className="spec-outline">
      <div className="spec-outline-head">
        <span className="spec-outline-title">Contents</span>
        {onToggleAll ? (
          <button type="button" className="spec-outline-toggle" onClick={onToggleAll}>
            {allOpen ? 'Collapse all' : 'Expand all'}
          </button>
        ) : null}
      </div>
      {items.map((item) => (
        <Fragment key={item.id}>
          <button
            type="button"
            aria-current={activeId === item.id ? 'true' : undefined}
            onClick={() => onSelect(item.id)}
          >
            {item.number ? <span className="spec-outline-number">{item.number}</span> : null}
            {item.label}
          </button>
          {item.children?.map((child) => (
            <button
              key={child.id}
              type="button"
              className="spec-outline-child"
              aria-current={activeId === child.id ? 'true' : undefined}
              onClick={() => onSelect(child.id)}
            >
              {child.label}
            </button>
          ))}
        </Fragment>
      ))}
    </nav>
  )
}

/**
 * The last section whose heading has passed the top of the reading area. Elements
 * that are not in the document (for example a section not rendered in this flow)
 * are skipped, and environments without IntersectionObserver keep the first entry.
 */
function useActiveSection(ids: string[]): string | undefined {
  const [activeId, setActiveId] = useState<string | undefined>(ids[0])
  const key = ids.join('|')

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)
    if (targets.length === 0) return

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        const first = targets.find((target) => visible.has(target.id))
        if (first) setActiveId(first.id)
      },
      // The reading line sits a little below the top of the viewport, where a
      // section's heading lands after a contents jump.
      { rootMargin: '-96px 0px -60% 0px' },
    )
    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
    // ids is captured through key so the observer follows the set of sections, not the array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return activeId
}
