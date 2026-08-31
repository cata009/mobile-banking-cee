import { useRef } from "react";

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
 * grey outline versus a black one. Same job, same control: this is the Offers
 * page's chip, which is the one the brand's own partner page uses.
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
  const { dragHandlers, isDragging } = useDragCarousel({ carouselRef: railRef });

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
            {...(chipDataAttribute ? { [chipDataAttribute]: category.id } : {})}
            aria-pressed={active}
            onClick={() => onSelect(category.id)}
            className={`flex h-[36px] shrink-0 items-center justify-center rounded-[4px] border px-[16px] text-[14px] font-bold uppercase leading-[18px] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] ${
              active
                ? "border-[var(--uc-action-strong)] bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]"
                : "border-[var(--uc-text)] bg-[var(--uc-surface)] text-[var(--uc-text)]"
            }`}
          >
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
