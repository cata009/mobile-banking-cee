import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { waitFor } from '@testing-library/react'
import type {
  NativeDemoModule,
  NativeDemoMount,
  NativeDemoSnapshot,
} from '@/features/demo-native/contracts'

export const nativeWebRendererDiagnostics = {
  loadCalls: 0,
  mountCalls: 0,
  updateCalls: 0,
  unmountCalls: 0,
  snapshots: [] as NativeDemoSnapshot[],
  loadErrors: [] as string[],
  mountErrors: [] as string[],
  renderErrors: [] as string[],
}

let restoreNativeWebBrowserApis: (() => void) | null = null

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function copySnapshot(snapshot: NativeDemoSnapshot): NativeDemoSnapshot {
  return JSON.parse(JSON.stringify(snapshot)) as NativeDemoSnapshot
}

function diagnosticDetails(surface?: HTMLElement | null) {
  const latest = nativeWebRendererDiagnostics.snapshots.at(-1)
  const state = surface?.getAttribute('data-native-demo-surface') ??
    surface?.getAttribute('data-native-screen-preview') ?? null
  return {
    surfaceState: state,
    nativeHostMounted: Boolean(surface?.querySelector('[data-native-current-host="true"]')),
    nativeHostChildCount: surface?.querySelector('[data-native-current-host="true"]')?.childElementCount ?? 0,
    loadErrors: [...nativeWebRendererDiagnostics.loadErrors],
    mountErrors: [...nativeWebRendererDiagnostics.mountErrors],
    renderErrors: [...nativeWebRendererDiagnostics.renderErrors],
    snapshot: latest
      ? {
          country: latest.country,
          release: latest.release,
          scenario: latest.scenario,
          bankingScenario: latest.bankingScenario,
          productCounts: latest.productCounts,
          activeFeatures: latest.activeFeatures,
          route: latest.route,
        }
      : null,
    text: surface?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 500) ?? '',
  }
}

/** Wait for the actual Native React root, preserving compact diagnostics on failure. */
export async function asyncNativeReady(container: ParentNode): Promise<HTMLElement> {
  let readySurface: HTMLElement | null = null
  await waitFor(
    () => {
      const surface = container.querySelector<HTMLElement>(
        '[data-native-demo-surface], [data-native-screen-preview]',
      )
      if (!surface) throw new Error('Source Native preview surface has not mounted')
      const state = surface.getAttribute('data-native-demo-surface') ??
        surface.getAttribute('data-native-screen-preview')
      if (state === 'error') {
        throw new Error(`Native preview failed: ${JSON.stringify(diagnosticDetails(surface))}`)
      }
      const nativeHost = surface.querySelector<HTMLElement>('[data-native-current-host="true"]')
      if (state !== 'ready' || !nativeHost || nativeHost.childElementCount === 0) {
        throw new Error(`Waiting for Native React root: ${JSON.stringify(diagnosticDetails(surface))}`)
      }
      readySurface = surface
    },
    { timeout: 5_000, interval: 40 },
  )
  if (!readySurface) throw new Error('Native renderer ready check completed without a surface')
  return readySurface
}

/** Fill the browser API shape RN Web subscribes to, preserving a test stub's matches value. */
export function installNativeWebTestBrowserApis(): () => void {
  if (restoreNativeWebBrowserApis) return restoreNativeWebBrowserApis

  const originalMatchMedia = window.matchMedia
  const originalScrollTo =
    typeof HTMLElement === 'undefined'
      ? undefined
      : Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollTo')
  const patchScrollTo = Boolean(
    originalScrollTo?.configurable &&
    Object.prototype.hasOwnProperty.call(originalScrollTo, 'value') &&
    originalScrollTo.writable !== true,
  )
  if (patchScrollTo && originalScrollTo) {
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      ...originalScrollTo,
      writable: true,
    })
  }

  window.matchMedia = (query: string) => {
    const source = originalMatchMedia.call(window, query) as unknown as Partial<MediaQueryList>
    const listeners = new EventTarget()
    const supportsModernListeners =
      typeof source.addEventListener === 'function' &&
      typeof source.removeEventListener === 'function'
    const addEventListener = supportsModernListeners
      ? source.addEventListener!.bind(source)
      : listeners.addEventListener.bind(listeners)
    const removeEventListener = supportsModernListeners
      ? source.removeEventListener!.bind(source)
      : listeners.removeEventListener.bind(listeners)
    const dispatchEvent =
      typeof source.dispatchEvent === 'function'
        ? source.dispatchEvent.bind(source)
        : listeners.dispatchEvent.bind(listeners)
    const addListener =
      typeof source.addListener === 'function'
        ? source.addListener.bind(source)
        : (listener: unknown) => {
            if (typeof listener === 'function') addEventListener('change', listener as EventListener)
          }
    const removeListener =
      typeof source.removeListener === 'function'
        ? source.removeListener.bind(source)
        : (listener: unknown) => {
            if (typeof listener === 'function') removeEventListener('change', listener as EventListener)
          }

    return {
      media: source.media ?? query,
      get matches() {
        return Boolean(source.matches)
      },
      get onchange() {
        return source.onchange ?? null
      },
      set onchange(handler) {
        source.onchange = handler
      },
      addEventListener,
      removeEventListener,
      dispatchEvent,
      addListener,
      removeListener,
    } as unknown as MediaQueryList
  }
  restoreNativeWebBrowserApis = () => {
    window.matchMedia = originalMatchMedia
    if (patchScrollTo && originalScrollTo) {
      Object.defineProperty(HTMLElement.prototype, 'scrollTo', originalScrollTo)
    }
    restoreNativeWebBrowserApis = null
  }
  return restoreNativeWebBrowserApis
}

