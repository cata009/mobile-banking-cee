/**
 * CardComponent
 * Figma source: codex-figma-component-spec/v1 node 9133:3831 "Card component"
 * Frame: 375x448, vertical layout, gap 12, clips content.
 * Background: Primary/K7 (#F5F5F5)
 */

import type { HTMLAttributes } from "react";

import Card, { type CardVariant } from "@/app/components/cards/Card";
import { cn } from "@/app/components/ui/utils";

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
  /** Accessible label for the rendered card */
  ariaLabel?: string;
  /** Shared Card component artwork variant */
  variant: CardVariant;
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
  {
    id: "card-credit",
    ariaLabel: "Credit card ending in 4007",
    variant: "mc-credit-partner-standard",
  },
  {
    id: "card-debit",
    ariaLabel: "Debit card",
    variant: "mc-debit-standard",
  },
];

export default function CardComponent({
  cardHolderName = "PETER JAGODIC",
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
      <div className="flex w-full flex-col gap-[8px] pl-[24px]">
        <div className="flex w-[169px] flex-col gap-[2px]">
          <span
            className="block w-full text-left text-[14px] font-bold leading-none tracking-[0] text-[#262626]"
            style={{ fontFamily: "UniCredit, sans-serif" }}
          >
            {cardHolderName}
          </span>

          <span
            className="block w-full text-left text-[18px] font-bold leading-none tracking-[0] text-[#262626]"
            style={{ fontFamily: "UniCredit, sans-serif" }}
          >
            {cardNumber}
          </span>
        </div>

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

interface CardArtSlotProps {
  card: CardArtItem;
}

function CardArtSlot({ card }: CardArtSlotProps) {
  return (
    <div
      className="shrink-0 overflow-hidden"
      style={{
        width: 219,
        height: 138,
        borderRadius: 5.67,
        boxShadow: "0 11.265px 11.265px rgba(0,0,0,0.2)",
      }}
    >
      <Card
        ariaLabel={card.ariaLabel}
        size="large"
        variant={card.variant}
        style={{
          width: 219,
          height: 138,
          borderRadius: 5.67,
        }}
      />
    </div>
  );
}
