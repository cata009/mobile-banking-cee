import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

/**
 * Figma-style inspect, on the real screen.
 *
 * Wraps a MiniPhone. With measuring on, hovering any element inside the phone
 * outlines it and shows its box in the phone's own 375-wide pixels — size,
 * padding, margin, gap, radius — plus the typography class, the colour token
 * and the utility classes it was built with. Click pins the reading so it can
 * be read at leisure; click again to release.
 *
 * The values are what the browser laid out, so they are the numbers a developer
 * would otherwise read off a Figma frame — except that here they cannot disagree
 * with the build, because they are it. Only the box (a bounding rect, which a
 * CSS transform scales) is divided back by the frame's scale; computed styles
 * such as padding and font size are already in the screen's own CSS pixels.
 */

interface Reading {
  tag: string
  width: number
  height: number
  padding: string
  margin: string
  gap: string
  radius: string
  font: string
  typeClass: string | null
  color: string
  colorToken: string | null
  background: string | null
  backgroundToken: string | null
  classes: string[]
  box: { left: number; top: number; width: number; height: number }
}

const TOKEN_PREFIX = '--uc-'

/**
 * Colour tokens resolved to the rgb() values the browser reports, so a computed
 * colour can be named. Built once per inspector, from the stylesheet as loaded.
 */
function buildColorTokenIndex(): Map<string, string> {
  const index = new Map<string, string>()
  if (typeof document === 'undefined') return index
  const names = new Set<string>()
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule)) continue
      for (const property of Array.from(rule.style)) {
        if (property.startsWith(TOKEN_PREFIX)) names.add(property)
      }
    }
  }
  // A token that is not a colour (a size, a weight) makes the declaration invalid
  // at computed-value time, so the probe inherits its parent's colour. Giving the
  // parent a sentinel colour makes those tokens recognisable and skippable.
  const SENTINEL = 'rgb(1, 2, 3)'
  const host = document.createElement('span')
  host.style.position = 'absolute'
  host.style.visibility = 'hidden'
  host.style.color = SENTINEL
  const probe = document.createElement('span')
  host.appendChild(probe)
  document.body.appendChild(host)
  // Semantic tokens (--uc-text, --uc-action) name a colour better than the raw
  // palette entries that happen to share its value, so they are indexed first.
  const ordered = [...names].sort((left, right) => rank(left) - rank(right))
  for (const name of ordered) {
    probe.style.color = ''
    probe.style.color = `var(${name})`
    if (!probe.style.color) continue
    const resolved = getComputedStyle(probe).color
    if (!resolved || resolved === SENTINEL) continue
    if (!index.has(resolved)) index.set(resolved, name)
  }
  host.remove()
  return index
}

/** Lower ranks first: semantic tokens, then brand/status colours, then raw palette entries. */
function rank(token: string): number {
  if (/--uc-(static|neutral|banner|brand|glass)-/.test(token)) return 2
  if (/--uc-(green|red|orange|gold|blue|yellow|pink)-/.test(token)) return 1
  return 0
}

