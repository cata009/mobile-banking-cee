import { configure } from '@testing-library/dom'
import { installDeterministicBrowserGeometry } from './helpers/browserGeometry'

configure({ asyncUtilTimeout: 10_000 })

installDeterministicBrowserGeometry()

/**
 * jsdom ships no PointerEvent, so `fireEvent.pointerDown(el, { clientX })` used
 * to build a plain Event and silently drop the coordinate. Every swipe test was
 * therefore driving its gesture with `undefined` coordinates — a NaN delta that
 * happened to fall through the old comparisons and "pass". Pointer gestures are
 * how this app changes period, reorders cards and dismisses sheets, so they have
 * to be testable with real coordinates.
 */
function installPointerEvents() {
  if (typeof window === 'undefined') return

  if (typeof window.PointerEvent === 'undefined') {
    class PointerEventPolyfill extends MouseEvent {
      readonly pointerId: number
      readonly pointerType: string
      readonly isPrimary: boolean
      readonly width: number
      readonly height: number
      readonly pressure: number

      constructor(type: string, params: PointerEventInit = {}) {
        super(type, params)
        this.pointerId = params.pointerId ?? 0
        this.pointerType = params.pointerType ?? ''
        this.isPrimary = params.isPrimary ?? true
        this.width = params.width ?? 1
        this.height = params.height ?? 1
        this.pressure = params.pressure ?? 0
      }
    }

    window.PointerEvent = PointerEventPolyfill as unknown as typeof window.PointerEvent
  }

  // Capture is a no-op here: there is one synthetic pointer and no compositor.
  for (const method of ['setPointerCapture', 'releasePointerCapture'] as const) {
    if (typeof Element.prototype[method] !== 'function') {
      Element.prototype[method] = function noop() {}
    }
  }
  if (typeof Element.prototype.hasPointerCapture !== 'function') {
    Element.prototype.hasPointerCapture = function hasPointerCapture() {
      return false
    }
  }
}

installPointerEvents()

/** Shared sheets query reduced motion; jsdom does not implement media queries. */
function installMediaQueries() {
  if (typeof window === 'undefined' || typeof window.matchMedia === 'function') return

  window.matchMedia = (media: string): MediaQueryList => {
    const query = new EventTarget() as MediaQueryList
    Object.defineProperties(query, {
      media: { value: media, enumerable: true },
      matches: { value: false, configurable: true, enumerable: true },
      onchange: { value: null, writable: true },
    })
    query.addListener = (listener) => {
      if (listener) query.addEventListener('change', listener as EventListener)
    }
    query.removeListener = (listener) => {
      if (listener) query.removeEventListener('change', listener as EventListener)
    }
    return query
  }
}

installMediaQueries()

if (typeof Element !== 'undefined' && typeof Element.prototype.scrollTo !== 'function') {
  Element.prototype.scrollTo = function (optionsOrX?: ScrollToOptions | number, y?: number) {
    const options = typeof optionsOrX === 'number' ? { left: optionsOrX, top: y } : optionsOrX
    if (options?.left !== undefined) this.scrollLeft = options.left
    if (options?.top !== undefined) this.scrollTop = options.top
  }
}
