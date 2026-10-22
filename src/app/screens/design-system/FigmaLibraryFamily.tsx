import { useState } from 'react'
import { COMPONENT_REGISTRY } from '@/app/registry/componentRegistry'
import { COMPONENT_CODE_SAMPLES, resolveComponentCodeSample } from '@/app/registry/componentCodeSamples'
import {
  getComponentImplementationPackage,
  type ComponentImplementationPackage,
} from '@/app/registry/componentImplementationPackages'
import { getNativeDesignSystemPreview } from '@/features/demo-native/designSystemPreview'
import type { ComponentId } from '@/app/state/demoTypes'
import ImplementationCodeBrowser from './ImplementationCodeBrowser'
import ComponentOverviewSections from './ComponentOverviewSections'
import { getComponentLivePreview } from './componentLivePreviews'
import { InspectModeContext } from './inspect/MeasurementSurface'
import { NativeDesignSystemPreview } from './NativeDesignSystemPreview'
import {
  CATALOG_COMPOSITION_SOURCES,
  getCatalogCompositionSource,
} from '@/app/components/contracts/catalogCompositions'
import { getFigmaLibraryReference } from './figmaLibraryReferences'
import {
  getFigmaFamilyExamples,
  getFigmaImplementationGroup,
  getFigmaNodeUrl,
  getFigmaPageSectionId,
  getFigmaVariantScopeExclusion,
  getFigmaFamilyScopeExclusion,
  type FigmaLibraryFamily,
  type FigmaLibraryPage,
} from './figmaLibraryCatalog'

export function FigmaLivePreview({
  family,
  implementationId,
  theme = 'light',
}: {
  family: FigmaLibraryFamily
  implementationId?: string
  theme?: 'light' | 'dark'
}) {
  const id = implementationId ?? getFigmaFamilyExamples(family.nodeId)[0]
  const native = id ? getNativeDesignSystemPreview(id) : undefined
  if (id && native)
    return (
      <NativeDesignSystemPreview
        componentId={id}
        themeMode={theme}
        variantId={
          native.controls === 'internal'
            ? family.variants.find((variant) => native.variants.includes(variant.nodeId))?.nodeId
            : undefined
        }
        initialVariantId={family.variants.find((variant) => native.variants.includes(variant.nodeId))?.nodeId}
      />
    )
  return id ? getComponentLivePreview(id, theme) : null
}

function sourcePackage(family: FigmaLibraryFamily): ComponentImplementationPackage {
  const first = family.variants[0]
  return {
    summary:
      getFigmaFamilyScopeExclusion(family.nodeId) ||
      family.description ||
      getFigmaLibraryReference(family.nodeId)?.reason ||
      family.name + ' requires source alignment before implementation.',
    visualSpecifications: [
      {
        label: 'Source canvas',
        value: first ? `${first.width} × ${first.height} px` : 'See Figma',
        detail: 'Dimensions refer to the authored source. Inspector measures actual rendered elements.',
      },
    ],
    states: [],
    motionSpecifications: [
      {
        label: 'Interaction ownership',
        value: 'Controlled values and callbacks',
        detail: 'The consuming feature owns validation, availability, navigation and banking actions.',
      },
    ],
    accessibilitySpecifications: family.name.toLowerCase().includes('counter')
      ? [
          'Include the count in the owning action’s accessible name; keep the visual counter out of the focus order.',
          'Expose status in text and semantics, as well as color.',
        ]
      : family.name.toLowerCase().includes('field')
        ? [
            'Associate a persistent label with the field and expose its selected value, error and disabled state.',
            'Support keyboard activation, selection, dismissal and focus return in the target host.',
            'Verify focus, contrast, wrapping and reachable actions at 200% text size.',
          ]
        : [
            'Use readable text and meaningful accessible names; keep decorative artwork out of the focus order.',
            'Check keyboard, screen reader and visible focus in the consuming screen.',
            'Verify contrast and content adaptation at 200% text size; test browser zoom separately.',
          ],
    assets: {
      required: false,
      summary:
        'Shared primitives, typography and original glyph/artwork assets. Review imports in the executable source.',
    },
  }
}

