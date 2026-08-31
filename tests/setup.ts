import { configure } from '@testing-library/dom'

configure({ asyncUtilTimeout: 10_000 })

function installDeterministicElementGeometry() {
  if (typeof Element === 'undefined') return

  const nativeGetBoundingClientRect = Element.prototype.getBoundingClientRect
  Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
    if (this.classList.contains('recharts-responsive-container')) {
      return {
        x: 0,
        y: 0,
        top: 0,
        right: -1,
        bottom: -1,
        left: 0,
        width: -1,
        height: -1,
        toJSON: () => ({ x: 0, y: 0, width: -1, height: -1 }),
      }
    }

    return nativeGetBoundingClientRect.call(this)
  }
}

installDeterministicElementGeometry()

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
