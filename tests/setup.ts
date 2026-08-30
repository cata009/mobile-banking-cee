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
