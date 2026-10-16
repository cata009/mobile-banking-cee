import { useId, type CSSProperties, type HTMLAttributes } from "react";

import { cn } from "@/app/components/ui/utils";
import logoSvgPaths from "@/imports/svg-pn3y56bdut";

export const CARD_SOURCE = {
  schema: "figma-meniga-harmonization-icons/v1",
  figmaComponentName: "Card",
  sourceNodeIds: {
    mcDebitGoldSmall: "3039:30713",
    mcCreditPremiumGold: "3039:7485",
    mcCreditPartnerStandard: "3039:8064",
    mcDebitStandard: "4161:9198",
    mcVirtualStandardViolet: "3039:12315",
    mcVirtualStandardOrange: "3039:12380",
  },
  width: 64,
  height: 40,
  cornerRadius: 4,
} as const;

const CARD_ARROW_PATH = "M10.3 0 31.4 20 10.3 40c-2.4-2.7-3-6.2-1.6-9.7.45-1.1 1.2-2.05 2.05-2.9L18.6 20l-7.85-7.4C9.9 11.8 9.15 10.8 8.7 9.7 7.3 6.2 7.9 2.7 10.3 0Z";

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

export type CardVariant =
  | "mc-debit-gold"
  | "mc-credit-premium-gold"
  | "mc-credit-partner-standard"
  | "mc-debit-standard"
  | "mc-virtual-standard-violet"
  | "mc-virtual-standard-orange";

export type CardSize = "figma" | "medium" | "large";

type CardTone = {
  label: string;
  network: string;
  typeLabel: "debit" | "credit";
  sourceNodeId: string;
  background: string;
  backgroundEnd?: string;
  pattern: string;
  patternEnd?: string;
  logoText: string;
  brandMark: string;
  labelColor: string;
  mastercardStroke: string;
  mastercardRed: string;
  mastercardYellow: string;
  mastercardCenter: string;
  shadowOpacity?: number;
};

export const CARD_VARIANTS: Record<CardVariant, CardTone> = {
  "mc-debit-gold": {
    label: "MC Debit Gold",
    network: "Mastercard",
    typeLabel: "debit",
    sourceNodeId: CARD_SOURCE.sourceNodeIds.mcDebitGoldSmall,
    background: "#F9F9FA",
    pattern: "#B1A06F",
    patternEnd: "#D9D1BD",
    logoText: "#111111",
    brandMark: "#E30613",
    labelColor: "#8E8E8E",
    mastercardStroke: "transparent",
    mastercardRed: "#EB001B",
    mastercardYellow: "#F79E1B",
    mastercardCenter: "#FF5F00",
  },
  "mc-credit-premium-gold": {
    label: "MC Credit Premium Gold",
    network: "Mastercard",
    typeLabel: "credit",
    sourceNodeId: CARD_SOURCE.sourceNodeIds.mcCreditPremiumGold,
    background: "#CF0612",
    backgroundEnd: "#7C0F0D",
    pattern: "#B1A06F",
    patternEnd: "#D9D1BD",
    logoText: "#FFFFFF",
    brandMark: "#E30613",
    labelColor: "#FFFFFF",
    mastercardStroke: "#FFFFFF",
    mastercardRed: "#EB001B",
    mastercardYellow: "#F79E1B",
    mastercardCenter: "#FF5F00",
    shadowOpacity: 0.16,
  },
  "mc-credit-partner-standard": {
    label: "MC Credit Partner Standard",
    network: "Mastercard",
    typeLabel: "credit",
    sourceNodeId: CARD_SOURCE.sourceNodeIds.mcCreditPartnerStandard,
    background: "#CF0612",
    backgroundEnd: "#7C0F0D",
    pattern: "#E30613",
    patternEnd: "#B80E19",
    logoText: "#FFFFFF",
    brandMark: "#E30613",
    labelColor: "#FFFFFF",
    mastercardStroke: "#FFFFFF",
    mastercardRed: "#EB001B",
    mastercardYellow: "#F79E1B",
    mastercardCenter: "#FF5F00",
    shadowOpacity: 0.16,
  },
  "mc-debit-standard": {
    label: "MC Debit Standard",
    network: "Mastercard",
    typeLabel: "debit",
    sourceNodeId: CARD_SOURCE.sourceNodeIds.mcDebitStandard,
    background: "#F9F9FA",
    pattern: "#E30613",
    logoText: "#111111",
    brandMark: "#E30613",
    labelColor: "#8E8E8E",
    mastercardStroke: "transparent",
    mastercardRed: "#EB001B",
    mastercardYellow: "#F79E1B",
    mastercardCenter: "#FF5F00",
  },
  "mc-virtual-standard-violet": {
    label: "MC Virtual Standard Electric Violet",
    network: "Mastercard",
    typeLabel: "debit",
    sourceNodeId: CARD_SOURCE.sourceNodeIds.mcVirtualStandardViolet,
    background: "#772B8B",
    pattern: "#AD80B9",
    logoText: "#FFFFFF",
    brandMark: "#E30613",
    labelColor: "#FFFFFF",
    mastercardStroke: "transparent",
    mastercardRed: "#EB001B",
    mastercardYellow: "#F79E1B",
    mastercardCenter: "#FF5F00",
    shadowOpacity: 0.1,
  },
  "mc-virtual-standard-orange": {
    label: "MC Virtual Standard Vibrant Orange",
    network: "Mastercard",
    typeLabel: "debit",
    sourceNodeId: CARD_SOURCE.sourceNodeIds.mcVirtualStandardOrange,
    background: "#F78F20",
    pattern: "#FABC79",
    logoText: "#FFFFFF",
    brandMark: "#E30613",
    labelColor: "#FFFFFF",
    mastercardStroke: "#FFFFFF",
    mastercardRed: "#EB001B",
    mastercardYellow: "#F79E1B",
    mastercardCenter: "#FF5F00",
    shadowOpacity: 0.1,
  },
};

