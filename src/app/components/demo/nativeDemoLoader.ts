import type { NativeDemoModule } from '@/features/demo-native/contracts'

let pending: Promise<NativeDemoModule> | null = null

export function loadNativeDemoModule(): Promise<NativeDemoModule> {
  if (pending) return pending
  pending = (async () => {
    const response = await fetch('/native-demo/manifest.json', { cache: 'no-store' })
    if (!response.ok) throw new Error('Native demo build is unavailable')
    const manifest = await response.json() as { version: number; buildId: string; entry: string; css: string[] }
    if (manifest.version !== 1 || manifest.entry !== 'current-host.js' || !Array.isArray(manifest.css)
      || manifest.css.some(file => !/^[\w.-]+\.css$/.test(file))) throw new Error('Invalid Native demo manifest')
    await Promise.all(manifest.css.map(file => new Promise<void>((resolve, reject) => {
      const href = `/native-demo/${file}?build=${encodeURIComponent(manifest.buildId)}`
      const previous = document.querySelector<HTMLLinkElement>(`link[data-native-demo-css="${file}"]`)
      if (previous?.getAttribute('href') === href && previous.sheet) { resolve(); return }
      const link = document.createElement('link')
      link.rel = 'stylesheet'; link.href = href; link.dataset.nativeDemoCss = file
      link.onload = () => { previous?.remove(); resolve() }
      link.onerror = () => { link.remove(); reject(new Error('Native demo styles could not be loaded')) }
      document.head.append(link)
    })))
    const url = `/native-demo/current-host.js?build=${encodeURIComponent(manifest.buildId)}`
    const loaded: unknown = await import(/* @vite-ignore */ url)
    const module = loaded as Partial<NativeDemoModule>
    if (module.version !== 1 || typeof module.mountCurrentApplication !== 'function') throw new Error('Incompatible Native demo module')
    return module as NativeDemoModule
  })().catch(error => { pending = null; throw error })
  return pending
}
