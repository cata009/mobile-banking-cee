import regularFontUrl from '../../../../native-spike/assets/fonts/UniCredit-regular.ttf?url'
import mediumFontUrl from '../../../../native-spike/assets/fonts/UniCredit-medium.ttf?url'
import boldFontUrl from '../../../../native-spike/assets/fonts/UniCredit-bold.ttf?url'

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

/** SVG image rendering cannot load page fonts, so embed the existing font assets. */
export async function embedReferenceFonts(element: HTMLElement) {
  const sources = await Promise.all([regularFontUrl, mediumFontUrl, boldFontUrl].map(async (url) => {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Could not load the reference fonts.')
    const blob = await response.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read the reference fonts.'))
      reader.onerror = () => reject(new Error('Could not read the reference fonts.'))
      reader.readAsDataURL(blob)
    })
  }))
  const faces: Array<[string, number, string]> = [
    ['UniCredit', 400, sources[0]!], ['UniCredit', 500, sources[1]!], ['UniCredit', 700, sources[2]!],
    ['UniCredit:Regular', 400, sources[0]!], ['UniCredit:Bold', 700, sources[2]!],
    ['UniCredit-regular', 400, sources[0]!], ['UniCredit-medium', 500, sources[1]!], ['UniCredit-bold', 700, sources[2]!],
  ]
  const style = document.createElement('style')
  style.textContent = faces.map(([family, weight, data]) => `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};src:url('${data}') format('truetype');}`).join('\n')
  element.appendChild(style)
}