const CARD_SIZES: Record<CardSize, { width: number; height: number }> = {
  figma: { width: 64, height: 40 },
  medium: { width: 96, height: 60 },
  large: { width: 160, height: 100 },
};

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
  const tone = CARD_VARIANTS[variant];
  const dimensions = CARD_SIZES[size];
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
          d="M-10 4 6.3 20-10 36v-9.8L-3.7 20-10 13.8V4Z"
          fill={patternFill}
          opacity={tone.shadowOpacity ? 0.96 : 1}
        />
        <path
          d="M10.3 0 31.4 20 10.3 40c-2.4-2.7-3-6.2-1.6-9.7.45-1.1 1.2-2.05 2.05-2.9L18.6 20l-7.85-7.4C9.9 11.8 9.15 10.8 8.7 9.7 7.3 6.2 7.9 2.7 10.3 0Z"
          fill={patternFill}
          opacity={tone.shadowOpacity ? 0.88 : 1}
        />
        <path d="M10.3 0 31.4 20 10.3 40" fill="none" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="0.4" />

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
            d="M6.6.82a4.1 4.1 0 0 1 0 6.56 4.1 4.1 0 0 1 0-6.56Z"
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
      <path clipRule="evenodd" d={logoSvgPaths.p2cef6600} fill={brandColor} fillRule="evenodd" />
      <path clipRule="evenodd" d={logoSvgPaths.p27e9da00} fill={brandColor} fillRule="evenodd" />
      <path clipRule="evenodd" d={logoSvgPaths.p2e662b0} fill="#FFFFFF" fillRule="evenodd" />
      <path d={logoSvgPaths.p3d56e1f0} fill={textColor} />
      <path d={logoSvgPaths.p18a76220} fill={textColor} />
      <path d={logoSvgPaths.p2205fa00} fill={textColor} />
      <path d={logoSvgPaths.p4138200} fill={textColor} />
      <path d={logoSvgPaths.p120fd332} fill={textColor} />
      <path d={logoSvgPaths.p3558cb00} fill={textColor} />
      <path d={logoSvgPaths.p29646d00} fill={textColor} />
      <path d={logoSvgPaths.p3ed7ba20} fill={textColor} />
      <path d={logoSvgPaths.p4240280} fill={textColor} />
    </g>
  );
}
