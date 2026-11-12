import { useId, useState, type KeyboardEvent, type ReactNode } from 'react'
import { PreviewControlSlotContext } from './previewControlSlot'
import ThemeModeSegment from '@/app/components/ThemeModeSegment'
import type { ComponentImplementationPackage as ImplementationPackageData } from '@/app/registry/componentImplementationPackages'
import { SCREEN_REGISTRY } from '@/app/registry/screenRegistry'
import type { ScreenId } from '@/app/state/demoTypes'
import { getComponentStatePreview } from './componentStatePreviews'
import { FigmaLogo } from './FigmaLogo'
import { humanizeVariant } from './FigmaStateGallery'
import { InspectModeContext, MeasurementSurface } from './inspect/MeasurementSurface'

type ThemeMode = 'light' | 'dark'
export type ComponentDocTab = 'overview' | 'states' | 'specs' | 'code'

const TAB_LABEL: Record<ComponentDocTab, string> = {
  overview: 'Overview',
  states: 'States',
  specs: 'Specs',
  code: 'Code',
}

/** Rows that restate the template rather than describe the component. They are left out of Specs. */
const GENERIC_ROWS = new Set(['Policy ownership', 'Interaction ownership', 'Source canvas'])
const GENERIC_STATE_DESCRIPTION = /^Select this implemented presentation in the live preview/

export interface ComponentDocCrumb {
  label: string
  href?: string
  onClick?: () => void
}

export interface ComponentDocStatus {
  label: string
  tone?: 'positive' | 'neutral' | 'attention'
}

/**
 * The one documentation template for every component: a compact header, then Overview, States, Specs and Code.
 * Each fact appears once; sections without content are left out instead of being filled with generic text.
 */
