export function installDeterministicBrowserGeometry(): void {
  if (typeof Element === 'undefined') return
  const nativeBounds = Element.prototype.getBoundingClientRect
  Element.prototype.getBoundingClientRect = function () {
    if (!this.classList.contains('recharts-responsive-container')) return nativeBounds.call(this)
    const height = this instanceof HTMLElement && this.style.height.endsWith('px') ? Number.parseFloat(this.style.height) : 180
    const width = this instanceof HTMLElement && this.style.width.endsWith('px') ? Number.parseFloat(this.style.width) : 320
    return { x:0, y:0, top:0, left:0, right:width, bottom:height, width, height, toJSON:() => ({x:0,y:0,width,height}) }
  }

  if (typeof ResizeObserver === 'undefined') {
    class DeterministicResizeObserver implements ResizeObserver {
      private readonly callback: ResizeObserverCallback
      private readonly targets = new Set<Element>()
      constructor(callback: ResizeObserverCallback) { this.callback = callback }
      observe(target: Element): void {
        this.targets.add(target)
        const contentRect = target.getBoundingClientRect()
        const size = {inlineSize:contentRect.width,blockSize:contentRect.height}
        this.callback([{target,contentRect,borderBoxSize:[size],contentBoxSize:[size],devicePixelContentBoxSize:[size]}],this)
      }
      unobserve(target: Element): void { this.targets.delete(target) }
      disconnect(): void { this.targets.clear() }
    }
    globalThis.ResizeObserver = DeterministicResizeObserver
  }
}
