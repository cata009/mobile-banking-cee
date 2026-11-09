import { useEffect, useMemo, useRef, useState } from 'react'
import { FigmaLogo } from './FigmaLogo'
import FigmaLibraryFamilyView, { FigmaLivePreview } from './FigmaLibraryFamily'
import { InventorySearchField } from './specimenShell'
import { COMPONENT_REGISTRY } from '@/app/registry/componentRegistry'
import type { ComponentId } from '@/app/state/demoTypes'
import { getNativeDesignSystemPreview } from '@/features/demo-native/designSystemPreview'
import { getSectionForHash } from './inventoryNav'
import { getFigmaLibraryReference } from './figmaLibraryReferences'
import {
  FIGMA_LIBRARY_PAGES,
  FIGMA_IMPLEMENTATION_GROUPS,
  getFigmaFamilyExamples,
  getFigmaFamilyForHash,
  getFigmaFamilyHref,
  getFigmaNodeUrl,
  getFigmaPageSectionId,
  matchesFigmaFamily,
} from './figmaLibraryCatalog'

function pageForHash(hash: string) {
  if (hash === '#figma-library' || !hash) return 'all'
  const section = getSectionForHash(hash)
  return FIGMA_LIBRARY_PAGES.find((page) => getFigmaPageSectionId(page.nodeId) === section)?.nodeId ?? 'all'
}

