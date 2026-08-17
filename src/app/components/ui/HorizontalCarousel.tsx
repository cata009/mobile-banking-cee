import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type UIEvent,
} from 'react';
import AccountCarouselIndicator from '@/app/components/accounts/AccountCarouselIndicator';
import { useDragCarousel } from '@/hooks/useDragCarousel';

export interface HorizontalCarouselProps {
  ariaLabel: string;
  count: number;
  /** What each dot navigates to, used in the dot labels. */
  itemLabel?: string;
  children: ReactNode;
}

/**
 * Snap-per-card horizontal rail with drag support and the 30x6 / 6x6 dot
 * indicator, used by the Evo 2027 Products shelf.
 *
 * The 2027 home screen keeps its own private copy of this rail on purpose —
 * home is out of scope for the Products work and was left untouched.
 */
export default function HorizontalCarousel({ ariaLabel, count, itemLabel, children }: HorizontalCarouselProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const scrollSnapTimeoutRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  /**
   * On a foldable or a rotated tablet every card can already be on screen. Dots
   * that can never change state are noise, and drag-to-scroll on a rail with
   * nothing to scroll feels broken — so both switch off once nothing overflows.
   */
  const [overflows, setOverflows] = useState(true);
  /**
   * Snap offsets, clamped to the rail's real maximum scroll. Without the clamp
   * the last card of a rail of narrow cards can never settle: its ideal offset
   * lies past `scrollWidth - clientWidth`, the browser stops short, and the
   * nearest-index maths then snaps the rail back to the previous card.
   */
  const getSnapOffsets = useCallback(() => {
    const rail = railRef.current;
    const item = rail?.firstElementChild as HTMLElement | null;
    if (!rail || !item) return [] as number[];
    const gap = Number.parseFloat(getComputedStyle(rail).gap || '0');
    const step = item.offsetWidth + gap;
    const maxScrollLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);
    return Array.from({ length: count }, (_, index) => Math.min(index * step, maxScrollLeft));
  }, [count]);
  const getNearestIndex = useCallback((scrollLeft: number) => {
    const offsets = getSnapOffsets();
    if (!offsets.length) return 0;
    return offsets.reduce(
      (nearest, offset, index) =>
        Math.abs(scrollLeft - offset) < Math.abs(scrollLeft - offsets[nearest]!) ? index : nearest,
      0,
    );
  }, [getSnapOffsets]);
  const scrollToIndex = useCallback((index: number) => {
    const rail = railRef.current;
    const offsets = getSnapOffsets();
    if (!rail || !offsets.length) return;
    const nextIndex = Math.max(0, Math.min(index, offsets.length - 1));
    const left = offsets[nextIndex]!;
    if (typeof rail.scrollTo === 'function') rail.scrollTo({ left, behavior: 'smooth' });
    else rail.scrollLeft = left;
    setActiveIndex(nextIndex);
  }, [getSnapOffsets]);
  const settle = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    scrollToIndex(getNearestIndex(rail.scrollLeft));
  }, [getNearestIndex, scrollToIndex]);
  const clearScrollSnapTimeout = () => {
    if (scrollSnapTimeoutRef.current === null) return;
    window.clearTimeout(scrollSnapTimeoutRef.current);
    scrollSnapTimeoutRef.current = null;
  };
  const { dragHandlers, isDragging, isPressActiveRef } = useDragCarousel({ carouselRef: railRef, enabled: count > 1 && overflows, onSettle: settle });
  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    const rail = event.currentTarget;
    setActiveIndex(getNearestIndex(rail.scrollLeft));
    if (isPressActiveRef.current) return;
    clearScrollSnapTimeout();
    scrollSnapTimeoutRef.current = window.setTimeout(settle, 120);
  };

  useEffect(() => () => {
    clearScrollSnapTimeout();
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const measure = () => setOverflows(rail.scrollWidth - rail.clientWidth > 1);
    measure();
    // Both listeners on purpose: the observer catches a foldable unfolding into
    // the same window, `resize` catches rotation and window changes.
    window.addEventListener('resize', measure);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(rail);
    return () => {
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, [count]);

  // Match the Products rail: the drag source is each visible card as well as
  // the rail itself. This keeps mouse drags stable when they begin over a
  // button, image, or card copy instead of an empty part of the rail.
  const draggableChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    return cloneElement(child, { ...dragHandlers } as never);
  });

  return <>
    <div ref={railRef} data-carousel-rail role="region" aria-label={ariaLabel} tabIndex={0} onScroll={onScroll} onKeyDown={(event) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); scrollToIndex(activeIndex + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); scrollToIndex(activeIndex - 1); }
    }} {...dragHandlers} className={`mt-[12px] flex gap-[12px] overflow-x-auto overscroll-x-contain pb-[4px] scrollbar-hide select-none touch-pan-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${!overflows ? '' : isDragging ? 'cursor-grabbing' : 'cursor-grab'}`} style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}>
      {draggableChildren}
    </div>
    {count > 1 && overflows ? <div className="mt-[4px] flex justify-center" aria-label={`${ariaLabel} pages`}>
      <AccountCarouselIndicator count={count} activeIndex={activeIndex} itemLabel={itemLabel} onSelect={scrollToIndex} />
    </div> : null}
  </>;
}
