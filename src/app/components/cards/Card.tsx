import { useId, type CSSProperties, type HTMLAttributes } from "react";

import { cn } from "@/app/components/ui/utils";
import { CARD_SOURCE, CARD_ARTWORK, resolveCardArtwork, type CardTone, type CardVariant, type CardSize } from "@/app/components/contracts/cardArtwork";
export { CARD_SOURCE, CARD_VARIANTS } from "@/app/components/contracts/cardArtwork";
export type { CardVariant, CardSize } from "@/app/components/contracts/cardArtwork";

const CARD_ARROW_PATH = CARD_ARTWORK.arrowPath;

/** Reusable UniCredit double-arrow mark for campaign photography overlays. */
export function CardArrowMark({ color = "var(--uc-brand)", className }: { color?: string; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("block h-full w-full", className)}
      preserveAspectRatio="none"
      viewBox="0 0 64 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={CARD_ARROW_PATH} fill={color} />
      <path d={CARD_ARROW_PATH} fill={color} transform="translate(24 0) scale(.95)" />
    </svg>
  );
}

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  ariaLabel?: string;
  size?: CardSize;
  variant?: CardVariant;
}

export default function Card({
  ariaLabel,
  className,
  size = "figma",
  style,
  variant = "mc-debit-gold",
  ...props
}: CardProps) {
  const dimensions = resolveCardArtwork({ variant, size });
  const { tone } = dimensions;
  const svgId = useId().replace(/:/g, "");
  const cardBackground = tone.backgroundEnd
    ? `linear-gradient(135deg, ${tone.background} 0%, ${tone.backgroundEnd} 100%)`
    : tone.background;
  const computedStyle: CSSProperties = {
    width: dimensions.width,
    height: dimensions.height,
    borderRadius: (dimensions.width / CARD_SOURCE.width) * CARD_SOURCE.cornerRadius,
    background: cardBackground,
    transform: "translateZ(0)",
    ...style,
  };

  return (
    <div
      {...props}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      className={cn("inline-block shrink-0 overflow-hidden align-middle", className)}
      data-card-variant={variant}
      data-component="Card"
      data-figma-node={tone.sourceNodeId}
      data-figma-schema={CARD_SOURCE.schema}
      role={ariaLabel ? "img" : undefined}
      style={computedStyle}
    >
      <CardSvg tone={tone} uniqueId={`${variant}-${svgId}`} />
    </div>
  );
}

function CardSvg({ tone, uniqueId }: { tone: CardTone; uniqueId: string }) {
  const backgroundFill = tone.backgroundEnd ? `url(#${uniqueId}-card-bg)` : tone.background;
  const patternFill = tone.patternEnd ? `url(#${uniqueId}-pattern)` : tone.pattern;

  return (
    <svg
      aria-hidden="true"
      className="block h-full w-full select-none"
      focusable="false"
      preserveAspectRatio="none"
      style={{ borderRadius: "inherit" }}
      viewBox={`0 0 ${CARD_SOURCE.width} ${CARD_SOURCE.height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {tone.backgroundEnd ? (
          <linearGradient id={`${uniqueId}-card-bg`} x1="0" x2="64" y1="0" y2="40">
            <stop offset="0" stopColor={tone.background} />
            <stop offset="1" stopColor={tone.backgroundEnd} />
          </linearGradient>
        ) : null}
        {tone.patternEnd ? (
          <linearGradient id={`${uniqueId}-pattern`} x1="0" x2="32" y1="0" y2="40">
            <stop offset="0" stopColor={tone.pattern} />
            <stop offset="1" stopColor={tone.patternEnd} />
          </linearGradient>
        ) : null}
      </defs>

      <g>
        <rect width="64" height="40" fill={backgroundFill} />
        <path
          d={CARD_ARTWORK.edgeArrowPath}
          fill={patternFill}
          opacity={tone.shadowOpacity ? 0.96 : 1}
        />
        <path
          d={CARD_ARTWORK.arrowPath}
          fill={patternFill}
          opacity={tone.shadowOpacity ? 0.88 : 1}
        />
        <path d={CARD_ARTWORK.detailPath} fill="none" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="0.4" />

        <UniCreditCardLogo brandColor={tone.brandMark} textColor={tone.logoText} />

        <g transform="translate(47.7 9.1)">
          <circle
            cx="4.1"
            cy="4.1"
            r="4.05"
            fill={tone.mastercardRed}
            stroke={tone.mastercardStroke}
            strokeWidth={tone.mastercardStroke === "transparent" ? 0 : 0.42}
          />
          <circle
            cx="9.1"
            cy="4.1"
            r="4.05"
            fill={tone.mastercardYellow}
            stroke={tone.mastercardStroke}
            strokeWidth={tone.mastercardStroke === "transparent" ? 0 : 0.42}
          />
          <path
            d={CARD_ARTWORK.networkCenterPath}
            fill={tone.mastercardCenter}
            opacity="0.92"
          />
        </g>

        <text
          fill={tone.labelColor}
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="2.55"
          fontWeight="700"
          letterSpacing="0.18"
          textAnchor="end"
          x="61.1"
          y="22.1"
        >
          {tone.typeLabel}
        </text>
      </g>
    </svg>
  );
}

function UniCreditCardLogo({ brandColor, textColor }: { brandColor: string; textColor: string }) {
  const scale = 19.55 / 139.508;

  return (
    <g transform={`translate(42.15 2.05) scale(${scale})`}>
      <path clipRule="evenodd" d={CARD_ARTWORK.logoPaths.p2cef6600} fill={brandColor} fillRule="evenodd" />
      <path clipRule="evenodd" d={CARD_ARTWORK.logoPaths.p27e9da00} fill={brandColor} fillRule="evenodd" />
      <path clipRule="evenodd" d={CARD_ARTWORK.logoPaths.p2e662b0} fill="#FFFFFF" fillRule="evenodd" />
      <path d={CARD_ARTWORK.logoPaths.p3d56e1f0} fill={textColor} />
      <path d={CARD_ARTWORK.logoPaths.p18a76220} fill={textColor} />
      <path d={CARD_ARTWORK.logoPaths.p2205fa00} fill={textColor} />
      <path d={CARD_ARTWORK.logoPaths.p4138200} fill={textColor} />
      <path d={CARD_ARTWORK.logoPaths.p120fd332} fill={textColor} />
      <path d={CARD_ARTWORK.logoPaths.p3558cb00} fill={textColor} />
      <path d={CARD_ARTWORK.logoPaths.p29646d00} fill={textColor} />
      <path d={CARD_ARTWORK.logoPaths.p3ed7ba20} fill={textColor} />
      <path d={CARD_ARTWORK.logoPaths.p4240280} fill={textColor} />
    </g>
  );
}
