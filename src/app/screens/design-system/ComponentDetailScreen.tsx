import { useMemo, useState } from 'react'
import { getNativeDesignSystemPreview } from '@/features/demo-native/designSystemPreview'
import { COMPONENT_REGISTRY, getComponentMeta } from '@/app/registry/componentRegistry'
import { COMPONENT_CODE_SAMPLES, resolveComponentCodeSample } from '@/app/registry/componentCodeSamples'
import {
  getComponentImplementationPackage,
  type ComponentImplementationPackage,
} from '@/app/registry/componentImplementationPackages'
import ComponentOverviewSections from './ComponentOverviewSections'
import ImplementationCodeBrowser from './ImplementationCodeBrowser'
import { getComponentLivePreview } from './componentLivePreviews'
import { getComponentDocumentationUrl } from './documentationLinks'
import { humanizeVariant } from './FigmaStateGallery'
import { NativeDesignSystemPreview, VariantPicker } from './NativeDesignSystemPreview'
import './DesignSystem.css'

interface ComponentDetailScreenProps {
  componentId: string
  variantId?: string
  onVariantChange?: (variantId: string) => void
  onBack: () => void
}

/** A registry component without a Figma family, documented with the same template as the catalog. */
export default function ComponentDetailScreen({
  componentId,
  variantId,
  onVariantChange,
  onBack,
}: ComponentDetailScreenProps) {
  const implementationPackage = getComponentImplementationPackage(componentId)
  const nativeDefinition = getNativeDesignSystemPreview(componentId)
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light')
  const [pickedVariant, setPickedVariant] = useState<string>()
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

  const data: ComponentImplementationPackage = implementationPackage ?? {
    summary: meta.notes ?? '',
    visualSpecifications: [],
    states: [],
    motionSpecifications: [],
    accessibilitySpecifications: [],
    assets: { required: false, summary: '' },
  }
  const pickable =
    nativeDefinition && nativeDefinition.controls !== 'internal' && nativeDefinition.variants.length > 1
      ? nativeDefinition.variants
      : []
  const shownVariant =
    pickedVariant && pickable.includes(pickedVariant)
      ? pickedVariant
      : variantId && getNativeDesignSystemPreview(componentId, variantId)
        ? variantId
        : pickable[0]
  const preview = nativeDefinition ? (
    <NativeDesignSystemPreview componentId={componentId} variantId={shownVariant} themeMode={themeMode} />
  ) : (
    getComponentLivePreview(componentId, themeMode)
  )

  return (
    <div className="ds-workspace ds-detail">
      <ComponentOverviewSections
        componentId={componentId}
        title={meta.label}
        breadcrumbs={[{ label: 'Components', onClick: onBack }]}
        status={[{ label: nativeDefinition ? 'React Native' : 'React' }]}
        data={data}
        themeMode={themeMode}
        onThemeModeChange={setThemeMode}
        preview={preview ?? undefined}
        previewControls={
          pickable.length && shownVariant ? (
            <VariantPicker
              componentId={componentId}
              id={`${componentId.split('.').pop()}-variant-select`}
              label=""
              variants={pickable}
              selected={shownVariant}
              onSelect={setPickedVariant}
            />
          ) : undefined
        }
        sourcePath={nativeDefinition?.sourcePath ?? meta.componentPath}
        webSourcePath={nativeDefinition ? meta.componentPath : undefined}
        documentationUrl={documentationUrl}
        usedByScreens={meta.usedByScreens}
        allowThemeChange={nativeDefinition?.themeModes?.length !== 1}
        implementation={
          <>
            {variantOptions.length > 0 && onVariantChange ? (
              <label className="ds-figma-select-label">
                Example
                <select
                  aria-label="Variant"
                  value={variantId ?? variantOptions[0]}
                  onChange={(event) => onVariantChange(event.target.value)}
                >
                  {variantOptions.map((id) => (
                    <option key={id} value={id}>
                      {humanizeVariant(id)}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <ImplementationCodeBrowser
              componentId={componentId}
              componentPath={nativeDefinition?.sourcePath ?? meta.componentPath}
              code={resolved ?? undefined}
            />
          </>
        }
      />
    </div>
  )
}
