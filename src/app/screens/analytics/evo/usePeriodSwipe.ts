import { useEffect, useRef, useState } from 'react'

export const PERIOD_SWIPE_THRESHOLD = 40

export const PERIOD_SWIPE_CAPTURE_PX = 4

export const PERIOD_SWIPE_SETTLE_PX = 72

export const PERIOD_SWIPE_CLICK_GUARD_MS = 120

export function usePeriodSwipe(onStep: (direction: -1 | 1) => void, bounds?: { canPrev: boolean; canNext: boolean }) {
  const startXRef = useRef<number | null>(null)
  const pointerIdRef = useRef<number | undefined>(undefined)
  const captureTargetRef = useRef<HTMLElement | null>(null)
  const swipedRef = useRef(false)
  const guardTimeoutRef = useRef<number | null>(null)
  const settleTimeoutRef = useRef<number | null>(null)
  const [offset, setOffset] = useState(0)
  const [isDragging, setDragging] = useState(false)

  const canPrev = bounds?.canPrev ?? true
  const canNext = bounds?.canNext ?? true
  const resistance = (deltaX: number) => ((deltaX < 0 && !canNext) || (deltaX > 0 && !canPrev) ? 0.25 : 1) * deltaX

  const release = () => {
    const target = captureTargetRef.current
    const pointerId = pointerIdRef.current
    if (target && pointerId !== undefined && target.hasPointerCapture?.(pointerId)) {
      target.releasePointerCapture(pointerId)
    }
    captureTargetRef.current = null
    startXRef.current = null
    pointerIdRef.current = undefined
  }

  const swipeHandlers = {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      startXRef.current = event.clientX
      pointerIdRef.current = event.pointerId
      swipedRef.current = false
      setDragging(true)
      /*
       * No setPointerCapture here. While an element holds the capture the browser
       * fires the following `click` at *that* element, so every tap on an arc, a
       * bar or a dot inside the chart was delivered to the chart surface instead
       * and did nothing. Capture is taken in onPointerMove, once the press has
       * proven itself a swipe.
       */
    },
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
      const startX = startXRef.current
      if (startX === null || pointerIdRef.current !== event.pointerId) return

      const deltaX = event.clientX - startX
      // Capture keeps the gesture alive if the finger leaves the chart. It throws
      // for a pointer the browser no longer considers active, which would take the
      // whole screen down with it.
      if (!captureTargetRef.current && Math.abs(deltaX) >= PERIOD_SWIPE_CAPTURE_PX) {
        try {
          event.currentTarget.setPointerCapture?.(event.pointerId)
          captureTargetRef.current = event.currentTarget
        } catch {
          /* the gesture still works without capture */
        }
      }
      setOffset(resistance(deltaX))
    },
    onPointerUp: (event: React.PointerEvent<HTMLElement>) => {
      const startX = startXRef.current
      if (startX === null) return
      const deltaX = event.clientX - startX
      release()

      const direction: -1 | 1 = deltaX < 0 ? 1 : -1
      const commits = Math.abs(deltaX) >= PERIOD_SWIPE_THRESHOLD && (direction === 1 ? canNext : canPrev)

      if (!commits) {
        setDragging(false)
        setOffset(0)
        return
      }

      // A committed swipe swallows the click the browser sends after it, and
      // then lets go. It used to hold the flag until some later click came
      // along and was eaten in its place — a tap on a dot or an arc, minutes on.
      swipedRef.current = true
      if (guardTimeoutRef.current !== null) window.clearTimeout(guardTimeoutRef.current)
      guardTimeoutRef.current = window.setTimeout(() => {
        swipedRef.current = false
        guardTimeoutRef.current = null
      }, PERIOD_SWIPE_CLICK_GUARD_MS)

      // Park the incoming period on the far side with the transition still off,
      // then let it travel to centre: the motion carries the direction you swiped.
      setOffset(direction === 1 ? PERIOD_SWIPE_SETTLE_PX : -PERIOD_SWIPE_SETTLE_PX)
      onStep(direction)
      // A frame later, not a frame handler: requestAnimationFrame is throttled
      // to a standstill in a background tab, and the chart would stay parked
      // off-centre until the tab came back.
      if (settleTimeoutRef.current !== null) window.clearTimeout(settleTimeoutRef.current)
      settleTimeoutRef.current = window.setTimeout(() => {
        settleTimeoutRef.current = null
        setDragging(false)
        setOffset(0)
      }, 16)
    },
    onPointerCancel: () => {
      release()
      setDragging(false)
      setOffset(0)
    },
    onClickCapture: (event: React.MouseEvent<HTMLElement>) => {
      if (!swipedRef.current) return
      swipedRef.current = false
      event.preventDefault()
      event.stopPropagation()
    },
    onDragStart: (event: React.DragEvent<HTMLElement>) => {
      event.preventDefault()
    },
  }

  useEffect(
    () => () => {
      if (guardTimeoutRef.current !== null) window.clearTimeout(guardTimeoutRef.current)
      if (settleTimeoutRef.current !== null) window.clearTimeout(settleTimeoutRef.current)
    },
    [],
  )

  // A press that never became a swipe holds no capture, so releasing it outside
  // the chart never reaches the element's own handler. Without this the chart
  // would stay parked wherever the finger left it.
  useEffect(() => {
    const endStrayPress = (event: globalThis.PointerEvent) => {
      if (startXRef.current === null || pointerIdRef.current !== event.pointerId) return
      if (captureTargetRef.current) return
      startXRef.current = null
      pointerIdRef.current = undefined
      setDragging(false)
      setOffset(0)
    }
    window.addEventListener('pointerup', endStrayPress)
    window.addEventListener('pointercancel', endStrayPress)
    return () => {
      window.removeEventListener('pointerup', endStrayPress)
      window.removeEventListener('pointercancel', endStrayPress)
    }
  }, [])

  /** Spread on the element that should move; the handlers go on the surface. */
  const swipeMotionStyle = {
    transform: `translate3d(${offset}px, 0, 0)`,
    transition: isDragging ? 'none' : 'transform 220ms cubic-bezier(0.22, 0.61, 0.36, 1)',
  }

  return { swipeHandlers, swipeMotionStyle }
}
