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
import ComponentOverviewSections, { type ComponentDocStatus, type ComponentDocTab } from './ComponentOverviewSections'
import { getComponentLivePreview } from './componentLivePreviews'
import { NativeDesignSystemPreview, VariantPicker } from './NativeDesignSystemPreview'
import { CATALOG_COMPOSITION_SOURCES } from '@/app/components/contracts/catalogCompositions'
import { getFigmaLibraryReference } from './figmaLibraryReferences'
import { FigmaStateGallery, resolveFigmaStates } from './FigmaStateGallery'
import {
  getFigmaFamilyExamples,
  getFigmaFamilyHref,
  getFigmaFamilyTabFromHash,
  getFigmaImplementationGroup,
  getFigmaNodeUrl,
  getFigmaFamilyScopeExclusion,
  getFigmaPageSectionId,
  type FigmaLibraryFamily,
  type FigmaLibraryPage,
} from './figmaLibraryCatalog'

const DOC_TABS: readonly ComponentDocTab[] = ['overview', 'states', 'specs', 'code']

export function FigmaLivePreview({
  family,
  implementationId,
  theme = 'light',
  variantId,
}: {
  family: FigmaLibraryFamily
  implementationId?: string
  theme?: 'light' | 'dark'
  /** Shows this implemented variant; the page then owns the variant picker. */
  variantId?: string
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
            : variantId && native.variants.includes(variantId)
              ? variantId
              : undefined
        }
        initialVariantId={family.variants.find((variant) => native.variants.includes(variant.nodeId))?.nodeId}
      />
    )
  return id ? getComponentLivePreview(id, theme) : null
}

/** A design that is not a live component documents its source only; there is nothing to specify yet. */
function sourcePackage(family: FigmaLibraryFamily): ComponentImplementationPackage {
  return {
    summary: family.description,
    visualSpecifications: [],
    states: [],
    motionSpecifications: [],
    accessibilitySpecifications: [],
    assets: { required: false, summary: '' },
  }
}

function unimplementedReason(family: FigmaLibraryFamily): string {
  const exclusion = getFigmaFamilyScopeExclusion(family.nodeId)
  if (exclusion) return exclusion
  const reference = getFigmaLibraryReference(family.nodeId)
  if (reference) return reference.reason
  return (
    CATALOG_COMPOSITION_SOURCES.find((source) => source.familyId === family.nodeId && source.status === 'blocked')
      ?.reason ?? 'This design is not implemented yet.'
  )
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const meta = COMPONENT_REGISTRY[selected as ComponentId]
  const native = getNativeDesignSystemPreview(selected)
  const data = (selected && getComponentImplementationPackage(selected)) || sourcePackage(family)
  const code = resolveComponentCodeSample(COMPONENT_CODE_SAMPLES[selected], undefined)
  const title = sources.length > 1 ? (meta?.label ?? group?.label ?? family.name) : family.name
  const states = resolveFigmaStates(sources, selected || undefined, native?.variants ?? [])
  const pickable = native && native.controls !== 'internal' && native.variants.length > 1 ? native.variants : []
  const [variant, setVariant] = useState<string>()
  const currentVariant =
    variant && pickable.includes(variant)
      ? variant
      : (family.variants.find((entry) => pickable.includes(entry.nodeId))?.nodeId ?? pickable[0])
  const hashTab = getFigmaFamilyTabFromHash(window.location.hash)
  const initialTab = DOC_TABS.find((tab) => tab === hashTab) ?? 'overview'

  const status: ComponentDocStatus[] = []
  if (!implementations.length)
    status.push(
      exclusion
        ? { label: 'Out of scope', tone: 'neutral' }
        : reference
          ? { label: `Design reference · ${reference.kind}`, tone: 'neutral' }
          : { label: 'Not implemented', tone: 'attention' },
    )
  else {
    status.push(
      states.perState
        ? {
            label:
              states.built === states.total
                ? `All ${states.total} states live`
                : `${states.built} of ${states.total} states live`,
            tone: states.built === states.total ? 'positive' : 'neutral',
          }
        : { label: 'Live preview', tone: 'positive' },
    )
    status.push({ label: native ? 'React Native' : 'React' })
  }

  return (
    <div className="ds-figma-family" data-figma-family={family.nodeId}>
      <ComponentOverviewSections
        key={selected}
        componentId={selected || family.nodeId}
        title={title}
        breadcrumbs={[
          { label: 'Components', href: '#figma-library' },
          { label: page.name, href: '#' + getFigmaPageSectionId(page.nodeId) },
        ]}
        summary={data.summary}
        status={status}
        documentationUrl={getFigmaNodeUrl(family.nodeId)}
        notice={implementations.length ? undefined : unimplementedReason(family)}
        headerExtras={
          implementations.length > 1 ? (
            <div className="ds-composition-chips" role="group" aria-label="Implementation">
              {implementations.map((id) => (
                <button key={id} type="button" aria-pressed={selected === id} onClick={() => setSelected(id)}>
                  {COMPONENT_REGISTRY[id as ComponentId]?.label ?? id}
                </button>
              ))}
            </div>
          ) : null
        }
        data={data}
        themeMode={theme}
        onThemeModeChange={setTheme}
        preview={
          selected ? (
            <FigmaLivePreview family={family} implementationId={selected} theme={theme} variantId={currentVariant} />
          ) : undefined
        }
        previewControls={
          pickable.length && currentVariant ? (
            <VariantPicker
              componentId={selected}
              id={`${selected.split('.').pop()}-variant-select`}
              label=""
              variants={pickable}
              selected={currentVariant}
              onSelect={setVariant}
            />
          ) : undefined
        }
        webSourcePath={native ? meta?.componentPath : undefined}
        usedByScreens={meta?.usedByScreens}
        sourceStates={
          states.total ? (
            <FigmaStateGallery
              sources={sources}
              componentId={selected || undefined}
              liveVariantIds={native?.variants ?? []}
              theme={theme}
            />
          ) : undefined
        }
        allowThemeChange={native?.themeModes?.length !== 1}
        initialTab={initialTab}
        onTabChange={(tab) =>
          window.history.replaceState(
            null,
            '',
            getFigmaFamilyHref(family.nodeId) + (tab === 'overview' ? '' : '/' + tab),
          )
        }
        implementation={
          native || meta ? (
            <ImplementationCodeBrowser
              key={selected}
              componentId={selected}
              componentPath={native?.sourcePath ?? meta?.componentPath ?? ''}
              code={code ?? undefined}
            />
          ) : undefined
        }
      />
    </div>
  )
}
