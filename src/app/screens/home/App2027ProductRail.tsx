import type { ReactNode } from 'react';

import { AppIcon } from '@/app/components/icons';
import HorizontalCarousel from '@/app/components/ui/HorizontalCarousel';
import type { DragCarouselHandlers } from '@/hooks/useDragCarousel';

/**
 * The header every Home product group wears.
 *
 * The count reads as part of the title — "Deposits, 3 products" — so it sits
 * beside it rather than adrift at the far edge with nothing to belong to. That
 * frees the right end for the one action a group as a whole can take: opening
 * the shelf page where the customer gets another one of these.
 */
export function App2027ProductGroupHeader({
  title,
  countLabel,
  onAdd,
  addLabel,
}: {
  title: string;
  countLabel?: string;
  onAdd?: () => void;
  /** Names the add button for assistive tech — it is an icon on its own. */
  addLabel?: string;
}) {
  return (
    <div
      data-home-product-group-header="static"
      className="flex min-h-[48px] w-full items-center gap-[12px] px-0 py-[4px]"
    >
      <div className="flex min-w-0 flex-1 items-baseline gap-[8px]">
        <h2 className="uc-type-l1 min-w-0 truncate text-[var(--uc-text)]">{title}</h2>
        {countLabel ? (
          <span data-home-group-count className="shrink-0 text-[13px] leading-[16px] text-[var(--uc-text-muted)]">
            {countLabel}
          </span>
        ) : null}
      </div>
      {onAdd ? <App2027GroupAddButton label={addLabel ?? ''} onClick={onAdd} /> : null}
    </div>
  );
}

/**
 * The group's add action: the white roundel the account quick actions wear,
 * scaled to a header. The disc is what makes the mark a control — bare on the
 * page ground it read as a stray glyph — but the plus inside stays a hairline
 * in the muted ink, because a second filled circle inside the first turned a
 * secondary action into the loudest thing in the header.
 */
export function App2027GroupAddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      data-home-group-add
      aria-label={label}
      onClick={onClick}
      className="group grid size-[32px] shrink-0 cursor-pointer place-items-center rounded-full bg-[var(--uc-surface)] shadow-[0_1px_3px_rgb(var(--uc-shadow-rgb)/0.08)] transition-[transform,box-shadow] duration-150 hover:shadow-[0_2px_6px_rgb(var(--uc-shadow-rgb)/0.12)] active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
    >
      <AppIcon
        name="plus"
        size={16}
        color="var(--uc-text-muted)"
        aria-hidden="true"
        className="transition-colors group-hover:text-[var(--uc-text)]"
      />
    </button>
  );
}

export interface App2027ProductRailItem {
  /** Stable key, and the id the sheet is stamped with for tests and deep links. */
  id: string;
  /** Names the dot that scrolls to this card — "Mortgage Loan", not "item 2". */
  label: string;
  content: ReactNode;
}

export interface App2027ProductRailProps {
  title: string;
  /** The "3 products" hint beside the title. Omit for a single-product group. */
  countLabel?: string;
  items: readonly App2027ProductRailItem[];
  /** Stamped on each sheet, e.g. `data-home-deposit-sheet`. */
  sheetDataAttribute?: string;
  /** Stamped on the rail wrapper, e.g. `data-home-deposit-rail`. */
  railDataAttribute?: string;
  /** Opens the shelf page where the customer takes out another of these. */
  onAdd?: () => void;
  addLabel?: string;
}

/**
 * A Home product group as a rail of cards.
 *
 * Accounts already worked this way and the rest of Home did not: savings,
 * deposits, credits and insurance stacked their products behind a collapsed
 * accordion, so the second product of a group was a tap away and the count in
 * the header was the only sign it existed. One swipe reaches it now, the dots
 * say how many there are, and every group on the page answers to the same
 * gesture — which is also what lets a per-product action be added to any of
 * them later without inventing a second layout for it.
 *
 * Only the frame lives here. What a deposit or a policy card shows is the
 * caller's business; this owns the header, the rail and the peek.
 */
export default function App2027ProductRail({
  title,
  countLabel,
  items,
  sheetDataAttribute,
  railDataAttribute,
  onAdd,
  addLabel,
}: App2027ProductRailProps) {
  // One card fills the width; two or more leave the next one showing at the edge.
  const peek = items.length > 1;

  return (
    <div {...(railDataAttribute ? { [railDataAttribute]: true } : {})} className="flex flex-col">
      <App2027ProductGroupHeader title={title} countLabel={countLabel} onAdd={onAdd} addLabel={addLabel} />

      <HorizontalCarousel ariaLabel={title} count={items.length} itemLabels={items.map((item) => item.label)}>
        {items.map((item) => (
          <ProductRailSheet
            key={item.id}
            id={item.id}
            label={item.label}
            peek={peek}
            sheetDataAttribute={sheetDataAttribute}
          >
            {item.content}
          </ProductRailSheet>
        ))}
      </HorizontalCarousel>
    </div>
  );
}

/**
 * One page of the rail. The carousel clones its drag handlers onto every page,
 * so a swipe can start on the card itself rather than only on the gap between
 * two of them.
 */
function ProductRailSheet({
  id,
  label,
  peek,
  sheetDataAttribute,
  children,
  ...dragHandlers
}: {
  id: string;
  label: string;
  peek: boolean;
  sheetDataAttribute?: string;
  children: ReactNode;
} & Partial<DragCarouselHandlers>) {
  return (
    <div
      role="group"
      aria-label={label}
      {...(sheetDataAttribute ? { [sheetDataAttribute]: id } : {})}
      {...dragHandlers}
      className={`flex shrink-0 flex-col ${peek ? 'w-[calc(100%-24px)]' : 'w-full'}`}
    >
      {/* The card's own surface and corners live here so each item renderer stays
          a plain block of content, the way the stacked lists left them. */}
      <div className="flex h-full flex-col overflow-hidden rounded-[8px] bg-[var(--uc-surface)] shadow-[0_1px_1px_rgb(var(--uc-shadow-rgb)/0.04)]">
        {children}
      </div>
    </div>
  );
}