export function resetNativeWebRendererDiagnostics() {
  nativeWebRendererDiagnostics.loadCalls = 0
  nativeWebRendererDiagnostics.mountCalls = 0
  nativeWebRendererDiagnostics.updateCalls = 0
  nativeWebRendererDiagnostics.unmountCalls = 0
  nativeWebRendererDiagnostics.snapshots.length = 0
  nativeWebRendererDiagnostics.loadErrors.length = 0
  nativeWebRendererDiagnostics.mountErrors.length = 0
  nativeWebRendererDiagnostics.renderErrors.length = 0
  restoreNativeWebBrowserApis?.()
  document.head.querySelector('[data-native-web-renderer-css]')?.remove()
}

/** Test-only loader that mounts the actual compiled React 19 Native renderer. */
export async function loadNativeDemoModuleForWebTest(): Promise<NativeDemoModule> {
  nativeWebRendererDiagnostics.loadCalls += 1
  try {
    installNativeWebTestBrowserApis()
    const [css, sourceTheme] = await Promise.all([
      readFile(resolve(process.cwd(), 'native-spike/dist-host/current-host.css'), 'utf8'),
      readFile(resolve(process.cwd(), 'src/styles/theme.css'), 'utf8'),
    ])
    if (!document.head.querySelector('[data-native-web-renderer-css]')) {
      const style = document.createElement('style')
      style.dataset.nativeWebRendererCss = 'true'
      // Browser entry points load these rules through the Source stylesheet.
      // Keep that independent palette in jsdom without unsupported Tailwind directives.
      const light = sourceTheme.match(/:root,\s*\[data-uc-theme="light"\]\s*\{([^}]+)\}/)?.[1]
      const dark = sourceTheme.match(/\[data-uc-theme="dark"\]\s*\{([^}]+)\}/)?.[1]
      if (!light || !dark) throw new Error('Source light/dark theme rules are unavailable')
      style.textContent = `:root,[data-uc-theme="light"]{${light}}[data-uc-theme="dark"]{${dark}}\n${css}`
      document.head.append(style)
    }

    const loaded: unknown = await import('../../native-spike/dist-host/current-host.js')
    const nativeModule = loaded as Partial<NativeDemoModule>
    const moduleVersion = nativeModule.version
    const mountCurrentApplication = nativeModule.mountCurrentApplication
    if (moduleVersion !== 1 || typeof mountCurrentApplication !== 'function') {
      throw new Error('Compiled Native Web renderer is unavailable or incompatible')
    }

    return {
      version: moduleVersion,
      mountCurrentApplication(element, snapshot, events): NativeDemoMount {
        nativeWebRendererDiagnostics.mountCalls += 1
        nativeWebRendererDiagnostics.snapshots.push(copySnapshot(snapshot))
        const monitoredEvents = new Proxy(events, {
          get(target, property, receiver) {
            const value = Reflect.get(target, property, receiver)
            if (property !== 'onRenderError' || typeof value !== 'function') return value
            return (message: string) => {
              nativeWebRendererDiagnostics.renderErrors.push(message)
              return value(message)
            }
          },
        })

        let nativeMount: NativeDemoMount
        try {
          nativeMount = mountCurrentApplication(element, snapshot, monitoredEvents)
        } catch (error) {
          nativeWebRendererDiagnostics.mountErrors.push(errorMessage(error))
          throw error
        }

        return {
          update(nextSnapshot) {
            nativeWebRendererDiagnostics.updateCalls += 1
            nativeWebRendererDiagnostics.snapshots.push(copySnapshot(nextSnapshot))
            nativeMount.update(nextSnapshot)
          },
          back() {
            nativeMount.back()
          },
          unmount() {
            nativeWebRendererDiagnostics.unmountCalls += 1
            nativeMount.unmount()
          },
        }
      },
    }
  } catch (error) {
    nativeWebRendererDiagnostics.loadErrors.push(errorMessage(error))
    throw error
  }
}
