import { useEffect, useState } from 'react'
import CodeBlock from '@/app/components/CodeBlock'
import { getNativeDesignSystemPreview } from '@/features/demo-native/designSystemPreview'
import { loadNativeComponentSource } from './nativeComponentSourceLoader'

/** Displays the actual canonical source, rather than a separately maintained Web snippet. */
export function NativeComponentSource({ componentId, componentPath }: { componentId: string; componentPath?: string }) {
  const definition = getNativeDesignSystemPreview(componentId)
  const [loaded, setLoaded] = useState<{ path: string; code: string }>()
  const [failed, setFailed] = useState<string>()
  const path = componentPath ?? definition?.sourcePath
  useEffect(() => {
    let active = true
    if (!path) return
    setFailed(undefined)
    void loadNativeComponentSource(path).then(
      (code) => {
        if (active) {
          setLoaded({ path, code })
          setFailed(undefined)
        }
      },
      () => {
        if (active) setFailed(path)
      },
    )
    return () => {
      active = false
    }
  }, [path])
  if (!path) return null
  if (failed === path)
    return (
      <p role="status">{definition ? 'Native source could not be loaded.' : 'Component source could not be loaded.'}</p>
    )
  if (loaded?.path !== path) return <p role="status">Loading {definition ? 'React Native' : 'React'} source…</p>
  return <CodeBlock code={loaded.code} language="tsx" fileName={path.split('/').pop() ?? 'Component.tsx'} />
}
