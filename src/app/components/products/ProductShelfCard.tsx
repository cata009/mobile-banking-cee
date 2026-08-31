import type { ComponentPropsWithoutRef } from "react";
import type { ProductShelfCategoryId, ProductShelfItem } from "@/app/config/productsShelfConfig";

type ForwardedButtonProps = Omit<
  ComponentPropsWithoutRef<"button">,
  "type" | "className" | "children" | "aria-label" | "onClick"
>;

interface ProductShelfCardProps extends ForwardedButtonProps {
  item: ProductShelfItem;
  /** `carousel` is the 240px rail card; `list` fills the category page width. */
  layout?: "carousel" | "list";
  /** Analytics context: which rail this card was rendered in. */
  categoryId?: ProductShelfCategoryId;
  /** Analytics context: 1-based position inside that rail. */
  position?: number;
  onClick?: (item: ProductShelfItem) => void;
}

const IMAGE_HEIGHT = { carousel: "h-[100px]", list: "h-[140px]" } as const;
const CARD_WIDTH = { carousel: "w-[240px] shrink-0", list: "w-full" } as const;

/**
 * Product card for the Evo 2027 Offers shelf (Figma node 24042:11585).
 * Photo + product name + benefit line.
 *
 * The name used to be a small uppercase tag laid over the photograph while the
 * marketing headline took the bold slot underneath, so scanning the shelf you
 * read four slogans before you read four product names. Choosing a product is a
 * lookup far more often than a discovery, so the two have swapped: the name is
 * the headline, the benefit is the line under it, and the photo carries no text.
 */
export default function ProductShelfCard({
  item,
  layout = "carousel",
  categoryId,
  position,
  onClick,
  ...forwardedProps
}: ProductShelfCardProps) {

  return (
    <button
      type="button"
      /* The rail's drag handlers arrive here through cloneElement and must reach
         the DOM node. Without them the rail alone calls setPointerCapture, so the
         browser fires `click` on the rail instead of on this card — the card
         looks tappable and does nothing. */
      {...forwardedProps}
      data-product-shelf-card={item.id}
      data-shelf-category={categoryId}
      data-shelf-position={position}
      data-shelf-layout={layout}
      aria-label={`${item.productName} — ${item.title}`}
      onClick={() => onClick?.(item)}
      /* `flex flex-col` matters: a plain button centres its content vertically,
         which leaves an uncovered strip above the photo once the rail stretches
         shorter cards to the tallest one. */
      className={`${CARD_WIDTH[layout]} flex flex-col overflow-hidden rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]`}
    >
      <span className={`relative block shrink-0 ${IMAGE_HEIGHT[layout]} w-full overflow-hidden bg-[var(--uc-surface-muted)]`}>
        <img
          src={item.image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          draggable={false}
          data-product-shelf-media
          className="size-full object-cover"
          style={{ objectPosition: item.imagePosition }}
        />
      </span>
      <span className="flex min-h-[66px] flex-1 flex-col gap-[4px] p-[12px]">
        <span data-product-shelf-name className="text-[17px] font-bold leading-[21px] text-[var(--uc-text)]">
          {item.productName}
        </span>
        <span data-product-shelf-benefit className="line-clamp-2 text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
          {item.title}
        </span>
      </span>
    </button>
  );
}
