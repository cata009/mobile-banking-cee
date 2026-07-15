// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createPhoneFigmaJson,
  createPhoneScreenshotBlob,
  type FigmaReadyLayer,
  type PhoneFigmaJsonPayload,
} from '../../src/app/utils/phoneScreenshot'

type RectTuple = [x: number, y: number, width: number, height: number]

function parseRect(element: Element): RectTuple {
  const values = (element.getAttribute('data-test-rect') ?? '0,0,0,0')
    .split(',')
    .map(Number)
  const [x = 0, y = 0, width = 0, height = 0] = values
  const htmlElement = element instanceof HTMLElement ? element : null
  const inlineTop = htmlElement ? Number.parseFloat(htmlElement.style.top) : Number.NaN
  const inlineWidth = htmlElement ? Number.parseFloat(htmlElement.style.width) : Number.NaN
  const inlineHeight = htmlElement ? Number.parseFloat(htmlElement.style.height) : Number.NaN

  return [
    x,
    Number.isFinite(inlineTop) ? inlineTop : y,
    element.hasAttribute('data-test-resize') && Number.isFinite(inlineWidth) ? inlineWidth : width,
    element.hasAttribute('data-test-resize') && Number.isFinite(inlineHeight) ? inlineHeight : height,
  ]
}

function toRect([x, y, width, height]: RectTuple): DOMRect {
  return {
    x,
    y,
    width,
    height,
    top: y,
    right: x + width,
    bottom: y + height,
    left: x,
    toJSON: () => ({ x, y, width, height }),
  }
}

function readMetric(element: HTMLElement, attribute: string, fallback: number) {
  const value = Number(element.getAttribute(attribute))
  return Number.isFinite(value) && value > 0 ? value : fallback
}

function findLayer(layers: FigmaReadyLayer[], name: string): FigmaReadyLayer | undefined {
  for (const layer of layers) {
    if (layer.name === name) return layer
    const nested = findLayer(layer.children ?? [], name)
    if (nested) return nested
  }
  return undefined
}

