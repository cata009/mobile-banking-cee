import { getCoverCrop } from './preloginPictureCrop'
import type { PreloginTextField } from './preloginTextFields'

type RGB = readonly [number, number, number]
export interface PreviewCheck {
  screen: 'active' | 'inactive'
  key?: string
  label: string
  ratio: number | null
  threshold: number
  lowContrast: boolean
  overflow: boolean
  brand: boolean
  rect: { left: number; top: number; width: number; height: number }
}

function luminance(rgb: RGB) {
  const linear = rgb.map((value) => {
    const n = value / 255
    return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4
  })
  return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722
}
export function contrastRatio(foreground: RGB, background: RGB): number {
  const a = luminance(foreground)
  const b = luminance(background)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
export function meetsTextContrast(ratio: number, fontSize: number, fontWeight: number) {
  return ratio >= (fontSize >= 24 || (fontSize >= 18.6667 && fontWeight >= 700) ? 3 : 4.5)
}
function rgbColor(value: string): RGB {
  const numbers = value.match(/[\d.]+/g)?.map(Number)
  return numbers && numbers.length >= 3 ? [numbers[0]!, numbers[1]!, numbers[2]!] : [255, 255, 255]
}

/** Samples background colors with the measured app overlays, not text antialiasing. */
export function scanPreloginReadability(host: HTMLElement, fields: readonly PreloginTextField[]): PreviewCheck[] {
  const checks: PreviewCheck[] = []
  for (const root of host.querySelectorAll<HTMLElement>('[data-prelogin-screen]')) {
    const bounds = root.getBoundingClientRect()
    const image = root.querySelector<HTMLImageElement>('img[alt="Background"]')
    if (!image?.complete || !image.naturalWidth || bounds.width <= 0 || bounds.height <= 0) continue
    const width = root.clientWidth
    const height = root.clientHeight
    if (!width || !height) continue
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) continue
    const points = (image.style.objectPosition || '50% 50%').match(/[\d.]+/g)?.map(Number) ?? [50, 50]
    const zoom = Number(image.style.transform.match(/scale\(([^)]+)\)/)?.[1] ?? 1)
    const crop = getCoverCrop(
      image.naturalWidth,
      image.naturalHeight,
      width,
      height,
      points[0] ?? 50,
      points[1] ?? 50,
      zoom,
    )
    const black = getComputedStyle(root).getPropertyValue('--uc-static-black').trim() || '#262626'
    context.fillStyle = black
    context.fillRect(0, 0, width, height)
    context.drawImage(image, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, width, height)
    const toLocal = (rect: DOMRect) => ({
      left: ((rect.left - bounds.left) / bounds.width) * width,
      top: ((rect.top - bounds.top) / bounds.height) * height,
      width: (rect.width / bounds.width) * width,
      height: (rect.height / bounds.height) * height,
    })
    for (const overlay of root.querySelectorAll<HTMLElement>('[data-prelogin-overlay]')) {
      const rect = toLocal(overlay.getBoundingClientRect())
      if (rect.height <= 0) continue
      const gradient = context.createLinearGradient(0, rect.top, 0, rect.top + rect.height)
      if (overlay.dataset.preloginOverlay === 'top') {
        gradient.addColorStop(0, 'rgba(38,38,38,0.7)')
        gradient.addColorStop(1, 'rgba(38,38,38,0)')
      } else {
        gradient.addColorStop(0, 'rgba(38,38,38,0)')
        gradient.addColorStop(0.0595, black)
        gradient.addColorStop(1, black)
      }
      context.fillStyle = gradient
      context.fillRect(rect.left, rect.top, rect.width, rect.height)
    }
    const screen = root.dataset.preloginScreen === 'active' ? 'active' : 'inactive'
    for (const element of root.querySelectorAll<HTMLElement>('h1,h2,p,button,[data-prelogin-brand]')) {
      // Button children are checked once using their actual button background.
      if (element.tagName !== 'BUTTON' && element.closest('button')) continue
      const brand = element.hasAttribute('data-prelogin-brand')
      const text = element.textContent?.trim() || ''
      if (!brand && !text) continue
      const rect = toLocal(element.getBoundingClientRect())
      if (rect.width <= 0 || rect.height <= 0) continue
      const style = getComputedStyle(element)
      const size = parseFloat(style.fontSize) || 16
      const weight = parseInt(style.fontWeight) || 400
      const threshold = brand || size >= 24 || (size >= 18.6667 && weight >= 700) ? 3 : 4.5
      const foreground: RGB = brand ? [255, 255, 255] : rgbColor(style.color)
      const opaqueButton =
        element.tagName === 'BUTTON' &&
        style.backgroundColor !== 'transparent' &&
        !style.backgroundColor.endsWith(', 0)')
      let ratio = 21
      for (const fx of [0.1, 0.3, 0.5, 0.7, 0.9])
        for (const fy of [0.2, 0.5, 0.8]) {
          const x = Math.max(0, Math.min(width - 1, Math.round(rect.left + rect.width * fx)))
          const y = Math.max(0, Math.min(height - 1, Math.round(rect.top + rect.height * fy)))
          const pixel = context.getImageData(x, y, 1, 1).data
          const background: RGB = opaqueButton ? rgbColor(style.backgroundColor) : [pixel[0]!, pixel[1]!, pixel[2]!]
          ratio = Math.min(ratio, contrastRatio(foreground, background))
        }
      const overflow =
        element.scrollWidth > element.clientWidth + 1 ||
        element.scrollHeight > element.clientHeight + 1 ||
        rect.left < -1 ||
        rect.top < -1 ||
        rect.left + rect.width > width + 1 ||
        rect.top + rect.height > height + 1
      const field = fields.find((field) => field.group === screen && field.value.trim() === text)
      checks.push({
        screen,
        key: field?.key,
        label: brand ? 'Logo (visual guidance)' : (field?.label ?? text.slice(0, 42)),
        ratio,
        threshold,
        lowContrast: ratio < threshold,
        overflow,
        brand,
        rect: {
          left: (rect.left / width) * 100,
          top: (rect.top / height) * 100,
          width: (rect.width / width) * 100,
          height: (rect.height / height) * 100,
        },
      })
    }
    canvas.width = 0
    canvas.height = 0
  }
  return checks
}
