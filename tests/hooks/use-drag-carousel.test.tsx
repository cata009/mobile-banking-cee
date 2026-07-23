// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import { createRef } from 'react'
import { useDragCarousel } from '../../src/hooks/useDragCarousel'

afterEach(cleanup)

function createCarousel(scrollLeft = 0) {
  const el = document.createElement('div')
  Object.defineProperty(el, 'scrollLeft', { value: scrollLeft, writable: true, configurable: true })
  return el
}

function pointerEvent(overrides: Record<string, unknown> = {}) {
  return {
    pointerType: 'mouse',
    button: 0,
    pointerId: 1,
    clientX: 0,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    currentTarget: {
      setPointerCapture: vi.fn(),
      hasPointerCapture: vi.fn(() => true),
      releasePointerCapture: vi.fn(),
    },
    ...overrides,
  } as never
}

describe('useDragCarousel', () => {
  it('drags past the 4px threshold, updates scrollLeft, and settles once', () => {
    const carousel = createCarousel(100)
    const ref = createRef<HTMLElement>()
    ;(ref as { current: HTMLElement }).current = carousel
    const onSettle = vi.fn()

    const { result } = renderHook(() => useDragCarousel({ carouselRef: ref, onSettle }))

    act(() => result.current.dragHandlers.onPointerDown(pointerEvent({ clientX: 0 })))
    act(() => result.current.dragHandlers.onPointerMove(pointerEvent({ clientX: -30 })))

    // scrollLeft moves opposite to the drag delta (startScrollLeft - deltaX).
    expect(carousel.scrollLeft).toBe(130)
    expect(result.current.isDragging).toBe(true)

    act(() => result.current.dragHandlers.onPointerUp(pointerEvent({ clientX: -30 })))

    expect(onSettle).toHaveBeenCalledTimes(1)
    expect(result.current.isDragging).toBe(false)
  })

  it('treats a sub-threshold press as a tap: no scroll, no settle, no click suppression', () => {
    const carousel = createCarousel(50)
    const ref = createRef<HTMLElement>()
    ;(ref as { current: HTMLElement }).current = carousel
    const onSettle = vi.fn()

    const { result } = renderHook(() => useDragCarousel({ carouselRef: ref, onSettle }))

    act(() => result.current.dragHandlers.onPointerDown(pointerEvent({ clientX: 0 })))
    act(() => result.current.dragHandlers.onPointerMove(pointerEvent({ clientX: -2 })))
    act(() => result.current.dragHandlers.onPointerUp(pointerEvent({ clientX: -2 })))

    expect(carousel.scrollLeft).toBe(50)
    expect(onSettle).not.toHaveBeenCalled()

    const clickEvent = pointerEvent()
    act(() => result.current.dragHandlers.onClickCapture(clickEvent))
    expect((clickEvent as unknown as { preventDefault: () => void }).preventDefault).not.toHaveBeenCalled()
  })

  it('suppresses the click that immediately follows a real drag', () => {
    const carousel = createCarousel(0)
    const ref = createRef<HTMLElement>()
    ;(ref as { current: HTMLElement }).current = carousel

    const { result } = renderHook(() => useDragCarousel({ carouselRef: ref }))

    act(() => result.current.dragHandlers.onPointerDown(pointerEvent({ clientX: 0 })))
    act(() => result.current.dragHandlers.onPointerMove(pointerEvent({ clientX: 40 })))
    act(() => result.current.dragHandlers.onPointerUp(pointerEvent({ clientX: 40 })))

    const clickEvent = pointerEvent()
    act(() => result.current.dragHandlers.onClickCapture(clickEvent))
    expect((clickEvent as unknown as { preventDefault: () => void }).preventDefault).toHaveBeenCalled()
    expect((clickEvent as unknown as { stopPropagation: () => void }).stopPropagation).toHaveBeenCalled()
  })

  it('never begins a drag when disabled', () => {
    const carousel = createCarousel(0)
    const ref = createRef<HTMLElement>()
    ;(ref as { current: HTMLElement }).current = carousel
    const onSettle = vi.fn()

    const { result } = renderHook(() => useDragCarousel({ carouselRef: ref, onSettle, enabled: false }))

    act(() => result.current.dragHandlers.onPointerDown(pointerEvent({ clientX: 0 })))
    act(() => result.current.dragHandlers.onPointerMove(pointerEvent({ clientX: -50 })))
    act(() => result.current.dragHandlers.onPointerUp(pointerEvent({ clientX: -50 })))

    expect(carousel.scrollLeft).toBe(0)
    expect(onSettle).not.toHaveBeenCalled()
    expect(result.current.isDragging).toBe(false)
  })

  it('reports press-active via ref from press to release, even before movement', () => {
    const carousel = createCarousel(0)
    const ref = createRef<HTMLElement>()
    ;(ref as { current: HTMLElement }).current = carousel

    const { result } = renderHook(() => useDragCarousel({ carouselRef: ref }))

    expect(result.current.isPressActiveRef.current).toBe(false)
    act(() => result.current.dragHandlers.onPointerDown(pointerEvent({ clientX: 0 })))
    // Press is active immediately, before any movement (isDragging is still false).
    expect(result.current.isPressActiveRef.current).toBe(true)
    expect(result.current.isDragging).toBe(false)
    act(() => result.current.dragHandlers.onPointerUp(pointerEvent({ clientX: 0 })))
    expect(result.current.isPressActiveRef.current).toBe(false)
  })

  it('drives the mouse path through document-level move/up listeners', () => {
    const carousel = createCarousel(200)
    const ref = createRef<HTMLElement>()
    ;(ref as { current: HTMLElement }).current = carousel
    const onSettle = vi.fn()

    const { result } = renderHook(() => useDragCarousel({ carouselRef: ref, onSettle }))

    act(() => result.current.dragHandlers.onMouseDown(pointerEvent({ clientX: 0 })))
    act(() => {
      document.dispatchEvent(new MouseEvent('mousemove', { clientX: -25, buttons: 1 }))
    })
    expect(carousel.scrollLeft).toBe(225)

    act(() => {
      document.dispatchEvent(new MouseEvent('mouseup', {}))
    })
    expect(onSettle).toHaveBeenCalledTimes(1)
  })
})