export default function FigmaLibraryFamilyView({
  page,
  family,
}: {
  page: FigmaLibraryPage
  family: FigmaLibraryFamily
}) {
  const group = getFigmaImplementationGroup(family.nodeId)
  const reference = getFigmaLibraryReference(family.nodeId)
  const exclusion = getFigmaFamilyScopeExclusion(family.nodeId)
  const implementations = group?.implementations ?? []
  const sources = group?.sources ?? [family]
  const [selected, setSelected] = useState(implementations[0] ?? '')
  const [inspect, setInspect] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const meta = COMPONENT_REGISTRY[selected as ComponentId]
  const native = getNativeDesignSystemPreview(selected)
  const data = getComponentImplementationPackage(selected) ?? sourcePackage(family)
  const code = resolveComponentCodeSample(COMPONENT_CODE_SAMPLES[selected], undefined)
  const title = sources.length > 1 ? (meta?.label ?? group?.label ?? family.name) : family.name
  const sourceStates = (
    <>
      {sources.map((source) => (
        <div key={source.nodeId}>
          <h3>{source.name}</h3>
          <div className="ds-figma-variant-list" role="list" aria-label={source.name + ' source variants'}>
            {source.variants.map((variant) => (
              <div className="ds-figma-variant-row" role="listitem" key={variant.nodeId}>
                <a href={getFigmaNodeUrl(variant.nodeId)} target="_blank" rel="noreferrer">
                  {variant.name} ↗
                  {getFigmaVariantScopeExclusion(variant.nodeId) ? (
                    <span className="ds-source-note">
                      {' '}
                      · Excluded by scope: {getFigmaVariantScopeExclusion(variant.nodeId)}
                    </span>
                  ) : null}
                  {!getFigmaVariantScopeExclusion(variant.nodeId) &&
                  getCatalogCompositionSource(variant.nodeId)?.status === 'blocked' ? (
                    <span className="ds-source-note">
                      {' '}
                      · Unavailable: {getCatalogCompositionSource(variant.nodeId)?.reason}
                    </span>
                  ) : null}
                </a>
                <span>
                  {variant.width} × {variant.height} px
                </span>
                <code>{variant.nodeId}</code>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  )
  return (
    <article className="ds-figma-family" data-figma-family={family.nodeId}>
      <a className="ds-text-link ds-back" href={'#' + getFigmaPageSectionId(page.nodeId)}>
        ← {page.name}
      </a>
      <header className="ds-detail-header">
        <div>
          <p className="ds-eyebrow">{page.name}</p>
          <h1>{title}</h1>
          <p>
            {sources.reduce((sum, source) => sum + source.variants.length, 0)} authored source variants ·{' '}
            {sources.length} Figma {sources.length === 1 ? 'family' : 'families'}
          </p>
        </div>
        <a className="ds-text-link" href={getFigmaNodeUrl(family.nodeId)} target="_blank" rel="noreferrer">
          Open Figma ↗
        </a>
      </header>
      {implementations.length ? (
        <div className="ds-detail-toolbar">
          {implementations.length > 1 ? (
            <label className="ds-figma-select-label">
              Composition
              <select
                aria-label="Component composition"
                value={selected}
                onChange={(event) => setSelected(event.target.value)}
              >
                {implementations.map((id) => (
                  <option key={id} value={id}>
                    {COMPONENT_REGISTRY[id as ComponentId]?.label ?? id}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span className="ds-source-note">
              {native ? 'React Native · implemented source' : 'Shared web component'}
            </span>
          )}
          <button
            type="button"
            className="ds-inspector-button"
            aria-pressed={inspect}
            onClick={() => setInspect((value) => !value)}
          >
            {inspect ? 'Inspector ON' : 'Inspector OFF'}
          </button>
        </div>
      ) : (
        <p className="ds-source-note">
          {exclusion ??
            (reference
              ? `${reference.kind} reference · ${reference.reason}`
              : (CATALOG_COMPOSITION_SOURCES.find(
                  (source) => source.familyId === family.nodeId && source.status === 'blocked',
                )?.reason ??
                'This source family is awaiting implementation or exact mapping. It is not a live component.'))}
        </p>
      )}
      {inspect ? (
        <p className="ds-inspect-help">Select an element to measure its rendered dimensions, typography and spacing.</p>
      ) : null}
      <InspectModeContext.Provider value={inspect}>
        <ComponentOverviewSections
          componentId={selected || family.nodeId}
          data={data}
          themeMode={theme}
          onThemeModeChange={setTheme}
          preview={
            selected ? <FigmaLivePreview family={family} implementationId={selected} theme={theme} /> : undefined
          }
          sourcePath={native?.sourcePath ?? meta?.componentPath}
          webSourcePath={meta?.componentPath}
          documentationUrl={getFigmaNodeUrl(family.nodeId)}
          usedByScreens={meta?.usedByScreens}
          sourceStates={sourceStates}
          allowThemeChange={native?.themeModes?.length !== 1}
        />
      </InspectModeContext.Provider>
      <section className="ds-doc-section">
        <p className="ds-eyebrow">07 / Developer handoff</p>
        <h2>Implementation & code</h2>
        {native || meta ? (
          <ImplementationCodeBrowser
            key={selected}
            componentId={selected}
            componentPath={native?.sourcePath ?? meta?.componentPath ?? ''}
            code={code ?? undefined}
          />
        ) : (
          <p className="ds-source-note">
            {exclusion
              ? 'This source is excluded by the requested scope. Its original Figma identity is preserved.'
              : reference
                ? 'Use the existing shared components and the platform or feature composition referenced by this design. This source reference does not introduce another implementation.'
                : 'No executable source is mapped. Follow the exact approved design when adding this component.'}
          </p>
        )}
      </section>
    </article>
  )
}
