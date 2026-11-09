import { useState } from 'react'
import CodeBlock from '@/app/components/CodeBlock'
import type { ComponentCodeSample } from '@/app/registry/componentCodeSamples'
import { getNativeDesignSystemPreview } from '@/features/demo-native/designSystemPreview'
import { NativeComponentSource } from './NativeComponentSource'

type CodeSegment = 'react' | 'swift' | 'kotlin'

export function getImplementationSourcePaths(componentPath: string): string[] {
  const parts = componentPath
    .split(' + ')
    .map((path) => path.trim())
    .filter(Boolean)
  const directory = parts[0]?.slice(0, parts[0].lastIndexOf('/') + 1) ?? ''
  return parts.map((path) => (path.startsWith('src/') || path.startsWith('native-spike/') ? path : directory + path))
}

/** Keeps executable source and curated references visibly distinct on every detail page. */
export default function ImplementationCodeBrowser({
  componentId,
  componentPath,
  code,
}: {
  componentId: string
  componentPath: string
  code?: Pick<ComponentCodeSample, 'react' | 'swift' | 'kotlin'>
}) {
  const [segment, setSegment] = useState<CodeSegment>('react')
  const [selectedFile, setSelectedFile] = useState('')
  const nativeDefinition = getNativeDesignSystemPreview(componentId)
  const files = nativeDefinition?.sourcePaths
    ? [...nativeDefinition.sourcePaths]
    : getImplementationSourcePaths(nativeDefinition?.sourcePath ?? componentPath)
  const sourcePath = files.includes(selectedFile) ? selectedFile : (files[0] ?? componentPath)
  const canonical = segment === 'react' && (!!nativeDefinition || sourcePath.startsWith('src/app/components/'))
  const available = canonical || !!code?.[segment]?.trim()
  const platform = segment === 'swift' ? 'Swift' : 'Kotlin'
  const fileName =
    segment === 'react' ? sourcePath.split('/').pop() : segment === 'swift' ? 'Component.swift' : 'Component.kt'

  return (
    <div>
      <div className="ds-code-platforms" role="group" aria-label="Implementation language">
        {(['react', 'swift', 'kotlin'] as const).map((entry) => (
          <button type="button" key={entry} onClick={() => setSegment(entry)} aria-pressed={segment === entry}>
            {entry === 'react'
              ? nativeDefinition
                ? 'React Native'
                : 'React'
              : entry === 'swift'
                ? 'Swift'
                : 'Kotlin'}
          </button>
        ))}
      </div>
      {segment === 'react' && files.length > 1 ? (
        <label className="ds-figma-select-label">
          Source file
          <select aria-label="Source file" value={sourcePath} onChange={(event) => setSelectedFile(event.target.value)}>
            {files.map((path) => (
              <option key={path} value={path}>
                {path.split('/').pop()}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {canonical ? null : (
        <p className="ds-code-provenance" role="status">
          {segment === 'react'
            ? available
              ? 'Illustrative React example. The repository component is the source of truth.'
              : 'No React example is mapped for this component.'
            : available
              ? `Illustrative ${platform} reference. No production ${platform} implementation is mapped.`
              : `No ${platform} reference has been written for this component.`}
        </p>
      )}
      {canonical ? (
        <NativeComponentSource componentId={componentId} componentPath={sourcePath} />
      ) : available && code ? (
        <CodeBlock code={code[segment]} language={segment === 'react' ? 'tsx' : segment} fileName={fileName} />
      ) : (
        <p className="ds-doc-text">
          Source: <code>{componentPath}</code>
        </p>
      )}
    </div>
  )
}
