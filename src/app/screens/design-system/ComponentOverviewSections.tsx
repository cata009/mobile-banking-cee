import type { ReactNode } from 'react'
import ThemeModeSegment from '@/app/components/ThemeModeSegment'
import type { ComponentImplementationPackage as ImplementationPackageData } from '@/app/registry/componentImplementationPackages'
import { getComponentStatePreview } from './componentStatePreviews'
import { MeasurementSurface } from './inspect/MeasurementSurface'

type ThemeMode = 'light' | 'dark'
const sections = [
  ['overview', 'Overview'],
  ['accessibility', 'Accessibility'],
  ['anatomy', 'Anatomy & geometry'],
  ['states', 'Variants & states'],
  ['behaviour', 'Behaviour & adaptation'],
  ['references', 'References'],
] as const

export default function ComponentOverviewSections({
  componentId,
  data,
  themeMode,
  onThemeModeChange,
  preview,
  sourcePath,
  webSourcePath,
  documentationUrl,
  usedByScreens = [],
  sourceStates,
  allowThemeChange = true,
}: {
  componentId: string
  data: ImplementationPackageData
  themeMode: ThemeMode
  onThemeModeChange: (value: ThemeMode) => void
  preview?: ReactNode
  sourcePath?: string
  webSourcePath?: string
  documentationUrl?: string
  usedByScreens?: readonly string[]
  sourceStates?: ReactNode
  allowThemeChange?: boolean
}) {
  const sectionId = (id: string) => `ds-doc-${componentId}-${id}`
  return (
    <div className="ds-doc-layout" data-component-overview-sections="true">
      <nav className="ds-doc-toc" aria-label="On this page">
        <p className="ds-eyebrow">On this page</p>
        {sections.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() =>
              document.getElementById(sectionId(id))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="ds-doc-content">
        <section id={sectionId('overview')} className="ds-doc-section">
          <div className="ds-doc-section-heading">
            <div>
              <p className="ds-eyebrow">01 / Purpose & preview</p>
              <h2>Overview</h2>
            </div>
            {preview && allowThemeChange ? (
              <ThemeModeSegment value={themeMode} onChange={onThemeModeChange} ariaLabel="Component preview theme" />
            ) : null}
          </div>
          <p className="ds-body">{data.summary}</p>
          {preview ? (
            <MeasurementSurface>
              <div className="ds-document-preview">
                <div className="ds-document-preview-label">
                  <span>Interactive component</span>
                  <span>1× · {themeMode}</span>
                </div>
                {preview}
              </div>
            </MeasurementSurface>
          ) : null}
        </section>
        <section id={sectionId('accessibility')} className="ds-doc-section">
          <p className="ds-eyebrow">02 / Inclusive interaction</p>
          <h2>Accessibility</h2>
          <p className="ds-body">
            Apply these component requirements in the consuming screen. Confirm keyboard, screen reader and text
            enlargement behaviour in the target platform.
          </p>
          <ul className="ds-checklist">
            {data.accessibilitySpecifications.map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>
        </section>
        <section id={sectionId('anatomy')} className="ds-doc-section">
          <p className="ds-eyebrow">03 / Anatomy, dimensions & spacing</p>
          <h2>Anatomy, dimensions & spacing</h2>
          <p className="ds-body">
            Reference values from the implementation package. Enable Inspector to measure actual rendered elements; use
            the Figma board for annotated anatomy and layout guides.
          </p>
          <div className="overflow-x-auto">
            <table className="ds-spec-table">
              <thead>
                <tr>
                  <th scope="col">Property</th>
                  <th scope="col">Value</th>
                  <th scope="col">Layout & usage</th>
                </tr>
              </thead>
              <tbody>
                {data.visualSpecifications.map((item) => (
                  <tr key={item.label}>
                    <td>{item.label}</td>
                    <td>{item.value}</td>
                    <td>{item.detail ?? 'See the component source for contextual overrides.'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section id={sectionId('states')} className="ds-doc-section">
          <p className="ds-eyebrow">04 / Variants & states</p>
          <h2>States</h2>
          <p className="ds-body">
            {sourceStates
              ? 'Every authored Figma state is listed below. The live preview exposes implemented selections; a source reference alone does not claim implementation.'
              : 'Compare supported treatments and interaction states. Each isolated example follows the selected preview theme.'}
          </p>
          {sourceStates ?? (
            <div className="ds-state-list mt-5">
              {data.states.map((state) => {
                const statePreview = getComponentStatePreview(componentId, state.id, themeMode)
                return (
                  <article key={state.id} className="ds-state">
                    <div>
                      <h3>{state.label}</h3>
                      <p>{state.description}</p>
                    </div>
                    <MeasurementSurface>
                      <div
                        className={`ds-state-preview ${themeMode === 'dark' ? 'dark bg-[var(--uc-static-black)]' : ''}`}
                      >
                        {statePreview ?? (
                          <p>
                            No isolated preview is mapped for this state. Inspect interaction states in the live
                            component.
                          </p>
                        )}
                      </div>
                    </MeasurementSurface>
                  </article>
                )
              })}
            </div>
          )}
        </section>
        <section id={sectionId('behaviour')} className="ds-doc-section">
          <p className="ds-eyebrow">05 / Behaviour & adaptation</p>
          <h2>Behaviour & adaptation</h2>
          <div className="overflow-x-auto">
            <table className="ds-spec-table">
              <thead>
                <tr>
                  <th scope="col">Interaction</th>
                  <th scope="col">Value</th>
                  <th scope="col">Behaviour</th>
                </tr>
              </thead>
              <tbody>
                {data.motionSpecifications.map((item) => (
                  <tr key={item.label}>
                    <td>{item.label}</td>
                    <td>{item.value}</td>
                    <td>{item.detail ?? 'Review the source for the complete interaction contract.'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="ds-body">
            <strong>100% text:</strong> use the reference typography and container dimensions above. Check labels with
            realistic translated content.
          </p>
          <p className="ds-body">
            <strong>200% text:</strong> verify the consuming layout at enlarged text size. Check clipping, wrapping,
            focus visibility and reachability of actions. Reference dimensions alone do not establish enlarged-text
            support.
          </p>
        </section>
        <section id={sectionId('references')} className="ds-doc-section">
          <p className="ds-eyebrow">06 / Design & implementation</p>
          <h2>References</h2>
          <dl className="ds-reference-grid">
            <dt>Design</dt>
            <dd>
              {documentationUrl ? (
                <a className="ds-text-link" href={documentationUrl} target="_blank" rel="noreferrer">
                  Open Figma documentation ↗
                </a>
              ) : (
                'A component-specific documentation board is not mapped.'
              )}
            </dd>
            <dt>Preview source</dt>
            <dd>
              <code>{sourcePath ?? 'Review the implementation package.'}</code>
            </dd>
            {webSourcePath && webSourcePath !== sourcePath ? (
              <>
                <dt>Web component</dt>
                <dd>
                  <code>{webSourcePath}</code>
                </dd>
              </>
            ) : null}
            <dt>Assets</dt>
            <dd>{data.assets.summary}</dd>
            <dt>Used by</dt>
            <dd>
              {usedByScreens.length > 0
                ? usedByScreens.join(' · ')
                : 'No consuming screens are listed in the component registry.'}
            </dd>
            <dt>Platform coverage</dt>
            <dd>
              Use the Implementation package to review mapped React Native source or curated React, Swift and Kotlin
              examples. Reference examples are not production native implementations.
            </dd>
          </dl>
        </section>
      </div>
    </div>
  )
}