function createScreen() {
  const screen = document.createElement('main')
  screen.setAttribute('data-test-rect', '0,0,375,200')
  screen.setAttribute('data-test-resize', 'true')
  screen.setAttribute('data-client-width', '375')
  screen.setAttribute('data-client-height', '200')
  screen.setAttribute('data-scroll-height', '200')
  screen.style.backgroundColor = 'rgb(245, 245, 245)'

  const scroll = document.createElement('section')
  scroll.setAttribute('data-name', 'Scrollable content')
  scroll.setAttribute('data-test-rect', '0,0,375,160')
  scroll.setAttribute('data-test-resize', 'true')
  scroll.setAttribute('data-client-width', '375')
  scroll.setAttribute('data-client-height', '160')
  scroll.setAttribute('data-scroll-height', '360')
  scroll.setAttribute('data-scroll-top', '24')
  scroll.style.overflowY = 'auto'

  const card = document.createElement('article')
  card.setAttribute('data-name', 'Asset card')
  card.setAttribute('data-test-rect', '16,12,343,132')
  card.style.backgroundColor = 'rgb(255, 255, 255)'
  card.style.backgroundImage = 'url("data:image/png;base64,QkdJTUc=")'
  card.style.boxShadow = 'rgba(0, 0, 0, 0.2) 0px 2px 4px 0px, #112233 1px 3px 6px 0px'

  const text = document.createElement('p')
  text.setAttribute('data-test-rect', '32,24,180,24')
  text.style.color = 'rgb(17, 34, 51)'
  text.style.fontFamily = 'Inter'
  text.style.fontSize = '16px'
  text.style.fontWeight = '600'
  text.style.lineHeight = '20px'
  text.textContent = 'Captured from clone'

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('data-name', 'Ordered vector')
  svg.setAttribute('data-test-rect', '32,60,24,24')
  svg.setAttribute('viewBox', '0 0 24 24')
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', 'M1 1h22v22H1z')
  svg.appendChild(path)

  const image = document.createElement('img')
  image.setAttribute('data-name', 'Ordered image')
  image.setAttribute('data-test-rect', '32,96,40,24')
  image.src = 'data:image/png;base64,SU1H'

  card.append(text, svg, image)
  scroll.appendChild(card)

  const stack = document.createElement('div')
  stack.setAttribute('data-name', 'Layout stack')
  stack.setAttribute('data-test-rect', '16,152,343,120')

  const stackBackground = document.createElement('div')
  stackBackground.setAttribute('data-name', 'Full stack background')
  stackBackground.setAttribute('data-test-rect', '16,152,343,120')
  stackBackground.style.backgroundColor = 'rgb(238, 238, 238)'

  const firstStackItem = document.createElement('p')
  firstStackItem.setAttribute('data-test-rect', '32,168,100,20')
  firstStackItem.style.color = 'rgb(17, 17, 17)'
  firstStackItem.style.fontSize = '14px'
  firstStackItem.style.lineHeight = '18px'
  firstStackItem.textContent = 'First stack item'

  const secondStackItem = document.createElement('p')
  secondStackItem.setAttribute('data-test-rect', '32,208,100,20')
  secondStackItem.style.color = 'rgb(17, 17, 17)'
  secondStackItem.style.fontSize = '14px'
  secondStackItem.style.lineHeight = '18px'
  secondStackItem.textContent = 'Second stack item'
  stack.append(stackBackground, firstStackItem, secondStackItem)

  const overlap = document.createElement('div')
  overlap.setAttribute('data-name', 'Overlapping group')
  overlap.setAttribute('data-test-rect', '16,280,343,64')
  for (const label of ['Overlap one', 'Overlap two']) {
    const item = document.createElement('p')
    item.setAttribute('data-test-rect', '32,292,100,20')
    item.style.color = 'rgb(17, 17, 17)'
    item.style.fontSize = '14px'
    item.style.lineHeight = '18px'
    item.textContent = label
    overlap.appendChild(item)
  }
  const malformed = document.createElement('div')
  malformed.setAttribute('data-name', 'Malformed paint')
  malformed.setAttribute('data-test-rect', '180,292,40,20')
  malformed.setAttribute('style', 'background-color: banana; background-image: url(); box-shadow: rgb(bad) 0px;')
  overlap.appendChild(malformed)
  scroll.append(stack, overlap)

  const navWrapper = document.createElement('footer')
  navWrapper.setAttribute('data-name', 'Bottom navigation wrapper')
  navWrapper.setAttribute('data-test-rect', '0,160,375,40')
  navWrapper.style.position = 'absolute'
  navWrapper.style.bottom = '0px'
  navWrapper.style.backgroundColor = 'rgb(255, 255, 255)'

  const nav = document.createElement('nav')
  nav.setAttribute('data-name', 'Bottom navigation')
  nav.setAttribute('data-phone-bottom-navigation', 'true')
  nav.setAttribute('data-test-rect', '0,160,375,40')
  nav.style.backgroundColor = 'rgb(255, 255, 255)'
  nav.textContent = 'Home'
  navWrapper.appendChild(nav)

  screen.append(scroll, navWrapper)
  for (const element of [screen, ...Array.from(screen.querySelectorAll('*'))]) {
    if (element instanceof HTMLElement || element instanceof SVGElement) {
      element.style.opacity = '1'
    }
  }
  document.body.appendChild(screen)
  return { screen, text, scroll }
}

