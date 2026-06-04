import type { CSSProperties, HTMLAttributes } from "react";

import mcDebitGoldSrc from "@/assets/design-system/debit-card-mc-gold.svg";
import { cn } from "@/app/components/ui/utils";

export const DEBIT_CARD_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  figmaComponentName: "Card_MC_Debit_Gold_IND_DIGITAL_SMALL",
  sourceNodeId: "3039:30713",
  width: 64,
  height: 40,
} as const;

export type DebitCardVariant = "mc-debit-gold";

interface DebitCardArt {
  label: string;
  network: string;
  src: string;
}

export const DEBIT_CARD_VARIANTS: Record<DebitCardVariant, DebitCardArt> = {
  "mc-debit-gold": { label: "MC Debit Gold", network: "Mastercard", src: mcDebitGoldSrc },
};

export type DebitCardSize = "figma" | "medium" | "large";

const DEBIT_CARD_SIZES: Record<DebitCardSize, { width: number; height: number }> = {
  figma: { width: 64, height: 40 },
  medium: { width: 96, height: 60 },
  large: { width: 160, height: 100 },
};

export interface DebitCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  variant?: DebitCardVariant;
  size?: DebitCardSize;
  ariaLabel?: string;
}

/**
 * Debit Card — Figma-extracted payment card artwork (64x40 base) generated from
 * `codex-figma-component-spec/v1` node `3039:30713`. The source SVG (gold
 * gradient body, Mastercard symbol, UniCredit and contactless marks) is kept as
 * a separate design asset; the component renders a selected `variant` at a
 * controlled `size` while preserving the 8:5 aspect ratio. Decorative by
 * default; pass `ariaLabel` to expose it as an image.
 */
export default function DebitCard({
  variant = "mc-debit-gold",
  size = "figma",
  ariaLabel,
  className,
  style,
  ...props
}: DebitCardProps) {
  const art = DEBIT_CARD_VARIANTS[variant];
  const dimensions = DEBIT_CARD_SIZES[size];
  const computedStyle: CSSProperties = {
    width: dimensions.width,
    height: dimensions.height,
    borderRadius: (dimensions.width / DEBIT_CARD_SOURCE.width) * 4,
    ...style,
  };

  return (
    <div
      {...props}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      className={cn("inline-block shrink-0 overflow-hidden align-middle", className)}
      data-component="DebitCard"
      data-debit-card-variant={variant}
      data-figma-schema={DEBIT_CARD_SOURCE.schema}
      role={ariaLabel ? "img" : undefined}
      style={computedStyle}
    >
      <img alt="" className="block h-full w-full select-none" draggable={false} src={art.src} />
    </div>
  );
}
