/**
 * CardComponent
 * Figma source: codex-figma-component-spec/v1 node 9133:3831 "Card component"
 * Frame: 375×448, vertical layout, gap 12, clips content.
 * Background: Primary/K7 (#F5F5F5)
 */

import type { HTMLAttributes } from "react";
import { cn } from "@/app/components/ui/utils";
import cardArtworkSrc from "@/assets/design-system/card.svg";

export const CARD_COMPONENT_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  figmaComponentName: "CardComponent",
  sourceNodeId: "9133:3831",
  width: 375,
  height: 448,
} as const;

export interface CardArtItem {
  /** Unique key for the card in the carousel */
  id: string;
  /** Accessible label for the card image */
  ariaLabel?: string;
  /** Custom image src — falls back to the shared card.svg design asset */
  imageSrc?: string;
}

export interface CardComponentProps extends HTMLAttributes<HTMLDivElement> {
  /** Card holder display name (shown as N5-Text uppercase label) */
  cardHolderName?: string;
  /** Masked card number string, e.g. "9234  ****  ****  4007" */
  cardNumber?: string;
  /** Array of cards to show in the horizontal carousel (max visible ~1.5) */
  cards?: CardArtItem[];
}

const DEFAULT_CARDS: CardArtItem[] = [
  { id: "card-1", ariaLabel: "Credit card ending in 4007" },
  { id: "card-2", ariaLabel: "Debit card" },
];

export default function CardComponent({
  cardHolderName = "PETER JAGODIĆ",
  cardNumber = "9234  ****  ****  4007",
  cards = DEFAULT_CARDS,
  className,
  ...props
}: CardComponentProps) {
  return (
    <div
      {...props}
      className={cn("flex w-full flex-col gap-[12px] overflow-hidden bg-[#F5F5F5]", className)}
      data-component="CardComponent"
      data-figma-schema={CARD_COMPONENT_SOURCE.schema}
      data-figma-node={CARD_COMPONENT_SOURCE.sourceNodeId}
    >
      {/* Frame 46 — text block + carousel, padding-left: 24px, gap: 8px */}
      <div className="flex w-full flex-col gap-[8px] pl-[24px]">
        {/* text 1 — card holder + card number, gap: 2px */}
        <div className="flex w-[169px] flex-col gap-[2px]">
          {/* Card Holder — N5 Text input/label, 14px bold, K1 */}
          <span
            className="block w-full text-left text-[14px] font-bold leading-none tracking-[0] text-[#262626]"
            style={{ fontFamily: "UniCredit, sans-serif" }}
          >
            {cardHolderName}
          </span>

          {/* Card Number — L2 Card subtitle, 18px bold, K1 */}
          <span
            className="block w-full text-left text-[18px] font-bold leading-none tracking-[0] text-[#262626]"
            style={{ fontFamily: "UniCredit, sans-serif" }}
          >
            {cardNumber}
          </span>
        </div>

        {/* Cards carousel — 351×140, horizontal, gap 24, pl 1, clips off */}
        <div
          className="flex shrink-0 items-center overflow-x-auto"
          style={{
            width: 351,
            height: 140,
            gap: 24,
            paddingLeft: 1,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {cards.map((card) => (
            <CardArtSlot key={card.id} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Card art slot ─────────────────────────────────────────────────────────────
// Figma: 219×138, cornerRadius 5.67, stroke K6 (#E5E5E5) 1px outside,
//         drop-shadow 0 11.265px 11.265px rgba(0,0,0,0.2)

interface CardArtSlotProps {
  card: CardArtItem;
}

function CardArtSlot({ card }: CardArtSlotProps) {
  return (
    <div
      aria-label={card.ariaLabel}
      role={card.ariaLabel ? "img" : undefined}
      aria-hidden={card.ariaLabel ? undefined : true}
      className="shrink-0 overflow-hidden"
      style={{
        width: 219,
        height: 138,
        borderRadius: 5.67,
        border: "1px solid #E5E5E5",
        boxShadow: "0 11.265px 11.265px rgba(0,0,0,0.2)",
      }}
    >
      <img
        alt=""
        className="block h-full w-full select-none object-cover"
        draggable={false}
        src={card.imageSrc ?? cardArtworkSrc}
      />
    </div>
  );
}
