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
                ? 'Swift reference'
                : 'Kotlin reference'}
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
      <div className="ds-code-provenance" role="status">
        <strong>
          {canonical ? 'Implemented source' : available ? 'Illustrative reference' : 'Mapping unavailable'}
        </strong>
        <p>
          {canonical
            ? `Executable ${nativeDefinition ? 'React Native' : 'React'} component source used by this preview. Imports and shared dependencies remain part of the repository.`
            : segment === 'react'
              ? available
                ? 'Curated React example. Consult the repository component for its complete runtime dependencies and integration.'
                : 'No React example or canonical mobile source is mapped for this component.'
              : `No production ${platform} implementation is mapped. ${available ? 'This reference illustrates the component contract; validate it before using it in an application.' : 'A reference example has not been authored for this component.'}`}
        </p>
        <code className="ds-code-path">
          {canonical ? sourcePath : segment === 'react' ? componentPath : `Reference example · ${fileName}`}
        </code>
      </div>
      {canonical ? (
        <NativeComponentSource componentId={componentId} componentPath={sourcePath} />
      ) : available && code ? (
        <CodeBlock code={code[segment]} language={segment === 'react' ? 'tsx' : segment} fileName={fileName} />
      ) : (
        <div className="ds-empty">
          <h3>Code sample unavailable</h3>
          <p>Use the source path and documentation references to review the current implementation.</p>
        </div>
      )}
    </div>
  )
}
