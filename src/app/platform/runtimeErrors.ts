export function renderBootError(root: HTMLElement | null, error: unknown): void {
  if (!root) return
  const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
  const stack = error instanceof Error ? (error.stack ?? '') : ''
  root.innerHTML = `
    <div style="font-family: monospace; padding: 24px; color: #262626; background: #fff;">
      <h1 style="font-size: 18px; margin: 0 0 12px;">App boot error</h1>
      <pre style="white-space: pre-wrap; font-size: 13px;">${escape(message)}\n\n${escape(stack)}</pre>
    </div>
  `
}

export function installRuntimeErrorHandlers(
  target: EventTarget,
  onBootError: (error: unknown) => void,
  onRuntimeError: (error: unknown) => void = (error) => console.error('Unhandled application error', error),
) {
  let mounted = false
  const report = (error: unknown) => (mounted ? onRuntimeError(error) : onBootError(error))
  const onError: EventListener = (event) => {
    const errorEvent = event as ErrorEvent
    report(errorEvent.error ?? errorEvent.message)
  }
  const onRejection: EventListener = (event) => report((event as PromiseRejectionEvent).reason)
  target.addEventListener('error', onError)
  target.addEventListener('unhandledrejection', onRejection)
  return {
    markMounted: () => {
      mounted = true
    },
    dispose: () => {
      target.removeEventListener('error', onError)
      target.removeEventListener('unhandledrejection', onRejection)
    },
  }
}
