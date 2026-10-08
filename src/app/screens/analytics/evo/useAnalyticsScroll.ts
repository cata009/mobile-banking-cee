import { useEffect, useRef, useState } from 'react'
import { type AnalyticsDirection } from '@/app/screens/analytics/evoAnalyticsState'
import type { AnalyticsView } from '@/features/analytics/evo/state'

export const HEADER_COLLAPSE_DISTANCE = 56
const HEADER_COLLAPSE_MARGIN = 24
export function useAnalyticsScroll(
  view: AnalyticsView,
  rowKey: string | undefined,
  analysisDirection: AnalyticsDirection,
) {
  const [contentScrollTop, setContentScrollTop] = useState(0)
  const contentRef = useRef<HTMLElement>(null)
  const [scrollSlack, setScrollSlack] = useState(0)
  const headerReleaseRef = useRef(0)
  // A page with less scroll than the collapse distance strands the title half-faded, which reads as
  // flicker. Pad the bottom until the title can always finish its trip into the header.
  useEffect(() => {
    const element = contentRef.current
    const content = element?.firstElementChild
    if (!element || !content) return

    // Collapsing unmounts the large title, which takes its height out of the scroll. Without room
    // for both, the collapse undoes the very scroll that triggered it and the title flickers — so
    // the reservation is kept once measured, including while the title is away.
    headerReleaseRef.current = 0

    const measure = () => {
      const largeTitle = view === 'overview' ? null : element.previousElementSibling
      if (largeTitle?.querySelector('h1.uc-type-h1')) {
        headerReleaseRef.current = (largeTitle as HTMLElement).offsetHeight
      }

      setScrollSlack((current) => {
        const naturalOverflow = element.scrollHeight - element.clientHeight - current
        // A page that does not scroll at all keeps its large title and never flickers; only the
        // pages caught between the two states need the extra room.
        const target = HEADER_COLLAPSE_DISTANCE + HEADER_COLLAPSE_MARGIN + headerReleaseRef.current
        const needed = naturalOverflow > 0 ? Math.max(0, target - naturalOverflow) : 0
        return Math.abs(needed - current) < 1 ? current : needed
      })
    }

    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(content)
    return () => observer.disconnect()
  }, [view, rowKey])
  /*
   * Every view here shares one scroller, so opening a category from halfway down
   * the list used to land the new page already scrolled — its chart cut off and
   * its header collapsed. Each level starts at its own top.
   */
  useEffect(() => {
    const element = contentRef.current
    if (!element) return
    element.scrollTop = 0
    setContentScrollTop(0)
  }, [view, rowKey, analysisDirection])

  return {
    contentRef,
    scrollSlack,
    setContentScrollTop,
    headerCollapseProgress: Math.min(1, contentScrollTop / HEADER_COLLAPSE_DISTANCE),
  }
}
