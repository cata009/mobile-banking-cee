import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { getCatalogCompositionSource } from '@/app/components/contracts/catalogCompositions'
import { NativeDesignSystemPreview } from './NativeDesignSystemPreview'
import { FigmaLogo } from './FigmaLogo'
import { getFigmaNodeUrl, getFigmaVariantScopeExclusion, type FigmaLibraryFamily } from './figmaLibraryCatalog'
import { FIGMA_STATE_IMPLEMENTATION } from './figmaStateImplementationMap'
import { describeFigmaVariant, figmaVariantQualifiers, humanizeVariant } from './variantLabels'

type Variant = FigmaLibraryFamily['variants'][number]

export { describeFigmaVariant, figmaVariantQualifiers, humanizeVariant } from './variantLabels'

export type FigmaStateStatus = 'live' | 'source' | 'unavailable' | 'excluded'

const STATUS_LABEL: Record<Exclude<FigmaStateStatus, 'live'>, string> = {
  source: 'Design only',
  unavailable: 'Unavailable',
  excluded: 'Excluded',
}

export interface ResolvedFigmaState {
  variant: Variant
  label: string
  /** The implemented variant that renders this Figma state. */
  live?: string
  status: FigmaStateStatus
  note?: string
}

export interface FigmaStateSummary {
  sources: readonly { source: FigmaLibraryFamily; states: readonly ResolvedFigmaState[] }[]
  /** Implemented variants with no Figma state. */
  implementationOnly: readonly string[]
  built: number
  total: number
  /** False when the component has no per-state previews, so states cannot be matched one by one. */
  perState: boolean
}

function unimplementedStatus(variantId: string): { status: FigmaStateStatus; note?: string } {
  const exclusion = getFigmaVariantScopeExclusion(variantId)
  if (exclusion) return { status: 'excluded', note: exclusion }
  const source = getCatalogCompositionSource(variantId)
  if (source?.status === 'blocked') return { status: 'unavailable', note: source.reason ?? 'Not mapped' }
  return { status: 'source' }
}

/**
 * Matches every Figma state to the implemented variant that renders it: the reviewed map first, then the same id,
 * then an implemented variant named like the state (image catalogues), and a single-state source to the single
 * implemented presentation.
 */
export function resolveFigmaStates(
  sources: readonly FigmaLibraryFamily[],
  componentId: string | undefined,
  liveVariantIds: readonly string[],
): FigmaStateSummary {
  const implemented = componentId ? liveVariantIds : []
  const stateMap: Readonly<Record<string, string>> = (componentId && FIGMA_STATE_IMPLEMENTATION[componentId]) || {}
  const allVariants = sources.flatMap((source) => source.variants)
  const byName = new Map(implemented.map((id) => [id.trim().toLowerCase(), id]))
  const liveFor = (variant: Variant): string | undefined => {
    const mapped = stateMap[variant.nodeId]
    if (mapped && implemented.includes(mapped)) return mapped
    if (implemented.includes(variant.nodeId)) return variant.nodeId
    const named = byName.get(describeFigmaVariant(variant.name).trim().toLowerCase())
    if (named) return named
    if (allVariants.length === 1 && implemented.length >= 1) return implemented[0]
    return undefined
  }
  const resolved = sources.map((source) => ({
    source,
    states: source.variants.map((variant): ResolvedFigmaState => {
      const label = describeFigmaVariant(variant.name)
      const live = liveFor(variant)
      return live
        ? { variant, label, live, status: 'live' }
        : { variant, label, ...unimplementedStatus(variant.nodeId) }
    }),
  }))
  const covered = new Set(resolved.flatMap(({ states }) => states.map((state) => state.live)).filter(Boolean))
  return {
    sources: resolved,
    implementationOnly: implemented.filter(
      (id) => !covered.has(id) && !allVariants.some((variant) => variant.nodeId === id),
    ),
    built: resolved.reduce((sum, { states }) => sum + states.filter((state) => state.live).length, 0),
    total: allVariants.length,
    perState: implemented.length > 0,
  }
}

/** Renders a live state only once it is near the viewport, so a long list stays light. */
function LazyPreview({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '400px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className="ds-state-lazy">
      {visible ? children : <span className="ds-state-skeleton" aria-hidden="true" />}
    </div>
  )
}