export default function FigmaLibraryInventory() {
  const [query, setQuery] = useState('')
  const [pageId, setPageId] = useState(() => pageForHash(window.location.hash))
  const [familyHash, setFamilyHash] = useState(() => window.location.hash)
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const sync = () => {
      setFamilyHash(window.location.hash)
      setPageId(pageForHash(window.location.hash))
    }
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])
  const detail = getFigmaFamilyForHash(familyHash)
  const groups = useMemo(
    () =>
      FIGMA_LIBRARY_PAGES.filter((page) => pageId === 'all' || page.nodeId === pageId)
        .map((page) => ({
          page,
          implementations: FIGMA_IMPLEMENTATION_GROUPS.filter(
            (group) =>
              group.page.nodeId === page.nodeId &&
              group.sources.some((family) => matchesFigmaFamily(page, family, query)),
          ),
          pending: page.families.filter(
            (family) =>
              !getFigmaFamilyExamples(family.nodeId).length &&
              !getFigmaLibraryReference(family.nodeId) &&
              matchesFigmaFamily(page, family, query),
          ),
          references: page.families.filter(
            (family) =>
              !getFigmaFamilyExamples(family.nodeId).length &&
              getFigmaLibraryReference(family.nodeId) &&
              matchesFigmaFamily(page, family, query),
          ),
        }))
        .filter(
          (group) =>
            group.implementations.length ||
            group.pending.length ||
            group.references.length ||
            (!group.page.families.length && !query.trim()),
        ),
    [pageId, query],
  )
  const count = groups.reduce((sum, group) => sum + group.implementations.length, 0)
  const pendingCount = groups.reduce((sum, group) => sum + group.pending.length, 0)
  const referenceCount = groups.reduce((sum, group) => sum + group.references.length, 0)
  function choosePage(next: string) {
    setPageId(next)
    const page = FIGMA_LIBRARY_PAGES.find((item) => item.nodeId === next)
    const hash = page ? '#' + getFigmaPageSectionId(page.nodeId) : '#figma-library'
    setFamilyHash(hash)
    window.history.replaceState(null, '', hash)
    root.current?.closest('.ds-workspace')?.scrollTo({ top: 0 })
  }
  if (detail)
    return (
      <div ref={root}>
        <FigmaLibraryFamilyView key={detail.family.nodeId} {...detail} />
      </div>
    )
  return (
    <div ref={root} className="ds-figma-library" id="figma-library">
      <div className="ds-inventory-search">
        <InventorySearchField
          value={query}
          onChange={setQuery}
          placeholder="Search components"
          label="Search components"
        />
      </div>
      <div className="ds-figma-layout">
        <nav className="ds-figma-page-nav ds-side-nav" aria-label="Component sections">
          <p className="ds-eyebrow">Sections</p>
          <button type="button" aria-current={pageId === 'all' ? 'page' : undefined} onClick={() => choosePage('all')}>
            All components <span>{FIGMA_IMPLEMENTATION_GROUPS.length}</span>
          </button>
          {FIGMA_LIBRARY_PAGES.map((page) => (
            <button
              key={page.nodeId}
              type="button"
              aria-current={pageId === page.nodeId ? 'page' : undefined}
              onClick={() => choosePage(page.nodeId)}
            >
              {page.name}{' '}
              <span>{FIGMA_IMPLEMENTATION_GROUPS.filter((group) => group.page.nodeId === page.nodeId).length}</span>
            </button>
          ))}
        </nav>
        <div className="ds-figma-results">
          <label className="ds-figma-select-label ds-figma-mobile-pages">
            Section
            <select aria-label="Figma page" value={pageId} onChange={(event) => choosePage(event.target.value)}>
              <option value="all">All components</option>
              {FIGMA_LIBRARY_PAGES.map((page) => (
                <option key={page.nodeId} value={page.nodeId}>
                  {page.name}
                </option>
              ))}
            </select>
          </label>
          <p role="status" className="ds-figma-result-count">
            {count} {count === 1 ? 'component' : 'components'}
            {pendingCount ? ` · ${pendingCount} not implemented` : ''}
            {referenceCount ? ` · ${referenceCount} design references` : ''}
          </p>
          {!groups.length ? (
            <div className="ds-empty">
              <h2>No components found</h2>
              <p>Try a component name, variant or source ID.</p>
              <button
                className="ds-text-link"
                type="button"
                onClick={() => {
                  setQuery('')
                  choosePage('all')
                }}
              >
                Clear search
              </button>
            </div>
          ) : null}
          {groups.map(({ page, implementations, pending, references }) => (
            <section
              key={page.nodeId}
              id={getFigmaPageSectionId(page.nodeId)}
              className="ds-figma-page"
              data-figma-page={page.nodeId}
            >
              <header className="ds-figma-page-heading">
                <h2>{page.name}</h2>
                <a
                  className="ds-figma-page-link"
                  href={getFigmaNodeUrl(page.nodeId)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${page.name} in Figma`}
                  title={`Open ${page.name} in Figma`}
                >
                  <FigmaLogo />
                </a>
              </header>
              {!page.families.length ? (
                <div className="ds-figma-foundation">
                  <h3>{page.name} foundation</h3>
                  <p>Tokens, styles and layout rules from the shared design library.</p>
                  <a
                    className="ds-text-link"
                    href={
                      page.name === 'Typography'
                        ? '#typography'
                        : page.name === 'Color Palette'
                          ? '#colors'
                          : getFigmaNodeUrl(page.nodeId)
                    }
                  >
                    Open {page.name} reference ↗
                  </a>
                </div>
              ) : null}
              {implementations.length ? (
                <div className="ds-figma-card-grid">
                  {implementations.map((group) => (
                    <article
                      key={group.id}
                      className="ds-figma-card"
                      data-figma-family={group.family.nodeId}
                      data-ds-component={group.id}
                    >
                      <div className="ds-figma-card-body">
                        <a className="ds-figma-card-header" href={getFigmaFamilyHref(group.family.nodeId)}>
                                                    <h3>
                            {group.sources.length > 1
                              ? (COMPONENT_REGISTRY[group.id as ComponentId]?.label ?? group.label)
                              : group.label}
                          </h3>
                          <p>
                            {(() => {
                              const live = getNativeDesignSystemPreview(group.id)?.variants.length ?? 0
                              const authored = group.sources.reduce((sum, family) => sum + family.variants.length, 0)
                              const count = live || authored
                              return `${count} ${count === 1 ? 'state' : 'states'}`
                            })()}
                          </p>
                        </a>
                      </div>
                      <div className="ds-figma-card-preview">
                        <FigmaLivePreview family={group.family} />
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
              {references.length ? (
                <details className="ds-figma-alignment" open={Boolean(query.trim())}>
                  <summary>{references.length} design and platform references</summary>
                  <p className="ds-source-note">
                    Foundations, complete compositions and OS/legacy references retain their original Figma identities.
                    Use shared primitives and the actual platform APIs when composing an interface.
                  </p>
                  <ul>
                    {references.map((family) => (
                      <li key={family.nodeId}>
                        <a href={getFigmaFamilyHref(family.nodeId)}>{family.name}</a>
                        <span>{getFigmaLibraryReference(family.nodeId)?.kind}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
              {pending.length ? (
                <details className="ds-figma-alignment" open={Boolean(query.trim())}>
                  <summary>
                    {pending.length} source {pending.length === 1 ? 'family' : 'families'} awaiting alignment
                  </summary>
                  <p className="ds-source-note">
                    These source contracts still need implementation or exact variant mapping. They are not presented as
                    live components.
                  </p>
                  <ul>
                    {pending.map((family) => (
                      <li key={family.nodeId}>
                        <a href={getFigmaFamilyHref(family.nodeId)}>{family.name}</a>
                        <span>
                          {family.variants.length} source variants{family.legacy ? ' · legacy' : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
