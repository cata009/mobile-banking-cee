import { useMemo, useState } from 'react'
import { AppIcon } from '@/app/components/icons'
import { getNativeDesignSystemPreview } from '@/features/demo-native/designSystemPreview'
import { COMPONENT_REGISTRY, getComponentMeta } from '@/app/registry/componentRegistry'
import { COMPONENT_CODE_SAMPLES, resolveComponentCodeSample } from '@/app/registry/componentCodeSamples'
import { getComponentImplementationPackage } from '@/app/registry/componentImplementationPackages'
import ComponentImplementationPackage from './ComponentImplementationPackage'
import ComponentOverviewSections from './ComponentOverviewSections'
import ImplementationCodeBrowser from './ImplementationCodeBrowser'
import { getComponentLivePreview } from './componentLivePreviews'
import { getComponentDocumentationUrl } from './documentationLinks'
import { NativeDesignSystemPreview } from './NativeDesignSystemPreview'
import { InspectModeContext, MeasurementSurface } from './inspect/MeasurementSurface'
import './DesignSystem.css'

interface ComponentDetailScreenProps {
  componentId: string
  variantId?: string
  onVariantChange?: (variantId: string) => void
  onBack: () => void
}

export default function ComponentDetailScreen({
  componentId,
  variantId,
  onVariantChange,
  onBack,
}: ComponentDetailScreenProps) {
  const implementationPackage = getComponentImplementationPackage(componentId)
  const nativeDefinition = getNativeDesignSystemPreview(componentId)
  const [tab, setTab] = useState<'view' | 'code' | 'package'>('view')
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light')
  const [inspectMode, setInspectMode] = useState(false)
  const meta = getComponentMeta(componentId as keyof typeof COMPONENT_REGISTRY)
  const sample = COMPONENT_CODE_SAMPLES[componentId]
  const resolved = useMemo(() => resolveComponentCodeSample(sample, variantId), [sample, variantId])
  const documentationUrl = getComponentDocumentationUrl(componentId)
  const variantOptions = sample?.variants ? Object.keys(sample.variants) : []

  if (!meta)
    return (
      <div className="ds-workspace ds-detail">
        <button type="button" onClick={onBack} className="ds-back">
          Back to components
        </button>
        <div className="ds-empty">
          <h1>Component unavailable</h1>
          <p>
            Unknown component: <code>{componentId}</code>
          </p>
        </div>
      </div>
    )

  const preview = nativeDefinition ? (
    <NativeDesignSystemPreview
      componentId={componentId}
      variantId={getNativeDesignSystemPreview(componentId, variantId) ? variantId : undefined}
      themeMode={themeMode}
    />
  ) : (
    getComponentLivePreview(componentId, themeMode)
  )

  return (
    <div className="ds-workspace ds-detail">
      <button type="button" onClick={onBack} className="ds-back" aria-label="Back to components">
        <AppIcon name="back-heavy" size={14} color="currentColor" /> Components / {meta.label}
      </button>
      <header className="ds-detail-header">
        <div>
          <p className="ds-eyebrow">Component documentation</p>
          <h1>{meta.label}</h1>
          <p className="ds-detail-id">{componentId}</p>
        </div>
        <div className="flex flex-col items-start gap-4">
          <span className="ds-header-status">
            {nativeDefinition ? 'React Native · source mapped' : 'Web component'}
          </span>
          {variantOptions.length > 0 && onVariantChange ? (
            <label className="flex items-center gap-2 text-[13px]">
              Variant
              <select
                aria-label="Variant"
                value={variantId ?? variantOptions[0]}
                onChange={(event) => onVariantChange(event.target.value)}
                className="uc-select rounded border bg-white px-3 py-2 text-black"
              >
                {variantOptions.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </header>
      <div className="ds-detail-toolbar">
        <div className="ds-detail-tabs" role="group" aria-label="Component detail view">
          {(['view', implementationPackage ? 'package' : 'code'] as const).map((entry) => (
            <button
              key={entry}
              type="button"
              aria-label={entry === 'view' ? 'view' : entry === 'package' ? 'Implementation package' : 'code'}
              aria-pressed={tab === entry}
              onClick={() => setTab(entry)}
            >
              {entry === 'view' ? 'Documentation' : entry === 'package' ? 'Implementation package' : 'Code'}
            </button>
          ))}
        </div>
        {tab === 'view' ? (
          <button
            type="button"
            onClick={() => setInspectMode((value) => !value)}
            data-inspector-ui="true"
            className="ds-inspector-button"
            aria-pressed={inspectMode}
          >
            {inspectMode ? 'Inspector ON' : 'Inspector OFF'}
          </button>
        ) : null}
      </div>
      {tab === 'view' && inspectMode ? (
        <p className="ds-inspect-help">
          Select an element in the preview to inspect its rendered dimensions, typography and spacing. Measurements
          reflect the web-rendered preview at its current size.
        </p>
      ) : null}
      {tab === 'view' ? (
        <InspectModeContext.Provider value={inspectMode}>
          {implementationPackage ? (
            <ComponentOverviewSections
              componentId={componentId}
              data={implementationPackage}
              themeMode={themeMode}
              onThemeModeChange={setThemeMode}
              preview={preview}
              sourcePath={nativeDefinition?.sourcePath ?? meta.componentPath}
              webSourcePath={meta.componentPath}
              documentationUrl={documentationUrl}
              usedByScreens={meta.usedByScreens}
              allowThemeChange={nativeDefinition?.themeModes?.length !== 1}
            />
          ) : (
            <div className="ds-doc-content mt-8">
              <section className="ds-doc-section">
                <p className="ds-eyebrow">01 / Overview</p>
                <h2>Overview</h2>
                <p className="ds-body">
                  {meta.notes ??
                    'Explore the component in isolation and review its source before integrating it into an experience.'}
                </p>
                <MeasurementSurface>
                  {preview ? (
                    <div className="ds-document-preview">{preview}</div>
                  ) : (
                    <p className="ds-body">
                      An isolated preview is not mapped. Review the component in its consuming screens.
                    </p>
                  )}
                </MeasurementSurface>
              </section>
              <section className="ds-doc-section">
                <p className="ds-eyebrow">02 / References</p>
                <h2>References</h2>
                <dl className="ds-reference-grid">
                  <dt>Web source</dt>
                  <dd>
                    <code>{meta.componentPath}</code>
                  </dd>
                  <dt>Implementation</dt>
                  <dd>{meta.status}</dd>
                  <dt>Documentation</dt>
                  <dd>
                    {documentationUrl ? (
                      <a className="ds-text-link" href={documentationUrl} target="_blank" rel="noreferrer">
                        Open Figma documentation ↗
                      </a>
                    ) : (
                      'A component-specific documentation board is not mapped.'
                    )}
                  </dd>
                </dl>
              </section>
            </div>
          )}
        </InspectModeContext.Provider>
      ) : tab === 'package' && implementationPackage && (resolved || nativeDefinition) ? (
        <ComponentImplementationPackage
          componentId={componentId}
          componentPath={nativeDefinition?.sourcePath ?? meta.componentPath}
          code={resolved ?? { react: '', swift: '', kotlin: '' }}
          data={implementationPackage}
        />
      ) : (
        <section className="ds-doc-section ds-code-shell">
          <p className="ds-eyebrow">Developer handoff</p>
          <h2>Implementation code</h2>
          <div className="mt-6">
            <ImplementationCodeBrowser
              componentId={componentId}
              componentPath={meta.componentPath}
              code={resolved ?? undefined}
            />
          </div>
        </section>
      )}
    </div>
  )
}