function FigmaLink({ variant, label }: { variant: Variant; label: string }) {
  return (
    <a
      className="ds-state-figma"
      href={getFigmaNodeUrl(variant.nodeId)}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${label} in Figma`}
      title="Open in Figma"
    >
      <FigmaLogo size={9} />
    </a>
  )
}

const size = (variant: Variant) => `${variant.width} × ${variant.height} px`

/** Splits a source into rows by its first property when that reads as a matrix (Type × State). */
function rowsOf(states: readonly ResolvedFigmaState[]) {
  const qualifiers = states.map((state) => figmaVariantQualifiers(state.variant.name))
  const firsts = [...new Set(qualifiers.map((parts) => parts[0] ?? ''))]
  const matrix =
    states.length > 3 &&
    qualifiers.every((parts) => parts.length >= 2) &&
    firsts.length >= 2 &&
    firsts.length <= 6 &&
    firsts.length < states.length
  if (!matrix) return [{ label: '', states: states.map((state) => ({ state, label: state.label })) }]
  return firsts.map((first) => ({
    label: first,
    states: states
      .map((state, index) => ({ state, label: qualifiers[index]!.slice(1).join(' · '), first: qualifiers[index]![0] }))
      .filter((entry) => entry.first === first),
  }))
}

/**
 * The component's states, in the order of the Figma source. A state the implementation renders is shown live; the
 * others keep their place in the grid as a Design only cell, so gaps are visible at a glance.
 */
export function FigmaStateGallery({
  sources,
  componentId,
  liveVariantIds,
  theme,
}: {
  sources: readonly FigmaLibraryFamily[]
  componentId?: string
  liveVariantIds: readonly string[]
  theme: 'light' | 'dark'
}) {
  const summary = resolveFigmaStates(sources, componentId, liveVariantIds)
  if (!summary.perState)
    return (
      <div className="ds-state-gallery">
        <p className="ds-state-intro">
          {componentId
            ? 'The live preview on Overview shows this component. Its Figma states are listed below for reference.'
            : 'This design is not implemented yet. Its Figma states are listed below for reference.'}
        </p>
        {summary.sources.map(({ source, states }) => (
          <section key={source.nodeId} className="ds-state-group" aria-label={`${source.name} states`}>
            {summary.sources.length > 1 ? <h3 className="ds-state-group-title">{source.name}</h3> : null}
            <ul className="ds-state-index">
              {states.map((state) => (
                <li key={state.variant.nodeId} data-state-status={state.status}>
                  <span title={state.variant.name}>{state.label}</span>
                  <span className="ds-state-size">{size(state.variant)}</span>
                  <FigmaLink variant={state.variant} label={state.label} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    )
  return (
    <div className="ds-state-gallery">
      {summary.sources.map(({ source, states }) => {
        const sizes = new Map<string, number>()
        for (const state of states) sizes.set(size(state.variant), (sizes.get(size(state.variant)) ?? 0) + 1)
        const common = [...sizes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
        const width = Math.max(...states.map((state) => state.variant.width), 120)
        const style = { '--ds-state-min': `${Math.min(width + 34, 440)}px` } as CSSProperties
        const built = states.filter((state) => state.live).length
        return (
          <section key={source.nodeId} className="ds-state-group" aria-label={`${source.name} states`} style={style}>
            <div className="ds-state-group-heading">
              {summary.sources.length > 1 ? <h3 className="ds-state-group-title">{source.name}</h3> : <span />}
              <span className="ds-state-group-meta">
                {built === states.length ? `${states.length} states` : `${built} of ${states.length} live`}
                {common ? ` · ${common}` : ''}
              </span>
            </div>
            {rowsOf(states).map((row) => (
              <div key={row.label || 'all'} className="ds-state-row">
                {row.label ? <h4 className="ds-state-row-title">{row.label}</h4> : null}
                <ul className="ds-state-grid" aria-label={row.label ? `${row.label} states` : `${source.name} states`}>
                  {row.states.map(({ state, label }) => (
                    <li
                      key={state.variant.nodeId}
                      className="ds-state-card"
                      data-state-status={state.status}
                      title={state.note}
                    >
                      <div className={`ds-state-stage${theme === 'dark' ? ' ds-state-stage-dark' : ''}`}>
                        {state.live && componentId ? (
                          <LazyPreview>
                            <NativeDesignSystemPreview
                              componentId={componentId}
                              variantId={state.live}
                              themeMode={theme}
                            />
                          </LazyPreview>
                        ) : (
                          <span className="ds-state-missing">
                            {STATUS_LABEL[state.status as keyof typeof STATUS_LABEL]}
                          </span>
                        )}
                      </div>
                      <div className="ds-state-footer">
                        <span className="ds-state-name" title={state.variant.name}>
                          {label || state.label}
                          {size(state.variant) === common ? null : (
                            <span className="ds-state-size">{size(state.variant)}</span>
                          )}
                        </span>
                        <FigmaLink variant={state.variant} label={state.label} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )
      })}
      {summary.implementationOnly.length && componentId ? (
        <section className="ds-state-group" aria-label="States in code only">
          <div className="ds-state-group-heading">
            <h3 className="ds-state-group-title">In code only</h3>
            <span className="ds-state-group-meta">Built states with no matching Figma state</span>
          </div>
          <ul className="ds-state-grid" aria-label="Code only states">
            {summary.implementationOnly.map((id) => (
              <li key={id} className="ds-state-card" data-state-status="live">
                <div className={`ds-state-stage${theme === 'dark' ? ' ds-state-stage-dark' : ''}`}>
                  <LazyPreview>
                    <NativeDesignSystemPreview componentId={componentId} variantId={id} themeMode={theme} />
                  </LazyPreview>
                </div>
                <div className="ds-state-footer">
                  <span className="ds-state-name">{humanizeVariant(id)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
