import type { CSSProperties, HTMLAttributes } from "react";

import cardArtworkSrc from "@/assets/design-system/card.svg";
import { cn } from "@/app/components/ui/utils";

export const CARD_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  figmaComponentName: "Card",
  sourceNodeId: "0:9261",
  width: 64,
  height: 40,
  cornerRadius: 4,
} as const;

export type CardSize = "figma" | "medium" | "large";

const CARD_SIZES: Record<CardSize, { width: number; height: number }> = {
  figma: { width: 64, height: 40 },
  medium: { width: 96, height: 60 },
  large: { width: 160, height: 100 },
};

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  ariaLabel?: string;
  size?: CardSize;
}

export default function Card({
  ariaLabel,
  className,
  size = "figma",
  style,
  ...props
}: CardProps) {
  const dimensions = CARD_SIZES[size];
  const computedStyle: CSSProperties = {
    width: dimensions.width,
    height: dimensions.height,
    borderRadius: (dimensions.width / CARD_SOURCE.width) * CARD_SOURCE.cornerRadius,
    ...style,
  };

  return (
    <div
      {...props}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      className={cn("inline-block shrink-0 overflow-hidden align-middle", className)}
      data-component="Card"
      data-figma-schema={CARD_SOURCE.schema}
      role={ariaLabel ? "img" : undefined}
      style={computedStyle}
    >
      <img
        alt=""
        className="block h-full w-full select-none"
        draggable={false}
        src={cardArtworkSrc}
      />
    </div>
  );
}
