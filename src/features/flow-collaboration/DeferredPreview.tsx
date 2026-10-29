import { Component, Suspense, lazy, useMemo, useState, type ComponentType, type ReactNode } from 'react'
import type { FlowScreenKind } from '@/app/screens/flow-library/flows/types'

export interface PreviewContext {
  countryName?: string
  parameters?: Readonly<Record<string, string>>
}
export interface PreviewProps {
  screen: FlowScreenKind
  context: PreviewContext
}
export type PreviewModule = { default: ComponentType<PreviewProps> }

class PreviewErrorBoundary extends Component<{ children: ReactNode; retry: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed)
      return (
        <div role="alert" data-flow-preview-error="true">
          <p>This preview could not be loaded.</p>
          <button type="button" className="min-h-[44px] underline" onClick={this.props.retry}>
            Retry preview
          </button>
        </div>
      )
    return this.props.children
  }
}
export function DeferredPreview({ load, ...props }: PreviewProps & { load: () => Promise<PreviewModule> }) {
  const [attempt, setAttempt] = useState(0)
  return (
    <PreviewErrorBoundary key={attempt} retry={() => setAttempt((value) => value + 1)}>
      <LoadedPreview load={load} {...props} />
    </PreviewErrorBoundary>
  )
}
function LoadedPreview({ load, ...props }: PreviewProps & { load: () => Promise<PreviewModule> }) {
  const Preview = useMemo(() => lazy(load), [load])
  return (
    <Suspense
      fallback={
        <div role="status" data-flow-preview-loading="true">
          Loading preview…
        </div>
      }
    >
      <Preview {...props} />
    </Suspense>
  )
}

/** Exports must capture executable screens, never a module/native loading state. */
export function waitForPreviewReady(root: HTMLElement, expectedScreens = 0): Promise<void> {
  return new Promise((resolve, reject) => {
    const stop = () => {
      observer.disconnect()
      clearTimeout(timer)
    }
    const check = () => {
      if (
        root.querySelector(
          '[data-flow-preview-error], [data-native-demo-surface="error"], [data-native-screen-preview="error"]',
        )
      ) {
        stop()
        reject(new Error('Preview failed to render'))
        return
      }
      if (
        root.querySelector(
          '[data-flow-preview-loading], [data-native-demo-surface="loading"], [data-native-screen-preview="loading"]',
        ) ||
        root.querySelectorAll('[data-flow-screen-capture]').length < expectedScreens
      )
        return
      // The Native bridge announces ready after createRoot(), before that
      // independent React root has committed its first screen into the host.
      const nativeHosts = root.querySelectorAll(
        '[data-native-screen-preview="ready"], [data-native-demo-surface="ready"]',
      )
      if (Array.from(nativeHosts).some((host) => !host.firstElementChild?.childElementCount)) return
      stop()
      resolve()
    }
    const observer = new MutationObserver(check)
    observer.observe(root, { subtree: true, childList: true, attributes: true })
    const timer = setTimeout(() => {
      stop()
      reject(new Error('Preview did not become ready in time'))
    }, 20_000)
    check()
  })
}
