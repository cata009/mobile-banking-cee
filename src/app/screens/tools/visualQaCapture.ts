/** Bring an iframe screen into the host document so the shared screenshot utility
 * can recognize its DOM types and preserve computed styles and scroll positions. */
export function mountReferenceSnapshot(source: HTMLElement) {
  const clone = document.importNode(source, true)
  const sources = [source, ...Array.from(source.querySelectorAll('*'))]
  const clones = [clone, ...Array.from(clone.querySelectorAll('*'))]
  const view = source.ownerDocument.defaultView
  if (!view) throw new Error('The demo frame is unavailable.')
  for (let i = 0; i < sources.length; i++) {
    const original = sources[i]!
    const copy = clones[i] as HTMLElement | SVGElement | undefined
    if (!copy?.style) continue
    const computed = view.getComputedStyle(original)
    for (let j = 0; j < computed.length; j++) {
      const property = computed.item(j)
      copy.style.setProperty(property, computed.getPropertyValue(property), computed.getPropertyPriority(property))
    }
  }
  const mount = document.createElement('div')
  mount.setAttribute('aria-hidden', 'true')
  mount.setAttribute('inert', '')
  mount.style.cssText = `position:fixed;left:-10000px;top:0;width:${source.clientWidth}px;height:${source.clientHeight}px;overflow:hidden;pointer-events:none;`
  document.body.appendChild(mount)
  mount.appendChild(clone)
  for (let i = 0; i < sources.length; i++) {
    const original = sources[i] as HTMLElement
    const copy = clones[i] as HTMLElement | undefined
    if (!copy) continue
    copy.scrollTop = original.scrollTop
    copy.scrollLeft = original.scrollLeft
  }
  return { element: clone, dispose: () => mount.remove() }
}