export default function ComponentOverviewSections({
  componentId,
  title,
  breadcrumbs = [],
  summary,
  status = [],
  documentationUrl,
  notice,
  headerExtras,
  data,
  themeMode,
  onThemeModeChange,
  preview,
  previewControls,
  webSourcePath,
  sourcePath,
  usedByScreens = [],
  sourceStates,
  allowThemeChange = true,
  implementation,
  initialTab = 'overview',
  onTabChange,
}: {
  componentId: string
  title: string
  breadcrumbs?: readonly ComponentDocCrumb[]
  /** One sentence on what the component is for. Defaults to the implementation package summary. */
  summary?: string
  status?: readonly ComponentDocStatus[]
  documentationUrl?: string
  /** Shown under the header when the design is not a live component. */
  notice?: ReactNode
  /** Extra header controls, such as the choice between composed implementations. */
  headerExtras?: ReactNode
  data: ImplementationPackageData
  themeMode: ThemeMode
  onThemeModeChange: (value: ThemeMode) => void
  preview?: ReactNode
  /** Variant controls shown in the preview toolbar. */
  previewControls?: ReactNode
  /** Source used by the preview; shown on Code only when no code browser is supplied. */
  sourcePath?: string
  webSourcePath?: string
  usedByScreens?: readonly string[]
  sourceStates?: ReactNode
  allowThemeChange?: boolean
  implementation?: ReactNode
  initialTab?: ComponentDocTab
  onTabChange?: (tab: ComponentDocTab) => void
}) {
  const baseId = useId()
  const [inspect, setInspect] = useState(false)
  const [controlSlot, setControlSlot] = useState<HTMLDivElement | null>(null)
  const specs = data.visualSpecifications.filter((row) => !GENERIC_ROWS.has(row.label))
  const behaviour = data.motionSpecifications.filter((row) => !GENERIC_ROWS.has(row.label))
  const showAssets = data.assets.required && !!data.assets.summary
  const states = sourceStates ? null : data.states
  const tabs: ComponentDocTab[] = [
    'overview',
    ...((sourceStates || data.states.length ? ['states'] : []) as ComponentDocTab[]),
    ...((specs.length || behaviour.length || data.accessibilitySpecifications.length || showAssets
      ? ['specs']
      : []) as ComponentDocTab[]),
    ...((implementation || sourcePath ? ['code'] : []) as ComponentDocTab[]),
  ]
  const [requested, setRequested] = useState<ComponentDocTab>(initialTab)
  const tab = tabs.includes(requested) ? requested : 'overview'
  const choose = (next: ComponentDocTab) => {
    setRequested(next)
    onTabChange?.(next)
  }
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = tabs.indexOf(tab)
    const next =
      event.key === 'ArrowRight'
        ? tabs[(index + 1) % tabs.length]
        : event.key === 'ArrowLeft'
          ? tabs[(index - 1 + tabs.length) % tabs.length]
          : event.key === 'Home'
            ? tabs[0]
            : event.key === 'End'
              ? tabs[tabs.length - 1]
              : undefined
    if (!next) return
    event.preventDefault()
    choose(next)
    document.getElementById(`${baseId}-tab-${next}`)?.focus()
  }
  const screens = usedByScreens.map((id) => SCREEN_REGISTRY[id as ScreenId]?.label ?? humanizeVariant(id))
  const text = summary ?? data.summary

  return (
    <InspectModeContext.Provider value={inspect && tab !== 'code'}>
      <article className="ds-doc" data-component-overview-sections="true" data-component-doc={componentId}>
        <header className="ds-doc-header">
          {breadcrumbs.length ? (
            <nav className="ds-breadcrumb" aria-label="Breadcrumb">
              <ol>
                {breadcrumbs.map((crumb) => (
                  <li key={crumb.label}>
                    {crumb.onClick ? (
                      <button type="button" onClick={crumb.onClick}>
                        {crumb.label}
                      </button>
                    ) : crumb.href ? (
                      <a href={crumb.href}>{crumb.label}</a>
                    ) : (
                      <span aria-current="page">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          <div className="ds-doc-title-row">
            <h1>{title}</h1>
            {documentationUrl ? (
              <a
                className="ds-doc-figma"
                href={documentationUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${title} in Figma`}
              >
                <FigmaLogo size={11} />
                <span>Figma</span>
              </a>
            ) : null}
          </div>
          {text ? <p className="ds-doc-summary">{text}</p> : null}
          {status.length ? (
            <ul className="ds-doc-status" aria-label="Status">
              {status.map((item) => (
                <li key={item.label} data-tone={item.tone ?? 'neutral'}>
                  {item.label}
                </li>
              ))}
            </ul>
          ) : null}
          {headerExtras}
          {notice ? <div className="ds-doc-notice">{notice}</div> : null}
        </header>

        <div className="ds-doc-surface">
          <div className="ds-doc-tabs" role="tablist" aria-label={`${title} documentation`}>
            {tabs.map((entry) => (
              <button
                key={entry}
                id={`${baseId}-tab-${entry}`}
                type="button"
                role="tab"
                aria-selected={tab === entry}
                aria-controls={`${baseId}-panel`}
                tabIndex={tab === entry ? 0 : -1}
                onClick={() => choose(entry)}
                onKeyDown={onTabKey}
              >
                {TAB_LABEL[entry]}
              </button>
            ))}
          </div>

          <div
            id={`${baseId}-panel`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${tab}`}
            className="ds-doc-panel"
            data-doc-tab={tab}
          >
            {tab === 'overview' ? (
              <>
                <section className="ds-doc-stage" aria-label="Live preview">
                  <div className="ds-doc-stage-toolbar">
                    <div className="ds-doc-stage-variants" ref={setControlSlot}>
                      {preview ? previewControls : <span className="ds-variant-count">No live preview</span>}
                    </div>
                    {preview && allowThemeChange ? (
                      <ThemeModeSegment value={themeMode} onChange={onThemeModeChange} ariaLabel="Preview theme" />
                    ) : null}
                    {preview ? (
                      <button
                        type="button"
                        className="ds-measure-button"
                        aria-pressed={inspect}
                        data-inspector-ui="true"
                        onClick={() => setInspect((value) => !value)}
                      >
                        Measure
                      </button>
                    ) : null}
                  </div>
                  {inspect ? (
                    <p className="ds-inspect-help">Select an element to see its size, typography and spacing.</p>
                  ) : null}
                  {preview ? (
                    <MeasurementSurface>
                      <div className={`ds-document-preview${themeMode === 'dark' ? ' ds-document-preview-dark' : ''}`}>
                        <PreviewControlSlotContext.Provider value={controlSlot}>{preview}</PreviewControlSlotContext.Provider>
                      </div>
                    </MeasurementSurface>
                  ) : (
                    <div className="ds-doc-empty">
                      <p>This design is documented in Figma. No isolated live preview is wired yet.</p>
                      {documentationUrl ? (
                        <a className="ds-text-link" href={documentationUrl} target="_blank" rel="noreferrer">
                          Open in Figma ↗
                        </a>
                      ) : null}
                    </div>
                  )}
                </section>
                {screens.length ? (
                  <section className="ds-doc-block">
                    <h2>Used in</h2>
                    <ul className="ds-used-in">
                      {screens.map((label) => (
                        <li key={label}>{label}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </>
            ) : null}

            {tab === 'states'
              ? (sourceStates ?? (
                  <ul className="ds-state-grid ds-state-grid-wide" aria-label={`${title} states`}>
                    {(states ?? []).map((state) => {
                      const statePreview = getComponentStatePreview(componentId, state.id, themeMode)
                      const description = GENERIC_STATE_DESCRIPTION.test(state.description) ? '' : state.description
                      return (
                        <li
                          key={state.id}
                          className="ds-state-card"
                          data-state-status={statePreview ? 'live' : 'source'}
                        >
                          <div className={`ds-state-stage${themeMode === 'dark' ? ' ds-state-stage-dark' : ''}`}>
                            {statePreview ? (
                              <MeasurementSurface>{statePreview}</MeasurementSurface>
                            ) : (
                              <span className="ds-state-missing">Shown in the live preview</span>
                            )}
                          </div>
                          <div className="ds-state-footer">
                            <span className="ds-state-name">
                              {state.label === state.id ? humanizeVariant(state.id) : state.label}
                              {description ? <span className="ds-state-size">{description}</span> : null}
                            </span>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                ))
              : null}

            {tab === 'specs' ? (
              <>
                {specs.length ? (
                  <section className="ds-doc-block">
                    <h2>Dimensions and layout</h2>
                    <SpecTable rows={specs} />
                  </section>
                ) : null}
                {behaviour.length ? (
                  <section className="ds-doc-block">
                    <h2>Behaviour</h2>
                    <SpecTable rows={behaviour} />
                  </section>
                ) : null}
                {data.accessibilitySpecifications.length ? (
                  <section className="ds-doc-block">
                    <h2>Accessibility</h2>
                    <ul className="ds-checklist">
                      {data.accessibilitySpecifications.map((requirement) => (
                        <li key={requirement}>{requirement}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}
                {showAssets ? (
                  <section className="ds-doc-block">
                    <h2>Assets</h2>
                    <p className="ds-doc-text">{data.assets.summary}</p>
                  </section>
                ) : null}
              </>
            ) : null}

            {tab === 'code' ? (
              <>
                {implementation ?? (
                  <p className="ds-doc-text">
                    Source: <code>{sourcePath}</code>
                  </p>
                )}
                {webSourcePath && webSourcePath !== sourcePath ? (
                  <p className="ds-doc-text ds-doc-web-source">
                    Web component: <code>{webSourcePath}</code>
                  </p>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </article>
    </InspectModeContext.Provider>
  )
}

function SpecTable({ rows }: { rows: readonly { label: string; value: string; detail?: string }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="ds-spec-table">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>
                <span className="ds-spec-value">{row.value}</span>
                {row.detail ? <span className="ds-spec-detail">{row.detail}</span> : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
