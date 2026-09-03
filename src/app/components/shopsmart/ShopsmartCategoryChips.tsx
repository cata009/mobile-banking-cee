import { useEffect, useRef } from "react";

import { useDragCarousel } from "@/hooks/useDragCarousel";

export interface ShopsmartCategoryChip {
  id: string;
  label: string;
}

export interface ShopsmartCategoryChipsProps {
  categories: readonly ShopsmartCategoryChip[];
  activeId: string;
  onSelect: (id: string) => void;
  /** Names the group for assistive technology; both surfaces use the same string. */
  ariaLabel: string;
  /** Extra classes on the rail — the two surfaces sit in different gutters. */
  className?: string;
  /** Data attribute stamped on each chip, e.g. `data-home-shopsmart-chip`. */
  chipDataAttribute?: string;
  /** Data attribute stamped on the rail, e.g. `data-partner-offers-categories`. */
  railDataAttribute?: string;
}

/**
 * The Shopsmart category rail.
 *
 * Home and the Offers page were filtering the same catalogue with two chips that
 * had drifted apart — 8px versus 4px corners, 13px versus 14px type, a muted
 * grey outline versus a black one. Same job, same control.
 *
 * Only the selected chip carries weight: a white pill on the page ground says
 * "not selected" on its own, and an outline around every one of them turned a
 * filter row into a row of buttons competing with the content under it.
 */
export default function ShopsmartCategoryChips({
  categories,
  activeId,
  onSelect,
  ariaLabel,
  className = "",
  chipDataAttribute,
  railDataAttribute,
}: ShopsmartCategoryChipsProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef(new Map<string, HTMLButtonElement>());
  const hasSettledRef = useRef(false);
  const { dragHandlers, isDragging } = useDragCarousel({ carouselRef: railRef });

  /*
   * Selecting a chip further along the rail used to leave it wherever it
   * happened to sit — often half cut off at the edge, with no sign of what comes
   * next. The rail now brings the selection to the middle and stops there, so
   * moving forward and back through the categories reads as one continuous
   * strip. The ends are the exception: a first or last chip stays put rather
   * than dragging empty space into view.
   */
  useEffect(() => {
    const rail = railRef.current;
    const chip = chipRefs.current.get(activeId);
    if (!rail || !chip) return;

    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const centred = chip.offsetLeft - (rail.clientWidth - chip.offsetWidth) / 2;
    const left = Math.min(Math.max(centred, 0), maxScroll);
    if (Math.abs(left - rail.scrollLeft) < 1) {
      hasSettledRef.current = true;
      return;
    }

    // The first placement is where the rail already was; only a change animates.
    const behavior: ScrollBehavior = hasSettledRef.current
      && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      ? 'smooth'
      : 'auto';
    hasSettledRef.current = true;
    if (typeof rail.scrollTo === 'function') rail.scrollTo({ left, behavior });
    else rail.scrollLeft = left;
  }, [activeId, categories]);

  return (
    <div
      ref={railRef}
      {...dragHandlers}
      {...(railDataAttribute ? { [railDataAttribute]: true } : {})}
      role="group"
      aria-label={ariaLabel}
      className={`flex flex-nowrap items-center gap-[8px] overflow-x-auto overscroll-x-contain scrollbar-hide select-none touch-pan-y ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      } ${className}`.trim()}
      style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
    >
      {categories.map((category) => {
        const active = category.id === activeId;

        return (
          <button
            key={category.id}
            type="button"
            ref={(node) => {
              if (node) chipRefs.current.set(category.id, node);
              else chipRefs.current.delete(category.id);
            }}
            {...(chipDataAttribute ? { [chipDataAttribute]: category.id } : {})}
            aria-pressed={active}
            onClick={() => onSelect(category.id)}
            /* Figma box: 12px on the sides, 8px above and below the 18px line. */
            className={`flex shrink-0 items-center justify-center rounded-[4px] border px-[12px] py-[8px] text-[14px] font-bold uppercase leading-[18px] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${
              active
                ? "border-[var(--uc-action-strong)] bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]"
                : "border-transparent bg-[var(--uc-surface)] text-[var(--uc-text-muted)]"
            }`}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