function px(value: number) {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

function sides(style: CSSStyleDeclaration, property: 'padding' | 'margin') {
  const values = ['Top', 'Right', 'Bottom', 'Left'].map((side) =>
    px(parseFloat(style.getPropertyValue(`${property}-${side.toLowerCase()}`) || '0')),
  )
  const [top, right, bottom, left] = values
  if (top === right && right === bottom && bottom === left) return top!
  if (top === bottom && left === right) return `${top} ${right}`
  return values.join(' ')
}

export default function ScreenInspector({
  children,
  scale,
  enabled,
}: {
  children: ReactNode
  /** The MiniPhone's scale, so readings come back in unscaled screen pixels. */
  scale: number
  enabled: boolean
}) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [reading, setReading] = useState<Reading | null>(null)
  const [pinned, setPinned] = useState(false)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)
  const tokenIndex = useMemo(() => (enabled ? buildColorTokenIndex() : new Map<string, string>()), [enabled])

  useEffect(() => {
    if (enabled) return
    setReading(null)
    setPinned(false)
    setCursor(null)
  }, [enabled])

  const measure = useCallback(
    (clientX: number, clientY: number) => {
      const host = hostRef.current
      const frame = host?.querySelector<HTMLElement>('[data-flow-screen-capture]')
      if (!host || !frame || typeof document.elementsFromPoint !== 'function') return
      const target = document
        .elementsFromPoint(clientX, clientY)
        .find(
          (candidate): candidate is HTMLElement =>
            candidate instanceof HTMLElement &&
            frame.contains(candidate) &&
            candidate !== frame &&
            !candidate.hasAttribute('data-screen-inspector'),
        )
      if (!target) return
      const frameRect = frame.getBoundingClientRect()
      const rect = target.getBoundingClientRect()
      const style = getComputedStyle(target)
      const classes = Array.from(target.classList)
      const color = style.color
      const background = style.backgroundColor
      const transparent = !background || background === 'rgba(0, 0, 0, 0)' || background === 'transparent'
      setReading({
        tag: target.tagName.toLowerCase(),
        width: rect.width / scale,
        height: rect.height / scale,
        padding: sides(style, 'padding'),
        margin: sides(style, 'margin'),
        gap: style.gap && style.gap !== 'normal' ? px(parseFloat(style.gap)) : '0',
        radius: px(parseFloat(style.borderTopLeftRadius || '0')),
        font: `${px(parseFloat(style.fontSize))} / ${
          style.lineHeight === 'normal' ? 'normal' : px(parseFloat(style.lineHeight))
        } · ${style.fontWeight}`,
        typeClass: classes.find((name) => name.startsWith('uc-type-')) ?? null,
        color,
        colorToken: tokenIndex.get(color) ?? null,
        background: transparent ? null : background,
        backgroundToken: transparent ? null : (tokenIndex.get(background) ?? null),
        classes,
        box: {
          left: rect.left - frameRect.left,
          top: rect.top - frameRect.top,
          width: rect.width,
          height: rect.height,
        },
      })
      const hostRect = host.getBoundingClientRect()
      setCursor({ x: clientX - hostRect.left, y: clientY - hostRect.top })
    },
    [scale, tokenIndex],
  )

  const frameOffset = (() => {
    const host = hostRef.current
    const frame = host?.querySelector<HTMLElement>('[data-flow-screen-capture]')
    if (!host || !frame) return { left: 0, top: 0 }
    const hostRect = host.getBoundingClientRect()
    const frameRect = frame.getBoundingClientRect()
    return { left: frameRect.left - hostRect.left, top: frameRect.top - hostRect.top }
  })()

  return (
    <div ref={hostRef} className="relative inline-block" data-testid="screen-inspector">
      {children}
      {enabled ? (
        <div
          data-screen-inspector="true"
          role="presentation"
          className="absolute inset-0 cursor-crosshair"
          onMouseMove={(event) => {
            if (pinned) return
            measure(event.clientX, event.clientY)
          }}
          onMouseLeave={() => {
            if (!pinned) {
              setReading(null)
              setCursor(null)
            }
          }}
          onClick={(event) => {
            if (pinned) {
              setPinned(false)
              measure(event.clientX, event.clientY)
              return
            }
            measure(event.clientX, event.clientY)
            setPinned(true)
          }}
        >
          {reading ? (
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute border-2 border-[#7B61FF] bg-[#7B61FF]/10"
                style={{
                  left: frameOffset.left + reading.box.left,
                  top: frameOffset.top + reading.box.top,
                  width: reading.box.width,
                  height: reading.box.height,
                }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -translate-y-full rounded-[3px] bg-[#7B61FF] px-[6px] py-[2px] font-mono text-[11px] font-bold leading-[16px] text-white"
                style={{
                  left: frameOffset.left + reading.box.left,
                  top: frameOffset.top + reading.box.top - 2,
                }}
              >
                {px(reading.width)} × {px(reading.height)}
              </div>
            </>
          ) : null}
          {reading && cursor ? (
            <InspectorCard reading={reading} cursor={cursor} pinned={pinned} hostRef={hostRef} />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function InspectorCard({
  reading,
  cursor,
  pinned,
  hostRef,
}: {
  reading: Reading
  cursor: { x: number; y: number }
  pinned: boolean
  hostRef: React.RefObject<HTMLDivElement | null>
}) {
  // The host is only as wide as the phone, so flipping is decided against the
  // viewport: the card sits to the right of the cursor, over the notes beside
  // the phone, and moves left only when it would leave the window.
  const hostRect = hostRef.current?.getBoundingClientRect()
  const width = 268
  const flipX = Boolean(hostRect) && typeof window !== 'undefined' && hostRect!.left + cursor.x + width + 24 > window.innerWidth
  const flipY = Boolean(hostRect) && typeof window !== 'undefined' && hostRect!.top + cursor.y + 260 > window.innerHeight
  return (
    <div
      data-testid="screen-inspector-card"
      className="pointer-events-none absolute z-10 rounded-[8px] border border-[#7B61FF] bg-[#17202A] p-[10px] font-mono text-[11px] leading-[16px] text-[#EAF2F8] shadow-lg"
      style={{
        width,
        left: flipX ? cursor.x - width - 14 : cursor.x + 14,
        top: flipY ? cursor.y - 14 : cursor.y + 14,
        transform: flipY ? 'translateY(-100%)' : undefined,
      }}
    >
      <p className="flex items-center justify-between gap-[8px] text-[#C9B8FF]">
        <span>&lt;{reading.tag}&gt;</span>
        <span className="text-[10px] uppercase tracking-[0.06em] text-[#9FB0C2]">{pinned ? 'pinned' : 'hover'}</span>
      </p>
      <dl className="mt-[6px] grid grid-cols-[72px_1fr] gap-x-[8px] gap-y-[2px]">
        <Row label="size" value={`${px(reading.width)} × ${px(reading.height)}`} />
        <Row label="padding" value={reading.padding} />
        <Row label="margin" value={reading.margin} />
        <Row label="gap" value={reading.gap} />
        <Row label="radius" value={reading.radius} />
        <Row label="font" value={reading.font} />
        {reading.typeClass ? <Row label="type" value={reading.typeClass} accent /> : null}
        <Row label="color" value={reading.colorToken ? `var(${reading.colorToken})` : reading.color} accent={Boolean(reading.colorToken)} />
        {reading.background ? (
          <Row
            label="bg"
            value={reading.backgroundToken ? `var(${reading.backgroundToken})` : reading.background}
            accent={Boolean(reading.backgroundToken)}
          />
        ) : null}
      </dl>
      {reading.classes.length ? (
        <p className="mt-[6px] max-h-[64px] overflow-hidden text-ellipsis break-all text-[#9FB0C2]">
          {reading.classes.join(' ')}
        </p>
      ) : null}
    </div>
  )
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <>
      <dt className="text-[#9FB0C2]">{label}</dt>
      <dd className={accent ? 'text-[#A7F3D0]' : ''}>{value}</dd>
    </>
  )
}