describe('phone screenshot public exporters', () => {
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      return toRect(parseRect(this))
    })
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return readMetric(this, 'data-client-width', parseRect(this)[2])
    })
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return readMetric(this, 'data-client-height', parseRect(this)[3])
    })
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function (this: HTMLElement) {
      return readMetric(this, 'data-scroll-height', this.clientHeight)
    })
    vi.spyOn(HTMLElement.prototype, 'scrollTop', 'get').mockImplementation(function (this: HTMLElement) {
      return Number(this.getAttribute('data-scroll-top')) || 0
    })
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0)
      return 1
    })
  })

  afterEach(() => {
    document.body.replaceChildren()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('exports the single prepared clone with stable text, asset order, shadows, and full-scroll associations', async () => {
    const { screen, text } = createScreen()

    const exportPromise = createPhoneFigmaJson({ screenElement: screen, mode: 'full' })
    text.textContent = 'Live DOM changed after capture started'
    text.style.fontWeight = '400'
    const liveOnly = document.createElement('aside')
    liveOnly.textContent = 'Live-only insertion'
    liveOnly.setAttribute('data-test-rect', '0,0,10,10')
    screen.prepend(liveOnly)
    const expectedLiveDom = screen.outerHTML

    const payload = JSON.parse(await exportPromise) as PhoneFigmaJsonPayload

    expect(payload.frame).toEqual({ width: 375, height: 400, background: '#F5F5F5' })
    expect(findLayer(payload.root.children, 'Captured from clone')?.text?.fontName.style).toBe('Semi Bold')
    expect(findLayer(payload.root.children, 'Live DOM changed after capture started')).toBeUndefined()
    expect(payload.assets.map((asset) => asset.id)).toEqual([
      'svg-1-1-2',
      'image-1-1-3',
      'image-1-1',
    ])
    expect(findLayer(payload.root.children, 'Ordered vector')?.assetRef).toBe('svg-1-1-2')
    expect(findLayer(payload.root.children, 'Ordered image')?.assetRef).toBe('image-1-1-3')
    expect(findLayer(payload.root.children, 'Asset card')?.styles?.effects?.map((effect) => effect.offset)).toEqual([
      { x: 0, y: 2 },
      { x: 1, y: 3 },
    ])
    const layoutStack = findLayer(payload.root.children, 'Layout stack')
    expect(layoutStack?.layout).toMatchObject({ mode: 'VERTICAL', gap: 20 })
    expect(layoutStack?.children?.map((layer) => [layer.name, layer.autoLayoutChild?.layoutPositioning])).toEqual([
      ['Full stack background', 'ABSOLUTE'],
      ['First stack item', 'AUTO'],
      ['Second stack item', 'AUTO'],
    ])
    expect(findLayer(payload.root.children, 'Overlapping group')?.layout).toBeUndefined()
    const malformedLayer = findLayer(payload.root.children, 'Malformed paint')
    expect(malformedLayer?.assetRef).toBeUndefined()
    expect(malformedLayer?.styles).toBeUndefined()
    expect(payload.root.children.find((layer) => layer.name === 'Bottom navigation wrapper')?.bounds.y).toBe(360)
    expect(screen.outerHTML).toBe(expectedLiveDom)
  })

  it('returns PNG blobs at visible and full dimensions without changing the live DOM', async () => {
    const { screen } = createScreen()
    const originalDom = screen.outerHTML
    const drawImage = vi.fn()
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      scale: vi.fn(),
      drawImage,
    } as unknown as CanvasRenderingContext2D)
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback, type) => {
      callback(new Blob(['deterministic-png-smoke'], { type: type ?? 'image/png' }))
    })

    class DeterministicImage {
      decoding = ''
      onload: (() => void) | null = null
      onerror: (() => void) | null = null

      set src(_value: string) {
        queueMicrotask(() => this.onload?.())
      }
    }
    vi.stubGlobal('Image', DeterministicImage)

    const visible = await createPhoneScreenshotBlob({ screenElement: screen, mode: 'visible' })
    const full = await createPhoneScreenshotBlob({ screenElement: screen, mode: 'full' })

    expect({ width: visible.width, height: visible.height, type: visible.blob.type }).toEqual({
      width: 375,
      height: 200,
      type: 'image/png',
    })
    expect({ width: full.width, height: full.height, type: full.blob.type }).toEqual({
      width: 375,
      height: 400,
      type: 'image/png',
    })
    expect(drawImage).toHaveBeenNthCalledWith(1, expect.any(DeterministicImage), 0, 0, 375, 200)
    expect(drawImage).toHaveBeenNthCalledWith(2, expect.any(DeterministicImage), 0, 0, 375, 400)
    expect(screen.outerHTML).toBe(originalDom)
  })
})
